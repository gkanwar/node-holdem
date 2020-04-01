import {Room} from 'colyseus';
import {HoldemState, PlayerState} from './HoldemState';
import HoldemEngine from './HoldemEngine';

// Wait up to 10m for reconnect
const RECONNECT_TIMEOUT = 600;
// Patch every 200ms
const PATCH_RATE = 200;

class HoldemRoom extends Room {
  constructor() {
    super();
  }

  /* eslint-disable no-unused-vars */
  onCreate(options) {
    this.setPatchRate(PATCH_RATE);
    this.setState(new HoldemState());
    this.clientsById = {};
  }
  /* eslint-enable no-unused-vars */

  onJoin(client, options) {
    this.clientsById[client.sessionId] = client;
    this.state.players[client.sessionId] = new PlayerState(options.username);
    this.state.playerOrder.push(client.sessionId);
    // TODO: Do we need to do something more careful for players joining mid-game?
    if (this.engine !== undefined) {
      this.state.players[client.sessionId].folded = true;
      this.engine.makePlayerPrivateState(client.sessionId);
    }
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
