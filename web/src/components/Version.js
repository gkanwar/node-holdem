import React, {Component} from 'react';
import {version as webVersion} from '../../package.json';
import {version as serverVersion} from '../../../package.json';

class Version extends Component {
  render() {
    return (
      <div>
        Web <span className="value">{webVersion}</span> |
        Server <span className="value">{serverVersion}</span>
      </div>
    );
  }
}

export default Version;
