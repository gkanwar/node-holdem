import React, {Component} from 'react';
import Card, {cardToString, cardPropType, EMPTY} from './Card';
import PropTypes from 'prop-types';

const CARD_SPACING = 50;
const MAX_BOARD = 5;

class Board extends Component {
  static propTypes = {
    cards: PropTypes.arrayOf(cardPropType)
  };
  render() {
    const {cards} = this.props;
    if (cards === undefined) {
      return null;
    }
    const boardElts = cards.map((card, index) => (
      <g key={`board-${index}`} transform={`translate(${index*CARD_SPACING},0)`}>
        <Card card={card}/>
      </g>
    ));
    const emptyCard = {rank: EMPTY, suit: EMPTY};
    console.log(Array(MAX_BOARD-cards.length));
    for (const i of Array(MAX_BOARD-cards.length).keys()) {
      const index = cards.length + i;
      console.log(index);
      boardElts.push(
        <g key={`board-${index}`} transform={`translate(${index*CARD_SPACING},0)`}>
          <Card card={emptyCard}/>
         </g>);
    }
    // const centerX = (cards.length-1)*CARD_SPACING/2;
    const centerX = (MAX_BOARD-1)*CARD_SPACING/2;
    return (
      <g className="board" transform={`translate(${-centerX},0)`}>
        {boardElts}
      </g>
    );
  }
}

export default Board;
