import React, {Component} from 'react';
import Connector from './Connector';
import GameController from './GameController';
import ActiveStateController from './ActiveStateController';
import Standings from './Standings';
import ShowdownContainer from './ShowdownContainer';
import Table from './Table';
import {ToastContainer, Flip} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class Game extends Component {
  constructor() {
    super();
    this.state = {
      connected: false,
      room: null
    };
    this.onConnect = this.onConnect.bind(this);
  }

  onConnect(room) {
    this.setState({
      connected: true,
      room: room
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
      const {room} = this.state;
      // TODO: Should reduce passed prop to only relevant piece of state
      return (
        <>
          <ToastContainer autoClose={3000} draggable={false} closeButton={false}
           hideProgressBar={true} pauseOnHover={false} transition={Flip}
           toastClassName="dark-toast"/>
          <GameController room={room}/>
          <ActiveStateController room={room}/>
          <Standings room={room}/>
          <Table room={room}/>
          <ShowdownContainer room={room}/>
        </>
      );
    }
  }
}

export default Game;
