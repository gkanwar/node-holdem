import {valueToChips, valueToChipStacks, CHIP_VALUES} from './Chips';
import {expect} from 'chai';

describe('valueToChips', () => {
  it('should make appropriate single chip', () => {
    const chips10 = valueToChips(10);
    expect(chips10).to.have.lengthOf(CHIP_VALUES.length);
    expect(chips10[2]).to.equal(1);
    chips10.splice(2,1);
    chips10.forEach(count => expect(count).to.equal(0));
    const chips500 = valueToChips(500);
    expect(chips500).to.have.lengthOf(CHIP_VALUES.length);
    expect(chips500[5]).to.equal(1);
    chips500.splice(5,1);
    chips500.forEach(count => expect(count).to.equal(0));
  })
  it('should make chip distribution', () => {
    const chips33 = valueToChips(33);
    expect(chips33).to.have.lengthOf(CHIP_VALUES.length);
    expect(chips33[0]).to.equal(3);
    expect(chips33[1]).to.equal(1);
    expect(chips33[2]).to.equal(0);
    expect(chips33[3]).to.equal(1);
  })
  it('should make chip distribution into stacks', () => {
    const stacks33 = valueToChipStacks(33);
    expect(stacks33).to.have.lengthOf(3);
    expect(stacks33[0]).to.include.ordered.members([0, 3]);
    expect(stacks33[1]).to.include.ordered.members([1, 1]);
    expect(stacks33[2]).to.include.ordered.members([3, 1]);
  })
  it('should make multiple stacks of 20', () => {
    const stacks = valueToChipStacks(500000);
    expect(stacks).to.have.lengthOf(3);
    expect(stacks[0]).to.include.ordered.members([8, 20]);
    expect(stacks[1]).to.include.ordered.members([8, 20]);
    expect(stacks[2]).to.include.ordered.members([8, 10]);
  })
})
