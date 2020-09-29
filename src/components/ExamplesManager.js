  
import React, { useState } from 'react';
import { CircularProgress } from '@material-ui/core';
import { Description } from '@material-ui/icons';
import { makeStyles, createStyles } from '@material-ui/core/styles';

import files from '../examples';
// import adapt from '../utilities/arrangeNodes';

const useStyles = makeStyles((theme) => createStyles({
    doc: {
        display: 'inline-block', 
        margin: 20
    },
}));


let ExamplesManager = (props) => {
    const classes = useStyles();

    var [ clicked, setClicked ] = useState();
    
    return (
        <>
            {/*Alternatively, t*/}Try one of the following examples:
            
            <br/>
            
            {Object.keys(files).map(k => (
                <div key={k} className={classes.doc}>
                    {!props.loading && <Description onClick={() => {setClicked(k); props.getFile( /*adapt(*/ files[k] /*)*/ )}} fontSize='large'/>}
                    {props.loading && k===clicked && <CircularProgress color='inherit' fontSize='large'/>}
                    <br/>
                    {k}
                </div>
            ))}
        </>
)}

export default ExamplesManager;