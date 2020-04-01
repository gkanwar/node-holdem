import React, {Component} from 'react';
import './pulse.scss';
import {cardToString} from './Card';
import {ReactComponent as Button} from './button.opt.svg';

class Player extends Component {

  render() {
    const {pos: {seat, button}, player, isMe, isActive, isButton, cards} = this.props;
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
    const usernameElt = (
      <text x={usernamePos[0]} y={usernamePos[1]} textAnchor='middle' fill={color}>
        {username}
      </text>
    );
    // TODO: Present this nicely
    const cardStr = (cards !== null) ? cards.map(cardToString).join(' ') : '';
    const infoElt = (
      <text x={infoPos[0]} y={infoPos[1]} textAnchor='middle'>
        <tspan x={infoPos[0]} dy='1.2em'>Off: {player.offering}</tspan>
        <tspan x={infoPos[0]} dy='1.2em'>Stack: {player.stack}</tspan>
        <tspan x={infoPos[0]} dy='1.2em'>Folded: {player.folded.toString()}</tspan>
        <tspan x={infoPos[0]} dy='1.2em'>Cards: {cardStr}</tspan>
      </text>
    );
    let avatarElt;
    if (isActive) {
      avatarElt = (
        <>
          {makeAvatarCircle('pulse-disk')}
          {makeAvatarCircle('pulse-circle-1')}
          {makeAvatarCircle('pulse-circle-2')}
        </>
      );
    }
    else {
      avatarElt = makeAvatarCircle('pulse-circle-fixed');
    }

    let buttonElt = null;
    if (isButton) {
      buttonElt = <Button x={button[0]} y={button[1]}/>;
    }
    
    return (
      <>
        {usernameElt}
        {infoElt}
        {avatarElt}
        {buttonElt}
      </>
    );
  }
}

export default Player;
