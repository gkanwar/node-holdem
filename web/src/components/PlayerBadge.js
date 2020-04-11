import React, {Component} from 'react';
import './player-badge.css';
import Card, {cardToString, cardPropType} from './Card';
import {ReadyTag, SittingTag, NextTag, FoldedTag} from './PlayerTag';
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
    isFolded: PropTypes.bool,
    cards: PropTypes.arrayOf(cardPropType)
  };
  constructor() {
    super();
    this.handleHover = this.handleHover.bind(this);
    this.handleUnhover = this.handleUnhover.bind(this);
    this.state = {
      isHovered: false
    }
  }

  handleHover() {
    this.setState({isHovered: true});
  }
  handleUnhover() {
    this.setState({isHovered: false});
  }
  
  render() {
    const {username, stack, isMe, isActive, isNextToAct, isShowing, isFolded, cards} = this.props;
    const {isHovered} = this.state;
    const showCards = isShowing || isHovered;
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
      const showClass = showCards ? "showing" : "not-showing";
      const classNames = `${meClass} ${showClass} cards-in-hand`;
      cardElt = <g className={classNames}>
        <g transform={`translate(-23,0)`}>
          <Card card={cards[0]}/>
        </g>
        <g transform={`translate(+23,0)`}>
          <Card card={cards[1]}/>
        </g>
      </g>;
    }

    // Active and nextToAct info in tag
    let tagElt = null;
    if (isNextToAct) {
      tagElt = <NextTag isMe={isMe}/>;
    }
    else if (isActive) {
      if (isFolded) {
        tagElt = <FoldedTag/>;
      }
      else {
        tagElt = <ReadyTag/>;
      }
    }
    else {
      tagElt = <SittingTag/>;
    }
    const posTagElt = <g transform="translate(55,50)">{tagElt}</g>;
    
    const badgeElt = <>{posTagElt}<PlayerBadgeBg/>{usernameElt}{stackElt}</>;
    // const combinedElt = showCards ? <>{badgeElt}{cardElt}</> : <>{cardElt}{badgeElt}</>;
    const combinedElt = <>{cardElt}{badgeElt}</>;

    const opacity = isActive ? 1.0 : 0.5;
    return (
        <g className="player-badge" transform="translate(-55,-25)" opacity={opacity}
         onMouseEnter={this.handleHover} onMouseLeave={this.handleUnhover}>
          {combinedElt}
      </g>
    );
  }
}

export default PlayerBadge;
