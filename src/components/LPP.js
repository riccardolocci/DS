import React, { useState } from 'react';
import PlotGraph from './PlotGraph';

import Dropzone from './Dropzone';
import ExamplesManager from './ExamplesManager';
import RandomManager from './RandomManager';

import { Button, Paper } from '@material-ui/core';

import { getY } from '../utils';

import { makeStyles, createStyles } from '@material-ui/core/styles';

var numbers = require('numbers');

var _ = require('lodash');

const useStyles = makeStyles((theme) => createStyles({
    button: {
        float: 'left',
        marginTop: 10,
        marginRight: 10,
        border: '1px solid rgba(0,0,0,0.3)'
    },
    buttonRight: {
        float: 'right',
        marginTop: 10,
        border: '1px solid rgba(0,0,0,0.3)'
    },
    colorPicker: {
        position: 'absolute',
        top: 50,
        zIndex: 1
    },
    drop: {
        height: '40vh',
        width: '80%',
        marginTop: 50,
        marginLeft: 'auto',
        marginRight: 'auto',
        transition: '1s'
    },
    dropClosed: {
        height: 0,
        width: '80%',
        marginLeft: 'auto',
        marginRight: 'auto',
        transition: '1s'
    },
    generator: {
        height: '10vh',
        width: '80%',
        marginTop: 50,
        marginLeft: 'auto',
        marginRight: 'auto',
        transition: '1s'
    },
    graph: {
        width: '80%',
        height: 'calc(100% - 200px)',
        margin: 'auto',
        whiteSpace: 'nowrap'
    },
    infoBox: {
        textAlign: 'left',
        width: '50%',
        display: 'inline-block',
        whiteSpace: 'normal',
        verticalAlign: 'top'
    },
    // infoBox table {
    //     width: 100%
    // },
    legend: {
        display: 'inline-block',
        height: 30,
        margin: '15px 10px 0 0',
        width: 120,
        textAlign: 'initial'
    },
    legendColor: {
        float: 'left',
        borderRadius: 10,
        height: 20,
        width: 20,
        margin: '5px 10px'
    },
    legendKey: {
        float: 'left',
        height: 20,
        width: 70,
        margin: '5px 0',
        fontSize: 15
    },
    legendPicked: {
        display: 'inline-block',
        height: 30,
        margin: '15px 10px 0 0',
        width: 120,
        textAlign: 'initial',
        borderRadius: 5,
        backgroundColor: 'rgba(0,0,0,0.1)'
    },
    loading: {
        width: 50,
        float: 'right',
        margin: '10px 10px'
    },
    menu: {
        height: 350,
    },
    paper: {
        backgroundColor: 'rgb(200, 0, 0)',
        color: 'white',
        marginTop: 50,
        width: '80%',
        marginLeft: 'auto',
        marginRight: 'auto',
        fontSize: 20,
    },
    paperDiv: {
        padding: '15px 0 15px 0',
        width: '100%',
        transition: '0.2s'
    },
    paperDivHide: {
        height: 0,
        width: '100%',
        transition: '0.2s',
        overflow: 'hidden'
    },
    // paths tbody {
    //     display: block,
    //     height: 20vh,
    //     overflow-y: auto,
    // },
    // paths thead, tbody tr {
    //     display: table,
    //     width: 100%,
    //     table-layout: fixed,
    // },
    // paths tbody td{
    //     padding: 2,
    // },
    // paths tbody tr:nth-child(odd):not(sourceRow):not(selectedRow){
    //     background-color: rgb(235, 241, 250),
    // },
    root: {
        height: '100%',
        fontSize: 'calc(12px + (18 - 12) * ((100vw - 1600px) / (2600 - 1600)))'
    },
    select: {
        width: 150,
        float: 'left',
        margin: '0 50px 0 0'
    },
    selectableRow: {
        cursor: 'pointer'
    },
    selectedRow: {
        backgroundColor: 'rgb(148, 235, 153)'
    },
    sourceRow: {
        backgroundColor: 'rgb(250, 240, 217)'
    },
    spacer: {
        position: 'relative',
        height: 80
    },
    switch: {
        float: 'left',
        padding: '20px 20px 0 0'
    },
    unselectableRow: {
        cursor: 'not-allowed'
    }
}));

const DEBUG=false
const PASS=50

let LPP = () => {
    let [file, setFile] = useState();
    let [lines, setLines] = useState([]);
    let [loading, setLoading] = useState(false);
    let [maxX, setMaxX] = useState(150);
    let [message, setMessage] = useState('');
    let [polygon, setPolygon] = useState([ [0,0], [maxX + 5,0], [maxX + 5,maxX + 5], [0,maxX + 5] ]);
    let [zoomLevel, setZoomLevel] = useState(3);
    
    const classes = useStyles();

    //https://stackoverflow.com/questions/44474864/compute-determinant-of-a-matrix?newreg=93b9aa02ef824ff1b0df794ca5558376
    const determinant = m =>  m.length === 1 ? m[0][0] :
        m.length === 2 ?  m[0][0]*m[1][1]-m[0][1]*m[1][0] :
        m[0].reduce((r,e,i) => 
            r+(-1)**(i+2)*e*determinant(
                m.slice(1).map(
                    c => c.filter((_,j) => i !== j)
                )
            ),
        0);

    let findIntersection = (line, segment) => {
        let [a, b, c] = line;
        let [[x1, y1], [x2, y2]] = segment;

        if(a/b === Infinity){
            //Parallel to y axis
            if((-c/a < x1 && -c/a > x2) || (-c/a > x1 && -c/a < x2)) {
                let lambda = (x2 + c/a)/(x2 - x1)
                let y = lambda * y1 + (1 - lambda) * y2;

                return [-c/a, y]
            }
        } 
        else if(b/a === Infinity){
            //Parallel to x axis
            if((-c/b < y1 && -c/b > y2) || (-c/b > y1 && -c/b < y2)) {
                let lambda = (y2 + c/b)/(y2 - y1)
                let x = lambda * x1 + (1 - lambda) * x2;

                return [x, -c/b]
            }
        } 
        else{
            let lambda = - (a*x2 + b*y2 + c)/(a*(x1-x2) + b*(y1-y2));

            if(lambda && lambda >= 0 && lambda <= 1){
                let x = lambda * x1 + (1 - lambda) * x2;
                let y = lambda * y1 + (1 - lambda) * y2;

                return [x, y]
            }
        }
        
    }

    let getFile = f => {
        setLoading(true);
        if(DEBUG) console.log('FILE:', f)
        setFile(f);
        setLoading(false);
    }

    let onAdd = (line, thisPolygon) => {
        const [a, b, c, s] = line;

        if(DEBUG){
            console.log(`Adding ${a}x`, `${b > 0 ? '+' : '-'} ${Math.abs(b)}y`, s > 0 ? '>' : '<', `${-c}`);
            console.log(`AKA y`, `${a/b > 0 ? '+' : '-'} ${Math.abs(a/b)}x`, s > 0 ? '>' : '<', `${-c/b}`);
        }

        let polygonLeft = [], polygonRight = [];
        
        let currentPolygon = polygonLeft;
        let intersections = []

        for(let i=0; i<thisPolygon.length; i++){
            let p1 = thisPolygon[i];
            
            if(intersections.length === 2){
                currentPolygon.push(p1);
                continue;
            }

            let j = i+1<thisPolygon.length ? i+1 : 0;
            let p2 = thisPolygon[j];

            let intersection = findIntersection(line, [p1, p2]);

            if(intersection){
                if(intersections.length === 1){
                    currentPolygon.push(p1);
                    currentPolygon.push(intersection);
                    currentPolygon=polygonLeft;
                    currentPolygon.push(intersection);
                }
                else{
                    currentPolygon.push(p1);
                    currentPolygon.push(intersection);
                    currentPolygon=polygonRight;
                    currentPolygon.push(intersection);
                }
            
                intersections.push(intersection);
            }
            else{
                currentPolygon.push(p1);
            }
        }

        let l_p1 = [-maxX, getY(line, -maxX, maxX)],
            l_p2 = [maxX, getY(line, maxX, maxX)];

        if(polygonLeft.length){
            let d = determinant([
                [l_p1[0], l_p2[0], polygonLeft[0][0]],
                [l_p1[1], l_p2[1], polygonLeft[0][1]],
                [1, 1, 1],
            ]);

            return s*d > 0 ? polygonLeft : polygonRight
        }
        else if(polygonRight.length){
            let d = determinant([
                [l_p1[0], l_p2[0], polygonRight[0][0]],
                [l_p1[1], l_p2[1], polygonRight[0][1]],
                [1, 1, 1],
            ]);

            return s*d > 0 ? polygonRight : polygonLeft
        }
    }

    let onClear = () => {
        setLines([]); 
        setMaxX(zoomLevel*PASS);
        setPolygon([ [0,0], [maxX + 5,0], [maxX + 5,maxX + 5], [0,maxX + 5] ]);
        setZoomLevel(3);
    }

    let printTableau = (c_bar_0, x_B_labels, x_F_labels, c_prime_bar_B, c_prime_bar_F, b_overbar, B_inv_B, F_overbar) => {
        console.log('  ', 'c_bar_0', x_B_labels, x_F_labels);
        console.log('-z', c_bar_0, c_prime_bar_B[0], c_prime_bar_F[0]);
        for(let l=0; l<b_overbar.length; l++){
            console.log(x_B_labels[l], b_overbar[l][0], B_inv_B[l], F_overbar[l]);
        }
        console.log('\n');
    }

    let onStartAlgorithm = () => {
        const { A, b, sign } = file.subjectTo;
        const { objectiveFunction: c_prime, variables } = file;

        let startLines = lines;
        let startPolygon = polygon;

        A.forEach((el, i) => {
            let thisLine = [el[0], el[1], -b[i], sign[i]]
            startLines = [...startLines, thisLine]
            startPolygon = onAdd(thisLine, startPolygon);
        })

        setLines(startLines);
        setPolygon(startPolygon);

        let B = numbers.matrix.identity(A.length)

        let x_F_labels = _.range(1, A.length+1).map(n => `x${n}`);
        let x_B_labels = _.range(x_F_labels.length+1, x_F_labels.length+A.length+1).map(n => `x${n}`);

        let B_inv = numbers.matrix.inverse(B);
        let F = A.slice();

        let B_inv_B = numbers.matrix.multiply(B_inv, B);

        // console.log('B', JSON.stringify(B));
        // console.log('B_inv', JSON.stringify(B_inv));
        // console.log('F', JSON.stringify(F));

        //TRASPOSTO PERCHE' DAL FILE LO STO PASSANDO COME UN VETTORE RIGA, MA DEVE ESSERE UN VETTORE COLONNA
        let b_prime = numbers.matrix.transpose([b]);
        // console.log('b_prime', JSON.stringify(b_prime));

        let b_overbar = numbers.matrix.multiply(B_inv, b_prime);
        // console.log('b_overbar', JSON.stringify(b_overbar));

        let F_overbar =  numbers.matrix.multiply(B_inv, F);
        // console.log('F_overbar', JSON.stringify(F_overbar));

        //VETTORE DEI COSTI DELLE VARIABILI IN BASE: NULLO ALL'INIZIO PERCHE' HO LE SLACK IN BASE
        let c_prime_B = numbers.matrix.zeros(1, B.length);
        // console.log('c_prime_B', JSON.stringify(c_prime_B));

        //VETTORE DEI COSTI DELLE VARIABILI FUORI BASE
        let c_prime_F = [c_prime.slice()];
        // console.log('c_prime_F', JSON.stringify(c_prime_F));

        let c_prime_B_b_overbar = numbers.matrix.multiply(c_prime_B, b_overbar);
        let c_bar_0 = -c_prime_B_b_overbar[0][0];
        // console.log('c_bar_0', JSON.stringify(c_bar_0));

        //VETTORE DEI COSTI RIDOTTI DELLE VARIABILI IN BASE: NULLO ALL'INIZIO PERCHE' HO LE SLACK IN BASE
        // let c_prime_B_F_overbar = numbers.matrix.multiply(c_prime_B, F_overbar);
        let c_prime_bar_B = numbers.matrix.zeros(1, B[0].length)
        // console.log('c_prime_bar_B', JSON.stringify(c_prime_bar_B));

        //VETTORE DEI COSTI RIDOTTI DELLE VARIABILI FUORI BASE
        let c_prime_B_F_overbar = numbers.matrix.multiply(c_prime_B, F_overbar);
        let c_prime_bar_F = numbers.matrix.subtraction(c_prime_F, c_prime_B_F_overbar);
        // console.log('c_prime_bar_F', JSON.stringify(c_prime_bar_F));

        //PER DEFINIZIONE, xB = B^(-1)*b
        let x_B = b_overbar.slice();
        // console.log('x_B', JSON.stringify(x_B));

        //PER DEFINIZIONE, IMPONGO LE VARIABILI FUORI BASE A 0
        let x_F = numbers.matrix.zeros(F.length, 1);
        // console.log('x_F', JSON.stringify(x_F));

        // x_B_labels.forEach((el, idx) => {
        //     console.log(el, x_B[idx][0])
        // })

        // x_F_labels.forEach((el, idx) => {
        //     console.log(el, x_F[idx][0])
        // })

        printTableau(c_bar_0, x_B_labels, x_F_labels, c_prime_bar_B, c_prime_bar_F, b_overbar, B_inv_B, F_overbar);

        // Index of the next entering variable
        let index_h = optimalityTest(c_prime_bar_F[0]);
        // console.log('index_h', index_h)

        let i=2
        while(index_h != null){
            console.log('iterations', i)

            // Index of the next leaving variable
            let index_t = null, min_value = null;
            // Column of the next entering variable
            let col_h = numbers.matrix.getCol(F_overbar, index_h);
            console.log('col_h', col_h)

            b_overbar.forEach((el, idx) => {
                let value_index_h = el[0] / col_h[idx]

                if(value_index_h > 0){
                    if(value_index_h < min_value || min_value === null){
                        min_value = value_index_h;
                        index_t = idx;
                    }
                }
            })

            console.log('index_t', index_t);

            if(index_t === null) break;
            
            let a_th = col_h[index_t];
            console.log('a_th(PIVOT)', a_th);

            //UPDATING TABLES
            let z_pivot = c_prime_bar_F[0][index_h];
            // console.log('z_pivot', z_pivot);

            b_prime = numbers.matrix.rowScale(b_prime, index_t, 1/a_th);
            B_inv_B = numbers.matrix.rowScale(B_inv_B, index_t, 1/a_th);
            F_overbar = numbers.matrix.rowScale(F_overbar, index_t, 1/a_th);

            // printTableau(c_bar_0, x_B_labels, x_F_labels, c_prime_bar_B, c_prime_bar_F, b_overbar, B_inv_B, F_overbar);

            c_bar_0 -= z_pivot*b_prime[index_t];
            c_prime_bar_B = numbers.matrix.subtraction(c_prime_bar_B, [numbers.matrix.rowScale(B_inv_B, index_t, z_pivot)[index_t]])
            c_prime_bar_F = numbers.matrix.subtraction(c_prime_bar_F, [numbers.matrix.rowScale(F_overbar, index_t, z_pivot)[index_t]]);

            // printTableau(c_bar_0, x_B_labels, x_F_labels, c_prime_bar_B, c_prime_bar_F, b_overbar, B_inv_B, F_overbar);
            
            for(let l=0; l<b_prime.length; l++){
                if(l === index_t) continue;

                b_prime = numbers.matrix.rowAddMultiple(b_prime, index_t, l, -col_h[l]);
                B_inv_B = numbers.matrix.rowAddMultiple(B_inv_B, index_t, l, -col_h[l]);
                F_overbar = numbers.matrix.rowAddMultiple(F_overbar, index_t, l, -col_h[l]);

                // printTableau(c_bar_0, x_B_labels, x_F_labels, c_prime_bar_B, c_prime_bar_F, b_overbar, B_inv_B, F_overbar);
            }
            

            //B, B_inv, F, b_overbar, F_overbar, c_prime_B, c_prime_F, x_B, x_F, c_prime_bar_F
            // [B, F] = swapColumns(B, index_t, F, index_h);
            [B_inv_B, F_overbar] = swapColumns(B_inv_B, index_t, F_overbar, index_h);

            [x_B_labels[index_t], x_F_labels[index_h]] = [x_F_labels[index_h], x_B_labels[index_t]];

            // console.log('B', JSON.stringify(B));
            // console.log('F', JSON.stringify(F));
/*
            B_inv = numbers.matrix.inverse(B);
            // console.log('B_inv', JSON.stringify(B_inv));
            b_overbar = numbers.matrix.multiply(B_inv, b_prime);
            // console.log('b_overbar', JSON.stringify(b_overbar));
            F_overbar = numbers.matrix.multiply(B_inv, F);
            // console.log('F_overbar', JSON.stringify(F_overbar));

            // [x_B[index_t][0], x_F[index_h][0]] = [x_F[index_h][0], x_B[index_t][0]];
            [x_B[index_t][0], x_F[index_h][0]] = [min_value, x_B[index_t][0] - col_h[index_t] * min_value];
            // console.log('x_B', JSON.stringify(x_B));
            // console.log('x_F', JSON.stringify(x_F));

            // let a_th = col_h[index_t];
            // console.log('a_th', a_th);

            [c_prime_B[0][index_t], c_prime_F[0][index_h]] = [c_prime_F[0][index_h], c_prime_B[0][index_t]];
            // console.log('c_prime_B', JSON.stringify(c_prime_B));
            // console.log('c_prime_F', JSON.stringify(c_prime_F));

            c_prime_B_b_overbar = numbers.matrix.multiply(c_prime_B, b_overbar);
            c_bar_0 = -c_prime_B_b_overbar[0][0];
            // console.log('c_bar_0', JSON.stringify(c_bar_0));

            c_prime_B_F_overbar = numbers.matrix.multiply(c_prime_B, F_overbar);
            c_prime_bar_F = numbers.matrix.subtraction(c_prime_F, c_prime_B_F_overbar);
            // console.log('c_prime_bar_F', JSON.stringify(c_prime_bar_F));
*/          
// console.log('AFTER SWAP')
            printTableau(c_bar_0, x_B_labels, x_F_labels, c_prime_bar_B, c_prime_bar_F, b_overbar, B_inv_B, F_overbar);

            index_h = optimalityTest(c_prime_bar_F[0]);
            // console.log('index_h', index_h)

            // x_B_labels.forEach((el, idx) => {
            //     console.log(el, x_B[idx][0])
            // })

            // x_F_labels.forEach((el, idx) => {
            //     console.log(el, x_F[idx][0])
            // })

            if(i>5) break;
            i++;
        }
    }

    let onZoom = i => {
        setZoomLevel(zoomLevel+i);
        setMaxX(zoomLevel*PASS);
    }

    let optimalityTest = c_prime_F => { 
        for(let i=0; i < c_prime_F.length; i++) if(c_prime_F[i] < 0) return i;
        return null
    }

    let showMessage = message => {
        setMessage(message);
        setTimeout(() => setMessage(''), 5000);
    }

    let swapColumns = (B, index_t, F, index_h) => {
        B.forEach((el, i) => {
            [el[index_t], F[i][index_h]] = [F[i][index_h], el[index_t]]
        })

        return [B, F]
    }

    return (
        <>
            {!file && <> 
                <div className={file ? classes.dropClosed : classes.drop}>
                    <Dropzone
                        getFile={getFile}
                        hide={file}
                        showMessage={showMessage}
                    />
                </div>

                <div className={file ? classes.dropClosed : classes.generator}>
                    <ExamplesManager getFile={getFile} loading={loading} />
                </div>

                <div className={file ? classes.dropClosed : classes.generator}>
                    <RandomManager getFile={getFile} loading={loading} />
                </div>
                
                <div className={classes.spacer}>
                    <Paper className={classes.paper}>
                        <div className={message ? classes.paperDiv : classes.paperDivHide}>
                            {message}
                        </div>
                    </Paper>
                </div>
            </>}

            {file && <>
                <Button variant='outlined' onClick={onAdd}>ADD LINE</Button>
                <Button variant='outlined' onClick={onClear}>CLEAR</Button>
                <Button variant='outlined' onClick={() => onZoom(1)}>+</Button>
                <Button variant='outlined' onClick={() => onZoom(-1)}>-</Button>
                <Button variant='outlined' onClick={onStartAlgorithm}>{">"}</Button>
                <PlotGraph 
                    lines={lines}
                    level={zoomLevel}
                    maxX={maxX}
                    polygon={polygon}
                    title={(file.type === 'ILP' ? 'Integer ' : '') + 'Linear Programming Problem'}
                />
                <div>
                    {lines.length}
                </div>
            </>}
        </>
    )
}

export default LPP;