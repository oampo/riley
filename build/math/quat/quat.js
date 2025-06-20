export class Quat {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    clone() {
        return new Quat(this.x, this.y, this.z, this.w);
    }
}
export function quat(x = 0, y = 0, z = 0, w = 1) {
    return new Quat(x, y, z, w);
}
