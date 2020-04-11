import React from 'react';
import Card, {EMPTY, HIDDEN} from './Card';
import {drawWithAxes} from '../../.storybook/storyUtils';

export default {
  component: Card,
  title: 'Card',
  excludeStories: /.*Data$/,
  decorators: [
    storyFn => drawWithAxes(storyFn(), -100, -100, 100, 100)
  ]
};

export const showCardData = {
  card: {rank: 0, suit: 1}
};
export const hideCardData = {
  card: {rank: HIDDEN, suit: HIDDEN}
};
export const emptyCardData = {
  card: {rank: EMPTY, suit: EMPTY}
};

export function hidden() {
  return <Card {...hideCardData}/>;
}
export function shown() {
  return <Card {...showCardData}/>;
}
export function empty() {
  return <Card {...emptyCardData}/>;
}
