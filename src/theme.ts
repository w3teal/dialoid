import Merriweather from "../assets/Merriweather-Regular.ttf";
import "../assets/Merriweather-ExtraBold.ttf";

export const colors = {
  background: "#f9f5d7",
  text: "#7c6f64",
  accent: "#98971a",
  black: "#000000",
};

export const fontFamily = Merriweather;

export const VIEW_ASPECT = 16 / 9;
export const IMAGE_ASPECT = 32 / 27;

/** Largest 16:9 rectangle that fits inside the viewport. */
export const screenWidth = (viewport: { width: number; height: number }) =>
  Math.min(viewport.width, viewport.height * VIEW_ASPECT);

export const screenHeight = (viewport: { width: number; height: number }) =>
  screenWidth(viewport) / VIEW_ASPECT;
