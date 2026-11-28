import {
  Canvas as DrawCanvas,
  OffscreenCanvas,
  View,
  type CanvasRenderingContext2D,
  type CanvasSize,
} from "nsh";
import baseImage from "../assets/base.png";
import { FALLBACK_PALETTE, paletteFromPng } from "./palette";
import { CANVAS_ASPECT, colors } from "./theme";

const SAMPLE_WIDTH = 48;

function drawCanvas(cx: CanvasRenderingContext2D, size: CanvasSize) {
  const { width: imageWidth, height: imageHeight } = baseImage.size;
  const scale = Math.min(size.width / imageWidth, size.height / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  cx.fillStyle = colors.background;
  cx.fillRect(0, 0, size.width, size.height);
  cx.drawImage(
    baseImage,
    (size.width - width) / 2,
    (size.height - height) / 2,
    width,
    height,
  );
}

export async function sampleCanvasPalette(): Promise<string[]> {
  try {
    const height = Math.max(1, Math.round(SAMPLE_WIDTH / CANVAS_ASPECT));
    const offscreen = new OffscreenCanvas(SAMPLE_WIDTH, height);
    const context = offscreen.getContext("2d");
    drawCanvas(context, { width: SAMPLE_WIDTH, height });

    const blob = await offscreen.convertToBlob({ type: "image/png", scale: 1 });
    return paletteFromPng(new Uint8Array(await blob.arrayBuffer()));
  } catch {
    return FALLBACK_PALETTE;
  }
}

/** Background canvas: the scene image held at the game's canvas aspect. */
export function Canvas() {
  return (
    <View
      testID="canvas"
      style={{
        height: "100%",
        aspectRatio: CANVAS_ASPECT,
        flexShrink: 0,
        justifyContent: "center",
      }}
    >
      <DrawCanvas
        testID="base-image"
        draw={drawCanvas}
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
}
