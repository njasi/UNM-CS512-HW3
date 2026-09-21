/**
 * Wrapper class to make animation and such simple.
 *
 * We will want this to hold
 * - vertices
 * - colors
 * - indices
 * (maybe multiples of the above)
 *
 * Later add for hierarchical models:
 * - children
 * - parent
 * - transformation matrix previously used?
 */

export default class SceneObject {
  constructor(label, vertices, colors, indices, parent = undefined) {
    this.label = label;

    // basic input from model generation
    this.vertices = vertices;
    this.colors = colors;
    this.indices = indices;

    // TODO parent and children for hierarchy later
    this.parent = parent;
    this.children = [];

    // transformation matrix to track?
    this.M = undefined;

    // vertex buffer, colors buffer, indices buffer
    this.vbo = undefined;
    this.nbo = undefined;
    this.ibo = undefined;
  }

  /**
   * Load the vertices, colors, indices into the buffers
   *
   * @param {*} gl the webgl2 context from canvas
   */
  loadBuffers(gl) {
    if (!(this.vertices instanceof Float32Array)) {
      throw new Error("vertices must be a Float32Array");
    }

    if (!(this.colors instanceof Float32Array)) {
      throw new Error("colors must be a Float32Array");
    }

    if (!(this.indices instanceof Uint16Array)) {
      throw new Error("indices must be a Uint16Array");
    }
    
    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    this.nbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    this.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
  }

  /**
   * Bind and setup buffers
   *
   * @param {*} gl the webgl2 context from canvas
   */
  bindBuffers(gl, posLoc, colorLoc) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
  }

  /**
   * Draw an object onto the canvas
   *
   * @param {*} gl the webgl2 context from canvas
   */
  draw(gl) {
    // draw the object by the index order
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  animate(dt) {
    // TODO, implement by extending this class
  }
}
