import React from 'react';

import { getY } from '../utils';

import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

let getPolygonPath = (perimeter) => perimeter.length ? `M${perimeter.reduce((acc, n) => `${acc}L${n.join(',')}`)}Z` : '';

let PlotGraph = (props) => {
  var drawLines = []

  const { lines, maxX, point, polygon, title } = props;

  if(lines) drawLines = lines.map( n => ({
      type: 'line',
      x0: -maxX, y0: getY(n, -maxX),
      x1: maxX, y1: getY(n, maxX),
      line: {
        color: 'rgb(200, 0, 0)',
        width: 4,
        dash: 'dot'
      }
    }));

  let shapes = [...drawLines]
  
  let polygonPath = getPolygonPath(polygon)
  if(polygonPath) shapes.push({
    type: 'path',
    path: polygonPath,
    fillcolor: 'rgba(0, 0, 184, 0.5)',
    line: {
      color: 'rgb(0, 0, 184)'
    }
  })

  if(point){
    shapes.push({
        type: 'circle',
        xref: 'x',
        yref: 'y',
        x0: point[0]-0.1,
        y0: point[1]-0.1,
        x1: point[0]+0.1,
        y1: point[1]+0.1,
        opacity: 1,
        fillcolor: 'green',
        line: {
            color: 'green'
        }
    })
  }
  
  return (
    <Plot
      layout={ {
        title: title,
        xaxis: {
          range: [-10, maxX],
          // fixedrange: true
        },
        yaxis: {
          range: [-10, maxX],
          // fixedrange: true
        },
        // width: 1000,
        // height: 500,
        // responsive: true,
        shapes: shapes
      } }
    />
  );
}

export default PlotGraph;