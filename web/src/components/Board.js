import React, {Component} from 'react';
import Card, {cardToString, cardPropType} from './Card';
import PropTypes from 'prop-types';

const CARD_SPACING = 50;

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
    const centerX = (cards.length-1)*CARD_SPACING/2;
    return (
      <g className="board" transform={`translate(${-centerX},0)`}>
        {boardElts}
      </g>
    );
  }
}

export default Board;
