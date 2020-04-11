import React from 'react';
import ActionBar from './ActionBar';
import {action} from '@storybook/addon-actions';

const absStyle = {
  position: 'absolute',
  top: '0px',
  left: '200px'
};
export default {
  component: ActionBar,
  title: 'ActionBar',
  excludeStories: /.*Data$/,
  decorators: [storyFn => <div style={absStyle}>{storyFn()}</div>]
};

export const state1Data = {
  toCall: 20,
  minRaise: 10,
  bigBlind: 2,
  offer: 10,
  stack: 990,
  enabled: true
};
export const state2Data = {
  toCall: 20,
  minRaise: 10,
  bigBlind: 2,
  offer: 10,
  stack: 990,
  enabled: false
};

export function action10ToCall10MinRaise() {
  return <ActionBar send={action('send-message')} {...state1Data}/>;
}
export function disabled() {
  return <ActionBar send={action('send-message')} {...state2Data}/>;
}
