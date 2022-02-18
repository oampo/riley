export default class Mat2 {
  m00: number;
  m01: number;
  m10: number;
  m11: number;

  constructor(m00 = 1, m01 = 0, m10 = 0, m11 = 1) {
    this.m00 = m00;
    this.m01 = m01;
    this.m10 = m10;
    this.m11 = m11;
  }

  clone() {
    return new Mat2(this.m00, this.m01, this.m10, this.m11);
  }
}
