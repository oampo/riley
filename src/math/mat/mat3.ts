export class Mat3 {
  m00: number;
  m01: number;
  m02: number;
  m10: number;
  m11: number;
  m12: number;
  m20: number;
  m21: number;
  m22: number;

  constructor(
    m00 = 1,
    m01 = 0,
    m02 = 0,
    m10 = 0,
    m11 = 1,
    m12 = 0,
    m20 = 0,
    m21 = 0,
    m22 = 1
  ) {
    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;
    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;
    this.m20 = m20;
    this.m21 = m21;
    this.m22 = m22;
  }

  clone() {
    return new Mat3(
      this.m00,
      this.m01,
      this.m02,
      this.m10,
      this.m11,
      this.m12,
      this.m20,
      this.m21,
      this.m22
    );
  }
}

export function mat3(
  m00 = 1,
  m01 = 0,
  m02 = 0,
  m10 = 0,
  m11 = 1,
  m12 = 0,
  m20 = 0,
  m21 = 0,
  m22 = 1
) {
  return new Mat3(m00, m01, m02, m10, m11, m12, m20, m21, m22);
}
