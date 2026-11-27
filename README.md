# Dialoid

A small visual-novel example built with nsh. It loads `scripts/init.dloid`,
splits it into speaker/message groups, and reveals one message per press of
**Continue** beside a background image.

## Source map

| Path | Responsibility |
| --- | --- |
| `App.tsx` | Composition root: page switching, script loading, responsive frame |
| `src/parser.ts` | `.dloid` text → dialogue nodes (the authority on script syntax) |
| `src/dialogues.tsx` | Reveal state and animated dialogue/speaker rows |
| `src/game.tsx` | Game screen: image, scrolling dialogue column, Continue button |
| `src/main-menu.tsx` | Title screen |
| `src/ui.tsx` | Shared button |
| `src/theme.ts` | Colors, fonts, aspect ratios and viewport sizing |
| `scripts/init.dloid` | Bundled sample script |

## Commands

- `nsh check` — type check
- `nsh run` — run in the native development host with hot reload
- `nsh build` — produce a bundled build

## Conventions

- All sizes are expressed in `vw` (one percent of the fitted 16:9 frame),
  computed in `src/theme.ts` and passed down as a `vw` prop.
- Script parsing stays in `src/parser.ts`; UI components only consume
  `RenderedDialogue` records.
- Reveal progress is a single count of visible messages in
  `createDialogueReveal`; per-dialogue counts are derived from it.
- Page changes fade the whole frame out and back in with `createMotion` in
  `App.tsx`; a guard prevents a second press during the transition.
