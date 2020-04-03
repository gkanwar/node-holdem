import {expect} from 'chai';
import HoldemEngine from './HoldemEngine';
import {HoldemState} from './HoldemState';

function expectMsgOk({msg}) {
  expect(msg).to.have.key('message');
  expect(msg.message).to.equal('Action OK');
}
function expectMsgErr({msg}) {
  expect(msg).to.have.key('error');
}

describe('Holdem Engine', () => {
  let state;
  let messages;
  let engine;
  let p1 = {pid: 'a', username: 'a'};
  let p2 = {pid: 'b', username: 'b'};
  let p3 = {pid: 'c', username: 'c'};
  let allPids = [p1.pid, p2.pid, p3.pid];
  describe('Setup', () => {
    beforeEach('Setup engine with three players', () => {
      state = new HoldemState();
      messages = [];
      engine = new HoldemEngine(state, (pid, msg) => messages.push({pid, msg}));
      engine.onJoin(p1.pid, p1.username);
      engine.onJoin(p2.pid, p2.username);
      engine.onJoin(p3.pid, p3.username);
    })
    it('Should be possible to join', () => {
      expect(state.players).to.include.all.keys(allPids);
    })
    it('Should be possible to leave', () => {
      engine.onLeave(p1.pid);
      expect(state.players).to.not.include.key(p1.pid);
      expect(state.players).to.include.all.keys(allPids.filter(pid => (pid != p1.pid)));
    })
    it('Should be possible to start round and get cards', () => {
      engine.initRound();
      expect(engine.privateState.deck.length).to.equal(52 - 2*allPids.length);
      expect(engine.privateState.players).to.include.all.keys(allPids);
      allPids.map((pid) => {
        expect(engine.privateState.players[pid]).to.include.all.keys(['playedThisStreet', 'cards']);
        expect(engine.privateState.players[pid].playedThisStreet).to.equal(false);
        expect(engine.privateState.players[pid].cards).to.have.lengthOf(2);
      });
      expect(messages).to.have.lengthOf(allPids.length);
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
      engine = new HoldemEngine(state, (pid, msg) => messages.push({pid, msg}));
      engine.onJoin(p1.pid, p1.username);
      engine.onJoin(p2.pid, p2.username);
      engine.onJoin(p3.pid, p3.username);
      state.button = 0;
      state.smallBlind = 1;
      state.bigBlind = 2;
      engine.initRound();
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
    it('Should not let player call too little', () => {
      engine.onAction(p1.pid, {type: 'bet', value: 1});
      expect(messages).to.have.lengthOf(1);
      const [msg] = messages;
      expectMsgErr(msg);
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
  })
  describe('Postflop play', () => {
    beforeEach('Setup engine with three players and play flop', () => {
      state = new HoldemState();
      messages = [];
      engine = new HoldemEngine(state, (pid, msg) => messages.push({pid, msg}));
      engine.onJoin(p1.pid, p1.username);
      engine.onJoin(p2.pid, p2.username);
      engine.onJoin(p3.pid, p3.username);
      state.button = 0;
      state.smallBlind = 1;
      state.bigBlind = 2;
      engine.initRound();
      engine.onAction(p1.pid, {type: 'bet', value: 2});
      engine.onAction(p2.pid, {type: 'bet', value: 1});
      engine.onAction(p3.pid, {type: 'bet', value: 0});
      messages.splice(0);
    })
    it('Should have collected money and flopped 3 cards', () => {
      expect(state.pot).to.equal(6);
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
      expect(state.pot).to.equal(36);
      expect(state.board).to.have.lengthOf(4);
    })
  })
})
