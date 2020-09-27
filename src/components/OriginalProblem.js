import React from 'react';
import Latex from 'react-latex';

let OriginalProblem = (props) => {
    const { objectiveFunction, subjectTo: { A, b, sign } } = props.problem;

    let constructEquation = (arr) =>{
        let equation = "";
        arr.forEach((cost, i) => {
            if(cost !== 0){
                if(!equation) {
                    if(cost === 1) equation += `\\quad \\; \\; x_{${i+1}} `;
                    else if(cost === -1) equation += `\\quad -x_{${i+1}} `;
                    else {
                        if(cost > 0) equation += `\\; \\; \\; ${cost}x_{${i+1}} `;
                        else equation += `${cost}x_{${i+1}} `;
                    }
                }
                else if(cost > 0){
                    if(cost === 1) equation += `\\; \\; +x_{${i+1}} `;
                    else equation += `+${cost}x_{${i+1}} `;
                }
                else {
                    if(cost === -1) equation += `\\; -x_{${i+1}} `;
                    else equation += `${cost}x_{${i+1}} `;
                }
            }
            else{
                equation += '\\; \\; \\; \\qquad ';
            }
        });

        return equation;
    }

    let objectiveFunctionString = constructEquation(objectiveFunction);

    let constraintsString = "";

    A.forEach((contraint, i) => {
        constraintsString += " \\qquad ";
        constraintsString += constructEquation(contraint);
        constraintsString += sign[i] > 0 ? '\\geq ' : ( sign[i] < 0 ? '\\leq ' : '= ' );
        constraintsString += `${b[i]} \\\\`;
    })

    constraintsString += " \\qquad \\quad \\; x_1, \\quad \\; x_2  \\geq 0";

    const text = `$$\\begin{cases} \\min ${objectiveFunctionString} \\\\ ${constraintsString} \\end{cases}$$`;

    return (
        <Latex>{text}</Latex>
    );
}

export default OriginalProblem;