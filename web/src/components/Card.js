import React, {Component} from 'react';
import SVG from 'react-inlinesvg';
import CardbackSpades from './card_v2_spades.opt.svg';
import CardbackDiamonds from './card_v2_diamonds.opt.svg';
import CardbackHearts from './card_v2_hearts.opt.svg';
import CardbackClubs from './card_v2_clubs.opt.svg';
import CardbackFacedown from './card_v2_facedown.opt.svg';
import CardbackEmpty from './card_v2_empty.opt.svg';
import PropTypes from 'prop-types';
import './card.css';

/** Render this function once to include svg elts for reference */
export function includeCardbacks() {
  return <div id="cb-assets" className="assets">
    <SVG src={CardbackHearts}/>
    <SVG src={CardbackDiamonds}/>
    <SVG src={CardbackSpades}/>
    <SVG src={CardbackClubs}/>
    <SVG src={CardbackFacedown}/>
    <SVG src={CardbackEmpty}/>
  </div>;
}

// TODO: Actual rendering of cards
const rankToString = {
  0: 'A', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7', 7: '8', 8: '9',
  9: 'T', 10: 'J', 11: 'Q', 12: 'K'
};
const suitToString = {
  0: 'S', 1: 'D', 2: 'H', 3: 'C'
};
export function cardToString(card) {
  if (card.rank >= 0 && card.suit >= 0) {
    return rankToString[card.rank] + suitToString[card.suit];
  }
  return Object.toString(card.rank) + Object.toString(card.suit);
}

const rankToString2 = {
  0: 'A', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7', 7: '8', 8: '9',
  9: '10', 10: 'J', 11: 'Q', 12: 'K'
};
const suitToCardbackHref = {
  0: '#cbSpades', 1: '#cbDiamonds', 2: '#cbHearts', 3: '#cbClubs'
};

export const HIDDEN = -1;
export const EMPTY = -2;
export const cardPropType = PropTypes.shape({rank: PropTypes.number, suit: PropTypes.number});

class Card extends Component {
  static propTypes = {card: cardPropType};
  render() {
    const {card} = this.props;
    if (card === undefined) {
      return null;
    }
    let cardbackHref;
    let rankElt = null;
    if (card.suit >= 0 && card.rank >= 0) { // face up
      cardbackHref = suitToCardbackHref[card.suit];
      rankElt = <text className="card-rank" x="50" y="55">{rankToString2[card.rank]}</text>;
    }
    else if (card.suit === EMPTY && card.rank === EMPTY) {
      cardbackHref = '#cbEmpty';
    }
    else if (card.suit === HIDDEN && card.rank === HIDDEN) {
      cardbackHref = '#cbFacedown';
    }
    if (cardbackHref === undefined) {
      return null;
    }
    return (
      <g className="card" transform="translate(-50,-55)">
        <use xlinkHref={cardbackHref}/>
        {rankElt}
      </g>
    );
  }
}

export default Card;
