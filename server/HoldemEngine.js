// This is where we make all the $$$

import {ArraySchema} from '@colyseus/schema';
import {makeDeck, randomInt, randomDraw, getHandScore} from './holdemUtils';
import {PlayerState, PotState} from './HoldemState';

// Need at least 10BBs to actively start playing
const MIN_STACK_TO_ACTIVATE = 10;
// Need at least 2 to tango
const MIN_ACTIVE_PLAYERS = 2;

/**
 * Given scores for all non-folded players' hands, allocate the money in this
 * pot to one or more winners out of the eligible players.
 */
function resolveShowdown(pot, handScores) {
  // const {players} = this.state;
  let bestScore = null;
  let bestPlayerIds = [];
  for (const playerId in handScores) {
    if (!pot.eligiblePids.includes(playerId)) {
      continue;
    }
    const score = handScores[playerId];
    if (bestScore === null || score < bestScore) {
      bestScore = score;
      bestPlayerIds = [playerId];
    }
    else if (score === bestScore) {
      bestPlayerIds.push(playerId);
    }
  }
  console.log(`pot winners: ${bestPlayerIds}`);
  return divideValue(bestPlayerIds, pot.value);
}
function divideValue(winners, value) {
  const winnings = {};
  const nWinners = winners.length;
  winners.forEach(winner => {
    winnings[winner] = Math.floor(value / nWinners);
  });
  winnings[winners[randomInt(nWinners)]] += value % nWinners;
  console.log(`Assigned value ${value}:`, winnings);
  return winnings;
}

function playerCanAct(player) {
  return !player.folded && player.stack !== 0
}


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
  constructor(state, send, broadcast) {
    this.state = state;
    this.send = send;
    this.broadcast = broadcast;
    this.privateState;
    this.request = {};
  }

  onJoin(playerId, username) {
    this.state.players[playerId] = new PlayerState(username);
  }

  onLeave(playerId) {
    const {players, playerOrder, nextToAct} = this.state;
    if (players[playerId].active) {
      this.request[playerId] = {state: 'leave'};
      if (nextToAct === playerOrder.findIndex((pid) => (pid == playerId))) {
        this.onAction(playerId, {type: 'fold'}, true);
      }
      else {
        players[playerId].folded = true;
      }
    }
    else {
      this.doStateRequest(playerId, {state: 'leave'});
    }
  }

  onRequest(playerId, state) {
    // Fast-fail on some requests
    const {players: {[playerId]: player}, bigBlind, running} = this.state;
    if (player === undefined) {
      return;
    }
    if (state === 'sit' && player.sitting === true) {
      this.send(playerId, {info: 'You are already sitting'});
      return;
    }
    if (state === 'stand') {
      if (player.sitting === false) {
        this.send(playerId, {info: 'You are already standing'});
        return;
      }
      else if (player.active === true) {
        this.send(playerId, {
          error: 'Cannot stand while actively playing, go inactive first'
        });
        return;
      }
    }
    if (state === 'active' && player.active === true) {
      this.send(playerId, {info: 'You are already active'});
      return;
    }
    if (state === 'inactive' && player.active === false) {
      this.send(playerId, {info: 'You are already inactive'});
      return;
    }
    if ((state === 'active' || state === 'inactive') &&
        player.standing === true) {
      this.send(playerId, {
        error: `Cannot go to state ${state} from standing, sit first`
      });
      return;
    }
    if (state === 'active' &&
        player.stack < MIN_STACK_TO_ACTIVATE * bigBlind) {
      this.send(playerId, {
        error: `Cannot start playing without at least ${MIN_STACK_TO_ACTIVATE} BBs`
      });
      return;
    }
    // Otherwise, do/queue request and notify player
    if (state === 'sit' || state === 'stand') {
      this.doStateRequest(playerId, {state});
      return;
    }
    else if (state === 'active') {
      if (!running) {
        this.doStateRequest(playerId, {state});
        return;
      }
      else {
        this.send(playerId, {
          info: 'You will be dealt in the next hand'
        });
      }
    }
    else if (state === 'inactive') {
      if (!running) {
        this.doStateRequest(playerId, {state});
        return;
      }
      else {
        this.send(playerId, {
          info: 'You will be removed after this hand is done'
        });
      }
    }
    else {
      this.send(playerId, {
        error: `Unknown requested state ${state}`
      });
      return;
    }
    this.request[playerId] = {state};
  }

  removePlayer(playerId, fromRoomEntirely) {
    const {playerOrder, button} = this.state;
    const _oldButtonPid = playerOrder[button];
    if (fromRoomEntirely) {
      console.log('Removing player from room entirely');
      delete this.state.players[playerId];
    }
    const index = playerOrder.findIndex((pid) => (pid === playerId));
    if (index < 0) {
      console.log('Player not found in player order, skipping removal');
      return;
    }
    playerOrder.splice(index, 1);
    if (button > index) {
      this.state.button = button - 1;
      if (_oldButtonPid !== index &&
          playerOrder[this.state.button] !== _oldButtonPid) {
        throw Error('Button should stay on the same player');
      }
    }
  }

  doStateRequest(playerId, {state}) {
    const {players, playerOrder} = this.state;
    const {[playerId]: player} = players;
    if (state === 'active') {
      player.sitting = true;
      player.active = true;
      if (!playerOrder.includes(playerId)) {
        playerOrder.push(playerId);
      }
      this.send(playerId, {
        info: 'You are now actively playing'
      });
    }
    else if (state === 'inactive' || state === 'sit') {
      player.sitting = true;
      player.active = false;
      if (!playerOrder.includes(playerId)) {
        playerOrder.push(playerId);
      }
      this.send(playerId, {
        info: 'You are now sitting out'
      });
    }
    else if (state === 'stand') {
      player.sitting = false;
      player.active = false;
      this.removePlayer(playerId, false);
      this.send(playerId, {
        info: 'You are now just watching gameplay'
      });
    }
    else if (state === 'leave') {
      delete players[playerId];
      this.removePlayer(playerId, true);
      this.send(playerId, {
        info: 'Goodbye'
      });
    }
    else {
      throw Error(`Unknown state ${state}`);
    }
  }

  handleStateRequests() {
    Object.entries(this.request).forEach(([k,v]) => {this.doStateRequest(k, v)});
    this.request = {};
  }

  setRunning(playerId, running) {
    const {playerOrder, players} = this.state;
    const activePlayers = playerOrder.filter(pid => players[pid].active).length;
    if (running && activePlayers < MIN_ACTIVE_PLAYERS) {
      this.send(playerId, {
        error: `Cannot start game with only ${activePlayers.length} players ready`
      });
    }
    else {
      this.state.running = running;
      if (running) {
        this.broadcast({info: 'Starting game!'});
        this.initRound();
      }
      else {
        this.broadcast({info: 'Pausing game after this hand'});
      }
    }
  }

  initRound() {
    const {playerOrder, players, button, pots, board, smallBlind, bigBlind} = this.state;
    if (board.length !== 0) {
      throw Error('Board must start empty before round!');
    }
    pots.splice();
    pots.push(new PotState(new ArraySchema(), 0));
    this.privateState = {
      players: {},
      deck: makeDeck(),
      lastAggressor: undefined
    };
    const {deck} = this.privateState;
    for (const playerId in players) {
      let cards = [];
      if (players[playerId].active) {
        cards = [randomDraw(deck), randomDraw(deck)];
        pots[0].eligiblePids.push(playerId);
      }
      this.makePlayerPrivateState(playerId, cards);
      this.notifyPlayerPrivateState(playerId);
    }
    const smallIndex = this.pushToFirstActive(button+1);
    const bigIndex = this.pushToFirstActive(smallIndex+1);
    this.state.toCall = bigBlind;
    this.state.minRaise = bigBlind;
    players[playerOrder[smallIndex]].addOffer(smallBlind);
    players[playerOrder[bigIndex]].addOffer(bigBlind);
    this.state.nextToAct = this.pushToFirstActive(bigIndex+1);
  }

  makePlayerPrivateState(playerId, cards) {
    const {players: privatePlayers} = this.privateState;
    privatePlayers[playerId] = {
      cards,
      playedThisStreet: false
    };
  }

  notifyPlayerPrivateState(playerId) {
    if (this.privateState === undefined) {
      return;
    }
    const {players: {[playerId]: privatePlayer}} = this.privateState;
    if (privatePlayer !== undefined) {
      const {cards} = privatePlayer;
      if (cards.length !== 0) {
        this.send(playerId, {myCards: cards});
      }
    }
  }

  onReconnect(playerId) {
    this.notifyPlayerPrivateState(playerId);
  }
  
  divideMoneyDefaulted(winnerIds) {
    const {players, pots} = this.state;
    pots.map(pot => {
      const winnings = divideValue(winnerIds, pot.value);
      Object.entries(winnings).map(([pid, value]) => {
        players[pid].stack += value;
      });
    });
  }

  divideMoneyShowdown(handScores) {
    const {players, pots} = this.state;
    pots.map(pot => {
      const winnings = resolveShowdown(pot, handScores);
      console.log('winnings', winnings);
      Object.entries(winnings).map(([pid, value]) => {
        players[pid].stack += value;
      });
    });
  }

  /**
   * Handle any state change requests (e.g. sit, active, inactive), and also
   * push out any players who cannot post blinds for the next round. If this
   * drops us to fewer than two players, pause the game.
   */
  finishRound() {
    // Reset/update state
    const {playerOrder, players, bigBlind} = this.state;
    this.state.button = (this.state.button+1) % playerOrder.length;
    this.state.pots = new ArraySchema();
    this.state.board = new ArraySchema();
    for (const playerId in players) {
      const player = players[playerId];
      player.folded = false;
      player.setLastValue();
      if (player.stack < bigBlind) {
        console.log(`Player ${playerId} is bust`);
        this.doStateRequest(playerId, {state: 'inactive'});
        this.send(playerId, {
          info: 'You are bust! Buy back in and toggle active state to rejoin'
        });
      }
      if (player.offering !== 0) {
        throw Error('Player must not have an active offering when ending round');
      }
    }
    // TODO: broadcast message that round ended?
    this.handleStateRequests();
    const activePlayers = playerOrder.filter(pid => players[pid].active).length;
    if (activePlayers < MIN_ACTIVE_PLAYERS) {
      this.state.running = false;
      this.broadcast({
        info: 'Fewer than two players active, pausing the game'
      });
    }
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
      console.warn('All players folded, possibly due to disconnection');
      return [];
    }
  }

  /**
   * Check whether the current board state corresponds to a finished street.
   * The criteria are: everyone either cannot act (folded/all-in), or have
   * offered the toCall value and have played this street.
   */
  isStreetDone() {
    const {players, toCall} = this.state;
    const {players: privatePlayers} = this.privateState;
    for (const playerId in players) {
      const player = players[playerId];
      const privatePlayer = privatePlayers[playerId];
      if (player.active && playerCanAct(player) &&
          (player.offering !== toCall || !privatePlayer.playedThisStreet)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Collect money from all players' offerings and built the latest set of pots.
   * The biggest complication here is that all-ins can cause there to be side
   * pots introduced. The logic is handled in 3ish steps:
   *   (1) Identify the pot "prices of entry". The offering size of each live
   *       player is the price of entry of some pot.
   *  (2a) Per player, work from the cheapest pot (the main pot for this street)
   *       to the most expensive and allocate the difference between each pot to
   *       the next.
   *  (2b) If the player is live, also add them to the eligible players for each
   *       pot on the way up.
   */
  finishStreet() {
    const {players, toCall} = this.state;
    const potPrices = new Set();
    for (const playerId in players) {
      const player = players[playerId];
      // Players already excluded from the side pots and those that folded
      // do not set pot prices
      if (player.offering === 0 || player.folded) {
        continue;
      }
      // Every all-in player sets the price of a side pot
      if (player.stack === 0) {
        potPrices.add(player.offering);
      }
    }
    const sortedPotPrices = Array.from(potPrices).sort((a,b) => a-b);
    console.log('(Pre)Pot prices:', sortedPotPrices);
    if (this.playersThatCanAct().length > 1) { // live side pot
      console.log('live side pot!', this.playersThatCanAct());
      sortedPotPrices.push(toCall);
    }
    if (sortedPotPrices.length === 0) {
      console.log('No all-ins this round, no live side pot');
      // Just collect all offerings into main pot
      const {pots} = this.state;
      Object.values(players).forEach(player => {
        pots[0].value += player.offering;
        player.offering = 0;
      });
      return;
    }
    const maxPrice = sortedPotPrices[sortedPotPrices.length-1];
    // Refund any player who offered more than the maximum pot price
    Object.entries(players).forEach(([pid, player]) => {
      if (player.offering > maxPrice) {
        console.log(`Refunding ${pid} who paid ${player.offering} vs ${maxPrice}`);
        player.addOffer(maxPrice - player.offering); // refund
      }
    });
    console.log('Pot prices:', sortedPotPrices);
    const potEligiblePids = sortedPotPrices.map(() => new ArraySchema());
    const potValues = sortedPotPrices.map(() => 0);
    for (const playerId in players) {
      const player = players[playerId];
      let lastPotPrice = 0;
      sortedPotPrices.forEach((potPrice, i) => {
        if (player.offering >= potPrice) {
          if (!player.folded) {
            potEligiblePids[i].push(playerId);
          }
          potValues[i] += potPrice - lastPotPrice;
        }        else if (player.offering > lastPotPrice) {
          potValues[i] += player.offering - lastPotPrice;
        }
        lastPotPrice = potPrice;
      });
      // return money if one player bets over everyone's all-in prices
      if (player.offering > lastPotPrice) {
        throw Error('Player should not be offering more than max price '
                    + `${player.offering} vs ${lastPotPrice} == ${maxPrice}`);
      }
      player.offering = 0;
    }
    // Carry over main pot, update list of pots
    const {pots} = this.state;
    potValues[0] += pots[0].value;
    console.log('reconstructing pots', potValues, potEligiblePids);
    pots.shift();
    potValues.map((potValue, i) => {
      const eligiblePids = potEligiblePids[i];
      pots.unshift(new PotState(eligiblePids, potValue));
    });
    console.log('finishStreet pots', pots.map(
      pot => `${pot.value} [${pot.eligiblePids}]`));
  }

  // TODO: remove code dup with below
  pushToFirstActive(index) {
    const {players, playerOrder} = this.state;
    let outIndex = index % playerOrder.length;
    const origIndex = outIndex;
    while (!(players[playerOrder[outIndex]]).active) {
      outIndex = (outIndex+1) % playerOrder.length;
      if (outIndex === origIndex) {
        return null;
      }
    }
    return outIndex;
  }

  /**
   * Find the next player from nextToAct onwards that can play, and update
   * nextToAct to point at them. Returns a boolean indicating whether any
   * can play.
   */
  pushNextToAct() {
    const {players, playerOrder} = this.state;
    const {players: privatePlayers} = this.privateState;
    const {nextToAct: origNextToAct} = this.state;
    let {nextToAct} = this.state;
    while (!playerCanAct(players[playerOrder[nextToAct]])) {
      privatePlayers[playerOrder[nextToAct]].playedThisStreet = true;
      nextToAct = this.pushToFirstActive(nextToAct+1);
      if (nextToAct === origNextToAct) {
        return false;
      }
    }
    this.state.nextToAct = nextToAct;
    return true;
  }

  initNextStreet() {
    const {board, button, playerOrder, players} = this.state;
    const {players: privatePlayers, deck} = this.privateState;
    this.state.toCall = 0;
    this.state.minRaise = 0;
    this.state.nextToAct = (button+1) % playerOrder.length;
    this.pushNextToAct();
    for (const playerId in privatePlayers) {
      privatePlayers[playerId].playedThisStreet = false;
    }
    if (board.length == 5) {
      // showdown!
      const handScores = {};
      const allCards = {};
      Object.entries(privatePlayers).filter(
        ([pid]) => !players[pid].folded
      ).forEach(([pid, privatePlayer]) => {
        const {cards} = privatePlayer;
        if (cards !== undefined && cards.length === 2) {
          allCards[pid] = cards;
          handScores[pid] = getHandScore(board, cards);
        }
      });
      this.broadcast({
        showdown: {
          cards: allCards,
          handScores,
          board
        }
      });
      return {handScores};
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
      throw Error(`Invalid board state, ${board.length} cards dealt`);
    }
    return false;
  }

  // reopenBetting() {
  //   const {players} = this.state;
  //   const {players: privatePlayers} = this.privateState;
  //   console.log('reopen betting');
  //   Object.entries(players).map(([pid, player]) => {
  //     if (playerCanAct(player)) {
  //       privatePlayers[pid].playedThisStreet = false;
  //     }
  //   });
  // }

  onBuy(playerId, value) {
    const {players: {[playerId]: player}} = this.state;
    if (player.active) {
      this.send(playerId, {
        error: 'Cannot buy while actively playing'
      });
      return;
    }
    if (!Number.isInteger(value)) {
      this.send(playerId, {
        error: `Value must be numeric integer (you sent ${value})`
      });
      return;
    }
    // TODO: or just use this mechanism to cash out?
    if (value < 0) {
      this.send(playerId, {
        error: `Cannot buy in for negative value ${value}`
      });
      return;
    }
    player.stack += value;
    player.bankroll -= value;
    player.setLastValue();
    this.send(playerId, {
      message: 'OK'
    });
  }

  playersThatCanAct() {
    const {players} = this.state;
    const pidsThatCanAct = [];
    for (const playerId in players) {
      const player = players[playerId];
      if (player.active && playerCanAct(player)) {
        pidsThatCanAct.push(playerId);
      }
    }
    return pidsThatCanAct;
  }

  onAction(playerId, action, silent=false) {
    const {running, nextToAct, playerOrder} = this.state;
    if (!running) {
      this.send(playerId, {
        error: 'Game is not running'
      });
      return;
    }
    if (playerOrder.findIndex((p) => p == playerId) !== nextToAct) {
      console.warn(`Player ${playerId} acted out of turn`);
      this.send(playerId, {
        error: 'Cannot act out of turn'
      });
      return;
    }
    console.log('Got action:', playerId, action);
    
    const {players: {[playerId]: player}} = this.state;
    const {players: {[playerId]: privatePlayer}} = this.privateState;
    const {type, value} = action;
    if (!player.active) {
      throw Error('Inactive player should not be next to act');
    }
    if (type === 'fold') {
      const {pots} = this.state;
      player.folded = true;
      pots.map((pot) => {
        pot.eligiblePids.filter(pid => pid !== playerId);
      });
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
      if (value > player.stack) {
        this.send(playerId, {
          error: `Cannot bet more than stack ${value} vs ${player.stack}`
        });
        return;
      }
      const {toCall, minRaise, bigBlind} = this.state;
      if (value + player.offering < toCall) {
        if (value !== player.stack) { // not all in
          this.send(playerId, {
            error: `Must at least call ${toCall - player.offering} (you bet ${value})`
          });
          return;
        }
      }
      if (toCall === player.offering && value !== 0) { // bet
        if (value < bigBlind && value !== player.stack) {
          this.send(playerId, {
            error: `Min bet value is big blind ${bigBlind} (you bet ${value})`
          });
          return;
        }
        this.privateState.lastAggressor = playerId;
        this.state.minRaise = value;
      }
      else if (value + player.offering > toCall) { // raise
        const raise = player.offering + value - toCall;
        if (raise < minRaise && value !== player.stack) {
          this.send(playerId, {
            error: `Min raise is ${minRaise} (you only raised ${raise})`
          });
          return;
        }
        if (this.privateState.lastAggressor === playerId) {
          this.send(playerId, {
            error: 'You cannot raise yourself!'
          });
          return;
        }
        if (raise >= minRaise) {
          this.state.minRaise = raise;
          this.privateState.lastAggressor = playerId;
          // this.reopenBetting();
        }
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
    if (!silent) {
      this.send(playerId, {message: 'OK'});
    }
    privatePlayer.playedThisStreet = true;
    
    this.state.nextToAct = this.pushToFirstActive(this.state.nextToAct+1);
    // TODO: Can probably merge the below round/street logic into something nicer
    this.pushNextToAct();

    console.log(Object.entries(this.privateState.players).map(
      ([pid, player]) => [pid, player.playedThisStreet]));

    const winners = this.isRoundDefaulted();
    if (winners !== false) {
      this.finishStreet();
      this.divideMoneyDefaulted(winners);
      this.finishRound();
      if (this.state.running) {
        this.initRound();
        return;
      }
    }
    else if (this.isStreetDone()) {
      this.finishStreet();
      const {handScores} = this.initNextStreet();
      if (handScores !== undefined) {
        this.divideMoneyShowdown(handScores);
        this.finishRound();
        if (this.state.running) {
          this.initRound();
          return;
        }
      }
    }
    // Special FF clause to avoid hang on 0/1 actionable players
    const {players, toCall} = this.state;
    const pidsThatCanAct = this.playersThatCanAct();
    console.log('pidsThatCanAct', pidsThatCanAct);
    if (pidsThatCanAct.length === 0 ||
        (pidsThatCanAct.length === 1 && players[pidsThatCanAct.pop()].offering >= toCall)) {
      console.log('Less than 2 actionable players left, and all have paid the '
                  + 'price, FF to showdown');
      let handScores;
      let _counter = 0;
      while (handScores === undefined) {
        this.finishStreet();
        handScores = this.initNextStreet().handScores;
        _counter++;
        if (_counter > 10) {
          throw Error('Should not have more than 10 streets!');
        }
      }
      this.divideMoneyShowdown(handScores);
      this.finishRound();
      if (this.state.running) {
        this.initRound();
      }
    }
  }
}

export default HoldemEngine;
