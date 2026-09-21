import ParticleEmitter from "./ParticleEmitterjs";

export class RainEmitter extends ParticleEmitter {
  constructor(x, y, z, w, h, d, rate) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    this.h = h;
    this.d = d;
    this.rate = rate;
  }

  animate() {
    // TODO spawn rain particles in the bounding box
  }
}
