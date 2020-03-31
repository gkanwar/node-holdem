import React, {Component} from 'react';

class Pot extends Component {
  render() {
    const {value} = this.props;
    return (
      <g className="pot">
        <text x="400" y="350" textAnchor='middle' >Pot: {value}</text>
      </g>
    );
  }
}

export default Pot;
