// TODO generate shapes from a composition of primitives

// raft
// bunch of cylinders horizontally as body
// rectangular prisms perpendicular to body logs as bindings?
// one cylinder mast
// one cylinder or prism crossbar
// rectangular prism sail

import {
  generateCylinder,
  generateFillerColors,
  generateSphere,
} from "./primitives";

/**
 * Generate a Parametric (kinda) Barrel
 * one cylinder as main body
 *  - the barrel body should be low to get the
 *    look of individual staves for free
 * 4 cylinders for the binding rings
 *
 * @param {*} segments
 * @param {*} r
 * @param {*} h
 * @param {*} x_c
 * @param {*} y_c
 * @param {*} z_c
 * @param {*} bulge
 * @returns
 */
export function generateBarrel(
  segments,
  r,
  h,
  x_c,
  y_c,
  z_c,
  bulge = 0.4,
  staves = 10,
) {
  let {
    vertices: mainVert,
    indices: mainInd,
    vertexCount: mainVCount,
  } = generateCylinder(staves, r, h, x_c, y_c, z_c, bulge, true, segments);

  const bracePositions = [-0.449, -0.2, 0.2, 0.449];

  const mainColors = generateFillerColors(
    mainVCount,
    [150 / 255, 111 / 255, 51 / 255, 1],
    true,
  );

  for (let i = 0; i < bracePositions.length; i++) {
    const brace_z = z_c + bracePositions[i] * h;
    const brace_r_angle = Math.PI * (bracePositions[i] + 0.5);

    const {
      vertices: braceVert,
      indices: braceInd,
      vertexCount: braceVCount,
    } = generateCylinder(
      staves,
      r + r * (bulge + 0.07) * Math.sin(brace_r_angle),
      0.1 * h,
      x_c,
      y_c,
      brace_z,
      0,
      true,
      2,
    );

    mainVert.push(...braceVert);
    mainInd.push(...braceInd.map((n) => n + mainVCount));
    mainVCount += braceVCount;
    mainColors.push(
      ...generateFillerColors(braceVCount, [0.2, 0.2, 0.2, 1], true),
    );
  }

  return {
    vertices: mainVert,
    colors: mainColors,
    indices: mainInd,
    vertexCount: mainVert.length / 4,
    indexCount: mainInd.length,
  };
}

/**
 * Generate a cannon object
 */
export function generateCannon() {
  const { vertices: shaftVerts, indices: shaftInds } = generateCylinder(
    10,
    1,
    10,
  );
  const { vertices: endVerts, indices: endInds } = generateSphere(10, 1);
  const { vertices: fuseVerts, indices: fuseInds } = generateCylinder(
    10,
    0.2,
    0.2,
  );

  // TODO transformations to place the parts

  const bodyVertCount =
    shaftVerts.length + fuseVerts.length + shaftVerts.length;
  const canonBodyColors = generateFillerColors(bodyVertCount, [0.2, 0.2, 0.2]);
}
