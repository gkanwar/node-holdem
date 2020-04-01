import React, {Component} from 'react';

class Pot extends Component {
  render() {
    const {value} = this.props;
    return (
      <g className="pot" transform="translate(400, 350)">
        <text x="0" y="0" textAnchor='middle' >Pot: {value}</text>
      </g>
    );
  }
}

export default Pot;
