// This is where we make all the $$$

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
  for (const skip1 in Array(7).keys()) {
    for (const skip2 in Array(skip1).keys()) {
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
    for (const playerId in Object.keys(privatePlayers)) {
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
    console.log(`smallIndex ${smallIndex} player ${playerOrder[smallIndex]} ${players[playerOrder[smallIndex]]}`);
    console.log(`bigIndex ${bigIndex} player ${playerOrder[bigIndex]}`);
    players[playerOrder[smallIndex]].addOffer(smallBlind);
    players[playerOrder[bigIndex]].addOffer(bigBlind);
    this.state.nextToAct = (button+3) % playerOrder.length;
  }

  finishRound(winners) {
    // Divide up pot
    for (const winner in winners) {
      winner.stack += Math.floor(this.state.pot / winners.length);
    }
    winners[randomInt(winners.length)].stack += this.state.pot % winners.length;
    // Reset/update state
    const {playerOrder, players} = this.state;
    this.button = (this.button+1) % playerOrder.length;
    this.state.pot = 0;
    this.state.board = [];
    for (const playerId in Object.keys(players)) {
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
    for (const playerId in Object.keys(players)) {
      if (!players[playerId].folded) {
        active.push(playerId);
      }
    }
    if (active.length > 1) {
      return false;
    }
    else if (active.length == 1) {
      return active.pop();
    }
    else {
      throw 'Cannot have 0 active players in a round';
    }
  }

  isStreetDone() {
    let activeOffers = [];
    const {players} = this.state;
    for (const playerId in Object.keys(players)) {
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
    for (const offer in activeOffers) {
      if (offer !== firstOffer) {
        return false;
      }
    }
    return true;
  }

  finishStreet() {
    const {players} = this.state;
    for (const playerId in Object.keys(players)) {
      const player = players[playerId];
      this.state.pot += player.offering;
      player.offering = 0;
    }

    const {board} = this.state;
    const {deck} = this.privateState;
    if (board.length == 5) {
      this.runShowdown();
    }
    else if (board.length == 0) {
      this.board.push(randomDraw(deck));
      this.board.push(randomDraw(deck));
      this.board.push(randomDraw(deck));
    }
    else if (board.length == 3 || board.length == 4) {
      this.board.push(randomDraw(deck));
    }
    else {
      throw `Invalid board state, ${board.length} cards dealt`;
    }
  }

  runShowdown() {
    // TODO: Deal with side pots and the like
    const {players, board} = this.state;
    let bestRank = null;
    let bestPlayerIds = [];
    for (const playerId in Object.keys(players)) {
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
    this.finishRound(bestPlayerIds);
  }

  onAction(playerId, action) {
    const {nextToAct, playerOrder} = this.state;
    if (playerOrder.findIndex((p) => p == playerId) !== nextToAct) {
      console.warn(`Player {player} acted out of turn`);
      return;
    }
    
    // TODO: check action is valid
    const {players: {[playerId]: player}} = this.state;
    const {type, value} = action;
    if (type === 'fold') {
      player.folded = true;
    }
    else if (type === 'bet') {
      if (value < player.offering) {
        this.send(playerId, {
          error: `Cannot bet less than current offerring ${value} vs ${player.offering}`
        });
        return;
      }
      player.addOffer(player.offering - value);
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

    const winner = this.isRoundDefaulted();
    if (winner !== false) {
      this.finishStreet();
      this.finishRound([winner]);
    }
    else if (this.isStreetDone()) {
      this.finishStreet();
    }
  }
}

export default HoldemEngine;
