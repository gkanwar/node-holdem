import React, {Component} from 'react';
import PropTypes from 'prop-types';

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

// TODO: ChipsOffering

export default TextOffering;
