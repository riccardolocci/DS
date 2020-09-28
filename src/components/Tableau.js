import React from 'react';

import { Table, TableRow, TableHead, TableCell, TableBody, Typography } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';

import { formatNumber } from '../utils';

const useStyles = makeStyles((theme) => createStyles({
    empty:{
        textAlign: 'left'
    },
    pivot: {
        backgroundColor: 'red',
        color: 'white'
    },
    pivotColumn: {
        backgroundColor: 'rgba(255,0,0,0.3)',
        color: 'white'
    },
    pivotRow: {
        backgroundColor: 'rgba(255,0,0,0.3)',
        color: 'white'
    }
}));

let Tableau = (props) => {
    const classes = useStyles();

    const { bOverbar, BInvB, cBar0, cPrimeBarB, cPrimeBarF, FOverbar, indexH, indexT, showIndexH, showIndexT, showPivot, xBLabels, xFLabels } = props.page;

    return (
        <>
            <Typography align="left" display="block" variant="h6">Tableau</Typography>
            {Boolean(Object.keys(props.page).length) && <Table>
                <TableHead>
                    <TableRow>
                        <TableCell key="head-empty-1"></TableCell>
                        <TableCell key="head-empty-2"></TableCell>
                        {xBLabels.map(n => (<TableCell key={`label-${n}`}>{n}</TableCell>))}
                        {xFLabels.map((n, i) => (
                            <TableCell 
                                key={`label-${n}`}
                                className={
                                    showIndexH && 
                                    indexH===i ? classes.pivotColumn : ''
                                } 
                            >{n}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell key='-z'>-z</TableCell>
                        <TableCell key='cBar0'>{formatNumber(cBar0)}</TableCell>
                        {cPrimeBarB[0].map((n, i) => (<TableCell key={`cPrimeBarB${i}`}>{formatNumber(n)}</TableCell>))}
                        {cPrimeBarF[0].map((n, i) => (
                            <TableCell 
                                key={`cPrimeBarF${i}`}
                                className={
                                    showIndexH && 
                                    indexH===i ? classes.pivotColumn : ''
                                } 
                            >{formatNumber(n)}</TableCell>
                        ))}
                    </TableRow>
                    {xBLabels.map((n,i) => (
                        <TableRow key={`baseValuesRow${i}`}
                            className={
                                showIndexT && 
                                indexT===i ? classes.pivotRow : ''
                            } 
                        >
                            <TableCell key={`baseValues${n}`}>{n}</TableCell>
                            <TableCell key={`bOverbar${i}`}>{formatNumber(bOverbar[i][0])}</TableCell>
                            {BInvB[i].map((n1, j) => (<TableCell key={`BInvB${j}_${i},${n1}`}>{formatNumber(n1)}</TableCell>))}
                            {FOverbar[i].map((n1, j) => (
                                <TableCell 
                                    className={
                                        showPivot && indexH===j && indexT===i ? classes.pivot : 
                                            showIndexH && indexH===j ? classes.pivotColumn : ''
                                    } 
                                    key={`FOverbar${j}_${i},${n1}`}
                                >
                                    {formatNumber(n1)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>}
            {!Boolean(Object.keys(props.page).length) && <div className={classes.empty}>
                Tableau will be displayed during algorithm execution
            </div>} 
        </>
    )
}

export default Tableau;