import {Schema, ArraySchema, MapSchema, defineTypes} from '@colyseus/schema';

class Card extends Schema {}
defineTypes(Card, {
  rank: 'uint8',
  suit: 'uint8'
});

export class PlayerState extends Schema {
  constructor() {
    super();
    this.connected = true;
    this.sitting = false;
    this.folded = false;
    this.offering = 0;
    this.stack = 0;
  }
}
defineTypes(PlayerState, {
  connected: 'boolean',
  sitting: 'boolean',
  stack: 'uint64',
  offering: 'uint64',
  folded: 'boolean'
});

export class HoldemState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.playerOrder = new ArraySchema();
    this.board = new ArraySchema();
  }
}
defineTypes(HoldemState, {
  players: {map: PlayerState},
  playerOrder: ['string'],
  board: [Card],
  button: 'uint8',
  pot: 'uint64'
});
