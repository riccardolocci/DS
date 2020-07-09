export const getY = (line, x, max=10000) => {
    let r = -(line[0]*(x) + line[2])/line[1];

    return isFinite(r) ? r : r > 0 ? max : -max;
}

export const getX = (line, y, max=10000) => {
    let r = -(line[1]*(y) + line[2])/line[0];

    return isFinite(r) ? r : r > 0 ? max : -max;
}

export default {getX, getY};