// This is where we make all the $$$

import {ArraySchema} from '@colyseus/schema';
import {makeDeck, randomInt, randomDraw, getHandScore} from './holdemUtils';
import {PlayerState} from './HoldemState';

/**
 * Game engine responsible for managing state of game across rounds. Accepts a
 * reference to the global room state, which is automatically synchronized to
 * clients as the engine makes changes. Further accepts a send(playerId, msg)
 * callback to send messages to players.
 * 
 * There is no clean divide in who mutates which elements of state, making the
 * logic here quite a mess. Should refactor in the future.
 */
class HoldemEngine {
  constructor(state, send) {
    this.state = state;
    this.send = send;
    this.privateState;
  }

  onJoin(playerId, username) {
    this.state.players[playerId] = new PlayerState(username);
    this.state.playerOrder.push(playerId);
    if (this.state.running) {
      this.state.players[playerId].folded = true;
      this.engine.makePlayerPrivateState(playerId);
    }
  }

  onLeave(playerId) {
    delete this.state.players[playerId];
    this.state.playerOrder = this.state.playerOrder.filter(
      pid => (pid != playerId));
  }

  initRound() {
    const {playerOrder, players, button, pot, board, smallBlind, bigBlind} = this.state;
    this.privateState = {
      players: {},
      deck: makeDeck()
    };
    const {deck} = this.privateState;
    for (const playerId in players) {
      const cards = [randomDraw(deck), randomDraw(deck)];
      this.makePlayerPrivateState(playerId, cards);
      this.send(playerId, {myCards: cards});
    }
    if (pot !== 0) {
      throw 'Pot must start at 0 before round!';
    }
    if (board.length !== 0) {
      throw 'Board must start empty before round!';
    }
    this.state.toCall = bigBlind;
    this.state.minRaise = bigBlind;
    const smallIndex = (button+1) % playerOrder.length;
    const bigIndex = (button+2) % playerOrder.length;
    players[playerOrder[smallIndex]].addOffer(smallBlind);
    players[playerOrder[bigIndex]].addOffer(bigBlind);
    this.state.nextToAct = (button+3) % playerOrder.length;
  }

  makePlayerPrivateState(playerId, cards) {
    const {players: privatePlayers} = this.privateState;
    privatePlayers[playerId] = {
      cards: cards !== undefined ? cards : [],
      playedThisStreet: false
    };
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
    const {players: privatePlayers} = this.privateState;
    for (const playerId in players) {
      const player = players[playerId];
      const privatePlayer = privatePlayers[playerId];
      if (!player.folded) {
        if (!privatePlayer.playedThisStreet) {
          return false;
        }
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
    const {players: privatePlayers, deck} = this.privateState;
    this.state.toCall = 0;
    this.state.minRaise = 0;
    this.state.nextToAct = (button+1) % playerOrder.length;
    this.pushNextToAct();
    for (const playerId in privatePlayers) {
      privatePlayers[playerId].playedThisStreet = false;
    }
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
    let bestScore = null;
    let bestPlayerIds = [];
    for (const playerId in players) {
      const player = players[playerId];
      if (player.folded) {
        continue;
      }
      const {cards} = this.privateState.players[playerId];
      const score = getHandScore(board, cards);
      if (bestScore === null || score < bestScore) {
        bestScore = score;
        bestPlayerIds = [playerId];
      }
      else if (score === bestScore) {
        bestPlayerIds.push(playerId);
      }
    }
    console.log(`runShowdown winners: ${bestPlayerIds}`);
    return bestPlayerIds;
  }

  onAction(playerId, action) {
    const {nextToAct, playerOrder} = this.state;
    if (playerOrder.findIndex((p) => p == playerId) !== nextToAct) {
      console.warn(`Player ${playerId} acted out of turn`);
      this.send(playerId, {
        error: 'Cannot act out of turn'
      });
      return;
    }
    
    const {players: {[playerId]: player}} = this.state;
    const {players: {[playerId]: privatePlayer}} = this.privateState;
    const {type, value} = action;
    if (type === 'fold') {
      player.folded = true;
    }
    else if (type === 'bet') {
      if (!Number.isInteger(value)) {
        this.send(playerId, {
          error: `Value must be numeric integer (you bet ${value})`
        });
        return;
      }
      if (value < 0) {
        this.send(playerId, {
          error: `Cannot bet negative value ${value}`
        });
        return;
      }
      const {toCall, minRaise, bigBlind} = this.state;
      if (value + player.offering < toCall) {
        this.send(playerId, {
          error: `Must at least call ${toCall - player.offering} (you bet ${value})`
        });
        return;
      }
      if (toCall === player.offering && value != 0) { // bet
        if (value < bigBlind) {
          this.send(playerId, {
            error: `Min bet value is big blind ${bigBlind} (you bet ${value})`
          });
          return;
        }
        this.state.minRaise = value;
      }
      else if (value + player.offering > toCall) { // raise
        const raise = player.offering + value - toCall;
        if (raise < minRaise) {
          this.send(playerId, {
            error: `Min raise is ${minRaise} (you only raised ${raise})`
          });
          return;
        }
        this.state.minRaise = raise;
      }
      player.addOffer(value);
      this.state.toCall = player.offering;
    }
    else {
      this.send(playerId, {
        error: `Invalid action type ${type}`
      });
      return;
    }
    privatePlayer.playedThisStreet = true;
    this.state.nextToAct = (this.state.nextToAct+1) % playerOrder.length;
    this.pushNextToAct();
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
