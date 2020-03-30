import {Room} from 'colyseus';
import {HoldemState, PlayerState} from '../common/HoldemState';

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
  }

  onJoin(client, options) {
    this.state.players[client.sessionId] = new PlayerState();
    this.state.playerOrder.push(client.sessionId);
  }

  onMessage(client, message) {
    if (message.sitting !== undefined) {
      this.state.players[client.sessionId].sitting = message.sitting;
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