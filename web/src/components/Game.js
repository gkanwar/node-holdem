import React, {Component} from 'react';
import Connector from './Connector';
import GameController from './GameController';
import ActiveStateController from './ActiveStateController';
import Standings from './Standings';
import ShowdownContainer from './ShowdownContainer';
import Table from './Table';
import Attention from './Attention';
import {ToastContainer, Flip} from 'react-toastify';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {includeChips} from './Chips';
import {includeCardbacks} from './Card';

class Game extends Component {
  constructor() {
    super();
    this.state = {
      connected: false,
      room: null,
      myIndex: null,
      myCards: []
    };
    this.onConnect = this.onConnect.bind(this);
  }

  onConnect(room) {
    this.setState({
      connected: true,
      room: room
    });
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
      const {playerOrder, ...residualState} = state;
      const myIndex = playerOrder.findIndex((sessionId) => sessionId == room.sessionId);
      this.setState({myIndex});
    });
  }

  render() {
    const {connected} = this.state;
    if (!connected) {
      return (
        <div id="connector-container1">
          <div id="connector-container2">
            <Connector onConnect={this.onConnect}/>
          </div>
        </div>
      );
    }
    else {
      const {room, myIndex, myCards} = this.state;
      const {
        pots, nextToAct, players, playerOrder, running, board, button,
        toCall, minRaise
      } = room.state;
      const orderedPlayers = playerOrder.map((pid) => players[pid]);
      const tableProps = {pots, nextToAct, running, board, button, toCall, minRaise, orderedPlayers};
      const send = (msg) => {return room.send(msg);}
      // TODO: Should reduce passed prop to only relevant piece of state
      return (
        <>
          {includeChips()}
          <ToastContainer autoClose={3000} draggable={false} closeButton={false}
           hideProgressBar={true} pauseOnHover={false} transition={Flip}
           toastClassName="dark-toast"/>
          <GameController room={room}/>
          <ActiveStateController room={room}/>
          <Standings room={room}/>
          <Table {...tableProps} send={send} myIndex={myIndex} myCards={myCards}/>
          <ShowdownContainer room={room}/>
          <Attention value={myIndex === nextToAct}/>
        </>
      );
    }
  }
}

export default Game;
