export default class Quat2 {
  rx: number;
  ry: number;
  rz: number;
  rw: number;
  dx: number;
  dy: number;
  dz: number;
  dw: number;

  constructor(rx = 0, ry = 0, rz = 0, rw = 1, dx = 0, dy = 0, dz = 0, dw = 0) {
    this.rx = rx;
    this.ry = ry;
    this.rz = rz;
    this.rw = rw;
    this.dx = dx;
    this.dy = dy;
    this.dz = dz;
    this.dw = dw;
  }

  clone() {
    return new Quat2(
      this.rx,
      this.ry,
      this.rz,
      this.rw,
      this.dx,
      this.dy,
      this.dz,
      this.dw
    );
  }
}
