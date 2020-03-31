import React, {Component} from 'react';
import {ReactComponent as TableBg} from './table.opt.svg';
import Player from './Player';
import Actions from './Actions';

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
    });
    room.onStateChange((state) => {
      const {players, playerOrder, nextToAct} = state;
      const orderedPlayers = playerOrder.map((sessionId) => players[sessionId]);
      const myIndex = playerOrder.findIndex((sessionId) => sessionId == room.sessionId);
      this.setState({
        myIndex: myIndex,
        players: orderedPlayers,
        positions: getPositions(orderedPlayers.length),
        nextToAct: nextToAct
      });
    });
  }

  render() {
    const {myIndex, myCards, players, positions, nextToAct} = this.state;
    const elements = players.map((player, index) => {
      const pos = positions[index];
      const isMe = index == myIndex;
      const isActive = index == nextToAct;
      const reactPlayer = (
          <Player key={'player-' + player.username} pos={pos} player={player} isMe={isMe}
           isActive={isActive} cards={isMe ? myCards : undefined}/>
      );
      return reactPlayer;
    });
    const {room} = this.props;
    elements.unshift(<TableBg key="table-bg"/>);
    const enableActions = myIndex == nextToAct;
    elements.push(<Actions key="actions-bar" room={room} myIndex={myIndex} enabled={enableActions}/>);
    return <svg id="game-canvas">{elements}</svg>;
  }
}

export default Table;
