export const formatNumber = (num) => Math.round((num + Number.EPSILON) * 10000) / 10000;

export const getPoint = (xBLables, bOverbar) => {
    let x1Idx = xBLables.indexOf('x1');
    let x2Idx = xBLables.indexOf('x2');

    let x1 = x1Idx >= 0 ? bOverbar[x1Idx][0] : 0;
    let x2 = x2Idx >= 0 ? bOverbar[x2Idx][0] : 0;

    return [x1, x2]
}

export const getY = (line, x, max=10000) => {
    let r = -(line[0]*(x) + line[2])/line[1];

    return isFinite(r) ? r : r > 0 ? max : -max;
}

export const getX = (line, y, max=10000) => {
    let r = -(line[1]*(y) + line[2])/line[0];

    return isFinite(r) ? r : r > 0 ? max : -max;
}

export const swapColumns = (B, indexT, F, indexH) => {
    B.forEach((el, i) => {
        [el[indexT], F[i][indexH]] = [F[i][indexH], el[indexT]]
    })

    return [B, F]
}

export default {getX, getY, swapColumns};