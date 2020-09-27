import React from 'react';

import { Table, TableRow, TableHead, TableCell, TableBody } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';

import { formatNumber } from '../utils';

const useStyles = makeStyles((theme) => createStyles({
    pivot: {
        backgroundColor: 'red',
        color: 'white'
    }
}));

let Tableau = (props) => {
    const classes = useStyles();

    const { bOverbar, BInvB, cBar0, cPrimeBarB, cPrimeBarF, FOverbar, indexH, indexT, showPivot, xBLabels, xFLabels } = props.page;

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell key="head-empty-1"></TableCell>
                    <TableCell key="head-empty-2"></TableCell>
                    {xBLabels.map(n => (<TableCell key={`label-${n}`}>{n}</TableCell>))}
                    {xFLabels.map(n => (<TableCell key={`label-${n}`}>{n}</TableCell>))}
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell key='-z'>-z</TableCell>
                    <TableCell key='cBar0'>{formatNumber(cBar0)}</TableCell>
                    {cPrimeBarB[0].map((n, i) => (<TableCell key={`cPrimeBarB${i}`}>{formatNumber(n)}</TableCell>))}
                    {cPrimeBarF[0].map((n, i) => (<TableCell key={`cPrimeBarF${i}`}>{formatNumber(n)}</TableCell>))}
                </TableRow>
                {xBLabels.map((n,i) => (
                    <TableRow key={`baseValuesRow${i}`}>
                        <TableCell key={`baseValues${n}`}>{n}</TableCell>
                        <TableCell key={`bOverbar${i}`}>{formatNumber(bOverbar[i][0])}</TableCell>
                        {BInvB[i].map((n1, j) => (<TableCell key={`BInvB${j}_${i},${n1}`}>{formatNumber(n1)}</TableCell>))}
                        {FOverbar[i].map((n1, j) => (
                            <TableCell 
                                className={
                                    showPivot && 
                                    indexT===i && indexH===j ? classes.pivot : ''
                                } 
                                key={`FOverbar${j}_${i},${n1}`}
                            >
                                {formatNumber(n1)}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default Tableau;