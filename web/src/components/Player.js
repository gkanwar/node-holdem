import React, {Component} from 'react';
import './pulse.scss';
import {cardToString} from './Card';
import {ReactComponent as Button} from './button.opt.svg';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

function stackToString(stack) {
  if (stack === 0) {
    return 'BUST';
  }
  else {
    return stack.toString();
  }
}

class Player extends Component {

  render() {
    const {
      pos: {seat, button, name, nameAnchor, nameBaseline}, player,
      isMe, isActive, isButton, cards
    } = this.props;
    const color = isActive ? '#ff0909' : '#888888';
    function makeAvatarCircle(className) {
      return (
        <circle cx={seat[0]} cy={seat[1]} fill={color} stroke={color}
        className={className}/>
      );
    };
    const {username, stack} = player;
    const usernamePos = [name[0], name[1]];
    const stackPos = [name[0], name[1]+15];
    const usernameElt = (
      <text x={usernamePos[0]} y={usernamePos[1]} textAnchor={nameAnchor}
       alignmentBaseline={nameBaseline}>
        {username}
      </text>
    );
    const stackElt = (
      <text x={stackPos[0]} y={stackPos[1]} textAnchor={nameAnchor}
       alignmentBaseline={nameBaseline}>
        ({stackToString(stack)})
      </text>
    );
    // TODO: Present this nicely
    const cardStr = (cards !== null) ? cards.map(cardToString).join(' ') : '';
    const infoElt = (
      <Tooltip>
        Off: {player.offering}<br/>
        Stack: {player.stack}<br/>
        Folded: {player.folded.toString()}<br/>
        Cards: {cardStr}
      </Tooltip>
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
      avatarElt = makeAvatarCircle('pulse-disk');
    }

    let buttonElt = null;
    if (isButton) {
      buttonElt = <Button x={button[0]} y={button[1]}/>;
    }
    
    return (
      <>
        <OverlayTrigger placement="bottom" overlay={infoElt}>
          <g>
            {usernameElt}{stackElt}
            {avatarElt}
          </g>
        </OverlayTrigger>
        {buttonElt}
      </>
    );
  }
}

export default Player;
