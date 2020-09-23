import { matrix } from 'numbers';
import { getPoint, swapColumns } from '../utils';

const _ = require('lodash');


export const dualFindPivot = (cPrimeBarF, FOverbar, indexT, xFLabels) => {
    let indexH = null, minValue = null;
    let rowT = FOverbar[indexT];

    console.log('cPrimeBarF', cPrimeBarF)

    cPrimeBarF[0].forEach((el, idx) => {
        if(rowT[idx] < 0){
            let valueIndexT = el / Math.abs(rowT[idx]);

            console.log('valueIndexT', valueIndexT);
            console.log('minValue', minValue);

            //Bland's rule (Dual)
            if(valueIndexT === minValue){
                const minLabelInt = parseInt(xFLabels[indexH].replace('x', ''));
                const valueIndexTLabelInt = parseInt(xFLabels[idx].replace('x', ''));

                console.log('xFLabels[indexH]', xFLabels[indexH], minLabelInt);
                console.log('xFLabels[idx]', xFLabels[idx], valueIndexTLabelInt);

                if(valueIndexTLabelInt < minLabelInt){
                    minValue = valueIndexT;
                    indexH = idx;
                }
            }
            else if(valueIndexT < minValue || minValue === null){
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

export const findPivot = (bOverbar, FOverbar, indexH) => {
    let indexT = null, minValue = null;
    let colH = matrix.getCol(FOverbar, indexH);

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
        indexT, showPivot: true
    }
}

export const init = (A, b, cPrime) => {
    let B = matrix.identity(A.length)

    let xFLabels = _.range(1, A.length+1).map(n => `x${n}`);
    let xBLabels = _.range(xFLabels.length+1, xFLabels.length+A.length+1).map(n => `x${n}`);

    let BInv = matrix.inverse(B);
    let F = A.slice();

    let BInvB = matrix.multiply(BInv, B);

    //TRASPOSTO PERCHE' DAL FILE LO STO PASSANDO COME UN VETTORE RIGA, MA DEVE ESSERE UN VETTORE COLONNA
    let bPrime = matrix.transpose([b]);
    
    let bOverbar = matrix.multiply(BInv, bPrime);
    let FOverbar =  matrix.multiply(BInv, F);

    //VETTORE DEI COSTI DELLE VARIABILI IN BASE: NULLO ALL'INIZIO PERCHE' HO LE SLACK IN BASE
    let cPrimeB = matrix.zeros(1, B.length);

    //VETTORE DEI COSTI DELLE VARIABILI FUORI BASE
    let cPrimeF = [cPrime.slice()];

    let cPrimeBbOverbar = matrix.multiply(cPrimeB, bOverbar);
    let cBar0 = -cPrimeBbOverbar[0][0];

    //VETTORE DEI COSTI RIDOTTI DELLE VARIABILI IN BASE: NULLO ALL'INIZIO PERCHE' HO LE SLACK IN BASE
    let cPrimeBarB = matrix.zeros(1, B[0].length)

    //VETTORE DEI COSTI RIDOTTI DELLE VARIABILI FUORI BASE
    let cPrimeBFOverbar = matrix.multiply(cPrimeB, FOverbar);
    let cPrimeBarF = matrix.subtraction(cPrimeF, cPrimeBFOverbar);

    let point = getPoint(xBLabels, bOverbar);

    let slacks = {}

    xBLabels.forEach((el,i) => {
        slacks[el] = [
            ...FOverbar[i].map(n => -n),
            bOverbar[i][0]
        ]
    })

    return {
        cBar0, xBLabels, xFLabels, cPrimeBarB, cPrimeBarF, bOverbar, BInvB, FOverbar, point, slacks
    }
}

export const optimalityTest = cPrimeF => {
    for(let i=0; i < cPrimeF.length; i++) if(cPrimeF[i] < 0) return i;
}

export const printTableau = (cBar0, xBLabels, xFLabels, cPrimeBarB, cPrimeBarF, bOverbar, BInvB, FOverbar) => {
    console.log('  ', 'cBar0', JSON.stringify(xBLabels), JSON.stringify(xFLabels));
    console.log('-z', cBar0, JSON.stringify(cPrimeBarB[0]), JSON.stringify(cPrimeBarF[0]));
    for(let l=0; l<bOverbar.length; l++){
        console.log(xBLabels[l], bOverbar[l][0], JSON.stringify(BInvB[l]), JSON.stringify(FOverbar[l]));
    }
    console.log('\n');
}

export const updateTableau = (prevTableau) => {
    let { cBar0, bOverbar, BInvB, FOverbar, cPrimeBarB, cPrimeBarF, xBLabels, xFLabels } = prevTableau;
    const { indexH, indexT } = prevTableau;

    const colH = matrix.getCol(FOverbar, indexH);

    prevTableau.showPivot = false;

    let aTH = colH[indexT];

    //UPDATING TABLES
    let zPivot = cPrimeBarF[0][indexH];

    bOverbar = matrix.rowScale(bOverbar, indexT, 1/aTH);
    BInvB = matrix.rowScale(BInvB, indexT, 1/aTH);
    FOverbar = matrix.rowScale(FOverbar, indexT, 1/aTH);

    cBar0 -= zPivot*bOverbar[indexT];

    cPrimeBarB = matrix.subtraction(cPrimeBarB, [matrix.rowScale(BInvB, indexT, zPivot)[indexT]]);
    cPrimeBarF = matrix.subtraction(cPrimeBarF, [matrix.rowScale(FOverbar, indexT, zPivot)[indexT]]);
    
    for(let l=0; l<bOverbar.length; l++){
        if(l === indexT) continue;

        bOverbar = matrix.rowAddMultiple(bOverbar, indexT, l, -colH[l]);
        BInvB = matrix.rowAddMultiple(BInvB, indexT, l, -colH[l]);
        FOverbar = matrix.rowAddMultiple(FOverbar, indexT, l, -colH[l]);
    }
    
    [BInvB, FOverbar] = swapColumns(BInvB, indexT, FOverbar, indexH);
    [cPrimeBarB, cPrimeBarF] = swapColumns(cPrimeBarB, indexT, cPrimeBarF, indexH);

    [xBLabels[indexT], xFLabels[indexH]] = [xFLabels[indexH], xBLabels[indexT]];

    return {
        ...prevTableau, 
        ...{
            cBar0, bOverbar, BInvB, FOverbar, cPrimeBarB, cPrimeBarF, 
            point: getPoint(xBLabels, bOverbar), xBLabels, xFLabels
        }
    }
}