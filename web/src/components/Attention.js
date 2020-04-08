/** Overlay to pulse and grab user attention on action */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './attention.scss';

class Attention extends Component {
  static propTypes = {
    value: PropTypes.bool
  };
  render() {
    const {value} = this.props;
    const animClass = value ? "animate" : "";
    return <div className={`attention ${animClass}`}></div>;
  }
}

export default Attention;
