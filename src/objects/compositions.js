// TODO generate shapes from a composition of primitives

// raft
// bunch of cylinders horizontally as body
// rectangular prisms perpendicular to body logs as bindings?
// one cylinder mast
// one cylinder or prism crossbar
// rectangular prism sail

import { mat4Identity, mat4RotateY, transformVertices } from "../transformations";
import { rgba } from "./helpers";
import {
  generateCylinder,
  generateFillerColors,
  generateSphere,
  generateTorus,
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
export function generateCannon(barrelLength = 3) {
  const { vertices: shaftVerts, indices: shaftInds } = generateCylinder(
    20,
    1,
    barrelLength,
    0,
    0,
    -barrelLength / 2,
    0,
    true,
    2,
  );
  const { vertices: endVerts, indices: endInds } = generateSphere(
    20,
    1,
    0,
    0,
    0,
  );
  const { vertices: fuseVerts, indices: fuseInds } = generateCylinder(
    10,
    0.2,
    0.2,
    3,
  );

  const {
    vertices: wheel1Verts,
    indices: wheel1Inds,
    vertexCount: wheelVertCount,
  } = generateTorus(40, 1.15, 0.15, 0, 0, -1.15);

  const { vertices: wheel2Verts, indices: wheel2Inds } = generateTorus(
    20,
    1.15,
    0.15,
    0,
    0,
    1.15,
  );

  const wheelVerts = [...wheel1Verts, ...wheel2Verts];
  const wheelInds = [
    ...wheel1Inds,
    ...wheel2Inds.map((ind) => ind + wheelVertCount),
  ];

  // TODO transformations to place the parts
  const id = mat4Identity();
  const wheelRot = mat4RotateY(id, Math.PI/2);
  
  const wheelVertsRotated = transformVertices(wheelVerts, wheelRot)


  const bodyVertCount =
    (shaftVerts.length + fuseVerts.length + endVerts.length) / 4;
  const cannonBodyColors = generateFillerColors(
    bodyVertCount,
    rgba(34, 34, 34, 1),
  );

  const wheelsVertCount = wheelVertCount * 2;
  const wheelColors = generateFillerColors(
    wheelsVertCount,
    rgba(150, 111, 51, 1),
  );

  shaftInds.push(...endInds.map((ind) => ind + shaftVerts.length / 4));
  shaftVerts.push(...endVerts);

  shaftInds.push(...fuseInds.map((ind) => ind + shaftVerts.length / 4));
  shaftVerts.push(...fuseVerts);

  console.log(shaftVerts.length, bodyVertCount, cannonBodyColors.length);

  const cannonVerts = [...shaftVerts, ...wheelVertsRotated];
  const cannonInds = [
    ...shaftInds,
    ...wheelInds.map((ind) => ind + shaftVerts.length / 4),
  ];
  const cannonColors = [...cannonBodyColors, ...wheelColors];

  return {
    vertices: cannonVerts,
    indices: cannonInds,
    colors: cannonColors,
    vertexCount: shaftVerts.length / 4,
  };
}
