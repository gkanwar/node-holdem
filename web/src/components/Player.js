import React, {Component} from 'react';
import './pulse.scss';

class Player extends Component {

  render() {
    const {pos: {seat}, player, isMe, isActive, cards} = this.props;
    const color = isMe ? '#ff0909' : '#888888';
    function makeAvatarCircle(className) {
      return (
        <circle cx={seat[0]} cy={seat[1]} fill={color} stroke={color}
        className={className}/>
      );
    };
    const {username} = player;
    const usernamePos = [seat[0], seat[1]-20];
    const infoPos = [seat[0], seat[1]+20];
    const elements = [];
    elements.push(
      <text x={usernamePos[0]} y={usernamePos[1]} textAnchor='middle' fill={color}>
        {username}
      </text>
    );
    // TODO: Present this nicely
    elements.push(
      <text x={infoPos[0]} y={infoPos[1]} textAnchor='middle'>
        <tspan x={infoPos[0]} dy='1.2em'>Off: {player.offering}</tspan>
        <tspan x={infoPos[0]} dy='1.2em'>Stack: {player.stack}</tspan>
        <tspan x={infoPos[0]} dy='1.2em'>Folded: {player.folded}</tspan>
        <tspan x={infoPos[0]} dy='1.2em'>Cards: {cards}</tspan>
      </text>
    );
    if (isActive) {
      elements.push(makeAvatarCircle('pulse-disk'));
      elements.push(makeAvatarCircle('pulse-circle-1'));
      elements.push(makeAvatarCircle('pulse-circle-2'));
    }
    else {
      elements.push(makeAvatarCircle('pulse-circle-fixed'));
    }
    
    return elements;
  }
}

export default Player;
