import React, {Component} from 'react';

class Player extends Component {

  render() {
    const {pos: {seat}, player, isMe} = this.props;
    console.log('player pos =', seat);
    const fill = isMe ? '#ff0909' : '#888888';
    const {username} = player;
    const usernamePos = [seat[0], seat[1]-20];
    return (
      <>
        <text x={usernamePos[0]} y={usernamePos[1]} textAnchor="middle" fill={fill}>{username}</text>
        <circle cx={seat[0]} cy={seat[1]} r={10} fill={fill}/>
      </>
    );
  }
}

export default Player;
