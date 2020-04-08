import React, {Component} from 'react';
import './pulse.scss';
import './player.css';
import './badge.css';
import Card, {cardToString, cardPropType} from './Card';
import {ReactComponent as PlayerBadgeBg} from './player_badge.opt.svg';
import PropTypes from 'prop-types';

class PlayerBadge extends Component {
  static propTypes = {
    username: PropTypes.string,
    stack: PropTypes.number,
    isMe: PropTypes.bool,
    isActive: PropTypes.bool,
    isNextToAct: PropTypes.bool,
    isShowing: PropTypes.bool,
    cards: PropTypes.arrayOf(cardPropType)
  };
  render() {
    const {username, stack, isMe, isActive, isNextToAct, isShowing, cards} = this.props;
    const meClass = isMe ? "me" : "";
    const usernameElt = (
      <text className={`${meClass} username`} x="70" y="28">
        {username}
      </text>
    );
    const stackElt = (
      <text className={`${meClass} stack`} x="70" y="45">
        {stack}
      </text>
    );
    let cardElt = null;
    // TODO: Hover to pop up
    if (cards.length === 2) {
      const overallTransform = isShowing ? "translate(85,-15)" : "translate(85,5)";
      const cardScale = isShowing ? 1.0 : 0.9;
      cardElt = <g transform={overallTransform}>
        <g transform={`scale(${cardScale}) translate(-23,0)`}><Card card={cards[0]}/></g>
        <g transform={`scale(${cardScale}) translate(+23,0)`}><Card card={cards[1]}/></g>
      </g>;
    }

    // Active and nextToAct info in avatar
    function makeAvatarCircle(className) {
      return <circle className={className}/>;
    };
    const avatarTransform = "translate(136,37)";
    let avatarElt = null;
    if (isNextToAct) {
      avatarElt = <g className="next-to-act" transform={avatarTransform}>
        {makeAvatarCircle('pulse-disk')}
        {makeAvatarCircle('pulse-circle-1')}
        {makeAvatarCircle('pulse-circle-2')}
      </g>;
    }
    else if (isActive) {
      avatarElt = <g className="active" transform={avatarTransform}>
        {makeAvatarCircle('pulse-disk-fixed')}
      </g>;
    }
    
    const badgeElt = <><PlayerBadgeBg/>{usernameElt}{stackElt}{avatarElt}</>;
    const combinedElt = isShowing ? <>{badgeElt}{cardElt}</> : <>{cardElt}{badgeElt}</>;

    return (
      <g className="player-badge" transform="translate(-83,-36)">
          {combinedElt}
      </g>
    );
  }
}

export default PlayerBadge;
