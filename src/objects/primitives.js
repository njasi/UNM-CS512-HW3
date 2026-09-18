function generateCube() {
  // cube
  const positions = new Float32Array([
    -1,
    -1,
    -1, // 0
    1,
    -1,
    -1, // 1
    1,
    1,
    -1, // 2
    -1,
    1,
    -1, // 3
    -1,
    -1,
    1, // 4
    1,
    -1,
    1, // 5
    1,
    1,
    1, // 6
    -1,
    1,
    1, // 7
  ]);

  const colors = new Float32Array([
    1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1,
  ]);

  // faces
  const indices = new Uint16Array([
    // Front
    4, 5, 6, 4, 6, 7,
    // Back
    1, 0, 3, 1, 3, 2,
    // Top
    3, 7, 6, 3, 6, 2,
    // Bottom
    0, 1, 5, 0, 5, 4,
    // Right
    1, 2, 6, 1, 6, 5,
    // Left
    0, 4, 7, 0, 7, 3,
  ]);

  return { vertices: positions, colors, indices };
}

function generateSphere() {
  // TODO
}

function generateCone() {
  // TODO
}

function generateRectangularPrism() {
  // TODO
}

function generateCylinder() {
  // TODO
}

function generateBulgingCylinder() {
  // TODO
}

function generateTorus() {
  // TODO
}

/**
 * Generate a square grid centered on the origin
 * @param {*} segments
 * @param {*} size
 */
function generateGrid(segments, size) {
  const vertices = [];
  const indices = [];

  // iterate over depth
  for (let z = 0; z <= segments; z++) {
    const vertZ = (z / segments - 0.5) * size;
    // iterate side to side
    for (let x = 0; x <= segments; x++) {
      const vertX = (x / segments - 0.5) * size;
      vertices.push(vertX, 0, vertZ);
    }
  }

  // create face indices
  for (let z = 0; z < segments; z++) {
    for (let x = 0; x < segments; x++) {
      const i_0 = z * (segments + 1) + x;
      // shift relative to first point to select the other nearby points
      const i_1 = i_0 + 1;
      // shift all the way to the next row of points
      const i_2 = i_0 + segments + 1;
      const i_3 = i_2 + 1;

      // push the two triangle faces
      indices.push(i_0, i_2, i_1, i_1, i_2, i_3);
    }
  }

  // package it for the buffers
  return {
    vertices: new Float32Array(vertices),
    indices: new Uint16Array(indices),
    vertexCount: vertices.length / 3,
    indexCount: indices.length,
  };
}

/**
 * Generate a filler color array for an object
 * @param {*} vertCount 
 * @param {*} color 
 * @param {*} alpha 
 * @returns Float32Array of colors
 */
function generateFillerColors(vertCount, color = undefined, alpha = false) {
  const colors = [];

  for (let i = 0; i < vertCount; i++) {
    if (color != undefined) {
      colors.push(...color);
      continue;
    }

    // if no color defined just make a random one.
    colors.push(Math.random(), Math.random(), Math.random());
    if (alpha) {
      colors.push(1);
    }
  }

  return new Float32Array(colors);
}
