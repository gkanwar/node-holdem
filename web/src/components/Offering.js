import React, {Component} from 'react';

/** Representation of chips out in front of player this street */
class Offering extends Component {
  render() {
    const {offer, posX, posY} = this.props;
    if (offer === undefined || offer === 0) {
      return null;
    }
    return <g className="offer">
      <text x={posX} y={posY} textAnchor="middle" alignmentBaseline="middle">{offer}</text>
    </g>;
  }
}

export default Offering;
