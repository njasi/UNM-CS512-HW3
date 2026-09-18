class Scene {
  constructor(canvasID) {
    this.canvas = document.getElementById(canvasID);
    this.gl = this.canvas.getContext("webgl2");

    if (!this.gl) {
      alert("WebGL2 not supported");
    }

    this.objects = [];
    this.lights = [];
    this.shaders = [];
    this.background = undefined;

    // TODO probably abstract these later but am already doing enough
    this.program = undefined;
    this.posLoc = undefined;
    this.colorLoc = undefined;
    this.timeLoc = undefined;
    this.uMVM = undefined;
    this.uPM = undefined;
    this.uMTM = undefined;


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

    for(let i = 0; i< this.shaders.length; i++){
      this.shaders[i].create(this.gl);
    }
  }

  /**
   * create the shaders and overall gl program
   *
   * TODO variable amount of shaders
   * @param {*} vsSource
   * @param {*} fsSource
   * @returns
   */
  createProgram(vsSource, fsSource) {
    // let vs = new Shader("vertex", this.gl.VERTEX_SHADER, vsSource, vsSource);
    // let fs = new Shader(
    //   "fragment",
    //   this.gl.FRAGMENT_SHADER,
    //   fsSource,
    //   fsSource,
    // );

    // vs.create(this.gl);
    // fs.create(this.gl);

    // TODO dynamic setup of shaders...
    const vs = this.shaders[0];
    const fs = this.shaders[1];


    let prog = this.gl.createProgram();
    this.gl.attachShader(prog, vs.shader);
    this.gl.attachShader(prog, fs.shader);
    this.gl.linkProgram(prog);

    if (!this.gl.getProgramParameter(prog, this.gl.LINK_STATUS)) {
      throw new Error(this.gl.getProgramInfoLog(prog));
    }

    return prog;
  }

  /**
   *
   */
  initShaderProgram(vertexSource, fragmentSource) {
    try {
      this.program = this.createProgram(this.gl, vertexSource, fragmentSource);
      this.gl.useProgram(this.program);

      this.posLoc = this.gl.getAttribLocation(this.program, "aPosition");
      this.colorLoc = this.gl.getAttribLocation(this.program, "aColor");
      this.timeLoc = this.gl.getUniformLocation(this.program, "uTime");
      this.uMVM = this.gl.getUniformLocation(this.program, "uModelViewMatrix");
      this.uPM = this.gl.getUniformLocation(this.program, "uProjectionMatrix");
      this.uMTM = this.gl.getUniformLocation(
        this.program,
        "uModelTransformationMatrix",
      );
    } catch (e) {
      console.error(e);
    }
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
  addObject(obj) {
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

  render() {
    if (!this.gl) {
      console.error("Scene has no WebGL context");
      return;
    }

    if (!this.program) {
      console.warn("Cannot render before initializing the shader program");
      return;
    }

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // rotation matrices
    const cx = Math.cos(this.rotationY);
    const sx = Math.sin(this.rotationY);
    const cy = Math.cos(this.rotationX);
    const sy = Math.sin(this.rotationX);
    const rotX = [1, 0, 0, 0, 0, cy, sy, 0, 0, -sy, cy, 0, 0, 0, 0, 1];
    const rotY = [cx, 0, -sx, 0, 0, 1, 0, 0, sx, 0, cx, 0, 0, 0, 0, 1];

    let sceneRotation = multiplyMat4(rotY, rotX);

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

    // // camera translation
    // modelViewMatrix = mat4Translate(modelViewMatrix, [camX, camY, camZ]);

    //delta time in ms
    let deltaTime = Date.now() - this.startTime;

    // set time in seconds
    this.gl.uniform1f(this.timeLoc, deltaTime / 1000.0);
    this.gl.uniformMatrix4fv(this.uPM, false, projectionMatrix);
    this.gl.uniformMatrix4fv(this.uMVM, false, modelViewMatrix);
    this.gl.uniformMatrix4fv(this.uMTM, false, modelTransformationMatrix);

    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];
      obj.bindBuffers(this.gl, this.posLoc, this.colorLoc);
      obj.draw(this.gl);
    }
  }
}
