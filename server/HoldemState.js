import {Schema, ArraySchema, MapSchema, defineTypes} from '@colyseus/schema';

const rankToString = {
  0: 'A', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7', 7: '8', 8: '9',
  9: 'T', 10: 'J', 11: 'Q', 12: 'K'
};
const suitToString = {
  0: 'S', 1: 'D', 2: 'H', 3: 'C'
};
export class Card extends Schema {
  constructor(rank, suit) {
    super();
    this.rank = rank;
    this.suit = suit;
  }
  toString() {
    return rankToString[this.rank] + suitToString[this.suit];
  }
}
defineTypes(Card, {
  rank: 'uint8',
  suit: 'uint8'
});

export class PlayerState extends Schema {
  constructor(username) {
    super();
    this.username = username;
    this.connected = true;
    this.folded = false;
    this.offering = 0;
    this.stack = 1000;
  }

  addOffer(value) {
    this.offering += value;
    this.stack -= value;
    if (this.stack < 0) {
      // TODO: Guard against this
      console.error('Error: player has negative stack!');
    }
  }
}
defineTypes(PlayerState, {
  username: 'string',
  connected: 'boolean',
  stack: 'int64',
  offering: 'int64',
  folded: 'boolean'
});

export class HoldemState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.playerOrder = new ArraySchema();
    this.button = 0;
    this.pot = 0;
    this.board = new ArraySchema();
    this.smallBlind = 1;
    this.bigBlind = 2;
    this.running = false;
  }
}
defineTypes(HoldemState, {
  players: {map: PlayerState},
  playerOrder: ['string'],
  board: [Card],
  button: 'uint8',
  pot: 'int64',
  nextToAct: 'uint8',
  smallBlind: 'int64',
  bigBlind: 'int64',
  running: 'boolean'
});
