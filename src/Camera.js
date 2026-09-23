import {
  perspective,
  mat4Translate,
  matMul,
  box2Cube,
  frustum2Box,
  mat4Identity,
} from "./transformations";

export default class Camera {
  constructor(
    aspect,
    x = 0,
    y = 0,
    z = -6,
    fov = Math.PI / 4,
    zNear = 0.1,
    zFar = 100,
    orthoSize = 2.5,
  ) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.fov = fov;
    this.aspect = aspect;
    this.zNear = zNear;
    this.zFar = zFar;
    this.orthoSize = orthoSize;

    this.projection = this.createPerspectiveProjection();
  }

  createPerspectiveProjection() {
    return perspective(this.fov, this.aspect, this.zNear, this.zFar);
  }

  createOrthographicProjection() {
    return matMul(
      box2Cube(
        -this.orthoSize * this.aspect,
        this.orthoSize * this.aspect,
        -this.orthoSize,
        this.orthoSize,
        this.zNear,
        this.zFar,
      ),
      flipZ(),
    );
  }

  usePerspective() {
    this.projection = this.createPerspectiveProjection();
  }

  useOrthographic() {
    this.projection = this.createOrthographicProjection();
  }

  resize(aspect) {
    this.aspect = aspect;
    this.projection = this.createOrthographicProjection();
  }

  move(x, y, z) {
    this.x += x;
    this.y += y;
    this.z += z;
  }

  getViewMatrix() {
    return mat4Translate(mat4Identity(), [this.x, this.y, this.z]);
  }

  getProjectionMatrix() {
    return this.projection;
  }
}
