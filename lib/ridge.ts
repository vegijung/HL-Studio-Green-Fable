/**
 * Ridge geometry helpers (BRIEF.md section 6, step 3).
 *
 * content/ridge.json holds the photographed ridge as normalised image
 * coordinates (0..1 of the image width and height). The hero draws the image
 * with object-fit: cover, so the same cover transform has to be applied to the
 * points for the line to sit on the ridge at any viewport aspect ratio.
 */

export type NormPoint = [number, number];

export interface RidgeData {
  source: string;
  width: number;
  height: number;
  points: NormPoint[];
}

/** narrows the plain JSON import (number[][]) into typed points */
export function toRidgeData(json: {
  source: string;
  width: number;
  height: number;
  points: number[][];
}): RidgeData {
  return {
    source: json.source,
    width: json.width,
    height: json.height,
    points: json.points.map(([x, y]) => [x, y]),
  };
}

export interface CoverTransform {
  /** rendered image width and height in viewport pixels */
  drawWidth: number;
  drawHeight: number;
  /** offset of the image's top-left corner relative to the box (negative when cropped) */
  offsetX: number;
  offsetY: number;
}

/**
 * Same math the browser uses for object-fit: cover with object-position 50% 50%:
 * scale so the image covers the box, then centre the overflow.
 */
export function coverTransform(
  imageWidth: number,
  imageHeight: number,
  boxWidth: number,
  boxHeight: number,
): CoverTransform {
  const scale = Math.max(boxWidth / imageWidth, boxHeight / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  return {
    drawWidth,
    drawHeight,
    offsetX: (boxWidth - drawWidth) / 2,
    offsetY: (boxHeight - drawHeight) / 2,
  };
}

/** maps a normalised image point into box pixels through a cover transform */
export function projectPoint(
  [nx, ny]: NormPoint,
  t: CoverTransform,
): [number, number] {
  return [t.offsetX + nx * t.drawWidth, t.offsetY + ny * t.drawHeight];
}

/** maps the whole ridge into box pixels */
export function projectRidge(
  ridge: RidgeData,
  boxWidth: number,
  boxHeight: number,
): Array<[number, number]> {
  const t = coverTransform(ridge.width, ridge.height, boxWidth, boxHeight);
  return ridge.points.map((p) => projectPoint(p, t));
}
