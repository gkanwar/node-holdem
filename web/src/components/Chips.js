import React from 'react';
import SVG from 'react-inlinesvg';
import Chip1 from './chip1.opt.svg';
import Chip5 from './chip5.opt.svg';
import Chip10 from './chip10.opt.svg';
import Chip25 from './chip25.opt.svg';
import Chip100 from './chip100.opt.svg';
import Chip500 from './chip500.opt.svg';
import Chip1000 from './chip1000.opt.svg';
import Chip5000 from './chip5000.opt.svg';
import Chip10000 from './chip10000.opt.svg';

export const CHIP_VALUES = [1,5,10,25,100,500,1000,5000,10000];
export const STACK_MAX = 20;

/** Convert value to count of chips of each type */
export function valueToChips(value) {
  const chips = [];
  const revChipValues = CHIP_VALUES.slice().reverse();
  for (const chipValue of revChipValues) {
    chips.unshift(Math.floor(value / chipValue));
    value = value % chipValue;
  }
  return chips;
}
/**
 * Convert value to ordered list of chip stacks (index,value), with max
 * height STACK_MAX.
 */
export function valueToChipStacks(value) {
  const chips = valueToChips(value);
  const stacks = [];
  let i = 0;
  while (i < CHIP_VALUES.length) {
    if (chips[i] === 0) {
      i++;
      continue;
    }
    if (chips[i] >= STACK_MAX) {
      chips[i] -= STACK_MAX;
      stacks.push([i, STACK_MAX]);
    }
    else {
      stacks.push([i, chips[i]]);
      i++;
    }
  }
  return stacks;
}

export const CHIP_HREFS = [
  '#chip1', '#chip5', '#chip10', '#chip25', '#chip100',
  '#chip500', '#chip1000', '#chip5000', '#chip10000'
];

export function includeChips() {
  return <div id="assets" style={{display: 'none'}}>
    <SVG src={Chip1}/>
    <SVG src={Chip5}/>
    <SVG src={Chip10}/>
    <SVG src={Chip25}/>
    <SVG src={Chip100}/>
    <SVG src={Chip500}/>
    <SVG src={Chip1000}/>
    <SVG src={Chip5000}/>
    <SVG src={Chip10000}/>
  </div>
}

const CHIP_OFFSET = 3;
function makeStackElt(stack) {
  const [index, count] = stack;
  const chipHref = CHIP_HREFS[index];
  const elt = [];
  for (var i = 0; i < count; i++) {
    elt.push(<g key={`chip-${i.toString()}`} transform={`translate(-15,${-i*CHIP_OFFSET})`}>
             <use xlinkHref={chipHref}/>
             </g>);
  }
  return elt;
}

const STACK_SPACING = 28;
export function makeStacksElt(stacks) {
  const centerX = (stacks.length-1)*STACK_SPACING/2;
  const stackElts = stacks.map((stack, index) => (
    <g key={`stack-${index}`} transform={`translate(${index*STACK_SPACING},0)`}>
      {makeStackElt(stack)}
    </g>
  ));
  return <g transform={`translate(${-centerX},-10)`}>{stackElts}</g>;
}
