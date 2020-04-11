import React, {Component} from 'react';
import {ReactComponent as TableBg} from './table.opt.svg';
import ActionBar from './ActionBar';
import {cardPropType} from './Card';
import Board from './Board';
import Pot from './Pot';
import Offering from './Offering';
import PlayerBadge from './PlayerBadge';
import PropTypes from 'prop-types';

const VIEW_HEIGHT = 600;
const positions6 = [
  {
    index: 0,
    badge: [90, 250],
    button: [148, 289],
    offer: [210, 270]
  },
  {
    index: 3,
    badge: [715, 258],
    button: [654, 227],
    offer: [600, 250]
  },
  {
    index: 1,
    badge: [268, 435],
    button: [317, 382],
    offer: [275, 360]
  },
  {
    index: 4,
    badge: [570, 80],
    button: [510, 130],
    offer: [500, 160]
  },
  {
    index: 2,
    badge: [528, 435],
    button: [560, 377],
    offer: [520, 360]
  },
  {
    index: 5,
    badge: [230, 80],
    button: [230, 133],
    offer: [295, 165]
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

    const offerElts = orderedPlayers.map((player, index) => {
      const {offer: offerPos} = positions[index];
      return <g transform={`translate(${offerPos[0]}, ${offerPos[1]})`}>
        <Offering offer={player.offering}/>
      </g>;
    });
    
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
          cards = [];
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
    const boardElt = <g transform="translate(400,310)">
      <Board cards={board}/>
          </g>;
    const potElt = <g transform="translate(400,385)">
      <Pot pots={pots}/>
    </g>;
    
    return (
      <div id="table-viewport">
        <svg id="game-canvas">
          <TableBg/>
          {playerBadges}
          {offerElts}
          {potElt}
          {boardElt}
        </svg>
        <ActionBar key="actions-bar" send={send} myIndex={myIndex} enabled={enableActionBar}/>
      </div>
    );
  }
}

export default Table;
