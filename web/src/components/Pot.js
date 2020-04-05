import React, {Component} from 'react';

class Pot extends Component {
  render() {
    const {pots} = this.props;
    if (pots === undefined || pots.length === 0) {
      return null;
    }
    const [activePot, ...otherPots] = pots;
    return (
      <g className="pot" transform="translate(400, 350)">
        <text x="0" y="0" textAnchor='middle' >Pot: {activePot.value}</text>
      </g>
    );
  }
}

export default Pot;
