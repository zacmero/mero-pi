import type { ExtensionAPI, ExtensionCommandContext, Theme } from "@earendil-works/pi-coding-agent";
import { matchesKey, visibleWidth, type Focusable } from "@earendil-works/pi-tui";

type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh";

const LEVELS: ThinkingLevel[] = ["off", "minimal", "low", "medium", "high", "xhigh"];

function cycleThinking(pi: ExtensionAPI): ThinkingLevel {
	const current = pi.getThinkingLevel();
	const start = Math.max(0, LEVELS.indexOf(current));

	for (let step = 1; step <= LEVELS.length; step++) {
		const candidate = LEVELS[(start + step) % LEVELS.length]!;
		pi.setThinkingLevel(candidate);
		const next = pi.getThinkingLevel();
		if (next !== current) return next;
	}

	return pi.getThinkingLevel();
}

export default function leaderThinking(pi: ExtensionAPI) {
	async function openLeader(ctx: ExtensionCommandContext) {
		await ctx.ui.custom<void>(
			(_tui, theme, _keybindings, done) => new LeaderOverlay(pi, theme, done),
			{ overlay: true },
		);
	}

	pi.registerShortcut("ctrl+l", {
		description: "Open leader overlay",
		handler: async (ctx) => {
			await openLeader(ctx);
		},
	});

	pi.registerCommand("leader", {
		description: "Open leader overlay",
		handler: async (_args, ctx) => {
			await openLeader(ctx);
		},
	});
}

class LeaderOverlay implements Focusable {
	readonly width = 46;
	focused = false;

	constructor(
		private pi: ExtensionAPI,
		private theme: Theme,
		private done: () => void,
	) {}

	handleInput(data: string): void {
		if (matchesKey(data, "escape") || matchesKey(data, "ctrl+c") || data === "q") {
			this.done();
			return;
		}

		if (data === "t") {
			cycleThinking(this.pi);
			return;
		}
	}

	render(_width: number): string[] {
		const th = this.theme;
		const innerW = this.width - 2;
		const current = this.pi.getThinkingLevel();
		const lines: string[] = [];
		const pad = (s: string, len: number) => s + " ".repeat(Math.max(0, len - visibleWidth(s)));
		const row = (content: string) => th.fg("border", "│") + pad(content, innerW) + th.fg("border", "│");

		lines.push(th.fg("border", `╭${"─".repeat(innerW)}╮`));
		lines.push(row(` ${th.fg("accent", "Leader")}`));
		lines.push(row(""));
		lines.push(row(` thinking: ${th.fg("accent", current)}`));
		lines.push(row(""));
		lines.push(row(` t  cycle thinking`));
		lines.push(row(` /model or Ctrl+Shift+L  model picker`));
		lines.push(row(` esc/q  close`));
		lines.push(th.fg("border", `╰${"─".repeat(innerW)}╯`));
		return lines;
	}

	invalidate(): void {}
	dispose(): void {}
}
