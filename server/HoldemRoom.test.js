import {expect} from 'chai';
import http from 'http';
import express from 'express';
import {Server} from 'colyseus';
import HoldemRoom from './HoldemRoom';
import * as Colyseus from 'colyseus.js';

const port = process.env.PORT || 9075;
const app = express();
const server = http.createServer(app);
const gameServer = new Server({server});
gameServer.define('lobby', HoldemRoom);
gameServer.listen(port);

function makeClientRoom() {
  const client = new Colyseus.Client(`ws://localhost:${port}`);
  const username = Math.random().toString(36).substring(2, 15);
  return client.joinOrCreate('lobby', {username});
}

describe('Integration tests', () => {
  beforeEach(function() {
    // TODO: tear/down setup room
  })
  it('Basic connection', async () => {
    const room1 = await makeClientRoom();
    expect(room1.id).to.be.a('string');
    expect(room1.sessionId).to.be.a('string');
    const room2 = await makeClientRoom();
    expect(room2.id).to.be.a('string');
    expect(room2.sessionId).to.be.a('string');
    expect(room1.id).to.equal(room2.id);
  })
  // TODO: Seems difficult to run integration tests across the ws
});
