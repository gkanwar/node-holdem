import React from 'react';
import Card from './Card';
import {drawWithAxes} from '../../.storybook/storyUtils';

export default {
  component: Card,
  title: 'Card',
  excludeStories: /.*Data$/
};

export const showCardData = {
  card: {rank: 0, suit: 1}
};
export const hideCardData = {
  card: {rank: -1, suit: -1}
};

export function hidden() {
  return drawWithAxes(<Card {...hideCardData}/>, -100, -100, 100, 100);
}
export function shown() {
  return drawWithAxes(<Card {...showCardData}/>, -100, -100, 100, 100);
}
