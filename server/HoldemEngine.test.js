import {expect} from 'chai';
import HoldemEngine from './HoldemEngine';
import {HoldemState} from './HoldemState';

function expectMsgOk({msg: {message}}) {
  expect(message).to.equal('Action OK')
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
  describe('Gameplay', () => {
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
    })
  })
})
