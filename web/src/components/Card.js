import React, {Component} from 'react';
import {ReactComponent as CardSpades} from './card_spades.opt.svg';
import {ReactComponent as CardDiamonds} from './card_diamonds.opt.svg';
import {ReactComponent as CardHearts} from './card_hearts.opt.svg';
import {ReactComponent as CardClubs} from './card_clubs.opt.svg';
import {ReactComponent as Facedown} from './card_facedown.opt.svg';
import PropTypes from 'prop-types';
import './card.css';

// TODO: Actual rendering of cards
const rankToString = {
  0: 'A', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7', 7: '8', 8: '9',
  9: 'T', 10: 'J', 11: 'Q', 12: 'K'
};
const suitToString = {
  0: 'S', 1: 'D', 2: 'H', 3: 'C'
};
export function cardToString(card) {
  if (card.rank !== -1 && card.suit !== -1) {
    return rankToString[card.rank] + suitToString[card.suit];
  }
  return Object.toString(card.rank) + Object.toString(card.suit);
}

const rankToString2 = {
  0: 'A', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7', 7: '8', 8: '9',
  9: '10', 10: 'J', 11: 'Q', 12: 'K'
};
const suitToCardback = {
  0: CardSpades, 1: CardDiamonds, 2: CardHearts, 3: CardClubs
};

export const cardPropType = PropTypes.shape({rank: PropTypes.number, suit: PropTypes.number});

class Card extends Component {
  static propTypes = {card: cardPropType};
  render() {
    const {card} = this.props;
    if (card === undefined) {
      return null;
    }
    let Cardback = Facedown;
    let rankElt = null;
    if (card.suit !== -1 && card.rank !== -1) { // face up
      Cardback = suitToCardback[card.suit];
      rankElt = <text className="card-rank" x="50" y="55">{rankToString2[card.rank]}</text>;
    }
    return (
      <g className="card" transform="translate(-50,-55)">
        <Cardback/>
        {rankElt}
      </g>
    );
  }
}

export default Card;
