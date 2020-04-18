import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './action-log.css';

class ActionLog extends Component {
  static propTypes = {
    log: PropTypes.arrayOf(PropTypes.string)
  };
  render() {
    const {log} = this.props;
    const lineElts = log.map(
      (line, index) => <tr key={`log-line${index}`}><td>{line}</td></tr>);
    return <div id="action-log" className="action-log control-box">
      <div className="control-header">Action log</div>
      <div className="scroll-box">
      <table><tbody>{lineElts}</tbody></table>
      </div>
    </div>;
  }
}

export default ActionLog;
