import React from 'react';
import Board from './Board';
import {drawWithAxes} from '../../.storybook/storyUtils';

export default {
  component: Board,
  title: 'Board',
  excludeStories: /.*Data$/,
  decorators: [storyFn => drawWithAxes(storyFn(), -400, -100, 400, 100)]
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

export const preflop = () => <Board {...preflopData}/>;
export const flop = () => <Board {...flopData}/>;
export const turn = () => <Board {...turnData}/>;
export const river = () => <Board {...riverData}/>;
