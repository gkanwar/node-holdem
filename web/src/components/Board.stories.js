import React from 'react';
import Board from './Board';
import {drawWithAxes} from '../../.storybook/storyUtils';

export default {
  component: Board,
  title: 'Board',
  excludeStories: /.*Data$/
};

export const preflopData = {
  cards: []
};
export const flopData = {
  cards: [
    {rank: 0, suit: 0},
    {rank: 4, suit: 1},
    {rank: 6, suit: 1}
  ]
};
export const turnData = {
  cards: [
    {rank: 0, suit: 0},
    {rank: 4, suit: 1},
    {rank: 6, suit: 1},
    {rank: 2, suit: 3}
  ]
};
export const riverData = {
  cards: [
    {rank: 0, suit: 0},
    {rank: 4, suit: 1},
    {rank: 6, suit: 1},
    {rank: 2, suit: 3},
    {rank: 12, suit: 0}
  ]
};

export function preflop() {
  return drawWithAxes(<Board {...preflopData}/>, -400, -100, 400, 100);
}
export function flop() {
  return drawWithAxes(<Board {...flopData}/>, -400, -100, 400, 100);
}
export function turn() {
  return drawWithAxes(<Board {...turnData}/>, -400, -100, 400, 100);
}
export function river() {
  return drawWithAxes(<Board {...riverData}/>, -400, -100, 400, 100);
}
