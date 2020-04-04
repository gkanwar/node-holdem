import React, {Component} from 'react';
import Card, {cardToString} from './Card';

const CARD_SPACING = 50;

class Board extends Component {
  render() {
    const {cards} = this.props;
    if (cards === undefined) {
      return null;
    }
    const boardElts = cards.map((card, index) => 
      <Card key={`board-${index}`} card={card} posX={index*CARD_SPACING} posY={0}/>
    );
    return (
      <g className="board" transform="translate(300, 270)">
        {boardElts}
      </g>
    );
  }
}

export default Board;
