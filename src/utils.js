export const formatNumber = (num) => Math.round((num + Number.EPSILON) * 10000) / 10000;

export const generate = (m) => {
    let start = {
        "variables": ["x1", "x2"],
        "objectiveFunction": [],
        "subjectTo": {
            "A": [],
            "b": [],
            "sign": []
        }
    }
    start.objectiveFunction = generateVector();
    for(let i=0; i<m; i++){
        start.subjectTo.A.push(generateVector());
        start.subjectTo.sign.push(generateSign());
        start.subjectTo.b.push(generateCoefficient());
    }

    console.log(JSON.stringify(start));

    return start;
}

const generateCoefficient = (max=10) => Math.floor(Math.random() * 2 * max + 1) - max;

const generateSign = () => Math.random() < 0.5 ? -1 : 1;

const generateVector = (n=2) => {
    let arr = [];
    while(arr.length < n) arr.push(generateCoefficient());
    return arr;
}

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