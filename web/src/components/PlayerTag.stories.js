import React from 'react';
import PlayerTag, {ReadyTag, SittingTag, NextTag} from './PlayerTag';
import {drawWithAxes} from '../../.storybook/storyUtils';

export default {
  component: PlayerTag,
  title: 'PlayerTag',
  decorators: [
    storyFn => drawWithAxes(storyFn(), -100, -20, 100, 20)
  ]
};

export const ready = () => <ReadyTag/>;
export const sitting = () => <SittingTag/>;
export const next = () => <NextTag/>;



  
