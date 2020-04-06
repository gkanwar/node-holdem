import React, {Component} from 'react';
import {ReactComponent as TableBg} from './table.opt.svg';
import {toast} from 'react-toastify';
import ActionBar from './ActionBar';
import Board from './Board';
import Player from './Player';
import Pot from './Pot';

const VIEW_HEIGHT = 600;
const positions6 = [
  {
    index: 0,
    seat: [85, 258],
    button: [148, 289],
    name: [75, 258],
    offer: [148, 258],
    nameAnchor: 'end',
    nameBaseline: 'middle'
  },
  {
    index: 3,
    seat: [715, 258],
    button: [654, 227],
    name: [725, 258],
    offer: [650, 258],
    nameAnchor: 'start',
    nameBaseline: 'middle'
  },
  {
    index: 1,
    seat: [268, 435],
    button: [317, 382],
    name: [268, 448],
    offer: [268, 375],
    nameAnchor: 'middle',
    nameBaseline: 'baseline'
  },
  {
    index: 4,
    seat: [528, 75],
    button: [510, 130],
    name: [528, 65],
    offer: [528, 130],
    nameAnchor: 'middle',
    nameBaseline: 'hanging'
  },
  {
    index: 2,
    seat: [528, 435],
    button: [560, 377],
    name: [528, 448],
    offer: [528, 375],
    nameAnchor: 'middle',
    nameBaseline: 'baseline'
  },
  {
    index: 5,
    seat: [268, 75],
    button: [230, 133],
    name: [268, 65],
    offer: [268, 133],
    nameAnchor: 'middle',
    nameBaseline: 'hanging'
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
  constructor() {
    super();
    this.state = {
      pot: 0,
      nextToAct: 0,
      myIndex: null,
      myCards: null,
      players: [],
      positions: []
    }
  }
  
  componentDidMount() {
    // TODO: Could miss messages between connection and Table mount
    const {room} = this.props;
    console.log('Table mounting room message handler');
    room.onMessage((message) => {
      console.log('Got room message', message);
      if (message.myCards !== undefined) {
        this.setState({myCards: message.myCards});
      }
      if (message.showdown !== undefined) {
        // TODO showdown popup
      }
      if (message.error !== undefined) {
        toast.error(message.error);
      }
      if (message.info !== undefined) {
        toast.info(message.info);
      }
    });
    room.onStateChange((state) => {
      const {players, playerOrder, ...residualState} = state;
      const orderedPlayers = playerOrder.map((sessionId) => players[sessionId]);
      const myIndex = playerOrder.findIndex((sessionId) => sessionId == room.sessionId);
      this.setState({
        players: orderedPlayers,
        positions: getPositions(orderedPlayers.length),
        myIndex,
        ...residualState
      });
    });
  }

  render() {
    const {myIndex, myCards, pots, board, button, players, positions, nextToAct, running} = this.state;
    console.log('myCards =', myCards);
    console.log('board =', board);
    const playerElements = players.map((player, index) => {
      const pos = positions[index];
      const isMe = index == myIndex;
      const isNextToAct = (index == nextToAct && running);
      const isActive = player.active;
      const isButton = index == button;
      console.log('key = ', 'player-'+player.username);
      const reactPlayer = (
        <Player key={'player-' + player.username} pos={pos} player={player} isMe={isMe}
         isActive={isActive} isNextToAct={isNextToAct} isButton={isButton}
         cards={isMe ? myCards : ['??', '??']}/>
      );
      return reactPlayer;
    });
    const {room} = this.props;
    const enableActionBar = (
      myIndex == nextToAct && players[myIndex] !== undefined
      && !players[myIndex].folded
    );
    return (
      <div id="table-viewport">
        <svg id="game-canvas">
          <TableBg/>
          {playerElements}
          <Pot pots={pots}/>
          <Board cards={board}/>
        </svg>
        <ActionBar key="actions-bar" room={room} myIndex={myIndex} enabled={enableActionBar}/>
      </div>
    );
  }
}

export default Table;
