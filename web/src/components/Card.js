import React, {Component} from 'react';
import {ReactComponent as CardHearts} from './card_hearts.opt.svg';

// TODO: Actual rendering of cards
const rankToString = {
  0: 'A', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7', 7: '8', 8: '9',
  9: 'T', 10: 'J', 11: 'Q', 12: 'K', '?': '?'
};
const rankToString2 = {
  0: 'A', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7', 7: '8', 8: '9',
  9: '10', 10: 'J', 11: 'Q', 12: 'K', '?': '?'
};
const suitToString = {
  0: 'S', 1: 'D', 2: 'H', 3: 'C', '?': '?'
};
export function cardToString(card) {
  if (card === '??') {
    return card;
  }
  return rankToString[card.rank] + suitToString[card.suit];
}

class Card extends Component {
  render() {
    const {card, posX, posY} = this.props;
    if (card === undefined) {
      return null;
    }
    // TODO: Suited card backs
    return (
      <g className="card" transform={`translate(${posX}, ${posY})`}>
        <CardHearts/>
        <text x="50" y="55" textAnchor="middle">{rankToString2[card.rank]}</text>
      </g>
    );
  }
}

export default Card;
