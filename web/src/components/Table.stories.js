import React from 'react';
import Table from './Table';
import {drawWithAxes} from '../../.storybook/storyUtils';
import {action} from '@storybook/addon-actions';

export default {
  component: Table,
  title: 'Table',
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
export const state1Data = {
  players: [
    {sessionId: 'a', active: true, username: 'shoveAlways', stack: 2930},
    {sessionId: 'b', active: true, username: 'helloFriends', stack: 349}
  ],
  pots: [
    {eligiblePids: ['a', 'b'], value: 0}
  ],
  nextToAct: 0,
  myIndex: 0,
  running: true,
  board: [],
  button: 1,
};
export const cards1Data = [{rank: 0, suit: 1}, {rank: 12, suit: 2}];
export const cards2Data = [{rank: 3, suit: 0}, {rank: 4, suit: 0}];
function send(msg) {
  action(msg);
}

const absStyle = {
  position: 'absolute',
  top: '0px',
  left: '0px'
};
function absContainer(elt) {
  return <div style={absStyle}>{elt}</div>;
}

export function headsUp() {
  return absContainer(
    <Table {...state1Data} send={send} myIndex={0} myCards={cards1Data}/>
  );
}
