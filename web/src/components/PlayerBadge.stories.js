import React from 'react';
import PlayerBadge from './PlayerBadge';
import {drawWithAxes} from '../../.storybook/storyUtils';

export default {
  component: PlayerBadge,
  title: 'PlayerBadge',
  excludeStories: /.*Data$/
};

export const playerData = {
  username: 'tester',
  stack: 100000,
};
export const showCardData = {
  cards: [{rank: 0, suit: 1}, {rank: 10, suit: 3}]
};
export const hideCardData = {
  cards: [{rank: -1, suit: -1}, {rank: -1, suit: -1}]
};


export function inactivePlayerWithoutCards() {
  return drawWithAxes(
    <PlayerBadge {...playerData} isMe={false} isActive={false}
    isNextToAct={false} cards={[]}/>,
    -100, -100, 100, 100);
}
export function activePlayerWithHiddenCards() {
  return drawWithAxes(
    <PlayerBadge {...playerData} isMe={false} isActive={true}
    isNextToAct={false} {...hideCardData}/>,
    -100, -100, 100, 100);
}
export function nextToActPlayerWithHiddenCards() {
  return drawWithAxes(
    <PlayerBadge {...playerData} isMe={false} isActive={true}
    isNextToAct={true} {...hideCardData}/>,
    -100, -100, 100, 100);
}
export function activePlayerShowingCards() {
  return drawWithAxes(
    <PlayerBadge {...playerData} isMe={false} isActive={true}
    isNextToAct={false} isShowing={true} {...showCardData}/>,
    -100, -100, 100, 100);
}
export function inactiveMeWithoutCards() {
  return drawWithAxes(
    <PlayerBadge {...playerData} isMe={true} isActive={false}
    isNextToAct={false} cards={[]}/>,
    -100, -100, 100, 100);
}
export function activeMeWithShownCards() {
  return drawWithAxes(
    <PlayerBadge {...playerData} isMe={true} isActive={true}
    isNextToAct={false} {...showCardData}/>,
    -100, -100, 100, 100);
}
export function activeMeShowingCards() {
  return drawWithAxes(
    <PlayerBadge {...playerData} isMe={true} isActive={true}
    isNextToAct={false} isShowing={true} {...showCardData}/>,
    -100, -100, 100, 100);
}
