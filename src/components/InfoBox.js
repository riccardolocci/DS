import React from 'react';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';


const useStyles = makeStyles((theme) => createStyles({
    info: {
        listStyleType: "'»'",
        padding: 0,
        width: '80%'
    },
    infoEntry: {
        padding: 5,
        textAlign: 'left'
    },
}));

let InfoBox = (props) => {
    const classes = useStyles();

    return (
        <>
            <Typography align="left" display="block" variant="h6">Info box</Typography>
            <ul className={classes.info}>
                {props.info && props.info.length > 0 ? props.info.map(n => (<li className={classes.infoEntry} key={n}>{n}<br/></li>)) : <li className={classes.infoEntry} key='emptyInfo'>No information available yet<br/></li>}
            </ul>
        </>
    )
}

export default InfoBox;