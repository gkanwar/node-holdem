import React, {Component} from 'react';

class Player extends Component {

  render() {
    const {pos: {seat}, player, isMe} = this.props;
    console.log('player pos =', seat);
    const fill = isMe ? '#ffffff' : '#888888';
    return <circle cx={seat[0]} cy={seat[1]} r={10} style={{fill: fill}}/>
  }
}

export default Player;
