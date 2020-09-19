import { getPoint, swapColumns } from '../utils';

const numbers = require('numbers');
const _ = require('lodash');


export const dualFindPivot = (cPrimeBarF, FOverbar, indexT) => {
    let indexH = null, minValue = null;
    let rowT = FOverbar[indexT];

    cPrimeBarF.forEach((el, idx) => {
        if(rowT[idx] < 0){
            let valueIndexT = el[0] / rowT[idx];

            if(valueIndexT < minValue || minValue === null){
                minValue = valueIndexT;
                indexH = idx;
            }
        }
    });

    return {
        rowT, indexH, showPivot: true
    }
}

export const dualOptimalityTest = (bOverbar) => {
    for(let i=0; i < bOverbar.length; i++) if(bOverbar[i][0] < 0) return i;
    return null
}

export const dualUpdateTableau = (prevTableau) => {}

export const findPivot = (bOverbar, FOverbar, indexH) => {
    let indexT = null, minValue = null;
    let colH = numbers.matrix.getCol(FOverbar, indexH);

    bOverbar.forEach((el, idx) => {
        if(colH[idx] > 0){
            let valueIndexH = el[0] / colH[idx];

            if(valueIndexH < minValue || minValue === null){
                minValue = valueIndexH;
                indexT = idx;
            }
        }
    });

    return {
        colH, indexT, showPivot: true
    }
}

export const init = (A, b, cPrime) => {
    let B = numbers.matrix.identity(A.length)

    let xFLables = _.range(1, A.length+1).map(n => `x${n}`);
    let xBLables = _.range(xFLables.length+1, xFLables.length+A.length+1).map(n => `x${n}`);

    let BInv = numbers.matrix.inverse(B);
    let F = A.slice();

    let BInvB = numbers.matrix.multiply(BInv, B);

    //TRASPOSTO PERCHE' DAL FILE LO STO PASSANDO COME UN VETTORE RIGA, MA DEVE ESSERE UN VETTORE COLONNA
    let bPrime = numbers.matrix.transpose([b]);
    
    let bOverbar = numbers.matrix.multiply(BInv, bPrime);
    let FOverbar =  numbers.matrix.multiply(BInv, F);

    //VETTORE DEI COSTI DELLE VARIABILI IN BASE: NULLO ALL'INIZIO PERCHE' HO LE SLACK IN BASE
    let cPrimeB = numbers.matrix.zeros(1, B.length);

    //VETTORE DEI COSTI DELLE VARIABILI FUORI BASE
    let cPrimeF = [cPrime.slice()];

    let cPrimeBbOverbar = numbers.matrix.multiply(cPrimeB, bOverbar);
    let cBar0 = -cPrimeBbOverbar[0][0];

    //VETTORE DEI COSTI RIDOTTI DELLE VARIABILI IN BASE: NULLO ALL'INIZIO PERCHE' HO LE SLACK IN BASE
    let cPrimeBarB = numbers.matrix.zeros(1, B[0].length)

    //VETTORE DEI COSTI RIDOTTI DELLE VARIABILI FUORI BASE
    let cPrimeBFOverbar = numbers.matrix.multiply(cPrimeB, FOverbar);
    let cPrimeBarF = numbers.matrix.subtraction(cPrimeF, cPrimeBFOverbar);

    let point = getPoint(xBLables, bOverbar);

    return {
        cBar0, xBLables, xFLables, cPrimeBarB, cPrimeBarF, bOverbar, BInvB, FOverbar, point
    }
}

export const optimalityTest = cPrimeF => {
    for(let i=0; i < cPrimeF.length; i++) if(cPrimeF[i] < 0) return i;
    return null
}

export const printTableau = (cBar0, xBLables, xFLables, cPrimeBarB, cPrimeBarF, bOverbar, BInvB, FOverbar) => {
    console.log('  ', 'cBar0', JSON.stringify(xBLables), JSON.stringify(xFLables));
    console.log('-z', cBar0, JSON.stringify(cPrimeBarB[0]), JSON.stringify(cPrimeBarF[0]));
    for(let l=0; l<bOverbar.length; l++){
        console.log(xBLables[l], bOverbar[l][0], JSON.stringify(BInvB[l]), JSON.stringify(FOverbar[l]));
    }
    console.log('\n');
}

export const updateTableau = (prevTableau) => {
    let { cBar0, bOverbar, BInvB, FOverbar, cPrimeBarB, cPrimeBarF, xBLables, xFLables } = prevTableau;
    const { colH, indexH, indexT } = prevTableau;

    prevTableau.showPivot = false;

    let aTH = colH[indexT];

    //UPDATING TABLES
    let zPivot = cPrimeBarF[0][indexH];

    bOverbar = numbers.matrix.rowScale(bOverbar, indexT, 1/aTH);
    BInvB = numbers.matrix.rowScale(BInvB, indexT, 1/aTH);
    FOverbar = numbers.matrix.rowScale(FOverbar, indexT, 1/aTH);

    cBar0 -= zPivot*bOverbar[indexT];

    cPrimeBarB = numbers.matrix.subtraction(cPrimeBarB, [numbers.matrix.rowScale(BInvB, indexT, zPivot)[indexT]]);
    cPrimeBarF = numbers.matrix.subtraction(cPrimeBarF, [numbers.matrix.rowScale(FOverbar, indexT, zPivot)[indexT]]);
    
    for(let l=0; l<bOverbar.length; l++){
        if(l === indexT) continue;

        bOverbar = numbers.matrix.rowAddMultiple(bOverbar, indexT, l, -colH[l]);
        BInvB = numbers.matrix.rowAddMultiple(BInvB, indexT, l, -colH[l]);
        FOverbar = numbers.matrix.rowAddMultiple(FOverbar, indexT, l, -colH[l]);
    }
    
    [BInvB, FOverbar] = swapColumns(BInvB, indexT, FOverbar, indexH);
    [cPrimeBarB, cPrimeBarF] = swapColumns(cPrimeBarB, indexT, cPrimeBarF, indexH);

    [xBLables[indexT], xFLables[indexH]] = [xFLables[indexH], xBLables[indexT]];

    return {
        ...prevTableau, 
        ...{
            cBar0, bOverbar, BInvB, FOverbar, cPrimeBarB, cPrimeBarF, 
            point: getPoint(xBLables, bOverbar), xBLables, xFLables
        }
    }
}