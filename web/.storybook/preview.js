import '../src/style.css';
import React from 'react';
import {addDecorator} from '@storybook/react';
import {includeCardbacks} from '../src/components/Card';
import {includeChips} from '../src/components/Chips';

addDecorator(storyFn => {
  return <>
    {includeCardbacks()}
    {includeChips()}
    {storyFn()}
  </>;
})
