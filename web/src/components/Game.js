import React, {Component} from 'react';
import Connector from './Connector';
import GameController from './GameController';
import ActiveStateController from './ActiveStateController';
import Standings from './Standings';
import Table from './Table';
import Attention from './Attention';
import {ToastContainer, Flip} from 'react-toastify';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {includeChips} from './Chips';
import {includeCardbacks} from './Card';
import betSmallSound from '../../sounds/bet_small.mp3';
import betLargeSound from '../../sounds/bet_large.mp3';
import checkSound from '../../sounds/check_table.mp3';

class Game extends Component {
  constructor() {
    super();
    this.state = {
      connected: false,
      room: null,
      showdown: null,
      myIndex: null,
      myCards: []
    };
    this.onConnect = this.onConnect.bind(this);
    this.sounds = {
      betSmall: new Audio(betSmallSound),
      betLarge: new Audio(betLargeSound),
      check: new Audio(checkSound)
    };
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
        this.setState({showdown: message.showdown});
      }
      if (message.action !== undefined) {
        const {type, value} = message.action;
        const {actionHint} = message;
        if (type === 'fold') {
          // TODO: fold sound
        }
        else if (type === 'bet') {
          if (actionHint === 'check') {
            this.sounds.check.play();
          }
          else if (actionHint === 'call' || actionHint === 'raise' ||
                   actionHint === 'bet' || actionHint === 'all in') {
            if (value >= 20) {
              this.sounds.betLarge.play();
            }
            else {
              this.sounds.betSmall.play();
            }
          }
        }
      }
      if (message.error !== undefined) {
        toast.error(message.error);
      }
      if (message.info !== undefined) {
        toast.info(message.info);
      }
    });
    room.onStateChange((state) => {
      const {playerOrder, running} = state;
      const myIndex = playerOrder.findIndex((sessionId) => sessionId == room.sessionId);
      this.setState({myIndex});
      if (!running) {
        this.setState({myCards: []});
      }
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
      const {room, myIndex, myCards, showdown} = this.state;
      const {
        pots, nextToAct, players, playerOrder, running, board, button,
        toCall, minRaise, bigBlind, log
      } = room.state;
      console.log('Game render', showdown);
      const orderedPlayers = playerOrder.map((pid) => players[pid]);
      const send = (msg) => {return room.send(msg);}
      const tableProps = {
        pots, nextToAct, running, board, button, toCall, minRaise, bigBlind,
        orderedPlayers, myIndex, myCards, showdown, send, log
      };
      // TODO: Should reduce passed prop to only relevant piece of state
      return (
        <>
          {includeChips()}{includeCardbacks()}
          <ToastContainer autoClose={3000} draggable={false} closeButton={false}
           hideProgressBar={true} pauseOnHover={false} transition={Flip}
           toastClassName="dark-toast"/>
          <GameController room={room}/>
          <ActiveStateController room={room}/>
          <Standings room={room}/>
          <Table {...tableProps}/>
          <Attention value={myIndex === nextToAct && running}/>
        </>
      );
    }
  }
}

export default Game;
