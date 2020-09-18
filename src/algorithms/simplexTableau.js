const numbers = require('numbers');
const _ = require('lodash');


export const findPivot = (bOverbar, FOverbar, indexH) => {
    let thisIndexT = null, minValue = null;
    let thisColH = numbers.matrix.getCol(FOverbar, indexH);

    bOverbar.forEach((el, idx) => {
        console.log('el', el);
        console.log('thisColH[idx]', thisColH[idx]);

        if(thisColH[idx] > 0){
            let value_indexH = el[0] / thisColH[idx];
            console.log('value_indexH', value_indexH);

            if(value_indexH < minValue || minValue === null){
                minValue = value_indexH;
                thisIndexT = idx;
            }
        }
    });

    return {
        thisColH, thisIndexT
    }
}

export const init = (A, b, c_prime) => {
    let B = numbers.matrix.identity(A.length)

    let xFLables = _.range(1, A.length+1).map(n => `x${n}`);
    let xBLables = _.range(xFLables.length+1, xFLables.length+A.length+1).map(n => `x${n}`);

    let B_inv = numbers.matrix.inverse(B);
    let F = A.slice();

    let BInvB = numbers.matrix.multiply(B_inv, B);

    //TRASPOSTO PERCHE' DAL FILE LO STO PASSANDO COME UN VETTORE RIGA, MA DEVE ESSERE UN VETTORE COLONNA
    let b_prime = numbers.matrix.transpose([b]);
    
    let bOverbar = numbers.matrix.multiply(B_inv, b_prime);
    let FOverbar =  numbers.matrix.multiply(B_inv, F);

    //VETTORE DEI COSTI DELLE VARIABILI IN BASE: NULLO ALL'INIZIO PERCHE' HO LE SLACK IN BASE
    let c_prime_B = numbers.matrix.zeros(1, B.length);

    //VETTORE DEI COSTI DELLE VARIABILI FUORI BASE
    let c_prime_F = [c_prime.slice()];

    let c_prime_B_bOverbar = numbers.matrix.multiply(c_prime_B, bOverbar);
    let cBar0 = -c_prime_B_bOverbar[0][0];

    //VETTORE DEI COSTI RIDOTTI DELLE VARIABILI IN BASE: NULLO ALL'INIZIO PERCHE' HO LE SLACK IN BASE
    let cPrimeBarB = numbers.matrix.zeros(1, B[0].length)

    //VETTORE DEI COSTI RIDOTTI DELLE VARIABILI FUORI BASE
    let c_prime_B_FOverbar = numbers.matrix.multiply(c_prime_B, FOverbar);
    let cPrimeBarF = numbers.matrix.subtraction(c_prime_F, c_prime_B_FOverbar);

    return {
        cBar0, xBLables, xFLables, cPrimeBarB, cPrimeBarF, bOverbar, BInvB, FOverbar
    }
}

export const optimalityTest = c_prime_F => { 
    console.log('c_prime_F', c_prime_F)
    for(let i=0; i < c_prime_F.length; i++) if(c_prime_F[i] < 0) return i;
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