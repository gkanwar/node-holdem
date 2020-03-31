// This is where we make all the $$$

import {ArraySchema} from '@colyseus/schema';
import {Card} from './HoldemState';
import PokerHand from 'poker-hand-evaluator';

function makeDeck() {
  let deck = [];
  for (var rank = 0; rank < 13; ++rank) {
    for (var suit = 0; suit < 4; ++suit) {
      deck.push(new Card(rank, suit));
    }
  }
  return deck;
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomDraw(deck) {
  const index = randomInt(deck.length);
  const value = deck[index];
  delete deck[index];
  return value;
}

function getHandRank(board, cards) {
  // Do it the dumb way: enumerate all 5-card hands
  const allCards = board.concat(cards);
  let bestRank = null;
  for (var skip1 = 0; skip1 < 7; skip1++) {
    for (var skip2 = 0; skip2 < skip1; skip2++) {
      const hand = allCards.filter(
        (val, index) => (index != skip1 && index != skip2));
      const handStr = hand.map(x => x.toString());
      const rank = PokerHand(handStr.join(' ')).getRank();
      if (bestRank === null || rank < bestRank) {
        bestRank = rank;
      }
    }
  }
  return bestRank;
}

class HoldemEngine {
  constructor(state, send) {
    this.state = state;
    this.send = send;
    this.privateState;

    this.initRound();
  }

  initRound() {
    const {playerOrder, players, button, pot, board, smallBlind, bigBlind} = this.state;
    this.privateState = {
      players: {},
      deck: makeDeck()
    };
    const {players: privatePlayers, deck} = this.privateState;
    for (const playerId in players) {
      const cards = [randomDraw(deck), randomDraw(deck)];
      privatePlayers[playerId] = {cards: cards};
      this.send(playerId, {cards: cards});
    }
    if (pot !== 0) {
      throw 'Pot must start at 0 before round!';
    }
    if (board.length !== 0) {
      throw 'Board must start empty before round!';
    }
    const smallIndex = (button+1) % playerOrder.length;
    const bigIndex = (button+2) % playerOrder.length;
    players[playerOrder[smallIndex]].addOffer(smallBlind);
    players[playerOrder[bigIndex]].addOffer(bigBlind);
    this.state.nextToAct = (button+3) % playerOrder.length;
  }

  finishRound(winnerIds) {
    const {playerOrder, players} = this.state;
    const winners = winnerIds.map(id => players[id]);
    // Divide up pot
    console.log(`Round over, dividing pot ${this.state.pot} among winners ${winners}`);
    winners.forEach(winner => {
      winner.stack += Math.floor(this.state.pot / winners.length);
      console.log(`New winner stack ${winner.stack}`);
    });
    winners[randomInt(winners.length)].stack += this.state.pot % winners.length;
    // Reset/update state
    this.state.button = (this.state.button+1) % playerOrder.length;
    this.state.pot = 0;
    this.state.board = new ArraySchema();
    for (const playerId in players) {
      const player = players[playerId];
      player.folded = false;
      if (player.offering !== 0) {
        throw 'Player must not have an active offering when ending round';
      }
    }
    // TODO: broadcast message that round ended?
  }

  // Check if one player wins by default
  isRoundDefaulted() {
    let active = [];
    const {players} = this.state;
    for (const playerId in players) {
      if (!players[playerId].folded) {
        active.push(playerId);
      }
    }
    if (active.length > 1) {
      return false;
    }
    else if (active.length == 1) {
      console.log(`isRoundDefaulted found winner ${active}`);
      return active;
    }
    else {
      throw 'Cannot have 0 active players in a round';
    }
  }

  isStreetDone() {
    let activeOffers = [];
    const {players} = this.state;
    for (const playerId in players) {
      const player = players[playerId];
      if (!player.folded) {
        activeOffers.push(player.offering);
      }
    }
    if (activeOffers.length < 2) {
      console.warn('Should not call isStreetDone with < 2 active players');
      return true;
    }
    const firstOffer = activeOffers[0];
    let haveUnchallengedBet = false;
    activeOffers.forEach(offer => {
      if (offer !== firstOffer) {
        haveUnchallengedBet = true;
      }
    });
    return !haveUnchallengedBet;
  }

  finishStreet() {
    const {players} = this.state;
    for (const playerId in players) {
      const player = players[playerId];
      this.state.pot += player.offering;
      player.offering = 0;
    }
  }

  pushNextToAct() {
    const {players, playerOrder} = this.state;
    let {nextToAct} = this.state;
    while (players[playerOrder[nextToAct]].folded) {
      nextToAct = (nextToAct+1) % playerOrder.length;
    }
    this.state.nextToAct = nextToAct;
  }

  initNextStreet() {
    const {board, button, playerOrder} = this.state;
    const {deck} = this.privateState;
    this.state.nextToAct = (button+1) % playerOrder.length;
    this.pushNextToAct();
    if (board.length == 5) {
      return this.runShowdown();
    }
    else if (board.length == 0) {
      board.push(randomDraw(deck));
      board.push(randomDraw(deck));
      board.push(randomDraw(deck));
    }
    else if (board.length == 3 || board.length == 4) {
      board.push(randomDraw(deck));
    }
    else {
      throw `Invalid board state, ${board.length} cards dealt`;
    }
    return false;
  }

  runShowdown() {
    // TODO: Deal with side pots and the like
    const {players, board} = this.state;
    let bestRank = null;
    let bestPlayerIds = [];
    for (const playerId in players) {
      const player = players[playerId];
      if (player.folded) {
        continue;
      }
      const {cards} = this.privateState.players[playerId];
      const rank = getHandRank(board, cards);
      if (bestRank === null || rank < bestRank) {
        bestRank = rank;
        bestPlayerIds = [playerId];
      }
      else if (rank === bestRank) {
        bestPlayerIds.push(playerId);
      }
    }
    console.log(`runShowdown winners: ${bestPlayerIds}`);
    return bestPlayerIds;
  }

  onAction(playerId, action) {
    const {nextToAct, playerOrder} = this.state;
    if (playerOrder.findIndex((p) => p == playerId) !== nextToAct) {
      console.warn(`Player ${player} acted out of turn`);
      return;
    }
    
    // TODO: check action is valid
    const {players: {[playerId]: player}} = this.state;
    const {type, value} = action;
    if (type === 'fold') {
      player.folded = true;
    }
    else if (type === 'bet') {
      if (!Number.isInteger(value)) {
        this.send(playerId, {
          error: `Value must be numeric integer, received ${value}`
        });
      }
      if (value < player.offering) {
        this.send(playerId, {
          error: `Cannot bet less than current offerring ${value} vs ${player.offering}`
        });
        return;
      }
      player.addOffer(value - player.offering);
      this.state.nextToAct = (this.state.nextToAct+1) % playerOrder.length;
      this.pushNextToAct();
    }
    else {
      this.send(playerId, {
        error: `Invalid action type ${type}`
      });
      return;
    }
    this.send(playerId, {
      message: 'Action OK'
    });

    const winners = this.isRoundDefaulted();
    if (winners !== false) {
      this.finishStreet();
      this.finishRound(winners);
      this.initRound();
    }
    else if (this.isStreetDone()) {
      this.finishStreet();
      const winners = this.initNextStreet();
      if (winners !== false) {
        this.finishRound(winners);
        this.initRound();
      }
    }
  }
}

export default HoldemEngine;
