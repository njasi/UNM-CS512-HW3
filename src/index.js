const canvas = document.getElementById("glcanvas");
const vertEditor = document.getElementById("vertEditor");
const fragEditor = document.getElementById("fragEditor");

// try to plug in new scene abstraction
const scene = new Scene("glcanvas");

scene.shaders.push(
  new Shader("vertex", scene.gl.VERTEX_SHADER, "", "./src/shaders/vertex.vert"),
);

scene.shaders.push(
  new Shader(
    "fragment",
    scene.gl.FRAGMENT_SHADER,
    "",
    "./src/shaders/fragment.frag",
  ),
);

function addBarrel() {
  // // generate a primitive
  const barrel = generateBarrelObject(
    "barrel",
    undefined,
    20,
    1,
    2.5,
    0,
    0,
    0,
    0.2,
  );

  scene.addObject(barrel);
}

// rgba(1, 113, 187)
// scene.addObject(
//   generateGridObject("sea", [1 / 255, 113 / 255, 187 / 255], 100, 100),
// );

function setupMouseControls() {
  // Mouse and keyboard interactions
  let mouseDown = false,
    lastX,
    lastY;

  canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  canvas.addEventListener("mouseup", () => (mouseDown = false));
  canvas.addEventListener("mouseleave", () => (mouseDown = false));
  canvas.addEventListener("mousemove", (e) => {
    if (!mouseDown) return;
    let dx = e.clientX - lastX;
    let dy = e.clientY - lastY;

    scene.rotationY += dx * 0.01;
    scene.rotationX += dy * 0.01;

    lastX = e.clientX;
    lastY = e.clientY;
  });
}

function setupKeyboardControls() {
  document.addEventListener("keydown", (e) => {
    const step = 0.2;

    switch (e.key) {
      case "ArrowUp":
        scene.camera.move(0, -step, 0);
        break;

      case "ArrowDown":
        scene.camera.move(0, step, 0);
        break;

      case "ArrowLeft":
        scene.camera.move(step, 0, 0);
        break;

      case "ArrowRight":
        scene.camera.move(-step, 0, 0);
        break;

      case "w":
        scene.camera.move(0, 0, step);
        break;

      case "s":
        scene.camera.move(0, 0, -step);
        break;
    }
  });
}

let startTime = Date.now();

/**
 * Main init function
 * - initBuffers
 * - loadShaders from files
 * - attach key events to editors
 * - attach animation loop \
 */
async function main() {
  addBarrel();

  await scene.loadShaders();

  // this is kinda annoying, maybe i move them to a map
  const vertexShader = scene.shaders.find(
    (shader) => shader.type === scene.gl.VERTEX_SHADER,
  );
  const fragmentShader = scene.shaders.find(
    (shader) => shader.type === scene.gl.FRAGMENT_SHADER,
  );
  vertEditor.value = vertexShader.source;
  fragEditor.value = fragmentShader.source;

  scene.initShaderProgram(vertEditor.value, fragEditor.value);
  scene.initBuffers();

  // initShaderProgram();
  // vertEditor.onkeyup = initShaderProgram;
  // fragEditor.onkeyup = initShaderProgram;

  setupMouseControls();
  setupKeyboardControls();

  // Initialize when page loads
  // dont need onload since we defer this script

  setInterval(() => {
    scene.render();
  }, 30);
}

main();
