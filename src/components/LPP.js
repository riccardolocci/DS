import React, { useState } from 'react';
import PlotGraph from './PlotGraph';

import Dropzone from './Dropzone';
import ExamplesManager from './ExamplesManager';
import RandomManager from './RandomManager';

import { Button, Paper, Table, TableRow, TableHead, TableCell, TableBody } from '@material-ui/core';

import { getY } from '../utils';

import { makeStyles, createStyles } from '@material-ui/core/styles';

var numbers = require('numbers');

const useStyles = makeStyles((theme) => createStyles({
    button: {
        float: 'left',
        marginTop: 10,
        marginRight: 10,
        border: '1px solid rgba(0,0,0,0.3)'
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
    loading: {
        width: 50,
        float: 'right',
        margin: '10px 10px'
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
    pivot: {
        backgroundColor: 'red',
        color: 'white'
    },
    spacer: {
        position: 'relative',
        height: 80
    }
}));

const DEBUG=false
const PASS=50

let LPP = () => {
    let [file, setFile] = useState();
    let [lines, setLines] = useState([]);
    let [loading, setLoading] = useState(false);
    let [maxX, setMaxX] = useState(30);
    let [message, setMessage] = useState('');
    let [polygon, setPolygon] = useState([ [0,0], [maxX + 5,0], [maxX + 5,maxX + 5], [0,maxX + 5] ]);
    let [stage, setStage] = useState(0);
    let [step, setStep] = useState(0);
    let [zoomLevel, setZoomLevel] = useState(3);

    let [cBar0, setCBar0] = useState();
    let [xBLables, setXBLables] = useState();
    let [xFLables, setXFLables] = useState();
    let [cPrimeBarB, setCPrimeBarB] = useState();
    let [cPrimeBarF, setCPrimeBarF] = useState();
    let [bOverbar, setBOverbar] = useState();
    let [BInvB, setBInvB] = useState();
    let [FOverbar, setFOverbar] = useState();

    let [indexH, setIndexH] = useState();
    let [indexT, setIndexT] = useState();
    let [colH, setColH] = useState();
    
    const classes = useStyles();

    let drawAdmissiblePlan = (thisFile) => {
        const { A, b, sign } = thisFile.subjectTo;

        let startLines = lines;
        let startPolygon = polygon;

        A.forEach((el, i) => {
            let thisLine = [el[0], el[1], -b[i], sign[i]]
            startLines = [...startLines, thisLine]
            startPolygon = onAdd(thisLine, startPolygon);
        })


        setLoading(false);

        setFile(thisFile);
        setLines(startLines);
        setPolygon(startPolygon);
    }

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

    let formatNumber = (num) => Math.round((num + Number.EPSILON) * 10000) / 10000;

    let getFile = f => {
        setLoading(true);
        if(DEBUG) console.log('FILE:', f)
        drawAdmissiblePlan(f);
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
            let d = numbers.matrix.determinant([
                [l_p1[0], l_p2[0], polygonLeft[0][0]],
                [l_p1[1], l_p2[1], polygonLeft[0][1]],
                [1, 1, 1],
            ]);

            return s*d > 0 ? polygonLeft : polygonRight
        }
        else if(polygonRight.length){
            let d = numbers.matrix.determinant([
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

    // let printTableau = (cBar0, xBLables, xFLables, cPrimeBarB, cPrimeBarF, bOverbar, BInvB, FOverbar) => {
    //     console.log('  ', 'cBar0', JSON.stringify(xBLables), JSON.stringify(xFLables));
    //     console.log('-z', cBar0, JSON.stringify(cPrimeBarB[0]), JSON.stringify(cPrimeBarF[0]));
    //     for(let l=0; l<bOverbar.length; l++){
    //         console.log(xBLables[l], bOverbar[l][0], JSON.stringify(BInvB[l]), JSON.stringify(FOverbar[l]));
    //     }
    //     console.log('\n');
    // }

    let onStartAlgorithm = () => {
        const { objectiveFunction: cPrime, subjectTo: { A, b } } = file;

        const algorithm = require('../algorithms/simplexTableau.js')
        
        switch(stage){
            case 0:
                const initValues = algorithm.init(A, b, cPrime);
                setCBar0(initValues.cBar0);
                setXBLables(initValues.xBLables);
                setXFLables(initValues.xFLables);
                setCPrimeBarB(initValues.cPrimeBarB);
                setCPrimeBarF(initValues.cPrimeBarF);
                setBOverbar(initValues.bOverbar);
                setBInvB(initValues.BInvB);
                setFOverbar(initValues.FOverbar);

                setStage(stage+1);
                break;

            case 1:
                switch(step){
                    case 0:
                        let thisIndexH = algorithm.optimalityTest(cPrimeBarF[0]);
                        setIndexH(thisIndexH);

                        if(!Number.isInteger(thisIndexH)) {
                            setStage(2);
                            setStep(0);
                        }
                        else setStep(1);

                        break;

                    case 1:
                        const {thisColH, thisIndexT} = algorithm.findPivot(bOverbar, FOverbar, indexH);
                        setIndexT(thisIndexT);
                        setColH(thisColH);
                        setStep(2);
                        break;

                    case 2:
                        let aTH = colH[indexT];

                        //UPDATING TABLES
                        let zPivot = cPrimeBarF[0][indexH];

                        bOverbar = numbers.matrix.rowScale(bOverbar, indexT, 1/aTH);
                        BInvB = numbers.matrix.rowScale(BInvB, indexT, 1/aTH);
                        FOverbar = numbers.matrix.rowScale(FOverbar, indexT, 1/aTH);

                        cBar0 -= zPivot*bOverbar[indexT];
                        setCBar0(cBar0);
                        cPrimeBarB = numbers.matrix.subtraction(cPrimeBarB, [numbers.matrix.rowScale(BInvB, indexT, zPivot)[indexT]])
                        cPrimeBarF = numbers.matrix.subtraction(cPrimeBarF, [numbers.matrix.rowScale(FOverbar, indexT, zPivot)[indexT]]);
                        
                        for(let l=0; l<bOverbar.length; l++){
                            if(l === indexT) continue;

                            bOverbar = numbers.matrix.rowAddMultiple(bOverbar, indexT, l, -colH[l]);
                            BInvB = numbers.matrix.rowAddMultiple(BInvB, indexT, l, -colH[l]);
                            FOverbar = numbers.matrix.rowAddMultiple(FOverbar, indexT, l, -colH[l]);
                        }
                        setBOverbar(bOverbar);
                        setBInvB(BInvB);
                        setFOverbar(FOverbar);
                        
                        [BInvB, FOverbar] = swapColumns(BInvB, indexT, FOverbar, indexH);
                        [cPrimeBarB, cPrimeBarF] = swapColumns(cPrimeBarB, indexT, cPrimeBarF, indexH);
                        setCPrimeBarB(cPrimeBarB);
                        setCPrimeBarF(cPrimeBarF);

                        [xBLables[indexT], xFLables[indexH]] = [xFLables[indexH], xBLables[indexT]];
                        setXBLables(xBLables);
                        setXFLables(xFLables);

                        setStep(0);
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

    let onZoom = i => {
        setZoomLevel(zoomLevel+i);
        setMaxX(zoomLevel*PASS);
    }

    let showMessage = message => {
        setMessage(message);
        setTimeout(() => setMessage(''), 5000);
    }

    let swapColumns = (B, indexT, F, indexH) => {
        B.forEach((el, i) => {
            [el[indexT], F[i][indexH]] = [F[i][indexH], el[indexT]]
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
            {stage>0 && <Table>
                <TableHead>
                    <TableRow>
                        <TableCell key="head-empty-1"></TableCell>
                        <TableCell key="head-empty-2"></TableCell>
                        {xBLables.map(n => (<TableCell key={`label-${n}`}>{n}</TableCell>))}
                        {xFLables.map(n => (<TableCell key={`label-${n}`}>{n}</TableCell>))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell key='-z'>-z</TableCell>
                        <TableCell key='cBar0'>{cBar0}</TableCell>
                        {cPrimeBarB[0].map((n, i) => (<TableCell key={`cPrimeBarB${i}`}>{formatNumber(n)}</TableCell>))}
                        {cPrimeBarF[0].map((n, i) => (<TableCell key={`cPrimeBarF${i}`}>{formatNumber(n)}</TableCell>))}
                    </TableRow>
                    {xBLables.map((n,i) => (
                        <TableRow key={`baseValuesRow${i}`}>
                            <TableCell key={`baseValues${n}`}>{n}</TableCell>
                            <TableCell key={`bOverbar${i}`}>{formatNumber(bOverbar[i][0])}</TableCell>
                            {BInvB[i].map(n => (<TableCell key={`BInvB${i},${n}`}>{formatNumber(n)}</TableCell>))}
                            {FOverbar[i].map((n,j) => (
                                <TableCell 
                                    className={
                                        stage===1 && step===2 && indexT===i && indexH===j ? classes.pivot : ''
                                    } 
                                    key={`FOverbar${i},${n}`}
                                >
                                    {formatNumber(n)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>}
        </>
    )
}

export default LPP;