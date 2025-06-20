export function color(line, color) {
    if (!color) {
        return line.color;
    }
    return {
        ...line,
        color,
    };
}
export function red(line, value) {
    if (!value) {
        return line.color.r;
    }
    const color = line.color.clone();
    color.r = value;
    return {
        ...line,
        color,
    };
}
export function green(line, value) {
    if (!value) {
        return line.color.g;
    }
    const color = line.color.clone();
    color.g = value;
    return {
        ...line,
        color,
    };
}
export function blue(line, value) {
    if (!value) {
        return line.color.b;
    }
    const color = line.color.clone();
    color.b = value;
    return {
        ...line,
        color,
    };
}
export function alpha(line, value) {
    if (!value) {
        return line.color.a;
    }
    const color = line.color.clone();
    color.a = value;
    return {
        ...line,
        color,
    };
}
