import React from 'react';
import PlayerBadge from './PlayerBadge';
import {drawWithAxes} from '../../.storybook/storyUtils';

export default {
  component: PlayerBadge,
  title: 'PlayerBadge',
  excludeStories: /.*Data$/,
  decorators: [
    storyFn => drawWithAxes(storyFn(), -100, -100, 100, 100)
  ]
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
  return <PlayerBadge {...playerData} isMe={false} isActive={false}
  isNextToAct={false} cards={[]}/>;
}
export function activePlayerWithHiddenCards() {
  return <PlayerBadge {...playerData} isMe={false} isActive={true}
  isNextToAct={false} {...hideCardData}/>;
}
export function nextToActPlayerWithHiddenCards() {
  return <PlayerBadge {...playerData} isMe={false} isActive={true}
  isNextToAct={true} {...hideCardData}/>;
}
export function activePlayerShowingCards() {
  return <PlayerBadge {...playerData} isMe={false} isActive={true}
  isNextToAct={false} isShowing={true} {...showCardData}/>;
}
export function inactiveMeWithoutCards() {
  return <PlayerBadge {...playerData} isMe={true} isActive={false}
  isNextToAct={false} cards={[]}/>;
}
export function activeMeWithShownCards() {
  return <PlayerBadge {...playerData} isMe={true} isActive={true}
  isNextToAct={false} {...showCardData}/>;
}
export function activeMeShowingCards() {
  return <PlayerBadge {...playerData} isMe={true} isActive={true}
  isNextToAct={false} isShowing={true} {...showCardData}/>;
}
