export default class Mat2d {
  m00: number;
  m01: number;
  m10: number;
  m11: number;
  m20: number;
  m21: number;

  constructor(m00 = 1, m01 = 0, m10 = 0, m11 = 1, m20 = 0, m21 = 0) {
    this.m00 = m00;
    this.m01 = m01;
    this.m10 = m10;
    this.m11 = m11;
    this.m20 = m20;
    this.m21 = m21;
  }

  clone() {
    return new Mat2d(
      this.m00,
      this.m01,
      this.m10,
      this.m11,
      this.m20,
      this.m21
    );
  }
}
