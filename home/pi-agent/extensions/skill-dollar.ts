import type { ExtensionAPI, ExtensionContext, Theme, TUI } from "@earendil-works/pi-coding-agent";
import { CustomEditor } from "@earendil-works/pi-coding-agent";
import type { KeybindingsManager } from "@earendil-works/pi-tui";
import { matchesKey, visibleWidth, type AutocompleteItem, type Focusable } from "@earendil-works/pi-tui";

type SkillEntry = {
	name: string;
	path: string;
	description?: string;
};

type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh";

const TOKEN_RE = /\[\$([a-z0-9][a-z0-9-]*)\]|(^|[ \t\n])\$([a-z0-9][a-z0-9-]*)\b/g;
const SKILL_REF_RE = /\[\$([a-z0-9][a-z0-9-]*)\]|\$([a-z0-9][a-z0-9-]*)\b/g;

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

function filteredSkills(skills: Map<string, SkillEntry>, query: string): SkillEntry[] {
	return [...skills.values()]
		.map((skill) => ({ skill, score: fuzzyScore(query, skill.name) }))
		.filter((x) => x.score >= 0)
		.sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name))
		.slice(0, 12)
		.map((x) => x.skill);
}

class SkillPickerOverlay implements Focusable {
	readonly width = 72;
	focused = false;
	private query = "";
	private selected = 0;

	constructor(
		private skills: Map<string, SkillEntry>,
		private theme: Theme,
		private done: (value: string | undefined) => void,
	) {}

	private get items(): SkillEntry[] {
		return filteredSkills(this.skills, this.query.toLowerCase());
	}

	handleInput(data: string): void {
		if (matchesKey(data, "escape") || matchesKey(data, "ctrl+c")) {
			this.done(undefined);
			return;
		}
		if (matchesKey(data, "backspace")) {
			this.query = this.query.slice(0, -1);
			this.selected = 0;
			return;
		}
		if (matchesKey(data, "up")) {
			this.selected = Math.max(0, this.selected - 1);
			return;
		}
		if (matchesKey(data, "down")) {
			this.selected = Math.min(Math.max(0, this.items.length - 1), this.selected + 1);
			return;
		}
		if (matchesKey(data, "return")) {
			const item = this.items[this.selected];
			this.done(item?.name);
			return;
		}
		if (data.length === 1 && data.charCodeAt(0) >= 32) {
			this.query += data;
			this.selected = 0;
		}
	}

	render(_width: number): string[] {
		const th = this.theme;
		const innerW = this.width - 2;
		const lines: string[] = [];
		const items = this.items;
		const pad = (s: string, len: number) => s + " ".repeat(Math.max(0, len - visibleWidth(s)));
		const row = (content: string) => th.fg("border", "│") + pad(content, innerW) + th.fg("border", "│");

		lines.push(th.fg("border", `╭${"─".repeat(innerW)}╮`));
		lines.push(row(` ${th.fg("accent", "Skill picker")}`));
		lines.push(row(` query: ${this.query || th.fg("dim", "type skill name")}`));
		lines.push(row(""));
		if (items.length === 0) {
			lines.push(row(` ${th.fg("warning", "No matching skills")}`));
		} else {
			for (let i = 0; i < items.length; i++) {
				const item = items[i]!;
				const selected = i === this.selected;
				const prefix = selected ? th.fg("accent", " ▶ ") : "   ";
				const label = selected ? th.fg("accent", `$${item.name}`) : `$${item.name}`;
				lines.push(row(`${prefix}${label} ${th.fg("dim", item.description ?? "")}`));
			}
		}
		lines.push(row(""));
		lines.push(row(` ${th.fg("dim", "type filter • ↑↓ move • Enter select • Esc cancel")}`));
		lines.push(th.fg("border", `╰${"─".repeat(innerW)}╯`));
		return lines;
	}

	invalidate(): void {}
	dispose(): void {}
}

class SkillDollarEditor extends CustomEditor {
	constructor(
		tui: TUI,
		private editorTheme: Theme,
		keybindings: KeybindingsManager,
		private getSkills: () => Map<string, SkillEntry>,
		private openSkillPicker: () => Promise<string | undefined>,
	) {
		super(tui, editorTheme, keybindings);
	}

	handleInput(data: string): void {
		if (data === "$") {
			void this.openSkillPicker().then((picked) => {
				this.insertTextAtCursor?.(picked ? `[$${picked}]` : "$");
			});
			return;
		}
		super.handleInput(data);
	}

	render(width: number): string[] {
		return super.render(width);
	}
}

export default function skillDollar(pi: ExtensionAPI) {
	let skills = new Map<string, SkillEntry>();

	async function openSkillPicker(ctx: ExtensionContext): Promise<string | undefined> {
		skills = buildSkillMap(pi);
		return await ctx.ui.custom<string | undefined>(
			(_tui, theme, _keybindings, done) => new SkillPickerOverlay(skills, theme, done),
			{ overlay: true },
		);
	}

	pi.on("session_start", (_event, ctx) => {
		skills = buildSkillMap(pi);

		ctx.ui.addAutocompleteProvider((current) => ({
			async getSuggestions(lines, cursorLine, cursorCol, options) {
				const line = lines[cursorLine] ?? "";
				const beforeCursor = line.slice(0, cursorCol);
				const match = beforeCursor.match(/(?:^|[ \t\n])\$([a-z0-9-]*)$/);
				if (!match) return current.getSuggestions(lines, cursorLine, cursorCol, options);

				skills = buildSkillMap(pi);
				const query = (match[1] ?? "").toLowerCase();
				const items = buildAutocompleteItems(skills, query);
				if (items.length === 0) return current.getSuggestions(lines, cursorLine, cursorCol, options);

				return { prefix: `$${match[1] ?? ""}`, items };
			},
			applyCompletion(lines, cursorLine, cursorCol, item, prefix) {
				return current.applyCompletion(lines, cursorLine, cursorCol, item, prefix);
			},
			shouldTriggerFileCompletion(lines, cursorLine, cursorCol) {
				return current.shouldTriggerFileCompletion?.(lines, cursorLine, cursorCol) ?? true;
			},
		}));

		ctx.ui.setEditorComponent((tui, theme, keybindings) =>
			new SkillDollarEditor(tui, theme, keybindings, () => skills, () => openSkillPicker(ctx)),
		);
	});

	pi.on("input", async (event) => {
		if (!event.text.includes("$")) return { action: "continue" as const };
		skills = buildSkillMap(pi);

		const used = new Map<string, SkillEntry>();
		const cleaned = event.text.replace(TOKEN_RE, (full, bracketName: string, lead: string, plainName: string) => {
			const name = bracketName || plainName;
			const skill = skills.get(name);
			if (!skill) return full;
			used.set(name, skill);
			return lead ?? "";
		});

		if (used.size === 0) return { action: "continue" as const };

		const refs = [...used.values()].map((skill) => `${skill.name}=${skill.path}`).join("; ");
		const cleanedText = cleaned.replace(/[ \t]{2,}/g, " ").trim();
		const skillNote = `[skills: ${refs}]\nRead referenced SKILL.md files before proceeding.`;
		const text = cleanedText ? `${cleanedText}\n\n${skillNote}` : skillNote;
		return { action: "transform" as const, text, images: event.images };
	});
}
