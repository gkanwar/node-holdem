import React from 'react';
import ActionLog from './ActionLog';

const absStyle = {
  position: 'absolute',
  top: '10px',
  left: '10px'
};
export default {
  component: ActionLog,
  title: 'ActionLog',
  excludeStories: /.*Data$/,
  decorators: [storyFn => <div style={absStyle}>{storyFn()}</div>]
}

const log1Data = [
  'a (ID: a) joined!',
  'b (ID: b) joined!',
  'c (ID: c) joined!',
  'a bought in for 1000',
  'b bought in for 1000',
  'c bought in for 1000',
  'Starting game!',
  'Starting new round: b pays small (1), c pays big (2)',
  'a called 2',
  'b called 2',
  'c checked',
  'Flop: 8D 4C TH',
  'b bet to 10',
  'c called 10',
  'a called 10',
  'Turn: 8D 4C TH JC',
  'b checked',
  'c bet to 50',
  'a called 50',
  'b folds',
  'River: 8D 4C TH JC JS'
];

export const logUntilRiver = () => <ActionLog log={log1Data}/>;
