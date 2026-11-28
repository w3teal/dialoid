import Merriweather from "../assets/Merriweather-Regular.ttf";
import "../assets/Merriweather-ExtraBold.ttf";

export const colors = {
  background: "#282828",
  black: "#000000",
  text: "#fff",
  menuTitle: "#fff",
  dialogueText: "#fff",
  dialogueOverlay: "linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0))",
};

export const fontFamily = Merriweather;

/** Font metrics, in multiples of vw. */
export const font = {
  title: { size: 5, lineHeight: 6.25, weight: 800 },
  status: { size: 2 },
  message: { size: 2.75, lineHeight: 2.75 * 1.25, weight: 800 },
  speaker: { size: 2, lineHeight: 2.5 },
  button: { size: 1.5, lineHeight: 2.5 },
};

/** Spacing, in multiples of vw. */
export const spacing = {
  statusPadding: 3,
  menuPadding: 3,
  menuTitleMargin: 3.35,
  menuButtonGap: 4,
  gamePadding: 3,
  gameGap: 4,
  dialogueGap: 2,
  speakerGap: 2,
  buttonGap: 0.25,
  buttonGroupGap: 0.5,
  buttonPadding: 0.5,
};

export type AutoSpeed = {
  label: string;
  msPerWord: number;
};

/** Auto-advance speeds: milliseconds given to each word, fastest to slowest. */
export const AUTO_SPEEDS: AutoSpeed[] = [
  { label: "Faster", msPerWord: 200 },
  { label: "Fast", msPerWord: 400 },
  { label: "Medium", msPerWord: 600 },
  { label: "Slow", msPerWord: 800 },
  { label: "Slower", msPerWord: 1000 },
];

export const VIEW_ASPECT = 16 / 9;
export const CANVAS_ASPECT = 32 / 27;

/** Largest 16:9 rectangle that fits inside the viewport. */
export const screenWidth = (viewport: { width: number; height: number }) =>
  Math.min(viewport.width, viewport.height * VIEW_ASPECT);

export const screenHeight = (viewport: { width: number; height: number }) =>
  screenWidth(viewport) / VIEW_ASPECT;
