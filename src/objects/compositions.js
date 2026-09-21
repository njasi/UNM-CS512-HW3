// TODO generate shapes from a composition of primitives

// raft
// bunch of cylinders horizontally as body
// rectangular prisms perpendicular to body logs as bindings?
// one cylinder mast
// one cylinder or prism crossbar
// rectangular prism sail

import {
  mat4Identity,
  mat4RotateX,
  mat4RotateY,
  mat4RotateZ,
  mat4Translate,
  matMul,
  transformVertices,
} from "../transformations";
import { rgba } from "./helpers";
import {
  generateCylinder,
  generateFillerColors,
  generateSphere,
  generateTorus,
} from "./primitives";

/**
 * Combine vert & ind lists together
 */
function combine(verts, inds) {
  const resultVerts = [];
  const resultInds = [];

  for (let i = 0; i < verts.length; i++) {
    resultInds.push(...inds[i].map((ind) => ind + resultVerts.length / 4));
    resultVerts.push(...verts[i]);
  }

  return [resultVerts, resultInds];
}

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

function generateWheel(segments, R, r, spokes, x_c, y_c, z_c) {
  const { vertices: rimVerts, indices: rimInds } = generateTorus(
    segments,
    R,
    r,
    x_c,
    y_c,
    z_c,
  );

  let spokeVerts = [],
    spokeInds = [];

  for (let i = 0; i < spokes; i++) {
    // TODO wtf is goin on here with the transformations
    // why does setting z_c make the cylinders fly in every direction
    const { vertices: tmpVerts, indices: tmpInds } = generateCylinder(
      segments,
      r / 2,
      R * 2,
      -z_c,
      y_c,
      0, //z_c
      0,
      false,
      2,
    );

    // rotate the spoke
    const id = mat4Identity();
    const ry = mat4RotateY(id, Math.PI / 2);
    const rx = mat4RotateX(id, (Math.PI * i) / spokes);

    const M = matMul(ry, rx);
    const rotatedTmpVerts = transformVertices(tmpVerts, M);

    let [tmpspokeVerts, tmpspokeInds] = combine(
      [spokeVerts, rotatedTmpVerts],
      [spokeInds, tmpInds],
    );

    spokeVerts = tmpspokeVerts;
    spokeInds = tmpspokeInds;
  }

  const [wheelVerts, wheelInds] = combine(
    [rimVerts, spokeVerts],
    [rimInds, spokeInds],
  );

  return {
    vertices: wheelVerts,
    indices: wheelInds,
    vertexCount: wheelVerts / 4,
  };
}

/**
 * Generate a cannon object
 */
export function generateCannon(barrelLength = 3) {

  // generate all the individual parts
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
  );

  const { vertices: axelVerts, indices: axelInds } = generateCylinder(
    16,
    0.15,
    2.5,
  );

  const { vertices: wheel1Verts, indices: wheel1Inds } = generateWheel(
    40,
    1.15,
    0.15,
    4,
    0,
    0,
    -1.15,
  );

  const { vertices: wheel2Verts, indices: wheel2Inds } = generateWheel(
    40,
    1.15,
    0.15,
    4,
    0,
    0,
    1.15,
  );

  const [wheelVerts, wheelInds] = combine(
    [wheel1Verts, wheel2Verts],
    [wheel1Inds, wheel2Inds],
  );

  // transformations to place the parts
  const id = mat4Identity();
  const wheelRot = mat4RotateY(id, Math.PI / 2);

  const fuseRot = mat4RotateX(id, Math.PI/2);
  const fuseTrans = mat4Translate(id, [0,1,0])
  const fuseM = matMul(fuseTrans, fuseRot);

  const fuseVertsTransformed = transformVertices(fuseVerts, fuseM)
  const wheelVertsRotated = transformVertices(wheelVerts, wheelRot);
  const axelVertsRotated = transformVertices(axelVerts, wheelRot);


  // combine the things all together now
  const [bodyVerts, bodyInds] = combine(
    [shaftVerts, fuseVertsTransformed, endVerts, axelVertsRotated],
    [shaftInds, fuseInds, endInds, axelInds],
  );

  const [cannonVerts, cannonInds] = combine(
    [bodyVerts, wheelVertsRotated],
    [bodyInds, wheelInds],
  );

  // generate the colors
  const cannonBodyColors = generateFillerColors(
     bodyVerts.length / 4,
    rgba(34, 34, 34, 1),
  );

  const wheelColors = generateFillerColors(
    wheelVerts.length / 4,
    rgba(150, 111, 51, 1),
  );

  const cannonColors = [...cannonBodyColors, ...wheelColors];

  return {
    vertices: cannonVerts,
    indices: cannonInds,
    colors: cannonColors,
    vertexCount: shaftVerts.length / 4,
  };
}
