import React, {Component} from 'react';
import {cardToString} from './Card';

class Board extends Component {
  render() {
    const {cards} = this.props;
    if (cards === undefined) {
      return null;
    }
    const boardStr = cards.map(cardToString).join(' ');
    return (
      <g className="board" transform="translate(400, 275)">
        <text x="0" y="0" textAnchor='middle' >Board: {boardStr}</text>
      </g>
    );
  }
}

export default Board;
