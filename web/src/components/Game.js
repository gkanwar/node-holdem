import React, {Component} from 'react';
import Connector from './Connector';
import Table from './Table';

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
      return (
        <svg id="game-canvas">
          <Table room={room}/>
        </svg>
      );
    }
  }
}

export default Game;
