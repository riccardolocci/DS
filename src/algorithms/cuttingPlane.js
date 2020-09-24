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
                if(i !== x1Index && BInvBRim[i] !== 0) {toAdd.push(slacks[el].map(n => sign*n*BInvBRim[i])); console.log('Entra', el);}
            })

            xFLabels.forEach((el, i) => {
                if(i!== x2Index && FOverbarRim[i] !== 0) {toAdd.push(slacks[el].map(n => sign*n*FOverbarRim[i])); console.log('Entra', el);}
            })
        }
        //x2 in base
        else{
            x1Index = xFLabels.indexOf('x1');
            a = FOverbarRim[x1Index];

            b = BInvBRim[x2Index];

            xBLabels.forEach((el, i) => {
                if(i!== x2Index && BInvBRim[i] !== 0) {toAdd.push(slacks[el].map(n => sign*n*BInvBRim[i])); console.log('Entra', el);}
            })

            xFLabels.forEach((el, i) => {
                if(i !== x1Index && FOverbarRim[i] !== 0) {toAdd.push(slacks[el].map(n => sign*n*FOverbarRim[i])); console.log('Entra', el);}
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
                if(i !== x1Index && i!== x2Index && BInvBRim[i] !== 0) {toAdd.push(slacks[el].map(n => sign*n*BInvBRim[i])); console.log('Entra', el);}
            })

            xFLabels.forEach((el, i) => {
                if(FOverbarRim[i] !== 0) {toAdd.push(slacks[el].map(n => sign*n*FOverbarRim[i])); console.log('Entra', el);}
            })
        }
        //both out of base
        else{
            x1Index = xFLabels.indexOf('x1');
            x2Index = xFLabels.indexOf('x2');
            
            a = FOverbarRim[x1Index];
            b = FOverbarRim[x2Index];

            xFLabels.forEach((el, i) => {
                if(i !== x1Index && i!== x2Index && FOverbarRim[i] !== 0) {toAdd.push(slacks[el].map(n => sign*n*FOverbarRim[i])); console.log('Entra', el);}
            })

            xBLabels.forEach((el, i) => {
                if(BInvBRim[i] !== 0) {toAdd.push(slacks[el].map(n => sign*n*BInvBRim[i])); console.log('Entra', el);}
            })
        }
    }

    console.log('base', [a, b, bOverbarRim])
    console.log('slacks', slacks)
    console.log('toAdd', toAdd)
    const slack = toAdd.reduce((prev, curr) => curr.map((el, i) => el + prev[i]), [a, b, bOverbarRim]); 
    console.log('slack', slack)

    return mode === 'line' ? [...slack, -1] : slack//toAdd.reduce((prev, curr) => curr.map((el, i) => el + prev[i]), [a, b, bOverbarRim]);
}

export const optimalityTest = (xStar) => {
    console.log('xStar', xStar)
    return xStar.findIndex(x => !Number.isInteger(formatNumber(x[0])));
}