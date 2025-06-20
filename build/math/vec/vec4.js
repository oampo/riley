import { floatEq } from "..";
class Vec4 {
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    clone() {
        return new Vec4(this.x, this.y, this.z, this.w);
    }
    get r() {
        return this.x;
    }
    set r(value) {
        this.x = value;
    }
    get g() {
        return this.y;
    }
    set g(value) {
        this.y = value;
    }
    get b() {
        return this.z;
    }
    set b(value) {
        this.z = value;
    }
    get a() {
        return this.w;
    }
    set a(value) {
        this.w = value;
    }
    add(a) {
        const x = this.x + a.x;
        const y = this.y + a.y;
        const z = this.z + a.z;
        const w = this.w + a.w;
        return new Vec4(x, y, z, w);
    }
    subtract(a) {
        const x = this.x - a.x;
        const y = this.y - a.y;
        const z = this.z - a.z;
        const w = this.w - a.w;
        return new Vec4(x, y, z, w);
    }
    multiply(a) {
        const x = this.x * a.x;
        const y = this.y * a.y;
        const z = this.z * a.z;
        const w = this.w * a.w;
        return new Vec4(x, y, z, w);
    }
    divide(a) {
        const x = this.x / a.x;
        const y = this.y / a.y;
        const z = this.z / a.z;
        const w = this.w / a.w;
        return new Vec4(x, y, z, w);
    }
    modulo(a) {
        const x = this.x % a.x;
        const y = this.y % a.y;
        const z = this.z % a.z;
        const w = this.w % a.w;
        return new Vec4(x, y, z, w);
    }
    min(a) {
        const x = Math.min(this.x, a.x);
        const y = Math.min(this.y, a.y);
        const z = Math.min(this.z, a.z);
        const w = Math.min(this.w, a.w);
        return new Vec4(x, y, z, w);
    }
    max(a) {
        const x = Math.max(this.x, a.x);
        const y = Math.max(this.y, a.y);
        const z = Math.max(this.z, a.z);
        const w = Math.max(this.w, a.w);
        return new Vec4(x, y, z, w);
    }
    scale(s) {
        const x = this.x * s;
        const y = this.y * s;
        const z = this.z * s;
        const w = this.w * s;
        return new Vec4(x, y, z, w);
    }
    lerp(a, t) {
        const x = this.x + t * (a.x - this.x);
        const y = this.y + t * (a.y - this.y);
        const z = this.z + t * (a.z - this.z);
        const w = this.w + t * (a.w - this.w);
        return new Vec4(x, y, z, w);
    }
    distance(a) {
        const dx = this.x - a.x;
        const dy = this.y - a.y;
        const dz = this.z - a.z;
        const dw = this.w - a.w;
        return Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2 + dw ** 2);
    }
    squaredDistance(a) {
        const dx = this.x - a.x;
        const dy = this.y - a.y;
        const dz = this.z - a.z;
        const dw = this.w - a.w;
        return dx ** 2 + dy ** 2 + dz ** 2 + dw ** 2;
    }
    dot(a) {
        return this.x * a.x + this.y * a.y + this.z * a.z + this.w * a.w;
    }
    equals(a) {
        return (floatEq(this.x, a.x) &&
            floatEq(this.y, a.y) &&
            floatEq(this.z, a.z) &&
            floatEq(this.w, a.w));
    }
    exactEquals(a) {
        return this.x === a.x && this.y === a.y && this.z === a.z && this.w === a.w;
    }
    abs() {
        const x = Math.abs(this.x);
        const y = Math.abs(this.y);
        const z = Math.abs(this.z);
        const w = Math.abs(this.w);
        return new Vec4(x, y, z, w);
    }
    floor() {
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);
        const z = Math.floor(this.z);
        const w = Math.floor(this.w);
        return new Vec4(x, y, z, w);
    }
    ceil() {
        const x = Math.ceil(this.x);
        const y = Math.ceil(this.y);
        const z = Math.ceil(this.z);
        const w = Math.ceil(this.w);
        return new Vec4(x, y, z, w);
    }
    normalize() {
        const length = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2);
        if (length === 0) {
            return new Vec4(0, 0, 0, 0);
        }
        const invLength = 1 / length;
        const x = this.x * invLength;
        const y = this.y * invLength;
        const z = this.y * invLength;
        const w = this.w * invLength;
        return new Vec4(x, y, z, w);
    }
    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2);
    }
    squaredLength() {
        return this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2;
    }
}
Vec4.prototype.sub = Vec4.prototype.subtract;
Vec4.prototype.mul = Vec4.prototype.multiply;
Vec4.prototype.div = Vec4.prototype.divide;
Vec4.prototype.mod = Vec4.prototype.modulo;
Vec4.prototype.len = Vec4.prototype.length;
Vec4.prototype.sqrLen = Vec4.prototype.squaredLength;
Vec4.prototype.dist = Vec4.prototype.distance;
Vec4.prototype.sqrDist = Vec4.prototype.squaredDistance;
export { Vec4 };
export function vec4(x = 0, y = 0, z = 0, w = 0) {
    return new Vec4(x, y, z, w);
}
