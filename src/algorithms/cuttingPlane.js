import { formatNumber } from '../utils';

export const computeSlackOrLine = (slacks, bOverbarRim, BInvBRim, xBLabels, FOverbarRim, xFLabels, mode='slack') => {
    let x1Index = xBLabels.indexOf('x1');
    let x2Index = xBLabels.indexOf('x2');
    let a = null,
        b = null;

    let sign = -1;
    if(mode==='line') sign = 1;

    let toAdd = [];

    //Different booleans: one in base, one out of base
    if(x1Index>=0 ^ x2Index>=0){
        //x1 in base
        if(x1Index>=0){
            x2Index = xFLabels.indexOf('x2');
            b = FOverbarRim[x2Index];

            a = BInvBRim[x1Index];

            xBLabels.forEach((el, i) => {
                if(i !== x1Index && BInvBRim[i] !== 0) toAdd.push(slacks[el].map(n => sign*n*BInvBRim[i]));
            })

            xFLabels.forEach((el, i) => {
                if(i!== x2Index && FOverbarRim[i] !== 0) toAdd.push(slacks[el].map(n => sign*n*FOverbarRim[i]));
            })
        }
        //x2 in base
        else{
            x1Index = xFLabels.indexOf('x1');
            a = FOverbarRim[x1Index];

            b = BInvBRim[x2Index];

            xBLabels.forEach((el, i) => {
                if(i!== x2Index && BInvBRim[i] !== 0) toAdd.push(slacks[el].map(n => sign*n*BInvBRim[i])); 
            })

            xFLabels.forEach((el, i) => {
                if(i !== x1Index && FOverbarRim[i] !== 0) toAdd.push(slacks[el].map(n => sign*n*FOverbarRim[i]));
            })
        }
    }
    //Same booleans: both in or out of base
    else{
        //both in base
        if(x1Index>=0){
            a = BInvBRim[x1Index];
            b = BInvBRim[x2Index];

            xBLabels.forEach((el, i) => {
                if(i !== x1Index && i!== x2Index && BInvBRim[i] !== 0) toAdd.push(slacks[el].map(n => sign*n*BInvBRim[i]));
            })

            xFLabels.forEach((el, i) => {
                if(FOverbarRim[i] !== 0) toAdd.push(slacks[el].map(n => sign*n*FOverbarRim[i]));
            })
        }
        //both out of base
        else{
            x1Index = xFLabels.indexOf('x1');
            x2Index = xFLabels.indexOf('x2');
            
            a = FOverbarRim[x1Index];
            b = FOverbarRim[x2Index];

            xFLabels.forEach((el, i) => {
                if(i !== x1Index && i!== x2Index && FOverbarRim[i] !== 0) toAdd.push(slacks[el].map(n => sign*n*FOverbarRim[i]));
            })

            xBLabels.forEach((el, i) => {
                if(BInvBRim[i] !== 0) toAdd.push(slacks[el].map(n => sign*n*BInvBRim[i]));
            })
        }
    }

    const slack = toAdd.reduce((prev, curr) => curr.map((el, i) => el + prev[i]), [a, b, bOverbarRim]);

    return mode === 'line' ? [...slack, -1] : slack;
}

export const optimalityTest = (xStar) => {
    //INFEASIBLE SOLUTION
    if(xStar.some(n => n<0)) return null;

    return xStar.findIndex(x => !Number.isInteger(formatNumber(x[0])));
}