import React, { useState } from 'react';
import PlotGraph from './PlotGraph';

import Dropzone from './Dropzone';
import ExamplesManager from './ExamplesManager';
import RandomManager from './RandomManager';

import { Button, Grid, Paper, Table, TableRow, TableHead, TableCell, TableBody } from '@material-ui/core';

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

    let [history, setHistory] = useState([]);
    let [page, setPage] = useState(0);
    let [finished, setFinished] = useState(false);
    
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

        let maxxxX = startPolygon.reduce((acc, curr) =>  Math.max(acc, ...curr), 0) * 2;
        setMaxX(maxxxX);
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

    let handleHistory = (next = false) => {
        if(next){
            //Create new page only if algorithm has not finished and next page does not exist
            if(!((history[page] && finished) || history[page+1])){
                onSimplexAlgorithm();
            }
            if(history[0]) setPage(page+1);
        }
        else{
            if(page > 0) setPage(page-1)
        }
    }

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

    let onIntegerSimplexAlgorithm = () => {
        const algorithm = require('../algorithms/cuttingPlane.js')

        // let newPage = null;
        // if(stage > 0){
        //     newPage = JSON.parse(JSON.stringify(history[page])); 
        // }

        do{
            handleHistory(true);
        }while(history[page] && !finished);

        console.log('page', page)

        while(!algorithm.optimalityTest(history[page].cBar0)){
            //FIND GENERATING ROW
            const indexT = history[page].bOverbar.forEach((el, i) => {
                if(!algorithm.optimalityTest(el)) return i
            });

            console.log('indexT', indexT)

            const x1Index = history[page].xBLables.indexOf('x1');
            const x2Index = history[page].xBLables.indexOf('x2');

            const bOverbarT = history[page].bOverbar[indexT][0];
            const BInvBT = history[page].BInvB[indexT];
            const FOverbarT = history[page].FOverbar[indexT];
            
            const bOverbarTFloor = Math.floor(bOverbarT);
            const BInvBTFloor = BInvBT.map(n => Math.floor(n));
            const FOverbarTFloor = FOverbarT.map(n => Math.floor(n));
            
            const newLine = [
                x1Index > 0 ? BInvBTFloor[x1Index] : FOverbarTFloor[x1Index],
                x2Index > 0 ? BInvBTFloor[x2Index] : FOverbarTFloor[x2Index],
                -bOverbarTFloor,
                -1
            ]

            onAdd(newLine, polygon);

            //ADDING NEW CONSTRAINT
            const newSlackIndex = history[page].xBLables.length + history[page].xFLables.length;

            history[page].xBLables.push(`x${newSlackIndex}`);
            history[page].bOverbar.push([bOverbarTFloor - bOverbarT]);
            history[page].BInvB.push(...numbers.matrix.subtraction([BInvBTFloor], [BInvBT]));

            //BECAUSE BEFORE THERE WHERE bOverbarT.length BASE ELEMENTS, NOW bOverbarT.length+1
            history[page].BInvB = history[page].BInvB.map((n,i) => [...n, i === bOverbarT.length ? 1 : 0]);

            history[page].FOverbar.push(...numbers.matrix.subtraction([FOverbarTFloor], [FOverbarT]));

            //DUAL SIMPLEX
            setStage(2);
            setStep(0);

            do{
                handleHistory(true);
            }while(history[page] && !finished);
        }

        // switch(newPage){
        //     case 0:
        //         //COMPUTE SIMPLEX
        //         break;
        //     case 1:
        //         //CHECK INTEGRALITY
        //         if(algorithm.optimalityTest(newPage.cBar0)){

        //         }
        //         break;
        //     case 2:
        //         //FIND CUT
        //         break;
        //     case 3:
        //         //APPLY CUT
        //         break;
        //     case 4:
        //         //FIND NEW X* BY DUAL SYMPLEX
        //         //REPEAT FROM 1
        //         break;
        //     default:
        //         break;
        // }
    }

    let onSimplexAlgorithm = () => {
        const { objectiveFunction: cPrime, subjectTo: { A, b } } = file;

        const algorithm = require('../algorithms/simplexTableau.js')

        let newPage = null;
        if(stage > 0){
            newPage = JSON.parse(JSON.stringify(history[page])); 
        }
        
        switch(stage){
            case 0:
                const initValues = algorithm.init(A, b, cPrime);

                setHistory([initValues]);
                setStage(stage+1);
                break;

            case 1:
                switch(step){
                    case 0:
                        newPage.indexH = algorithm.optimalityTest(newPage.cPrimeBarF[0]);

                        if(!Number.isInteger(newPage.indexH)) {
                            if(page === 0){
                                let bOverbarIndexes = [];
                                newPage.bOverbar.forEach((el,i) => {if(-el[0] < 0) bOverbarIndexes.push(i)});

                                if(bOverbarIndexes.length > 0){
                                    // ADMISSIBLE FOR DUAL SIMPLEX
                                    let nonZeroElements = {}
                                    bOverbarIndexes.forEach( idx => {
                                        const count = newPage.FOverbar[idx].filter(n => n>0).length;
                                        nonZeroElements[count] = count in nonZeroElements ? [...nonZeroElements[count], idx] : [idx];
                                    });
                                    const minNonZeroCount = Math.min(...Object.keys(nonZeroElements));
                                    const multiplyByMinusOne = nonZeroElements[minNonZeroCount];

                                    multiplyByMinusOne.forEach( idx => {
                                        newPage.bOverbar[idx][0] *= -1;
                                        newPage.FOverbar = numbers.matrix.rowScale(newPage.FOverbar, idx, -1);
                                    });

                                    setStage(2);
                                    setStep(0);
                                }
                                else{
                                    // NOT ADMISSIBLE FOR DUAL SIMPLEX
                                    // setFinished(true);
                                    setFinished(true);;
                                }
                            }
                            else{
                                // NOT ADMISSIBLE FOR DUAL SIMPLEX
                                // setFinished(true);
                                setFinished(true);;
                            }
                        }
                        else setStep(1);

                        setHistory([...history, newPage]);

                        break;

                    case 1:
                        const pivot = algorithm.findPivot(newPage.bOverbar, newPage.FOverbar, newPage.indexH);
                        newPage = {...newPage, ...pivot};

                        setStep(2);
                        setHistory([...history, newPage]);

                        break;

                    case 2:
                        newPage = algorithm.updateTableau(newPage);

                        setStep(0);
                        setHistory([...history, newPage]);
                        break;
                    default:
                        break;
                }
                break;
            case 2:
                switch(step){
                    case 0:
                        newPage.indexT = algorithm.dualOptimalityTest(newPage.bOverbar);

                        if(!Number.isInteger(newPage.indexT)) setFinished(true);
                        else setStep(1);

                        setHistory([...history, newPage]);

                        break;

                    case 1:
                        const pivot = algorithm.dualFindPivot(newPage.cPrimeBarF, newPage.FOverbar, newPage.indexT);
                        newPage = {...newPage, ...pivot};

                        setStep(2);
                        setHistory([...history, newPage]);

                        break;

                    case 2:
                        newPage = algorithm.updateTableau(newPage);

                        setStep(0);
                        setHistory([...history, newPage]);
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

    let showMessage = message => {
        setMessage(message);
        setTimeout(() => setMessage(''), 5000);
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
            {file && <Grid container direction='row'>
                <Grid container direction='row' item xs={6}>
                    <Grid item xs={12}>
                        <PlotGraph 
                            lines={lines}
                            level={zoomLevel}
                            maxX={maxX}
                            polygon={polygon}
                            point={page>0 ? history[page].point : null}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant='outlined' onClick={onAdd}>ADD LINE</Button>
                        <Button variant='outlined' onClick={onClear}>CLEAR</Button>
                        <Button variant='outlined' disabled={page <= 0} onClick={() => handleHistory()}>{"<"}</Button>
                        <Button variant='outlined' disabled={!history[page+1] && history[page] && finished} onClick={() => handleHistory(true)}>{">"}</Button>
                        <Button variant='outlined' onClick={() => onIntegerSimplexAlgorithm()}>CUTTING PLANE</Button>
                        {page}
                    </Grid>
                </Grid>
                <Grid container direction='column' item xs={6}>
                    {page>0 && <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell key="head-empty-1"></TableCell>
                                <TableCell key="head-empty-2"></TableCell>
                                {history[page].xBLables.map(n => (<TableCell key={`label-${n}`}>{n}</TableCell>))}
                                {history[page].xFLables.map(n => (<TableCell key={`label-${n}`}>{n}</TableCell>))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell key='-z'>-z</TableCell>
                                <TableCell key='cBar0'>{history[page].cBar0}</TableCell>
                                {history[page].cPrimeBarB[0].map((n, i) => (<TableCell key={`cPrimeBarB${i}`}>{formatNumber(n)}</TableCell>))}
                                {history[page].cPrimeBarF[0].map((n, i) => (<TableCell key={`cPrimeBarF${i}`}>{formatNumber(n)}</TableCell>))}
                            </TableRow>
                            {history[page].xBLables.map((n,i) => (
                                <TableRow key={`baseValuesRow${i}`}>
                                    <TableCell key={`baseValues${n}`}>{n}</TableCell>
                                    <TableCell key={`bOverbar${i}`}>{formatNumber(history[page].bOverbar[i][0])}</TableCell>
                                    {history[page].BInvB[i].map(n => (<TableCell key={`BInvB${i},${n}`}>{formatNumber(n)}</TableCell>))}
                                    {history[page].FOverbar[i].map((n,j) => (
                                        <TableCell 
                                            className={
                                                history[page].showPivot && 
                                                history[page].indexT===i && history[page].indexH===j ? classes.pivot : ''
                                            } 
                                            key={`FOverbar${j}_${i},${n}`}
                                        >
                                            {formatNumber(n)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>}
                </Grid>
            </Grid>}
        </>
    )
}

export default LPP;