import React, {Component} from 'react';
import Card, {cardToString, cardPropType, EMPTY} from './Card';
import PropTypes from 'prop-types';
import cardFlip from '../../sounds/card_flip.mp3';

const CARD_SPACING = 50;
export const MAX_BOARD = 5;
export const STREETS = [0,3,4,5];

class Board extends Component {
  static propTypes = {
    cards: PropTypes.arrayOf(cardPropType)
  };
  constructor() {
    super();
    this.cardFlip = new Audio(cardFlip);
  }
  componentDidMount() {
    const {cards} = this.props;
    if (cards !== undefined && cards.length > 0) {
      this.cardFlip.play();
    }
  }
  componentDidUpdate(prevProps) {
    const {cards} = this.props;
    if (cards !== undefined && prevProps.cards !== undefined &&
        cards.length > prevProps.cards.length) {
      this.cardFlip.play();
    }
  }
  render() {
    const {cards} = this.props;
    if (cards === undefined) {
      return null;
    }
    const boardElts = cards.map((card, index) => (
      <g key={`board-${index}`} transform={`translate(${index*CARD_SPACING},0)`}>
        <Card card={card} onBoard={true}/>
      </g>
    ));
    const emptyCard = {rank: EMPTY, suit: EMPTY};
    for (const i of Array(MAX_BOARD-cards.length).keys()) {
      const index = cards.length + i;
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
