import React from 'react';
import Offering from './Offering';
import {includeChips} from './Chips';
import {drawWithAxes} from '../../.storybook/storyUtils';

export default {
  component: Offering,
  title: 'Offering'
};

function drawOffer(offer) {
  const withAxes = drawWithAxes(
    <Offering offer={offer}/>,
    -50, -50, 50, 50);
  return <>{includeChips()}{withAxes}</>;
}

export const noOffer = () => drawOffer(0);
export const offer1 = () => drawOffer(1);
export const offer2 = () => drawOffer(2);
export const offer10 = () => drawOffer(10);
export const offer78 = () => drawOffer(78);
export const offer550 = () => drawOffer(550);
