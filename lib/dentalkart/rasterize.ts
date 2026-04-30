import { Resvg } from "@resvg/resvg-js";
import path from "node:path";

const FONT_DIR = path.join(process.cwd(), "lib/fonts");
const FONT_FILES = [
  path.join(FONT_DIR, "Inter-Regular.ttf"),
  path.join(FONT_DIR, "Inter-Bold.ttf"),
  path.join(FONT_DIR, "Inter-ExtraBold.ttf"),
];

// Rasterize an SVG to a 2400x1260 PNG using bundled Inter fonts.
// Using resvg (not sharp) because sharp's prebuilt binaries don't reliably
// include Pango/Cairo, so SVG <text> renders as .notdef tofu boxes.
export function rasterizeFeaturedImage(svg: string): Buffer {
  const resvg = new Resvg(svg, {
    font: {
      loadSystemFonts: false,
      fontFiles: FONT_FILES,
      defaultFontFamily: "Inter",
      sansSerifFamily: "Inter",
    },
    fitTo: { mode: "width", value: 2400 },
    shapeRendering: 2,
    textRendering: 2,
    imageRendering: 0,
  });
  return resvg.render().asPng();
}
