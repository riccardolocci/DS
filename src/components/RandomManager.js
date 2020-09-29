import React, { useState } from 'react';
import { Button, CircularProgress, TextField } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';

// import generate from '../utilities/randomGenerator';

const useStyles = makeStyles((theme) => createStyles({
    input: {
        margin: 10,
        width: 100
    },
}));


let RandomManager = (props) => {
    const classes = useStyles();

    let [ n, setN ] = useState(2);
    let [ m, setM ] = useState(1);

    let nMax = 50;
    let mMax = n*(n-1)/2;
    
    return (
    <>
        Otherwise, you can generate a random graph:
        <br/>
        
        <TextField className={classes.input} label='Nodes' type="number" inputProps={{ min: 1, max: nMax, step: 1 }} value={n} onChange={(e) => {let v = e.target.value; setN(v > nMax ? nMax : v); if(m > v*(v-1)/2) setM(v*(v-1)/2)}}/>
        <TextField className={classes.input} label='Edges' type="number" inputProps={{ min: 0, max: mMax, step: 1 }} value={m} onChange={(e) => setM(e.target.value > mMax ? mMax : e.target.value)} disabled={!n}/>
        <br/>
        <Button disabled={!n || !m} variant='outlined' onClick={() => {} /*props.getFile(generate(n, m))*/}>{props.loading ? (<CircularProgress/>) : 'GENERATE'}</Button>
        
    </>
)}

export default RandomManager;