import React, { useState } from 'react';
import PlotGraph from './PlotGraph';

// import Dropzone from './Dropzone';
import ExamplesManager from './ExamplesManager';
import InfoBox from './InfoBox';
import OriginalProblem from './OriginalProblem';
// import RandomManager from './RandomManager';
import Tableau from './Tableau';

import { Button, Grid, Paper } from '@material-ui/core';

import { formatNumber, getY } from '../utils';

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
    grid: {
        padding: 12
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
    spacer: {
        position: 'relative',
        height: 80
    }
}));

const DEBUG=false;

let LPP = () => {
    let [feasibleRegion, setFeasibleRegion] = useState([]);
    let [file, setFile] = useState();
    let [lines, setLines] = useState([]);
    let [loading, setLoading] = useState(false);
    let [maxX, setMaxX] = useState(30);
    let [message, setMessage] = useState('');
    let [phase, setPhase] = useState(0);
    let [polygon, setPolygon] = useState([ [0,0], [maxX + 5,0], [maxX + 5,maxX + 5], [0,maxX + 5] ]);
    let [stage, setStage] = useState(0);
    let [step, setStep] = useState(0);

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

        let boundingBox = findBoundingBox(startPolygon);

        let startFeasibleRegion = findIntegerFeasibleRegion(boundingBox, startPolygon);
        setFeasibleRegion(startFeasibleRegion);

        let maxxxX = startPolygon.reduce((acc, curr) =>  Math.max(acc, ...curr), 0) * 2;
        setMaxX(maxxxX);
    }
    
    let findBoundingBox = (polygon) => {
        let polygonMaxX = null,
            polygonMaxY = null,
            polygonMinX = null,
            polygonMinY = null;

        if(!polygon.length) return null;
        
        polygon.forEach(el => {
            const [x, y] = el.map(n => Math.floor(n));

            polygonMaxX = polygonMaxX === null || x > polygonMaxX ? x : polygonMaxX;
            polygonMaxY = polygonMaxY === null || y > polygonMaxY ? y : polygonMaxY;
            polygonMinX = polygonMinX === null || x < polygonMinX ? x : polygonMinX;
            polygonMinY = polygonMinY === null || y < polygonMinY ? y : polygonMinY;
        })

        return { polygonMaxX, polygonMaxY, polygonMinX, polygonMinY };
    }

    let findIntegerFeasibleRegion = (boundingBox, polygon) => {
        if(!boundingBox) return [];

        const { polygonMaxX, polygonMaxY, polygonMinX, polygonMinY } = boundingBox;

        let feasibleRegion = [];

        for(let i=polygonMinX; i<=polygonMaxX; i++){
            for(let j=polygonMinY; j<=polygonMaxY; j++){

                if(polygon.every((el, k) => {
                    const l_p1 = el;
                    const l_p2 = k === (polygon.length-1) ? polygon[0] : polygon[k+1];

                    const d = numbers.matrix.determinant([
                        [l_p1[0], l_p2[0], i],
                        [l_p1[1], l_p2[1], j],
                        [1, 1, 1],
                    ]);

                    return d >= 0;
                })){
                    feasibleRegion.push([i,j]);
                }
            }
        }

        return feasibleRegion;
    }

    let findIntersection = (line, segment) => {
        let [a, b, c] = line;
        let [[x1, y1], [x2, y2]] = segment;

        if(a/b === Infinity){
            //Parallel to y axis
            if((-c/a < x1 && -c/a > x2) || (-c/a > x1 && -c/a < x2)) {
                let lambda = (x2 + c/a)/(x2 - x1)
                let y = lambda * y1 + (1 - lambda) * y2;

                return [formatNumber(-c/a), formatNumber(y)]
            }
        } 
        else if(b/a === Infinity){
            //Parallel to x axis
            if((-c/b < y1 && -c/b > y2) || (-c/b > y1 && -c/b < y2)) {
                let lambda = (y2 + c/b)/(y2 - y1)
                let x = lambda * x1 + (1 - lambda) * x2;

                return [formatNumber(x), formatNumber(-c/b)]
            }
        } 
        else{
            let lambda = - (a*x2 + b*y2 + c)/(a*(x1-x2) + b*(y1-y2));

            if(lambda && lambda >= 0 && lambda <= 1){
                let x = lambda * x1 + (1 - lambda) * x2;
                let y = lambda * y1 + (1 - lambda) * y2;

                return [formatNumber(x), formatNumber(y)]
            }
        }
        
    }

    let handleHistory = (next = false) => {
        if(next){
            //Create new page only if algorithm has not finished and next page does not exist
            if(!((history[page] && history[page].finished) || history[page+1])){
                onIntegerSimplexAlgorithm();
            }
            if(history[0]) setPage(page+1);
        }
        else{
            if(history[page]) setPage(page-1)
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

        const l_p1 =  [
            b !== 0 ? -maxX : -c/a, 
            getY(line, -maxX, maxX)
        ];
        const l_p2 = [
            line[1] !== 0 ? maxX : -c/a, 
            getY(line, maxX, maxX)
        ];

        //THERE IS AN INTERSECTION
        //If d>0, polygon is in > region
        //Otherwise in < region
        //If s and d have same sign, polygon is correct
        if(polygonRight.length > 0){
            const barycenter = polygonRight.reduce((prev, curr) => [curr[0] + prev[0], curr[1] + prev[1]], [0,0]).map(n => n/polygonRight.length);
            
            let d = numbers.matrix.determinant([
                [l_p1[0], l_p2[0], barycenter[0]],
                [l_p1[1], l_p2[1], barycenter[1]],
                [1, 1, 1],
            ]);

            if(b === 0 && a<0) return s*d < 0 ? polygonRight : polygonLeft
            return s*d > 0 ? polygonRight : polygonLeft
        }
        else{
            const barycenter = polygonLeft.reduce((prev, curr) => [curr[0] + prev[0], curr[1] + prev[1]], [0,0]).map(n => n/polygonLeft.length);

            let d = numbers.matrix.determinant([
                [l_p1[0], l_p2[0], barycenter[0]],
                [l_p1[1], l_p2[1], barycenter[1]],
                [1, 1, 1],
            ]);

            return s*d >= 0 ? polygonLeft : polygonRight
        }
    }

    let onClear = () => {
        setFeasibleRegion([]);
        setFile();
        setLines([]);
        setLoading(false);
        setMaxX(30);
        setMessage('');
        setPhase(0);
        setPolygon([ [0,0], [maxX + 5,0], [maxX + 5,maxX + 5], [0,maxX + 5] ]);
        setStage(0);
        setStep(0);

        setHistory([]);
        setPage(0);
        setFinished(false);
    }

    let onIntegerSimplexAlgorithm = () => {
        const algorithm = require('../algorithms/cuttingPlane.js')

        let newPage = null;
        if(phase > 0 && phase < 4){
            newPage = JSON.parse(JSON.stringify(history[page])); 
        }

        let bOverbarGen = null, 
            BInvBGen = null, 
            FOverbarGen = null, 
            bOverbarGenFloor = null, 
            BInvBGenFloor = null, 
            FOverbarGenFloor = null;

        if([2,3].includes(phase)){
            bOverbarGen = newPage.bOverbar[newPage.genRowIndex][0];
            BInvBGen = newPage.BInvB[newPage.genRowIndex];
            FOverbarGen = newPage.FOverbar[newPage.genRowIndex];
            
            bOverbarGenFloor = Math.floor(bOverbarGen);
            BInvBGenFloor = BInvBGen.map(n => Math.floor(n));
            FOverbarGenFloor = FOverbarGen.map(n => Math.floor(n));
        }

        switch(phase){
            case 0:
                //COMPUTE SIMPLEX
                if(finished){
                    newPage = JSON.parse(JSON.stringify(history[page])); 
                    newPage.info = [`Simplex algorithm finished`, `Checking integrality of the solution`];
                    setHistory([...history, newPage]);
                    setFinished(false);
                    setPhase(1);
                }
                else {
                    //COMPUTE SIMPLEX
                    onSimplexAlgorithm();
                }

                break;
            case 1:
                //CHECK INTEGRALITY
                newPage.genRowIndex = algorithm.optimalityTest(newPage.bOverbar);

                if(newPage.genRowIndex < 0 || newPage.genRowIndex===null){
                    setPhase(5);
                    newPage.finished = true;
                    newPage.info = ['The solution satisfies integrality'];

                    if(newPage.genRowIndex===null){
                        newPage.infeasible = true;
                        newPage.info.push('But it is infeasible');
                    }
                    else{
                        newPage.info.push('Optimal integer solution found');
                    }
                }
                else {
                    setPhase(2);
                    newPage.info = ['The solution does not satisfy integrality'];
                    newPage.info.push('Applying cutting plane');
                }
                break;
            case 2:
                newPage.info = ['Computing new constraint', 'Applying cut'];
                const newLine = algorithm.computeSlackOrLine(
                    newPage.slacks, 
                    -bOverbarGenFloor, 
                    BInvBGenFloor, 
                    newPage.xBLabels, 
                    FOverbarGenFloor, 
                    newPage.xFLabels,
                    'line'
                );

                newPage.lines.push(newLine);
                newPage.polygon = onAdd(newLine, newPage.polygon);
                newPage.feasibleRegion = findIntegerFeasibleRegion(findBoundingBox(newPage.polygon), newPage.polygon);
                setPhase(3);
                break;
            case 3:
                //APPLY CUT
                const newSlackIndex = newPage.xBLabels.length + newPage.xFLabels.length + 1;

                const xBLabelsOld = [...newPage.xBLabels];

                const bOverbarRim = [bOverbarGenFloor - bOverbarGen];
                const BInvBRim = numbers.matrix.subtraction([BInvBGenFloor], [BInvBGen]);
                const FOverbarRim = numbers.matrix.subtraction([FOverbarGenFloor], [FOverbarGen]);

                newPage.xBLabels.push(`x${newSlackIndex}`);
                newPage.cPrimeBarB[0].push(0);
                newPage.bOverbar.push(bOverbarRim);
                newPage.BInvB.push(...BInvBRim);
                
                newPage.info = ['Adding rim to tableau'];

                //BECAUSE BEFORE THERE WHERE bOverbarGen.length BASE ELEMENTS, NOW bOverbarGen.length+1
                newPage.BInvB = newPage.BInvB.map((n,i) => [...n, i === newPage.bOverbar.length - 1 ? 1 : 0]);

                newPage.FOverbar.push(...FOverbarRim);

                newPage.slacks[`x${newSlackIndex}`] = algorithm.computeSlackOrLine(
                    newPage.slacks, 
                    bOverbarRim[0], 
                    BInvBRim[0], 
                    xBLabelsOld, 
                    FOverbarRim[0], 
                    newPage.xFLabels,
                    'slack'
                );

                newPage.info.push(`Computing new slack x${newSlackIndex} as function of original variables`);

                setStage(2);
                setStep(0);
                setPhase(4);
                break;
            case 4:
                if(finished){
                    newPage = JSON.parse(JSON.stringify(history[page])); 
                    newPage.info = [`Dual simplex algorithm finished`, `Checking integrality of the solution`];
                    setHistory([...history, newPage]);
                    setFinished(false);
                    setPhase(1);
                }
                else{
                    //FIND NEW X* BY DUAL SYMPLEX
                    //REPEAT FROM 1
                    onSimplexAlgorithm(true);
                }

                break;
            default:
                break;
        }

        if(phase > 0 && phase < 4) setHistory([...history, newPage]);
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
                const initValues = {feasibleRegion, info: ['Applying simplex algorithm', 'Initializing tableau'], lines, polygon, ...algorithm.init(A, b, cPrime)};

                setHistory([initValues]);
                setStage(stage+1);
                break;

            case 1:
                switch(step){
                    case 0:
                        newPage.indexH = algorithm.optimalityTest(newPage.cPrimeBarF[0]);
                        newPage.info = ['Checking optimality...']

                        if(isNaN(newPage.indexH)) {
                            newPage.info.push('Found no valid cadidate to enter base');

                            if(page === 0){
                                let bOverbarIndexes = [];
                                newPage.bOverbar.forEach((el,i) => {if(-el[0] < 0) bOverbarIndexes.push(i)});

                                newPage.info.push('Checking if problem can be solved with dual simplex');
                                if(bOverbarIndexes.length > 0){
                                    // ADMISSIBLE FOR DUAL SIMPLEX
                                    newPage.info.push('Problem satisfies dual simplex feasibility rules');

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

                                        const slack = newPage.xBLabels[idx];
                                        newPage.slacks[slack] = [
                                            ...newPage.FOverbar[idx].map(n => -n),
                                            newPage.bOverbar[idx][0]
                                        ]
                                    });

                                    newPage.info.push(`Multiplying row(s) ${multiplyByMinusOne.map(n => n+1).join(', ')} by -1`);

                                    setStage(2);
                                    setStep(0);
                                }
                                else{
                                    // NOT ADMISSIBLE FOR DUAL SIMPLEX
                                    newPage.info.push('Problem does not satisfy dual simplex feasibility rules');
                                    setFinished(true);
                                }
                            }
                            else{
                                // NOT ADMISSIBLE FOR DUAL SIMPLEX
                                newPage.info.push('Found optimal solution');
                                setFinished(true);
                            }
                        }
                        else {
                            newPage.info.push(`Solution can be improved`);
                            newPage.info.push(`Found candidate at column ${newPage.indexH+1} of out of base variables`);
                            newPage.info.push(`Variable ${newPage.xFLabels[newPage.indexH]} will enter the base`);
                            newPage.showIndexH = true;
                            setStep(1);
                        }

                        setHistory([...history, newPage]);

                        break;

                    case 1:
                        newPage.info = [`Looking for a valid candidate to leave base`];
                        const pivot = algorithm.findPivot(newPage.bOverbar, newPage.FOverbar, newPage.indexH);
                        newPage = {...newPage, ...pivot};
                        
                        newPage.info.push(`Found candidate at row ${newPage.indexT+1}`);
                        newPage.info.push(`Variable ${newPage.xBLabels[newPage.indexT]} will leave the base`);
                        newPage.info.push(`Found pivot at column ${newPage.indexH+1} of out of base variables, and row  ${newPage.indexT+1}`);
                        newPage.info.push(`Pivot value is ${newPage.FOverbar[newPage.indexT][newPage.indexH]}`);

                        setStep(2);
                        setHistory([...history, newPage]);

                        break;

                    case 2:
                        newPage = algorithm.updateTableau(newPage);
                        newPage.info = [`Apply pivoting and updating tableau`];

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
                        newPage.info = ['Applying dual simplex', 'Checking dual optimality...']
                        newPage.indexT = algorithm.dualOptimalityTest(newPage.bOverbar);

                        if(!Number.isInteger(newPage.indexT)) {
                            newPage.info.push('Found optimal solution');
                            setFinished(true);
                        }
                        else {
                            newPage.info.push(`Solution can be improved`);
                            newPage.info.push(`Found candidate at row ${newPage.indexT+1}`);
                            newPage.info.push(`Variable ${newPage.xBLabels[newPage.indexT]} will leave the base`);
                            newPage.showIndexT = true;
                            setStep(1);
                        }

                        setHistory([...history, newPage]);

                        break;

                    case 1:
                        newPage.info = [`Looking for a valid candidate to enter the base`];
                        const pivot = algorithm.dualFindPivot(newPage.cPrimeBarF, newPage.FOverbar, newPage.indexT, newPage.xFLabels);

                        if(pivot.indexH === null){
                            newPage.info.push(`No valid candidate found`);
                            setFinished(true);
                            newPage.infeasible = true;
                        }
                        else{
                            setStep(2);

                            newPage.info.push(`Found candidate at column ${pivot.indexH+1}`);
                            newPage.info.push(`Variable ${newPage.xBLabels[newPage.indexT]} will leave the base`);
                            newPage.info.push(`Found pivot at column ${pivot.indexH+1} of out of base variables, and row ${newPage.indexT+1}`);
                            newPage.info.push(`Pivot value is ${newPage.FOverbar[newPage.indexT][pivot.indexH]}`);
                        }

                        newPage = {...newPage, ...pivot};
                        setHistory([...history, newPage]);

                        break;

                    case 2:
                        newPage = algorithm.updateTableau(newPage);
                        newPage.info = [`Apply pivoting and updating tableau`];

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

    // let showMessage = message => {
    //     setMessage(message);
    //     setTimeout(() => setMessage(''), 5000);
    // }

    return (
        <>
            {!file && <>
                {/* <div className={file ? classes.dropClosed : classes.drop}>
                    <Dropzone
                        getFile={getFile}
                        hide={file}
                        showMessage={showMessage}
                    />
                </div> */}

                <div className={file ? classes.dropClosed : classes.generator}>
                    <ExamplesManager getFile={getFile} loading={loading} />
                </div>

                {/* <div className={file ? classes.dropClosed : classes.generator}>
                    <RandomManager getFile={getFile} loading={loading} />
                </div> */}
                
                <div className={classes.spacer}>
                    <Paper className={classes.paper}>
                        <div className={message ? classes.paperDiv : classes.paperDivHide}>
                            {message}
                        </div>
                    </Paper>
                </div>
            </>}
            {file && <Grid container direction='column' className={classes.grid}>
                <Grid container direction='row' item xs={12} className={classes.grid}>
                    <Grid container direction='row' item xs={5} className={classes.grid}>
                        <Grid item xs={12}>
                            <PlotGraph 
                                feasibleRegion={history[page] ? history[page].feasibleRegion : feasibleRegion}
                                lines={history[page] ? history[page].lines : lines}
                                maxX={maxX}
                                polygon={history[page] ? history[page].polygon : polygon}
                                point={history[page] ? history[page].point : null}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant='outlined' onClick={onClear}>CLEAR</Button>
                            <Button variant='outlined' disabled={page <= 0} onClick={() => handleHistory()}>{"<"}</Button>
                            <Button variant='outlined' disabled={!history[page+1] && history[page] && history[page].finished} onClick={() => handleHistory(true)}>{">"}</Button>
                            {history[page] && page}
                        </Grid>
                    </Grid>
                    <Grid item xs={7} className={classes.grid}>
                        <Tableau page={history[page] ? history[page] : {}} />
                    </Grid>
                </Grid>
                <Grid container direction='row' item xs={12} className={classes.grid}>
                    <Grid item xs={5} className={classes.grid}>
                        <OriginalProblem problem={file} />
                    </Grid>
                    <Grid item xs={7} className={classes.grid}>
                        <InfoBox info={history[page] ? history[page].info : []}/>
                    </Grid>
                </Grid>
            </Grid>}
        </>
    )
}

export default LPP;