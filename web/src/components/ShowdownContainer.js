import React, {Component} from 'react';
import Card from './Card';
import Board from './Board';
import './showdown.css';

const HOLE_CARD_SPACING = 50;
const HOLE_CARDS_X = 400;
const HOLE_CARDS_Y = 100;
const HOLE_CARDS_WIDTH = 600;
const SHOWDOWN_TIMER = 5000;

class ShowdownContainer extends Component {
  constructor() {
    super();
    this.state = {
      showdown: null
    };
  }

  componentDidMount() {
    const {room} = this.props;
    room.onMessage((message) => {
      const {showdown} = message;
      if (showdown !== undefined) {
        this.setState({showdown});
        // TODO: More interesting showdown reveal
        setTimeout(() => {
          this.setState({showdown: null});
        }, SHOWDOWN_TIMER);
      }
    });
  }

  render() {
    const {showdown} = this.state;
    if (showdown === null) {
      return null;
    }
    const {cards, board, handScores} = showdown;
    const nPlayers = Object.values(cards).length;
    const holeCardsElt = Object.entries(cards).map(
      ([pid, cards], index) => {
        const centerX = (
          index * HOLE_CARDS_WIDTH / nPlayers
          + HOLE_CARDS_WIDTH / (2*nPlayers)
          - HOLE_CARDS_WIDTH / 2 + HOLE_CARDS_X);
        return (<>
          <Card key={`${pid}-card0`} card={cards[0]}
           posX={centerX + HOLE_CARD_SPACING/2}
           posY={HOLE_CARDS_Y}/>
          <Card key={`${pid}-card1`} card={cards[1]}
           posX={centerX - HOLE_CARD_SPACING/2}
           posY={HOLE_CARDS_Y}/>
        </>);
      }
    );
    return (
      <div id="showdown-container">
        <div id="showdown-splash"></div>
        <svg id="showdown-hole-cards" width="800" height="600">
          {holeCardsElt}
        </svg>
        <svg id="showdown-board" width="800" height="600">
          <Board cards={board}/>
        </svg>
      </div>
    );
  }
}

export default ShowdownContainer;
