import React from 'react';
import Offering from './Offering';

export default {
  component: Offering,
  title: 'Offering'
};

export function noOffer() {
  return <Offering offer={0} posX={0} posY={0}/>;
}
export function offer1() {
  return <Offering offer={1} posX={0} posY={0}/>;
}
export function offer2() {
  return <Offering offer={2} posX={0} posY={0}/>;
}
export function offer10() {
  return <Offering offer={10} posX={0} posY={0}/>;
}
export function offer78() {
  return <Offering offer={78} posX={0} posY={0}/>;
}
export function offer550() {
  return <Offering offer={550} posX={0} posY={0}/>;
}
