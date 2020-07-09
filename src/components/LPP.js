import React, { useState } from 'react';
import PlotGraph from './PlotGraph';

import { Button } from '@material-ui/core';

import { getY } from '../utils';

const DEBUG=true
const PASS=50

let LPP = () => {
    let [lines, setLines] = useState([]);
    let [maxX, setMaxX] = useState(150);
    let [polygon, setPolygon] = useState([ [0,0], [maxX + 5,0], [maxX + 5,maxX + 5], [0,maxX + 5] ]);
    let [zoomLevel, setZoomLevel] = useState(3)

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

    let onAdd = () => {
        let a = parseInt(Math.random()*60) - 10,
            b = parseInt(Math.random()*30) - 10,
            c = [-1,1][Math.floor(Math.random() * 2)] * parseInt(Math.random()*100),
            s = [-1,1][Math.floor(Math.random() * 2)];
        
        let line = [ a, b, c, s ]

        if(DEBUG){
            console.log(`Adding ${a}x`, `${b > 0 ? '+' : '-'} ${Math.abs(b)}y`, s > 0 ? '>' : '<', `${-c}`);
            console.log(`AKA y`, `${a/b > 0 ? '+' : '-'} ${Math.abs(a/b)}x`, s > 0 ? '>' : '<', `${-c/b}`);
        }

        setLines([...lines, line]);

        let polygonLeft = [], polygonRight = [];
        
        let currentPolygon = polygonLeft;
        let intersections = []

        for(let i=0; i<polygon.length; i++){
            let p1 = polygon[i];
            
            if(intersections.length === 2){
                currentPolygon.push(p1);
                continue;
            }

            let j = i+1<polygon.length ? i+1 : 0;
            let p2 = polygon[j];

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

            setPolygon(s*d > 0 ? polygonLeft : polygonRight);
        }
        else if(polygonRight.length){
            let d = determinant([
                [l_p1[0], l_p2[0], polygonRight[0][0]],
                [l_p1[1], l_p2[1], polygonRight[0][1]],
                [1, 1, 1],
            ]);

            setPolygon(s*d > 0 ? polygonRight : polygonLeft);
        }
    }

    let onClear = () => {
        setZoomLevel(3);
        setMaxX(zoomLevel*PASS);
        setLines([]); 
        setPolygon([ [0,0], [maxX + 5,0], [maxX + 5,maxX + 5], [0,maxX + 5] ]);
    }

    let onZoom = (i) => {
        setZoomLevel(zoomLevel+i);
        setMaxX(zoomLevel*PASS);
    }

    return (
        <>
            <Button variant='outlined' onClick={onAdd}>ADD LINE</Button>
            <Button variant='outlined' onClick={onClear}>CLEAR</Button>
            <Button variant='outlined' onClick={() => onZoom(1)}>+</Button>
            <Button variant='outlined' onClick={() => onZoom(-1)}>-</Button>
            <PlotGraph 
                lines={lines}
                maxX={maxX}
                polygon={polygon}
                level={zoomLevel}
            />
            <div>
                {lines.length}
            </div>
        </>
    )
}

export default LPP;