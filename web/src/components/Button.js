import React, {Component} from 'react';
import {ReactComponent as ButtonImage} from './button.opt.svg';

class Button extends Component {
  render() {
    return <g transform="translate(-15,-15)" className="button"><ButtonImage/></g>;
  }
}

export default Button;
