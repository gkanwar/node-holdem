import {Room} from 'colyseus';
import {HoldemState, PlayerState} from './HoldemState';
import HoldemEngine from './HoldemEngine';

// Wait up to 10m for reconnect
const RECONNECT_TIMEOUT = 600;

class HoldemRoom extends Room {
  constructor() {
    super();
  }

  onCreate(options) {
    // Only need to patch every 1s
    this.setPatchRate(1000);
    this.setState(new HoldemState());
    this.clientsById = {};
  }

  onJoin(client, options) {
    this.clientsById[client.sessionId] = client;
    this.state.players[client.sessionId] = new PlayerState(options.username);
    this.state.playerOrder.push(client.sessionId);
  }

  onMessage(client, message) {
    console.log('Got message', message);
    if (message.running !== undefined) {
      this.state.running = this.state.running || message.running;
      if (this.state.running && this.engine === undefined) {
        console.log('Booting up the game engine!');
        this.engine = new HoldemEngine(this.state, (sessionId, msg) => {
          console.log(`Sending message to ${sessionId}`, msg);
          this.send(this.clientsById[sessionId], msg);
        });
      }
    }
    if (message.action !== undefined) {
      if (this.engine !== undefined) {
        this.engine.onAction(client.sessionId, message.action);
      }
      else {
        console.warn('Warning: action attempted before game started');
      }
    }
  }

  async onLeave(client, consented) {
    this.state.players[client.sessionId].connected = false;
    console.log(`Disconnected sessionId = ${client.sessionId}`);
    if (!consented) {
      try {
        await this.allowReconnection(client, RECONNECT_TIMEOUT);
        console.log(`Reconnected sessionId = ${client.sessionId}`);
        this.state.players[client.sessionId].connected = true;
      }
      catch (e) {
        console.log(`Timed out, full disconnect sessionId = ${client.sessionId}`);
        delete this.state.players[client.sessionId];
        this.state.playerOrder = this.state.playerOrder.filter(
          sessionId => (sessionId != client.sessionId));
      }
    }
  }

  onDispose() {
  }
}

export default HoldemRoom;
