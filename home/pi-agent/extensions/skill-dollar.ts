import { readFileSync } from "node:fs";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { AutocompleteItem } from "@earendil-works/pi-tui";

type SkillEntry = {
	name: string;
	path: string;
	description?: string;
};

const TOKEN_RE = /(^|[ \t\n])\$([a-z0-9][a-z0-9-]*)\b/g;

function fuzzyScore(query: string, value: string): number {
	if (!query) return 0;
	if (value === query) return 1000;
	if (value.startsWith(query)) return 800 - (value.length - query.length);
	if (value.includes(query)) return 500 - value.indexOf(query);

	let qi = 0;
	let streak = 0;
	let score = 0;
	for (let i = 0; i < value.length && qi < query.length; i++) {
		if (value[i] === query[qi]) {
			qi++;
			streak++;
			score += 10 + streak * 3;
		} else {
			streak = 0;
		}
	}
	return qi === query.length ? score : -1;
}

function buildSkillMap(pi: ExtensionAPI): Map<string, SkillEntry> {
	const map = new Map<string, SkillEntry>();
	for (const cmd of pi.getCommands()) {
		if (cmd.source !== "skill") continue;
		const raw = cmd.name.startsWith("skill:") ? cmd.name.slice(6) : cmd.name;
		const path = cmd.sourceInfo?.path;
		if (!raw || !path) continue;
		map.set(raw, { name: raw, path, description: cmd.description });
	}
	return map;
}

function buildAutocompleteItems(skills: Map<string, SkillEntry>, query: string): AutocompleteItem[] {
	return [...skills.values()]
		.map((skill) => ({ skill, score: fuzzyScore(query, skill.name) }))
		.filter((x) => x.score >= 0)
		.sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name))
		.slice(0, 20)
		.map(({ skill }) => ({
			value: `$${skill.name}`,
			label: `$${skill.name}`,
			description: skill.description ?? skill.path,
		}));
}

export default function skillDollar(pi: ExtensionAPI) {
	let skills = new Map<string, SkillEntry>();

	pi.on("session_start", (_event, ctx) => {
		skills = buildSkillMap(pi);

		ctx.ui.addAutocompleteProvider((current) => ({
			async getSuggestions(lines, cursorLine, cursorCol, options) {
				const line = lines[cursorLine] ?? "";
				const beforeCursor = line.slice(0, cursorCol);
				const match = beforeCursor.match(/(?:^|[ \t\n])\$([a-z0-9-]*)$/);
				if (!match) {
					return current.getSuggestions(lines, cursorLine, cursorCol, options);
				}

				const query = (match[1] ?? "").toLowerCase();
				const items = buildAutocompleteItems(skills, query);
				if (items.length === 0) {
					return current.getSuggestions(lines, cursorLine, cursorCol, options);
				}

				return {
					prefix: `$${match[1] ?? ""}`,
					items,
				};
			},

			applyCompletion(lines, cursorLine, cursorCol, item, prefix) {
				return current.applyCompletion(lines, cursorLine, cursorCol, item, prefix);
			},

			shouldTriggerFileCompletion(lines, cursorLine, cursorCol) {
				return current.shouldTriggerFileCompletion?.(lines, cursorLine, cursorCol) ?? true;
			},
		}));
	});

	pi.on("input", async (event) => {
		if (!event.text.includes("$")) return { action: "continue" as const };
		skills = buildSkillMap(pi);

		const used = new Map<string, SkillEntry>();
		const cleaned = event.text.replace(TOKEN_RE, (full, lead: string, name: string) => {
			const skill = skills.get(name);
			if (!skill) return full;
			used.set(name, skill);
			return lead;
		});

		if (used.size === 0) return { action: "continue" as const };

		const blocks: string[] = [];
		for (const skill of used.values()) {
			let content = "";
			try {
				content = readFileSync(skill.path, "utf8").trim();
			} catch {
				continue;
			}
			blocks.push(`<skill name="${skill.name}" path="${skill.path}">\n${content}\n</skill>`);
		}

		if (blocks.length === 0) return { action: "continue" as const };

		const text = `${cleaned.trim()}\n\nUse following loaded skill instructions if relevant:\n\n${blocks.join("\n\n")}`;
		return { action: "transform" as const, text, images: event.images };
	});
}
