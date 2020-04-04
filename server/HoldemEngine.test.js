import {expect} from 'chai';
import HoldemEngine from './HoldemEngine';
import {HoldemState} from './HoldemState';

function expectMsgOk({msg}) {
  expect(msg).to.have.key('message');
  expect(msg.message).to.equal('OK');
}
function expectMsgErr({msg}) {
  expect(msg).to.have.key('error');
}
function expectMsgShowdown({msg}) {
  expect(msg).to.have.key('showdown');
}

describe('Holdem Engine', () => {
  let state;
  let messages;
  let broadcasts;
  let engine;
  let p1 = {pid: 'a', username: 'a'};
  let p2 = {pid: 'b', username: 'b'};
  let p3 = {pid: 'c', username: 'c'};
  let allPids = [p1.pid, p2.pid, p3.pid];
  describe('Setup', () => {
    beforeEach('Setup engine with three players', () => {
      state = new HoldemState();
      messages = [];
      broadcasts = [];
      engine = new HoldemEngine(
        state,
        (pid, msg) => {
          if ('error' in msg || 'message' in msg || 'myCards' in msg) {
            messages.push({pid, msg})
          }
        },
        (msg) => {
          if ('showdown' in msg) {
            broadcasts.push({msg});
          }
        }
      );
      engine.onJoin(p1.pid, p1.username);
      engine.onJoin(p2.pid, p2.username);
      engine.onJoin(p3.pid, p3.username);
    })
    it('Should be possible to join', () => {
      expect(state.players).to.include.all.keys(allPids);
      Object.entries(state.players).map(([pid,player]) => {
        expect(player.sitting).to.be.false;
        expect(player.active).to.be.false;
      });
    })
    it('Should be possible to leave', () => {
      engine.onLeave(p1.pid);
      expect(state.players).to.not.include.key(p1.pid);
      expect(state.players).to.include.all.keys(allPids.filter(pid => (pid != p1.pid)));
    })
    it('Should be possible to sit', () => {
      expect(state.players).to.include.all.keys(allPids);
      engine.onRequest(p1.pid, 'sit');
      expect(state.players[p1.pid].sitting).to.be.true;
      expect(state.players[p1.pid].active).to.be.false;
    })
    it('Should be possible to stand', () => {
      expect(state.players).to.include.all.keys(allPids);
      engine.onRequest(p1.pid, 'sit');
      expect(state.players[p1.pid].sitting).to.be.true;
      expect(state.players[p1.pid].active).to.be.false;
      engine.onRequest(p1.pid, 'stand');
      expect(state.players[p1.pid].sitting).to.be.false;
      expect(state.players[p1.pid].active).to.be.false;
    })
    it('Should not be possible to be active without a stack', () => {
      engine.onRequest(p1.pid, 'sit');
      engine.onRequest(p1.pid, 'active');
      expectMsgErr(messages.pop());
    })
    it('Should be possible to buy in', () => {
      engine.onBuy(p1.pid, 1000);
      expectMsgOk(messages.pop());
      expect(state.players[p1.pid].stack).to.equal(1000);
      expect(state.players[p1.pid].bankroll).to.equal(-1000);
    })
    it('Should be possible to be active with a stack', () => {
      engine.onRequest(p1.pid, 'sit');
      engine.onBuy(p1.pid, 1000);
      expectMsgOk(messages.pop());
      engine.onRequest(p1.pid, 'active');
      expect(messages).to.have.lengthOf(0);
    })
    it('Should not be possible to buy while active', () => {
      engine.onRequest(p1.pid, 'sit');
      engine.onBuy(p1.pid, 1000);
      expectMsgOk(messages.pop());
      engine.onRequest(p1.pid, 'active');
      engine.onBuy(p1.pid, 1000);
      expectMsgErr(messages.pop());
      expect(state.players[p1.pid].stack).to.equal(1000);
      expect(state.players[p1.pid].bankroll).to.equal(-1000);
    })
    it('Should not be possible to start with only 1 active player', () => {
      engine.onBuy(p1.pid, 1000);
      engine.onBuy(p2.pid, 1000);
      engine.onBuy(p3.pid, 1000);
      console.log(messages);
      expect(messages).to.have.lengthOf(3);
      messages.splice(0,3).map(expectMsgOk);
      engine.onRequest(p1.pid, 'sit');
      engine.onRequest(p1.pid, 'active');
      engine.onRequest(p2.pid, 'sit');
      engine.onRequest(p3.pid, 'sit');
      engine.setRunning(p1.pid, true);
      expect(messages).to.have.lengthOf(1);
      expectMsgErr(messages.pop());
    })
    it('Should be possible to start heads up game', () => {
      engine.onBuy(p1.pid, 1000);
      engine.onBuy(p2.pid, 1000);
      expect(messages).to.have.lengthOf(2);
      messages.splice(0,2).map(expectMsgOk);
      engine.onRequest(p1.pid, 'sit');
      engine.onRequest(p1.pid, 'active');
      engine.onRequest(p2.pid, 'sit');
      engine.onRequest(p2.pid, 'active');
      engine.onRequest(p3.pid, 'sit'); // just watching
      engine.setRunning(p1.pid, true);
      console.log(messages);
      expect(messages).to.have.lengthOf(2);
      messages.map(({msg}) => {
        expect(msg).to.include.key('myCards');
        expect(msg.myCards).to.have.lengthOf(2);
      });
    })
    it('Should give cards', () => {
      engine.onBuy(p1.pid, 1000);
      engine.onBuy(p2.pid, 1000);
      engine.onBuy(p3.pid, 1000);
      engine.onRequest(p1.pid, 'sit');
      engine.onRequest(p1.pid, 'active');
      engine.onRequest(p2.pid, 'sit');
      engine.onRequest(p2.pid, 'active');
      engine.onRequest(p3.pid, 'sit');
      engine.onRequest(p3.pid, 'active');
      messages.splice(0);
      
      engine.setRunning(p1.pid, true);
      expect(engine.privateState.deck.length).to.equal(52 - 2*allPids.length);
      expect(engine.privateState.players).to.include.all.keys(allPids);
      allPids.map((pid) => {
        expect(engine.privateState.players[pid]).to.include.key('cards');
        expect(engine.privateState.players[pid].cards).to.have.lengthOf(2);
      });
      expect(messages).to.have.lengthOf(3);
      const pids = messages.map(msg => msg.pid);
      expect(pids).to.include.members(allPids);
      messages.map(({msg}) => {
        expect(msg).to.include.key('myCards');
        expect(msg.myCards).to.have.lengthOf(2);
      });
    })
  })
  describe('Preflop play', () => {
    beforeEach('Setup engine with three players and start round', () => {
      state = new HoldemState();
      messages = [];
      broadcasts = [];
      engine = new HoldemEngine(
        state,
        (pid, msg) => {
          if ('error' in msg || 'message' in msg || 'myCards' in msg) {
            messages.push({pid, msg})
          }
        },
        (msg) => {
          if ('showdown' in msg) {
            broadcasts.push({msg});
          }
        }
      );
      engine.onJoin(p1.pid, p1.username);
      engine.onJoin(p2.pid, p2.username);
      engine.onJoin(p3.pid, p3.username);
      engine.onBuy(p1.pid, 1000);
      engine.onBuy(p2.pid, 1000);
      engine.onBuy(p3.pid, 1000);
      engine.onRequest(p1.pid, 'sit');
      engine.onRequest(p1.pid, 'active');
      engine.onRequest(p2.pid, 'sit');
      engine.onRequest(p2.pid, 'active');
      engine.onRequest(p3.pid, 'sit');
      engine.onRequest(p3.pid, 'active');
      state.button = 0;
      state.smallBlind = 1;
      state.bigBlind = 2;
      engine.setRunning(p1.pid, true);
      messages.splice(0);
    })
    it('Should set nextToAct to after big blind', () => {
      expect(state.nextToAct).to.equal((0 + 3) % allPids.length);
    })
    it('Should not let player act out of turn', () => {
      engine.onAction(p2.pid, {type: 'fold'});
      expect(messages).to.have.lengthOf(1);
      const [msg] = messages;
      expect(msg.pid).to.equal(p2.pid);
      expectMsgErr(msg);
    })
    it('Should let player take action', () => {
      engine.onAction(p1.pid, {type: 'fold'});
      expect(messages).to.have.lengthOf(1);
      const [msg] = messages;
      expect(msg.pid).to.equal(p1.pid);
      expectMsgOk(msg);
      expect(state.players[p1.pid].folded).to.equal(true);
    })
    it('Should not let player bet non-numeric', () => {
      engine.onAction(p1.pid, {type: 'bet', value: 'hi'});
      expect(messages).to.have.lengthOf(1);
      const [msg] = messages;
      expect(msg.pid).to.equal(p1.pid);
      expectMsgErr(msg);
    })
    it('Should not let player bet numeric string', () => {
      engine.onAction(p1.pid, {type: 'bet', value: '1'});
      expect(messages).to.have.lengthOf(1);
      const [msg] = messages;
      expect(msg.pid).to.equal(p1.pid);
      expectMsgErr(msg);
    })
    it('Should not let player bet non-integer', () => {
      engine.onAction(p1.pid, {type: 'bet', value: 1.2});
      expect(messages).to.have.lengthOf(1);
      const [msg] = messages;
      expect(msg.pid).to.equal(p1.pid);
      expectMsgErr(msg);
    })
    it('Should let all players fold down', () => {
      engine.onAction(p1.pid, {type: 'fold'});
      engine.onAction(p2.pid, {type: 'fold'});
      messages.splice(0,2).forEach(expectMsgOk);
    })
    it('Should not let player call too little', () => {
      engine.onAction(p1.pid, {type: 'bet', value: 1});
      expect(messages).to.have.lengthOf(1);
      expectMsgErr(messages.pop());
    })
    it('Should not let player bet more than stack', () => {
      engine.onAction(p1.pid, {type: 'bet', value: 10000});
      expect(messages).to.have.lengthOf(1);
      expectMsgErr(messages.pop());
    })
    it('Should let player call', () => {
      engine.onAction(p1.pid, {type: 'bet', value: 2});
      expect(messages).to.have.lengthOf(1);
      console.log(messages);
      const [msg] = messages;
      expect(msg.pid).to.equal(p1.pid);
      expectMsgOk(msg);
      expect(state.players[p1.pid].offering).to.equal(2);
    })
    it('Should give big blind the option', () => {
      engine.onAction(p1.pid, {type: 'fold'});
      engine.onAction(p2.pid, {type: 'bet', value: 1});
      const [msg1, msg2] = messages;
      expectMsgOk(msg1);
      expectMsgOk(msg2);
      expect(state.players[p1.pid].offering).to.equal(0);
      expect(state.players[p2.pid].offering).to.equal(2);
      expect(state.players[p3.pid].offering).to.equal(2);
      expect(state.nextToAct).to.equal(2);
      engine.onAction(p3.pid, {type: 'bet', value: 0});
      const [msg] = messages;
      expectMsgOk(msg);
    })
    it('Should not allow BB less than min bet', () => {
      engine.onAction(p1.pid, {type: 'fold'});
      engine.onAction(p2.pid, {type: 'bet', value: 1});
      messages.splice(0);
      engine.onAction(p3.pid, {type: 'bet', value: 1});
      const [msg] = messages;
      expectMsgErr(msg);
    })
    it('Should allow BB to bet', () => {
      engine.onAction(p1.pid, {type: 'fold'});
      engine.onAction(p2.pid, {type: 'bet', value: 1});
      messages.splice(0);
      engine.onAction(p3.pid, {type: 'bet', value: 2});
      const [msg] = messages;
      expectMsgOk(msg);
    })
    it('Should skip folded player', () => {
      engine.onAction(p1.pid, {type: 'fold'});
      engine.onAction(p2.pid, {type: 'bet', value: 1});
      engine.onAction(p3.pid, {type: 'bet', value: 2});
      engine.onAction(p2.pid, {type: 'bet', value: 2});
      expect(messages).to.have.lengthOf(4);
      messages.map(expectMsgOk);
    })
    it('Should play to showdown when everyone is all in', () => {
      console.log('a folding');
      engine.onAction(p1.pid, {type: 'fold'});
      console.log('b going all in');
      engine.onAction(p2.pid, {type: 'bet', value: 999});
      console.log('c calling all in');
      engine.onAction(p3.pid, {type: 'bet', value: 998});
      messages.splice(0, 3).map(expectMsgOk);
      expect(broadcasts).to.have.lengthOf(1);
      expectMsgShowdown(broadcasts.pop());
      expect(state.board).to.have.lengthOf(0);
      expect(state.pots).to.have.lengthOf(1);
      expect(state.pots[0].value).to.equal(0);
    })
  })
  describe('Postflop play', () => {
    beforeEach('Setup engine with three players and play flop', () => {
      state = new HoldemState();
      messages = [];
      broadcasts = [];
      engine = new HoldemEngine(
        state,
        (pid, msg) => {
          if ('error' in msg || 'message' in msg || 'myCards' in msg) {
            messages.push({pid, msg})
          }
        },
        (msg) => {
          if ('showdown' in msg) {
            broadcasts.push({msg});
          }
        }
      );
      engine.onJoin(p1.pid, p1.username);
      engine.onJoin(p2.pid, p2.username);
      engine.onJoin(p3.pid, p3.username);
      engine.onBuy(p1.pid, 1000);
      engine.onBuy(p2.pid, 1000);
      engine.onBuy(p3.pid, 1000);
      engine.onRequest(p1.pid, 'sit');
      engine.onRequest(p1.pid, 'active');
      engine.onRequest(p2.pid, 'sit');
      engine.onRequest(p2.pid, 'active');
      engine.onRequest(p3.pid, 'sit');
      engine.onRequest(p3.pid, 'active');
      state.button = 0;
      state.smallBlind = 1;
      state.bigBlind = 2;
      engine.setRunning(p1.pid, true);
      
      engine.onAction(p1.pid, {type: 'bet', value: 2});
      engine.onAction(p2.pid, {type: 'bet', value: 1});
      engine.onAction(p3.pid, {type: 'bet', value: 0});
      messages.splice(0);
    })
    it('Should have collected money and flopped 3 cards', () => {
      expect(state.pots).to.have.lengthOf(1);
      expect(state.pots[0].value).to.equal(6);
      expect(state.pots[0].eligiblePids).to.include.members(allPids);
      expect(state.board).to.have.lengthOf(3);
      allPids.map((pid) => {
        expect(state.players[pid].folded).to.equal(false);
        expect(state.players[pid].offering).to.equal(0);
      });
    })
    it('Should give action to left of button', () => {
      expect(state.nextToAct).to.equal(1);
    })
    it('Should allow check', () => {
      engine.onAction(p2.pid, {type: 'bet', value: 0});
      const [msg] = messages;
      expectMsgOk(msg);
    })
    it('Should not allow smaller than min bet', () => {
      engine.onAction(p2.pid, {type: 'bet', value: 1});
      const [msg] = messages;
      expectMsgErr(msg);
    })
    it('Should allow fold down', () => {
      engine.onAction(p2.pid, {type: 'fold'});
      engine.onAction(p3.pid, {type: 'fold'});
      expect(messages).to.have.lengthOf(5);
      messages.splice(0,2).forEach(expectMsgOk);
      messages.forEach(({msg}) => {
        expect(msg).to.have.key('myCards');
      });
      const {smallBlind, bigBlind} = state;
      expect(state.players[p1.pid].stack).to.equal(1004-bigBlind);
      expect(state.players[p2.pid].stack).to.equal(998);
      expect(state.players[p3.pid].stack).to.equal(998-smallBlind);
    })
    it('Should allow bet', () => {
      engine.onAction(p2.pid, {type: 'bet', value: 2});
      const [msg] = messages;
      expectMsgOk(msg);
    })
    it('Should not allow check after bet', () => {
      engine.onAction(p2.pid, {type: 'bet', value: 2});
      engine.onAction(p3.pid, {type: 'bet', value: 0});
      const [msg1, msg2] = messages;
      expectMsgOk(msg1);
      expectMsgErr(msg2);
    })
    it('Should allow call after bet', () => {
      engine.onAction(p2.pid, {type: 'bet', value: 2});
      engine.onAction(p3.pid, {type: 'bet', value: 2});
      const [msg1, msg2] = messages;
      expectMsgOk(msg1);
      expectMsgOk(msg2);
    })
    it('Should not allow raise below min raise', () => {
      engine.onAction(p2.pid, {type: 'bet', value: 2});
      engine.onAction(p3.pid, {type: 'bet', value: 3});
      const [msg1, msg2] = messages;
      expectMsgOk(msg1);
      expectMsgErr(msg2);
    })
    it('Should allow raise', () => {
      engine.onAction(p2.pid, {type: 'bet', value: 2});
      engine.onAction(p3.pid, {type: 'bet', value: 4});
      const [msg1, msg2] = messages;
      expectMsgOk(msg1);
      expectMsgOk(msg2);
    })
    it('Should not allow reraise below min raise', () => {
      engine.onAction(p2.pid, {type: 'bet', value: 2});
      engine.onAction(p3.pid, {type: 'bet', value: 5});
      engine.onAction(p1.pid, {type: 'bet', value: 7});
      const [msg1, msg2, msg3] = messages;
      expectMsgOk(msg1);
      expectMsgOk(msg2);
      expectMsgErr(msg3);
    })
    it('Should allow reraise', () => {
      engine.onAction(p2.pid, {type: 'bet', value: 2});
      engine.onAction(p3.pid, {type: 'bet', value: 5});
      engine.onAction(p1.pid, {type: 'bet', value: 8});
      const [msg1, msg2, msg3] = messages;
      expectMsgOk(msg1);
      expectMsgOk(msg2);
      expectMsgOk(msg3);
    })
    it('Should not give small blind the option', () => {
      engine.onAction(p2.pid, {type: 'bet', value: 0});
      engine.onAction(p3.pid, {type: 'bet', value: 0});
      engine.onAction(p1.pid, {type: 'bet', value: 0});
      expect(state.board).to.have.lengthOf(4);
    })
    it('Should not give small blind the option after bets', () => {
      engine.onAction(p2.pid, {type: 'bet', value: 10});
      engine.onAction(p3.pid, {type: 'bet', value: 10});
      engine.onAction(p1.pid, {type: 'bet', value: 10});
      expect(state.pots[0].value).to.equal(36);
      expect(state.board).to.have.lengthOf(4);
    })
    it('Should allocate all money on showdown', () => {
      engine.onAction(p2.pid, {type: 'bet', value: 998});
      engine.onAction(p3.pid, {type: 'bet', value: 998});
      engine.onAction(p1.pid, {type: 'bet', value: 998});
      console.log(messages);
      expect(broadcasts).to.have.lengthOf(1);
      expectMsgShowdown(broadcasts.pop());
      const {smallBlind, bigBlind} = state;
      expect(allPids.reduce(
        (total, pid) => total + state.players[pid].stack, 0))
        .to.equal(3000 - smallBlind - bigBlind);
    })
  })
  describe('Showdown', () => {
    beforeEach('Setup engine with three players and play to river', () => {
      state = new HoldemState();
      messages = [];
      broadcasts = [];
      engine = new HoldemEngine(
        state,
        (pid, msg) => {
          if ('error' in msg || 'message' in msg || 'myCards' in msg) {
            messages.push({pid, msg})
          }
        },
        (msg) => {
          if ('showdown' in msg) {
            broadcasts.push({msg});
          }
        }
      );
      engine.onJoin(p1.pid, p1.username);
      engine.onJoin(p2.pid, p2.username);
      engine.onJoin(p3.pid, p3.username);
      engine.onBuy(p1.pid, 1000);
      engine.onBuy(p2.pid, 1000);
      engine.onBuy(p3.pid, 1000);
      engine.onRequest(p1.pid, 'sit');
      engine.onRequest(p1.pid, 'active');
      engine.onRequest(p2.pid, 'sit');
      engine.onRequest(p2.pid, 'active');
      engine.onRequest(p3.pid, 'sit');
      engine.onRequest(p3.pid, 'active');
      state.button = 0;
      state.smallBlind = 1;
      state.bigBlind = 2;
      engine.setRunning(p1.pid, true);
      
      engine.onAction(p1.pid, {type: 'bet', value: 2});
      engine.onAction(p2.pid, {type: 'bet', value: 1});
      engine.onAction(p3.pid, {type: 'bet', value: 0});
      
      engine.onAction(p2.pid, {type: 'bet', value: 10});
      engine.onAction(p3.pid, {type: 'bet', value: 10});
      engine.onAction(p1.pid, {type: 'bet', value: 10});

      engine.onAction(p2.pid, {type: 'bet', value: 0});
      engine.onAction(p3.pid, {type: 'bet', value: 50});
      engine.onAction(p1.pid, {type: 'bet', value: 50});
      engine.onAction(p2.pid, {type: 'fold'});
      messages.splice(0);
    })
    it('Should have full board, only 2 players', () => {
      expect(state.pots[0].value).to.equal(136);
      expect(state.board).to.have.lengthOf(5);
      expect(state.players[p1.pid].folded).to.equal(false);
      expect(state.players[p2.pid].folded).to.equal(true);
      expect(state.players[p3.pid].folded).to.equal(false);
    })
  })
  describe('Inactive and standing states', () => {
    beforeEach('Setup engine with three players', () => {
      state = new HoldemState();
      messages = [];
      engine = new HoldemEngine(
        state,
        (pid, msg) => {
          if ('error' in msg || 'message' in msg || 'myCards' in msg) {
            messages.push({pid, msg})
          }
        },
        (msg) => {}
      );
      engine.onJoin(p1.pid, p1.username);
      engine.onJoin(p2.pid, p2.username);
      engine.onJoin(p3.pid, p3.username);
      engine.onBuy(p1.pid, 200);
      engine.onBuy(p2.pid, 750);
      engine.onBuy(p3.pid, 1000);
      engine.onRequest(p1.pid, 'sit');
      engine.onRequest(p2.pid, 'sit');
      engine.onRequest(p3.pid, 'sit');
      state.button = 0;
      state.smallBlind = 1;
      state.bigBlind = 2;
    })
    it('Should skip inactive player', () => {
      expect(state.players[p1.pid].active).to.equal(false);
      engine.onRequest(p2.pid, 'active');
      engine.onRequest(p3.pid, 'active');
      engine.setRunning(p1.pid, true);
      messages.splice(0);
      
      engine.onAction(p2.pid, {type: 'bet', value: 1});
      engine.onAction(p3.pid, {type: 'bet', value: 0});
      expect(messages).to.have.lengthOf(2);
      messages.map(expectMsgOk);
    })
    it('Should make player inactive after bust', () => {
      engine.onRequest(p1.pid, 'active');
      engine.onRequest(p2.pid, 'active');
      engine.onRequest(p3.pid, 'active');
      engine.setRunning(p1.pid, true);
      messages.splice(0);
      // TODO need to mock out RNG to properly test this
      console.warn('Incomplete test!');
    })
  })
  describe('Side pots', () => {
    beforeEach('Setup engine with three players and unequal stacks', () => {
      state = new HoldemState();
      broadcasts = [];
      messages = [];
      engine = new HoldemEngine(
        state,
        (pid, msg) => {
          if ('error' in msg || 'message' in msg || 'myCards' in msg) {
            messages.push({pid, msg})
          }
        },
        (msg) => {
          if ('showdown' in msg) {
            broadcasts.push({msg});
          }
        }
      );
      engine.onJoin(p1.pid, p1.username);
      engine.onJoin(p2.pid, p2.username);
      engine.onJoin(p3.pid, p3.username);
      engine.onBuy(p1.pid, 200);
      engine.onBuy(p2.pid, 750);
      engine.onBuy(p3.pid, 1000);
      engine.onRequest(p1.pid, 'sit');
      engine.onRequest(p1.pid, 'active');
      engine.onRequest(p2.pid, 'sit');
      engine.onRequest(p2.pid, 'active');
      engine.onRequest(p3.pid, 'sit');
      engine.onRequest(p3.pid, 'active');
      state.button = 0;
      state.smallBlind = 1;
      state.bigBlind = 2;
      engine.setRunning(p1.pid, true);
      messages.splice(0);
    })
    it('Should make a side pot for betting beyond all in', () => {
      engine.onAction(p1.pid, {type: 'bet', value: 200});
      engine.onAction(p2.pid, {type: 'bet', value: 449});
      engine.onAction(p3.pid, {type: 'bet', value: 448});
      expect(state.board).to.have.lengthOf(3);
      expect(messages).to.have.lengthOf(3);
      messages.map(expectMsgOk);
      expect(state.pots).to.have.lengthOf(2);
      expect(state.pots[0].value).to.equal(500);
      expect(state.pots[1].value).to.equal(600);
      expect(state.pots[0].eligiblePids).to.have.members([p2.pid, p3.pid]);
      expect(state.pots[0].eligiblePids).to.not.have.members([p1.pid]);
      expect(state.pots[1].eligiblePids).to.have.members(allPids);
    })
    it('Should not let player undercall in side pot', () => {
      engine.onAction(p1.pid, {type: 'bet', value: 200});
      engine.onAction(p2.pid, {type: 'bet', value: 449});
      engine.onAction(p3.pid, {type: 'bet', value: 998});
      engine.onAction(p2.pid, {type: 'bet', value: 250});
      expect(messages).to.have.lengthOf(4);
      messages.splice(0,3).map(expectMsgOk);
      expectMsgErr(messages.pop());
    })
    it('Should play to showdown after making side pot', () => {
      engine.onAction(p1.pid, {type: 'bet', value: 200});
      engine.onAction(p2.pid, {type: 'bet', value: 449});
      engine.onAction(p3.pid, {type: 'bet', value: 798});
      engine.onAction(p2.pid, {type: 'bet', value: 300});
      console.log(messages);
      messages.splice(0,4).map(expectMsgOk);
      expect(state.board).to.have.lengthOf(0);
      expect(broadcasts).to.have.lengthOf(1);
      expectMsgShowdown(broadcasts.pop());
      expect(state.board).to.have.lengthOf(0);
      expect(state.pots).to.have.lengthOf(1);
      expect(state.pots[0].value).to.equal(0);
    })
    it('Should play to showdown if everyone all-in', () => {
      engine.onAction(p1.pid, {type: 'bet', value: 200});
      engine.onAction(p2.pid, {type: 'bet', value: 749});
      engine.onAction(p3.pid, {type: 'bet', value: 998});
      console.log(messages);
      messages.splice(0,3).map(expectMsgOk);
      expect(state.board).to.have.lengthOf(0);
      expect(broadcasts).to.have.lengthOf(1);
      expectMsgShowdown(broadcasts.pop());
      expect(state.board).to.have.lengthOf(0);
      expect(state.pots).to.have.lengthOf(1);
      expect(state.pots[0].value).to.equal(0);
    })
    it('Should allow call after incomplete raise', () => {
      engine.onAction(p1.pid, {type: 'bet', value: 75});
      engine.onAction(p2.pid, {type: 'bet', value: 149});
      engine.onAction(p3.pid, {type: 'bet', value: 148});
      engine.onAction(p1.pid, {type: 'bet', value: 125});
      engine.onAction(p2.pid, {type: 'bet', value: 50});
      console.log(messages);
      messages.splice(0,5).map(expectMsgOk);
    })
    it('Should not allow raise after incomplete raise', () => {
      engine.onAction(p1.pid, {type: 'bet', value: 75});
      engine.onAction(p2.pid, {type: 'bet', value: 149});
      engine.onAction(p3.pid, {type: 'bet', value: 148});
      engine.onAction(p1.pid, {type: 'bet', value: 125});
      engine.onAction(p2.pid, {type: 'bet', value: 125});
      console.log(messages);
      messages.splice(0,4).map(expectMsgOk);
      expectMsgErr(messages.shift());
    })
  })
})
