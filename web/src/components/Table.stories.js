import React from 'react';
import Table from './Table';
import {includeChips} from './Chips';
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
  orderedPlayers: [
    {sessionId: 'a', active: true, username: 'shoveAlways', stack: 2930,
     offering: 22},
    {sessionId: 'b', active: true, username: 'helloFriends', stack: 349,
     offering: 100}
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
export const state2Data = {
  orderedPlayers: [
    {sessionId: 'a', active: true, username: 'shoveAlways', stack: 2930,
     offering: 100},
    {sessionId: 'b', active: true, username: 'helloFriends', stack: 349,
     offering: 200},
    {sessionId: 'c', active: true, username: 'blahblah', stack: 2394,
     offering: 400},
    {sessionId: 'd', active: true, username: '99luftballons', stack: 1111,
     offering: 10},
    {sessionId: 'e', active: false, username: 'username', stack: 0,
     offering: 0},
    {sessionId: 'f', active: true, username: 'password', stack: 15,
     offering: 60}
  ],
  pots: [
    {eligiblePids: ['a', 'b', 'c', 'd', 'f'], value: 30}
  ],
  nextToAct: 3,
  myIndex: 5,
  running: true,
  board: [{rank: 5, suit: 2}, {rank: 3, suit: 0}, {rank: 4, suit: 0}],
  button: 2,
};
export const cards1Data = [{rank: 0, suit: 1}, {rank: 12, suit: 2}];
export const cards2Data = [{rank: 5, suit: 1}, {rank: 5, suit: 3}];
export const cards3Data = [{rank: 3, suit: 0}, {rank: 4, suit: 0}];

const absStyle = {
  position: 'absolute',
  top: '0px',
  left: '0px'
};
function absContainer(elt) {
  return <div style={absStyle}>{includeChips()}{elt}</div>;
}

export function headsUp() {
  return absContainer(
    <Table {...state1Data} send={action('send-message')} myIndex={0} myCards={cards1Data}/>
  );
n}
export function full6() {
  return absContainer(
    <Table {...state2Data} send={action('send-message')} myIndex={0} myCards={cards2Data}/>
  );
}
