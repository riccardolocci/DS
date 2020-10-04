import React, { useState } from 'react';
import { Button, CircularProgress, TextField } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';

import { generate } from '../utils';

const useStyles = makeStyles((theme) => createStyles({
    input: {
        margin: 10,
        width: 100
    },
}));


let RandomManager = (props) => {
    const classes = useStyles();

    let [ m, setM ] = useState(2);

    let mMax = 50;
    
    return (
    <>
        Otherwise, you can generate a random linear problem:
        <br/>
        
        <TextField className={classes.input} label='Constraints' type="number" inputProps={{ min: 1, max: mMax, step: 1 }} value={m} onChange={(e) => {let v = e.target.value; setM(v > mMax ? mMax : v)}}/>
        <br/>
        <Button disabled={!m} variant='outlined' onClick={() => props.getFile(generate(m))}>{props.loading ? (<CircularProgress/>) : 'GENERATE'}</Button>
        
    </>
)}

export default RandomManager;