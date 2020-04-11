import React from 'react';
import Table from './Table';
import {includeChips} from './Chips';
import {includeCardbacks} from './Card';
import {drawWithAxes} from '../../.storybook/storyUtils';
import {action} from '@storybook/addon-actions';

const absStyle = {
  position: 'absolute',
  top: '0px',
  left: '0px'
};
export default {
  component: Table,
  title: 'Table',
  excludeStories: /.*Data$/,
  decorators: [
    storyFn => {
      return <div style={absStyle}>
        {includeChips()}{includeCardbacks()}{storyFn()}
      </div>;
    }
  ]
};

export const cards1Data = [{rank: 0, suit: 1}, {rank: 12, suit: 2}];
export const cards2Data = [{rank: 5, suit: 1}, {rank: 5, suit: 3}];
export const cards3Data = [{rank: 3, suit: 0}, {rank: 4, suit: 0}];

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
  myCards: cards1Data,
  running: true,
  board: [],
  toCall: 100,
  minRaise: 78,
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
  myCards: cards2Data,
  running: true,
  board: [{rank: 5, suit: 2}, {rank: 3, suit: 0}, {rank: 4, suit: 0}],
  toCall: 400,
  minRaise: 200,
  button: 2,
};
export const state3Data = {
  orderedPlayers: [
    {sessionId: 'a', active: true, username: 'shoveAlways', stack: 2930,
     offering: 22},
    {sessionId: 'b', active: true, username: 'helloFriends', stack: 349,
     offering: 100},
    {sessionId: 'c', active: false, username: 'itsMe', stack: 0, offering: 0}
  ],
  pots: [
    {eligiblePids: ['a', 'b'], value: 0}
  ],
  nextToAct: 0,
  myIndex: 2,
  myCards: [],
  running: true,
  board: [],
  toCall: 100,
  minRaise: 78,
  button: 1,
};

export function headsUp() {
  return <Table {...state1Data} send={action('send-message')}/>;
}
export function headsUpSittingOut() {
  return <Table {...state3Data} send={action('send-message')}/>;
}
export function full6() {
  return <Table {...state2Data} send={action('send-message')}/>;
}
