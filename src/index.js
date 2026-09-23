import Scene from "./Scene";
import Shader from "./Shader";
import {
  generateBarrelObject,
  generateBombObject,
  generateCannonObject,
  generateCylinderObject,
  generateGridObject,
  rgba,
} from "./objects";
import { PhysicsObject } from "./objects/PhysicsObject";
import { generateBomb } from "./objects/compositions";

import { cacheOBJ, generateOBJObject } from "./objects/objLoader";

const canvas = document.getElementById("glcanvas");
const vertEditor = document.getElementById("vertEditor");
const fragEditor = document.getElementById("fragEditor");

// try to plug in new scene abstraction
const scene = new Scene("glcanvas");

scene.addShader(
  new Shader(
    "basicVertex",
    scene.gl.VERTEX_SHADER,
    "",
    "./src/shaders/vertex.vert",
  ),
);

scene.addShader(
  new Shader(
    "basicFragment",
    scene.gl.FRAGMENT_SHADER,
    "",
    "./src/shaders/fragment.frag",
  ),
);

let cannonConfig = {
  elevation: 45,
  yaw: 0,
  power: 0,
};

function updateCannon() {
  // TODO get cannon from scene and update it when we update config
  const cannon = scene.getObject("cannon");
  cannon.rotation[0] = (cannonConfig.elevation / 180) * Math.PI;
  cannon.rotation[1] = (cannonConfig.yaw / 180) * Math.PI;
}

function fireCannon() {
  // check strength, x,y sliders

  const bombPrim = generateBomb(0.5);

  // TODO do some calculation to get the position of the end of the cannon barrel
  const position = [0, 0, 0, 0];

  // TODO make random
  const rotation = [0, 0, 0, 0];
  const rotVelocity = [0, 0, 0, 0];

  // TODO calculate unit vector from the cannon angle
  //      and then scale based on the power slider
  const velocity = [0, 5, -25, 0];

  const bomb = new PhysicsObject(
    "bomb" + Date.now(),
    new Float32Array(bombPrim.vertices),
    new Float32Array(bombPrim.colors),
    new Uint16Array(bombPrim.indices),
    undefined,
    position,
    rotation,
    velocity,
    rotVelocity,
    9.81,
    0.5,
    true,
    () => {
      console.log("collided");
    },
  );

  scene.addObject(bomb, "basic");

  console.log("fired", bomb);
}

function initSceneObjects() {
  // generate a primitive
  // const barrel = generateBarrelObject(
  //   "barrel",
  //   undefined,
  //   20,
  //   1,
  //   2.5,
  //   0,
  //   0,
  //   0,
  //   0.2,
  // );

  // scene.addObject(barrel, "basic");

  // add water
  scene.addObject(
    generateGridObject("water", rgba(1, 86, 239), 100, 40),
    "basic",
  );

  // watercolor =>  rgba(1, 86, 239)
  const cannon = generateCannonObject("cannon", undefined);
  cannon.position[1] = 1.25;
  cannon.rotation[0] = Math.PI / 4;
  scene.addObject(cannon, "basic");
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

/**
 * Attach event listeners to the html elements
 * ie sliders & fire button
 */
function setupInputControls() {
  document.getElementById("fire-button").addEventListener("mousedown", () => {
    fireCannon();
  });

  function handleCannonConfig(event) {
    const name = event.target.name;
    cannonConfig[name] = parseFloat(event.target.value);
    document.getElementById(name + "Value").innerText = cannonConfig[name];
    updateCannon();
  }

  document.getElementById("yaw").addEventListener("input", handleCannonConfig);
  document
    .getElementById("elevation")
    .addEventListener("input", handleCannonConfig);
  document
    .getElementById("power")
    .addEventListener("input", handleCannonConfig);
}

/**
 * Main init function
 * - initBuffers
 * - loadShaders from files
 * - attach key events to editors
 * - attach animation loop \
 */
async function main() {
  // await cacheOBJ("./dist/utah_teapot.obj", "teapot");
  // scene.addObject(generateOBJObject("teapot1", undefined, "teapot"));

  await scene.loadShaders();

  scene.addProgram("basic", "basicVertex", "basicFragment");

  initSceneObjects();

  // this is kinda annoying, maybe i move them to a map
  const vertexShader = scene.shaders.find(
    (shader) => shader.type === scene.gl.VERTEX_SHADER,
  );
  const fragmentShader = scene.shaders.find(
    (shader) => shader.type === scene.gl.FRAGMENT_SHADER,
  );
  vertEditor.value = vertexShader.source;
  fragEditor.value = fragmentShader.source;

  scene.initBuffers();

  // initShaderProgram();
  // vertEditor.onkeyup = initShaderProgram;
  // fragEditor.onkeyup = initShaderProgram;

  setupMouseControls();
  setupKeyboardControls();
  setupInputControls();

  // Initialize when page loads
  // dont need onload since we defer this script

  setInterval(() => {
    scene.render();
  }, 30);
}

main();
