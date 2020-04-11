import React, {Component} from 'react';
import './player-badge.css';
import Card, {cardToString, cardPropType} from './Card';
import {ReadyTag, SittingTag, NextTag} from './PlayerTag';
import {ReactComponent as PlayerBadgeBg} from './player_badge_v2.opt.svg';
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
      <text className={`${meClass} username`} x="55" y="20">
        {username}
      </text>
    );
    const stackElt = (
      <text className={`${meClass} stack`} x="55" y="23">
        {stack}
      </text>
    );
    let cardElt = null;
    if (cards.length === 2) {
      const overallTransform = isShowing ? "translate(55,-15)" : "translate(55,5)";
      const cardScale = isShowing ? 1.0 : 0.9;
      cardElt = <g className={`${meClass} cards-in-hand`} transform={overallTransform}>
        <g transform={`scale(${cardScale}) translate(-23,0)`}>
          <Card card={cards[0]}/>
        </g>
        <g transform={`scale(${cardScale}) translate(+23,0)`}>
          <Card card={cards[1]}/>
        </g>
      </g>;
    }

    // Active and nextToAct info in tag
    let tagElt = null;
    if (isNextToAct) {
      tagElt = <NextTag/>;
    }
    else if (isActive) {
      tagElt = <ReadyTag/>;
    }
    else {
      tagElt = <SittingTag/>;
    }
    const posTagElt = <g transform="translate(55,50)">{tagElt}</g>;
    
    const badgeElt = <>{posTagElt}<PlayerBadgeBg/>{usernameElt}{stackElt}</>;
    const combinedElt = isShowing ? <>{badgeElt}{cardElt}</> : <>{cardElt}{badgeElt}</>;

    const opacity = isActive ? 1.0 : 0.5;
    return (
        <g className="player-badge" transform="translate(-55,-25)" opacity={opacity}>
          {combinedElt}
      </g>
    );
  }
}

export default PlayerBadge;
