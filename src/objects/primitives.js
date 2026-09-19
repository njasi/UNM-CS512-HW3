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

function generateSphere(segments, r, x_c, y_c, z_c) {
  const vertices = [];
  const indices = [];

  for (let v = 0; v <= segments; v++) {
    const vRad = (Math.PI * v) / segments;

    const vertZ = z_c + r * Math.cos(vRad);
    for (let u = 0; u <= segments; u++) {
      const uRad = (2 * Math.PI * u) / segments;

      const vertX = x_c + r * Math.sin(vRad) * Math.sin(uRad);
      const vertY = y_c + r * Math.sin(vRad) * Math.cos(uRad);

      vertices.push(vertX, vertY, vertZ);
    }
  }

  for (let v = 0; v < segments; v++) {
    for (let u = 0; u < segments; u++) {
      const i_0 = v * (segments + 1) + u;
      const i_1 = i_0 + 1;
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

function generateCone(segments, r, h, x_c, y_c, z_c, solid = true) {
  const vertices = [];
  const indices = [];

  for (let v = 0; v <= segments; v++) {
    const vFrac = v / segments;

    const vertZ = z_c + vFrac * h;
    for (let u = 0; u <= segments; u++) {
      const uRad = (2 * Math.PI * u) / segments;

      const vertX = x_c + r * (1 - vFrac) * Math.cos(uRad);
      const vertY = y_c + r * (1 - vFrac) * Math.sin(uRad);

      vertices.push(vertX, vertY, vertZ);
    }
  }

  for (let v = 0; v < segments; v++) {
    for (let u = 0; u < segments; u++) {
      const i_0 = v * (segments + 1) + u;
      const i_1 = i_0 + 1;
      const i_2 = i_0 + segments + 1;
      const i_3 = i_2 + 1;

      // push the two triangle faces
      indices.push(i_0, i_2, i_1, i_1, i_2, i_3);
    }
  }

  if (solid) {
    const bottomCenterIndex = vertices.length / 3;

    vertices.push(x_c, y_c, z_c);

    for (let u = 0; u < segments; u++) {
      const current = u;
      const next = u + 1;

      indices.push(bottomCenterIndex, next, current);
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

function generatePrism() {
  // TODO
}

function generateCylinder(
  segments,
  r,
  h,
  x_c,
  y_c,
  z_c,
  bulge = 0,
  solid = true,
) {
  const vertices = [];
  const indices = [];

  for (let v = 0; v <= segments; v++) {
    const vFrac = v / segments;

    const vertZ = z_c - h / 2 + vFrac * h;
    for (let u = 0; u <= segments; u++) {
      const uRad = (2 * Math.PI * u) / segments;

      const bulgeAmt = 1 + bulge * Math.sin(vFrac * Math.PI);

      const vertX = x_c + r * bulgeAmt * Math.cos(uRad);
      const vertY = y_c + r * bulgeAmt * Math.sin(uRad);

      vertices.push(vertX, vertY, vertZ);
    }
  }

  for (let v = 0; v < segments; v++) {
    for (let u = 0; u < segments; u++) {
      const i_0 = v * (segments + 1) + u;
      const i_1 = i_0 + 1;
      const i_2 = i_0 + segments + 1;
      const i_3 = i_2 + 1;

      // push the two triangle faces
      indices.push(i_0, i_2, i_1, i_1, i_2, i_3);
    }
  }

  if (solid) {
    const bottomCenterIndex = vertices.length / 3;

    vertices.push(x_c, y_c, z_c - h / 2);

    for (let u = 0; u < segments; u++) {
      const current = u;
      const next = u + 1;

      indices.push(bottomCenterIndex, next, current);
    }

    const topCenterIndex = vertices.length / 3;
    vertices.push(x_c, y_c, z_c + h / 2);

    const topStart = segments * (segments + 1);

    for (let u = 0; u < segments; u++) {
      const current = topStart + u;
      const next = current + 1;

      indices.push(topCenterIndex, current, next);
    }
  }

  // package it for the buffers
  return {
    vertices: vertices,
    indices: indices,
    vertexCount: vertices.length / 3,
    indexCount: indices.length,
  };
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
 * @returns number array of colors
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

  return colors;
}
