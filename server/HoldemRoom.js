import {Room} from 'colyseus';
import {HoldemState} from './HoldemState';
import HoldemEngine from './HoldemEngine';

// Wait up to 1m for reconnect
const RECONNECT_TIMEOUT = 60;
// Patch every 200ms
const PATCH_RATE = 200;

/**
 * Colyseus room for holdem game. Thin wrapper around HoldemEngine.
 */
class HoldemRoom extends Room {
  constructor() {
    super();
  }

  /* eslint-disable no-unused-vars */
  onCreate(options) {
    this.setPatchRate(PATCH_RATE);
    const state = new HoldemState()
    this.setState(state);
    this.clientsById = {};
    this.engine = new HoldemEngine(
      state,
      (sessionId, msg) => {
        console.log(`Sending message to ${sessionId}`, msg);
        this.send(this.clientsById[sessionId], msg);
      },
      (msg) => {
        console.log('Broadcasting message', msg);
        this.broadcast(msg);
      }
    );
  }
  /* eslint-enable no-unused-vars */

  onJoin(client, options) {
    this.clientsById[client.sessionId] = client;
    this.engine.onJoin(client.sessionId, options.username);
  }

  onMessage(client, message) {
    console.log('Got message', message);
    if (message.running !== undefined) {
      this.engine.setRunning(client.sessionId, message.running);
    }
    if (message.buy !== undefined) {
      this.engine.onBuy(client.sessionId, message.buy);
    }
    if (message.stateRequest !== undefined) {
      this.engine.onRequest(client.sessionId, message.stateRequest);
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
        this.clientsById[client.sessionId] = await this.allowReconnection(client, RECONNECT_TIMEOUT);
        console.log(`Reconnected sessionId = ${client.sessionId}`);
        this.state.players[client.sessionId].connected = true;
        this.engine.onReconnect(client.sessionId);
      }
      catch (e) {
        console.log(`Timed out, full disconnect sessionId = ${client.sessionId}`);
        this.engine.onLeave(client.sessionId);
      }
    }
  }

  onDispose() {
  }
}

export default HoldemRoom;
