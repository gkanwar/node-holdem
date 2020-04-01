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
    seat: [60, 258]
  },
  {
    index: 3,
    seat: [740, 258]
  },
  {
    index: 1,
    seat: [268, 457]
  },
  {
    index: 4,
    seat: [528, 50]
  },
  {
    index: 2,
    seat: [528, 457]
  },
  {
    index: 5,
    seat: [268, 50]
  }
];

function getPositions(n) {
  if (n <= 6) {
    const usedPositions = positions6.slice(0, n);
    usedPositions.sort((a,b) => a.index - b.index);
    return usedPositions.map((pos) => {
      const {seat} = pos;
      return {
        seat: [seat[0], VIEW_HEIGHT - seat[1]]
      };
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
    const {room} = this.props;
    room.onMessage((message) => {
      console.log('Got room message', message);
      if (message.myCards !== undefined) {
        this.setState({myCards: message.myCards});
      }
      if (message.error !== undefined) {
        toast(message.error);
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
    const {myIndex, myCards, pot, board, players, positions, nextToAct} = this.state;
    console.log('myCards =', myCards);
    const playerElements = players.map((player, index) => {
      const pos = positions[index];
      const isMe = index == myIndex;
      const isActive = index == nextToAct;
      console.log('key = ', 'player-'+player.username);
      const reactPlayer = (
          <Player key={'player-' + player.username} pos={pos} player={player} isMe={isMe}
           isActive={isActive} cards={isMe ? myCards : ['??', '??']}/>
      );
      return reactPlayer;
    });
    const {room} = this.props;
    const enableActionBar = (
      myIndex == nextToAct && players[myIndex] !== undefined
      && !players[myIndex].folded
    );
    return (
      <>
        <svg id="game-canvas">
          <TableBg/>
          {playerElements}
          <Pot value={pot}/>
          <Board cards={board}/>
        </svg>
        <ActionBar key="actions-bar" room={room} myIndex={myIndex} enabled={enableActionBar}/>
      </>
    );
  }
}

export default Table;
