import Camera from "./Camera";
import { rgba } from "./objects";
import Shader from "./Shader";
import ShaderProgram from "./ShaderProgram";
import { multiplyMat4, mat4Identity } from "./transformations";

export default class Scene {
  constructor(canvasID) {
    this.canvas = document.getElementById(canvasID);
    this.gl = this.canvas.getContext("webgl2");

    if (!this.gl) {
      alert("WebGL2 not supported");
    }
    
    // TODO replace objects & shaders with maps. will probably want lights too
    this.objects = [];
    this.lights = [];
    this.shaders = [];
    this.background = rgba(64, 112, 255, 1);
    
    // use to check if we actually need to switch shaders...
    this.activeProgram = undefined;
    // Map<string, ShaderProgram>
    this.programs = new Map();

    this.rotationX = 0;
    this.rotationY = 0;

    this.camera = new Camera(this.canvas.height / this.canvas.width);

    // object rotation
    this.rotationX;
    this.rotationY;

    // bind this to the renderer so we dont have context issues
    this.render = this.render.bind(this);
  }

  /**
   * Load our shaders and setup
   */
  async loadShaders() {
    await Promise.all(this.shaders.map((shader) => shader.loadRemote()));

    for (let i = 0; i < this.shaders.length; i++) {
      this.shaders[i].create(this.gl);
    }
  }

  /**
   * create the shaders and combined gl shader program
   *
   * @param {*} vertexShader
   * @param {*} fragmentShader
   * @returns
   */
  createProgram(vertexShader, fragmentShader) {
    const program = this.gl.createProgram();

    this.gl.attachShader(program, vertexShader.shader);
    this.gl.attachShader(program, fragmentShader.shader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      this.gl.deleteProgram(program);
      throw new Error(
        `Failed to link shader program: ${this.gl.getProgramInfoLog(program)}`,
      );
    }

    return program;
  }

  /**
   * Add a shader to the scene
   * @param {Shader} shader 
   */
  addShader(shader) {
    this.shaders.push(shader);
  }

  /**
   * Get a shader by its label
   * @param {*} label 
   * @returns 
   */
  getShader(label) {
    // TODO should I shove shaders in a map?
    const shader = this.shaders.find((shader) => shader.label === label);

    if (!shader) {
      throw new Error(`Shader "${label}" was not found`);
    }

    return shader;
  }

  /**
   * Create a new program
   * @param {*} label
   * @param {*} vertexShaderLabel
   * @param {*} fragmentShaderLabel
   * @returns
   */
  addProgram(label, vertexShaderLabel, fragmentShaderLabel) {
    const vertexShader = this.getShader(vertexShaderLabel);
    const fragmentShader = this.getShader(fragmentShaderLabel);

    if (!vertexShader.shader || !fragmentShader.shader) {
      throw new Error(
        `Shaders for program "${label}" must be compiled before creating the program`,
      );
    }

    const program = this.createProgram(vertexShader, fragmentShader);
    const shaderProgram = new ShaderProgram(label, program, this.gl);

    this.programs.set(label, shaderProgram);

    return shaderProgram;
  }

  /**
   * Get a program by its label
   * @param {string} label
   * @returns
   */
  getProgram(label) {
    const shaderProgram = this.programs.get(label);

    if (!shaderProgram) {
      throw new Error(`Shader program "${label}" was not found`);
    }

    return shaderProgram;
  }

  /**
   * Initialize the buffers for every SceneObject
   */
  initBuffers() {
    this.objects.forEach((obj) => {
      obj.loadBuffers(this.gl);
    });
  }

  /**
   * Add an object to the scene
   * TODO probably some binding needed?
   */
  addObject(obj, programLabel = obj.programLabel) {
    if (!programLabel) {
      throw new Error(
        `Object "${obj.label ?? "unknown"}" does not have a shader program`,
      );
    }

    obj.programLabel = programLabel;
    this.objects.push(obj);
  }

  /**
   * TODO probably some unbinding or something?
   * @param {*} label
   */
  removeObject(label) {
    this.objects = this.objects.filter((obj) => obj.label !== label);
  }

  /**
   * Set the scene rotation.
   *
   * NOTE this is not camera rotation,
   *      it is full rotation of the objects in the scene
   * @param {*} x
   * @param {*} y
   */
  setRotation(x, y) {
    this.rotationX = x;
    this.rotationY = y;
  }

  /**
   * Update the state of the scene
   * @param {*} dt timestep in seconds
   */
  update(dt) {
    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];
      obj.update(dt, this);
    }
  }

  /**
   * Render the scene
   */
  render() {
    if (!this.gl) {
      console.error("Scene has no WebGL context");
      return;
    }

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clearColor(...this.background);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // rotation matrices
    const cx = Math.cos(this.rotationY);
    const sx = Math.sin(this.rotationY);
    const cy = Math.cos(this.rotationX);
    const sy = Math.sin(this.rotationX);
    const rotX = [1, 0, 0, 0, 0, cy, sy, 0, 0, -sy, cy, 0, 0, 0, 0, 1];
    const rotY = [cx, 0, -sx, 0, 0, 1, 0, 0, sx, 0, cx, 0, 0, 0, 0, 1];

    let sceneRotation = multiplyMat4(rotY, rotX);

    // NOTE isn't doing this math in js slow?
    // init model-view matrix as identity matrix
    let modelViewMatrix = this.camera.getViewMatrix();
    // get projection from camera
    const projectionMatrix = this.camera.getProjectionMatrix();
    // init model transformation matrix as identity matrix
    let modelTransformationMatrix = mat4Identity();
    // object rotation
    modelTransformationMatrix = multiplyMat4(
      modelTransformationMatrix,
      sceneRotation,
    );
    
    //delta time in ms
    let deltaTime = Date.now() - this.startTime;

    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];

      const shaderProgram = this.getProgram(obj.programLabel);
      if(obj.programLabel != this.activeProgram){
        shaderProgram.use(this.gl);
      }



      // we only need to update these guys on the first loop iteration or on switch
      if(i == 0 || obj.programLabel != this.activeProgram){

        // set time in seconds
        if (shaderProgram.timeLoc !== null) {
          this.gl.uniform1f(shaderProgram.timeLoc, deltaTime / 1000);
        }
  
        if (shaderProgram.uPM !== null) {
          this.gl.uniformMatrix4fv(shaderProgram.uPM, false, projectionMatrix);
        }
        if (shaderProgram.uMVM !== null) {
          this.gl.uniformMatrix4fv(shaderProgram.uMVM, false, modelViewMatrix);
        }
        if (shaderProgram.uMTM !== null) {
          this.gl.uniformMatrix4fv(
            shaderProgram.uMTM,
            false,
            modelTransformationMatrix,
          );
        }
      }

      obj.bindBuffers(this.gl, shaderProgram.posLoc, shaderProgram.colorLoc);
      obj.draw(this.gl);
    }
  }
}
