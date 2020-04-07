import React, {Component} from 'react';
import {ReactComponent as TableBg} from './table.opt.svg';
import ActionBar from './ActionBar';
import {cardPropType} from './Card';
import Board from './Board';
import Player from './Player';
import Pot from './Pot';
import PlayerBadge from './PlayerBadge';
import PropTypes from 'prop-types';

const VIEW_HEIGHT = 600;
const positions6 = [
  {
    index: 0,
    badge: [85, 258],
    button: [148, 289],
    offer: [148, 258]
  },
  {
    index: 3,
    badge: [715, 258],
    button: [654, 227],
    offer: [650, 258]
  },
  {
    index: 1,
    badge: [268, 435],
    button: [317, 382],
    offer: [268, 375]
  },
  {
    index: 4,
    badge: [528, 75],
    button: [510, 130],
    offer: [528, 130]
  },
  {
    index: 2,
    badge: [528, 435],
    button: [560, 377],
    offer: [528, 375]
  },
  {
    index: 5,
    badge: [268, 75],
    button: [230, 133],
    offer: [268, 133]
  }
];

function getPositions(n) {
  if (n <= 6) {
    const usedPositions = positions6.slice(0, n);
    usedPositions.sort((a,b) => a.index - b.index);
    return usedPositions.map((pos) => {
      const {index, ...posData} = pos;
      const posDataReflected = Object.fromEntries(
        Object.entries(posData).map(
          ([k, v]) => {
            if (v.length === 2) {
              return [k, [v[0], VIEW_HEIGHT-v[1]]];
            }
            else {
              return [k, v];
            }
          }));
      console.log(posDataReflected);
      return posDataReflected;
    });
  }
  else {
    throw `Cannot seat > 6 players: ${n}`;
  }
}

class Table extends Component {
  static propTypes = {
    pots: PropTypes.array,
    nextToAct: PropTypes.number,
    myIndex: PropTypes.number,
    myCards: PropTypes.arrayOf(cardPropType),
    orderedPlayers: PropTypes.array,
    running: PropTypes.bool,
    board: PropTypes.array,
    button: PropTypes.number,
    send: PropTypes.func
  };
  constructor() {
    super();
    this.state = {
      positions: []
    }
  }

  componentDidMount() {
    const {orderedPlayers} = this.props;
    this.setState({
      positions: getPositions(orderedPlayers.length)
    });
  }

  componentDidUpdate(prevProps) {
    const {orderedPlayers} = this.props;
    if (prevProps.orderedPlayers.length !== orderedPlayers.length) {
      this.setState({
        positions: getPositions(orderedPlayers.length)
      });
    }
  }
  
  render() {
    const {positions} = this.state;
    const {
      pots, nextToAct, myIndex, myCards, orderedPlayers, running, board, button, send
    } = this.props;
    if (positions.length !== orderedPlayers.length) {
      return null;
    }
    console.log('myCards =', myCards);
    console.log('board =', board);
    console.log('positions =', positions);
    const buttonPos = positions[button];
    // TODO: Render button
    
    const playerBadges = orderedPlayers.map((player, index) => {
      const pos = positions[index];
      const isMe = index == myIndex;
      const badgeProps = {
        isMe,
        isNextToAct: (index == nextToAct && running),
        isActive: player.active,
        isShowing: false // TODO
      }
      const isButton = index == button;
      let cards = myCards;
      if (!isMe) {
        // TODO: For now just inferring whether players have cards, is there
        // a better (more robust) way?
        if (player.active && running) {
          cards = [{rank: -1, suit: -1}, {rank: -1, suit: -1}];
        }
        else {
          cards = null;
        }
      }
      const key = `player-${index}`;
      console.log('key = ', key);
      const {badge} = pos;
      return (
        <g transform={`translate(${badge[0]},${badge[1]})`}>
          <PlayerBadge key={key} username={player.username} stack={player.stack}
          {...badgeProps} cards={cards}/>
        </g>
      );
    });
    const enableActionBar = (
      myIndex == nextToAct && orderedPlayers[myIndex] !== undefined
      && !orderedPlayers[myIndex].folded
    );
    return (
      <div id="table-viewport">
        <svg id="game-canvas">
          <TableBg/>
          {playerBadges}
          <Pot pots={pots}/>
          <Board cards={board}/>
        </svg>
        <ActionBar key="actions-bar" send={send} myIndex={myIndex} enabled={enableActionBar}/>
      </div>
    );
  }
}

export default Table;
