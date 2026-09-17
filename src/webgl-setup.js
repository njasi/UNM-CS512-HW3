function createShader(gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  let vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  let fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  let prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog));
  }
  return prog;
}

// WebGL setup
const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl2");
if (!gl) {
  alert("WebGL2 not supported");
}
// TODO actually load from files instead of text content
let vertEditor = document.getElementById("vertEditor");
let fragEditor = document.getElementById("fragEditor");
// NOTE: now loaded from files...
// vertEditor.value = document.getElementById("vertex-shader").textContent;
// fragEditor.value = document.getElementById("fragment-shader").textContent;

let program, posLoc, colorLoc, timeLoc, uMVM, uPM, uMTM;

// vertex buffer, colors buffer, indices buffer.
let vbo, nbo, ibo;

// generate a primitive
const {vertices, indices, vertexCount } = generateGrid(30, 5);
const fillerColors = generateFillerColors(vertexCount);

// Buffers
function initBuffers() {
  vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  nbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nbo);
  gl.bufferData(gl.ARRAY_BUFFER, fillerColors, gl.STATIC_DRAW);

  ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
}

/**
 * Load a shader from a remote source (file)
 * @param {*} url shader url to load from
 * @returns 
 */
async function loadShader(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to load ${url}: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}

/**
 * Load our shaders and setup
 */
async function loadShaders(){
    const [vertexSource, fragmentSource] = await Promise.all([
      loadShader("./src/shaders/vertex.vert"),
      loadShader("./src/shaders/fragment.frag"),
    ]);

    // Put the loaded source into the editors
    vertEditor.value = vertexSource;
    fragEditor.value = fragmentSource;
}

function initShaderProgram() {
  try {
    program = createProgram(gl, vertEditor.value, fragEditor.value);
    gl.useProgram(program);
    posLoc = gl.getAttribLocation(program, "aPosition");
    colorLoc = gl.getAttribLocation(program, "aColor");
    timeLoc = gl.getUniformLocation(program, "uTime");
    uMVM = gl.getUniformLocation(program, "uModelViewMatrix");
    uPM = gl.getUniformLocation(program, "uProjectionMatrix");
    uMTM = gl.getUniformLocation(program, "uModelTransformationMatrix");
  } catch (e) {
    console.error(e);
  }
}

// Mouse and keyboard interactions
let mouseDown = false,
  lastX,
  lastY,
  cubeRotX = 0,
  cubeRotY = 0;
let camX = 0,
  camY = 0,
  camZ = -6;

canvas.addEventListener("mousedown", (e) => {
  mouseDown = true;
  lastX = e.clientX;
  lastY = e.clientY;
});
canvas.addEventListener("mouseup", () => (mouseDown = false));
canvas.addEventListener("mousemove", (e) => {
  if (!mouseDown) return;
  let dx = e.clientX - lastX;
  let dy = e.clientY - lastY;
  cubeRotY += dx * 0.01;
  cubeRotX += dy * 0.01;
  lastX = e.clientX;
  lastY = e.clientY;
});

document.addEventListener("keydown", (e) => {
  const step = 0.2;
  switch (e.key) {
    case "ArrowUp":
      camY -= step;
      break;
    case "ArrowDown":
      camY += step;
      break;
    case "ArrowLeft":
      camX += step;
      break;
    case "ArrowRight":
      camX -= step;
      break;
    case "w":
      camZ += step;
      break;
    case "s":
      camZ -= step;
      break;
  }
});

// Projection setup
let fov = Math.PI / 4,
  aspect = canvas.width / canvas.height,
  zNear = 0.1,
  zFar = 100;

let orthoSize = 2.5;

// Perspective and Orthographic projection
let projPerspective = perspective(fov, aspect, zNear, zFar);

let projOrtho = matMul(
  box2Cube(
    -orthoSize * aspect,
    orthoSize * aspect,
    -orthoSize,
    orthoSize,
    zNear,
    zFar,
  ),
  flipZ(),
);
let proj = projOrtho;

let startTime = Date.now();

function render() {
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // rotation matrices
  let cx = Math.cos(cubeRotY),
    sx = Math.sin(cubeRotY);
  let cy = Math.cos(cubeRotX),
    sy = Math.sin(cubeRotX);
  let rotX = [1, 0, 0, 0, 0, cy, sy, 0, 0, -sy, cy, 0, 0, 0, 0, 1];
  let rotY = [cx, 0, -sx, 0, 0, 1, 0, 0, sx, 0, cx, 0, 0, 0, 0, 1];
  let cubeRotation = multiplyMat4(rotY, rotX);

  // init model-view matrix as identity matrix
  let modelViewMatrix = mat4Identity();
  // init model transformation matrix as identity matrix
  let modelTransformationMatrix = mat4Identity();

  //delta time in ms
  let deltaTime = Date.now() - startTime;
  // object rotation
  modelTransformationMatrix = multiplyMat4(
    modelTransformationMatrix,
    cubeRotation,
  );
  // camera translation
  modelViewMatrix = mat4Translate(modelViewMatrix, [camX, camY, camZ]);

  //set time in seconds
  gl.uniform1f(timeLoc, deltaTime / 1000.0);
  gl.uniformMatrix4fv(uPM, false, proj);
  gl.uniformMatrix4fv(uMVM, false, modelViewMatrix);
  gl.uniformMatrix4fv(uMTM, false, modelTransformationMatrix);

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, nbo);
  gl.enableVertexAttribArray(colorLoc);
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

  // draw the object by the index order
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

/**
 * Main init function
 * - initBuffers
 * - loadShaders from files
 * - initShaderProgram
 * - attach key events to editors
 * - attach animation loop on load
 */
async function main() {
  initBuffers();

  await loadShaders();

  initShaderProgram();

  vertEditor.onkeyup = initShaderProgram;
  fragEditor.onkeyup = initShaderProgram;

  // Initialize when page loads
  // dont need onload since we defer this script
  // window.onload = function () {
  setInterval(render, 30);
  // };
}


main()
