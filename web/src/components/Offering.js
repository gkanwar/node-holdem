import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {makeStacksElt, valueToChipStacks} from './Chips';

/** Representation of chips out in front of player this street */
class TextOffering extends Component {
  static propTypes = {
    offer: PropTypes.number.isRequired
  };
  render() {
    const {offer} = this.props;
    if (offer === 0) {
      return null;
    }
    return <g className="offer">
      <text x={0} y={0} textAnchor="middle" alignmentBaseline="middle">{offer}</text>
    </g>;
  }
}

class ChipsOffering extends Component {
  static propTypes = {
    offer: PropTypes.number.isRequired
  };
  render() {
    const {offer} = this.props;
    if (offer === 0) {
      return null;
    }
    return <g className="offer">{makeStacksElt(valueToChipStacks(offer))}</g>;
  }
}

export default ChipsOffering;
