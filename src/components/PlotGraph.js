import React from 'react';

import { Typography } from '@material-ui/core';

import { getX, getY } from '../utils';

import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

let getPolygonPath = (perimeter) => perimeter.length ? `M${perimeter.reduce((acc, n) => `${acc}L${n.join(',')}`)}Z` : '';

let PlotGraph = (props) => {
  var drawLines = []

  const { feasibleRegion, lines, maxX, point, polygon, title } = props;

  if(lines) drawLines = lines.map( n => {
    let commonLine = {
      type: 'line',
      line: {
        color: 'rgb(200, 0, 0)',
        width: 1,
        dash: 'dot'
      }
    }

    if(n[0] === 0) {
      const y = getY(n, maxX);
      const x = getX(n, y);

      return {
        ...commonLine,
        x0: -x, y0: y,
        x1: x, y1: y
      }
    }

    if(n[1] === 0) {
      const x = getX(n, maxX);
      const y = getY(n, x);

      return {
        ...commonLine,
        x0: x, y0: -y,
        x1: x, y1: y
      }
    }
    
    return {
      ...commonLine,
      x0: -maxX, y0: getY(n, -maxX),
      x1: maxX, y1: getY(n, maxX)
    }
  });


  let shapes = [...drawLines]
  
  let polygonPath = getPolygonPath(polygon)
  if(polygonPath) shapes.push({
    type: 'path',
    path: polygonPath,
    fillcolor: 'rgba(0, 0, 184, 0.2)',
    line: {
      color: 'rgb(0, 0, 184)',
      width: 1,
    }
  })
  
  let feasibleRegionXs = [];
  let feasibleRegionYs = [];
  feasibleRegion.forEach(el => {
    feasibleRegionXs.push(el[0]);
    feasibleRegionYs.push(el[1]);
  });

  if(!feasibleRegion.length){
    feasibleRegionXs = [null];
    feasibleRegionYs = [null];
  }

  const data = [{
    marker: {
      color: 'blue',
      size: 3
    },
    mode: 'markers',
    name: 'feasible solutions',
    type: 'scatter',
    x: feasibleRegionXs,
    y: feasibleRegionYs
  }, {
    marker: {
      color: 'green',
      size: 5
    },
    mode: 'markers',
    name: 'current solution',
    type: 'scatter',
    x: [point ? point[0] : null],
    y: [point ? point[1] : null]
  }];
  
  return (
    <>
      <Typography align="left" display="block" variant="h6">Geometric representation</Typography>
      <Plot
        style={{
          height: "50vh"
        }}
        data = {data}
        layout = {{
          hovermode: 'closest',
          shapes: shapes,
          title: title,
          xaxis: {
            range: [-maxX/10, maxX],
            scaleanchor: "y", 
            scaleratio: 1
            // fixedrange: true
          },
          yaxis: {
            range: [-maxX/10, maxX],
            // fixedrange: true
          },
          // width: 1000,
          // height: 500,
          responsive: true,
        }}
      />
    </>
  );
}

export default PlotGraph;