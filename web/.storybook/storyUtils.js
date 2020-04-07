import React from 'react';

const svgEltStyle = {
  position: 'absolute',
  top: '0px',
  left: '0px'
};
const svgAxisStyle = {
  stroke: '#808080',
  strokeWidth: 0.5
};
const svgAxes = <>
  <line x1="-10000" y1="0" x2="10000" y2="0" style={svgAxisStyle}></line>
  <line y1="-10000" x1="0" y2="10000" x2="0" style={svgAxisStyle}></line>
</>;
export function drawWithAxes(elt, minX, minY, maxX, maxY) {
  const width = maxX - minX;
  const height = maxY - minY;
  const style = {...svgEltStyle, width, height};
  return <svg style={style} viewBox={`${minX} ${minY} ${maxX-minX} ${maxY-minY}`}>
    {svgAxes}{elt}
  </svg>;
}
