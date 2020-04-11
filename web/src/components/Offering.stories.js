import React from 'react';
import Offering from './Offering';
import {drawWithAxes} from '../../.storybook/storyUtils';

export default {
  component: Offering,
  title: 'Offering',
  decorators: [storyFn => drawWithAxes(storyFn(), -50, -50, 50, 50)]
};

export const noOffer = () => <Offering offer={0}/>;
export const offer1 = () => <Offering offer={1}/>;
export const offer2 = () => <Offering offer={2}/>;
export const offer10 = () => <Offering offer={10}/>;
export const offer78 = () => <Offering offer={78}/>;
export const offer550 = () => <Offering offer={550}/>;
