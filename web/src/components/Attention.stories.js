import React from 'react';
import Attention from './Attention';

export default {
  component: Attention,
  title: 'Attention'
};

export function attention() {
  return <Attention value={true}/>;
}
