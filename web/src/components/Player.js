import React, {Component} from 'react';
import './pulse.scss';
import './player.css';
import {cardToString} from './Card';
import {ReactComponent as Button} from './button.opt.svg';
import Offering from './Offering';
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
      pos: {seat, button, name, nameAnchor, nameBaseline, offer}, player,
      isMe, isActive, isNextToAct, isButton, cards
    } = this.props;
    // const color = isNextToAct ? '#ff0909' : '#888888';
    function makeAvatarCircle(className) {
      return <circle cx={seat[0]} cy={seat[1]} className={className}/>;
    };
    const {username, stack} = player;
    const usernamePos = [name[0], name[1]];
    const stackPos = [name[0], name[1]];
    if (nameBaseline === 'baseline') {
      stackPos[1] -= 15;
    }
    else {
      stackPos[1] += 15;
    }
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
    if (isNextToAct) {
      avatarElt = <g className="next-to-act">
        {makeAvatarCircle('pulse-disk')}
        {makeAvatarCircle('pulse-circle-1')}
        {makeAvatarCircle('pulse-circle-2')}
      </g>;
    }
    else if (isActive) {
      avatarElt = <g className="active">{makeAvatarCircle('pulse-disk-fixed')}</g>;
    }

    const offerElt = <Offering offer={player.offering} posX={offer[0]} posY={offer[1]}/>;

    let buttonElt = null;
    if (isButton) {
      buttonElt = <g transform={`translate(-15,-15)`}>
        <Button x={button[0]} y={button[1]}/>
      </g>;
    }
    
    return (
      <>
        <OverlayTrigger placement="bottom" overlay={infoElt}>
          <g>
            {usernameElt}{stackElt}
            {avatarElt}
          </g>
        </OverlayTrigger>
        {offerElt}
        {buttonElt}
      </>
    );
  }
}

export default Player;
