import React, {Component} from 'react';
import * as Colyseus from 'colyseus.js';
import './connector.css';

class Connector extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.tryConnect = this.tryConnect.bind(this);
    this.makeConnection = this.makeConnection.bind(this);
    this.state = {
      server: '',
      port: '',
      roomId: '',
      sessionId: '',
      trying: false,
      err: null
    }
  }

  componentDidMount() {
    const hostInfo = JSON.parse(localStorage.getItem('hostInfo'));
    if (hostInfo !== null) {
      this.setState(hostInfo);
    }
    const sessionInfo = JSON.parse(localStorage.getItem('sessionInfo'));
    if (sessionInfo !== null) {
      this.setState(sessionInfo, () => {
        const {sessionId} = this.state;
        if (sessionId !== '') {
          this.tryConnect();
        }
      });
    }
  }

  handleChange(event) {
    const {target: {name, value}} = event;
    this.setState({[name]: value});
  }

  onSubmit(event) {
    const {server, port} = this.state;
    console.log('Setting local storage hostInfo', this.state);
    localStorage.setItem('hostInfo', JSON.stringify({
      server: server,
      port: port
    }));
    this.tryConnect();
    event.preventDefault();
  }

  makeConnection() {
    console.log('makeConnection', this.state);
    const {server, port, sessionId, roomId} = this.state;
    const client = new Colyseus.Client(`ws://${server}:${port}`);
    if (sessionId !== '') {
      return client.reconnect(roomId, sessionId);
    }
    else if (roomId !== '') {
      return client.joinById(roomId);
    }
    else {
      return client.joinOrCreate('lobby');
    }
  }

  tryConnect() {
    console.log('tryConnect');
    const {server, port} = this.state;
    if (server === undefined) {
      this.setState({err: 'Must set server'});
    }
    else if (port === undefined) {
      this.setState({err: 'Must set port'});
    }
    else {
      this.setState({trying: true});
      const {onConnect} = this.props;
      this.makeConnection(server, port)
        .then(room => {
          this.setState({
            trying: false,
            roomId: room.id,
            sessionId: room.sessionId
          });
          console.log('Setting local storage sessionInfo', room);
          localStorage.setItem('sessionInfo', JSON.stringify({
            roomId: room.id,
            sessionId: room.sessionId
          }));
          onConnect(room)
        })
        .catch(e => {
          this.setState({
            trying: false,
            roomId: '',
            sessionId: '',
            server: '',
            port: '',
            err: `Failed to connect to ${server}:${port}: ${e.toString()}`
          });
        });
    }
  }

  render() {
    const {trying, err} = this.state;
    if (trying) {
      return (
        <>
          <div id="connector"></div>
          <div id="message">
            <div className="info">Connecting...</div>
          </div>
        </>
      );
    }
    else {
      const form = (
        <div id="connector">
          <form onSubmit={this.onSubmit}>
            <label> <span className="label">Host</span>
              <input type="text" name="server" value={this.state.server} onChange={this.handleChange}/>
            </label>
            <label> <span className="label">Port</span>
              <input type="text" name="port" value={this.state.port} onChange={this.handleChange}/>
            </label>
            <div id="submit-container"><input type="submit" value="Connect"/></div>
          </form>
        </div>
      );
      if (err !== null) {
        return [form,
          <div id="message">
             <div className="error">Error: {err.toString()}</div>
          </div>
        ] ;
      }
      else {
        return [form, <div id="message"></div>];
      }
    }
  }
}

export default Connector;
