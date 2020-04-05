import React, {Component} from 'react';

class ActiveStateController extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleSit = this.handleSit.bind(this);
    this.handleStand = this.handleStand.bind(this);
    this.handleActive = this.handleActive.bind(this);
    this.handleInactive = this.handleInactive.bind(this);
    this.handleBuyIn = this.handleBuyIn.bind(this);
    this.state = {
      username: '',
      active: false,
      sitting: false,
      buyInAmount: 0
    }
  }

  componentDidMount() {
    console.log('ActiveStateController did mount', this.props);
    const {room} = this.props;
    const {sessionId: myPid} = room;
    room.onStateChange((state) => {
      const {username, active, sitting} = state.players[myPid];
      this.setState({username, active, sitting});
    });
  }

  handleChange(event) {
    const {target: {name, value}} = event;
    this.setState({[name]: value});
  }

  handleStateEvent(event, state) {
    const {room} = this.props;
    room.send({stateRequest: state});
    event.preventDefault();
  }

  handleSit(event) {
    this.handleStateEvent(event, 'sit');
  }
  handleStand(event) {
    this.handleStateEvent(event, 'stand');
  }
  handleActive(event) {
    this.handleStateEvent(event, 'active');
  }
  handleInactive(event) {
    this.handleStateEvent(event, 'inactive');
  }

  handleBuyIn(event) {
    const {room} = this.props;
    const {buyInAmount} = this.state;
    room.send({buy: parseInt(buyInAmount)});
    this.setState({buyInAmount: 0});
    event.preventDefault();
  }
  
  render() {
    const {active, sitting, username, buyInAmount} = this.state;
    const {room} = this.props;
    if (room === undefined) {
      return null;
    }
    console.log(room);
    const {sessionId: myPid} = room;
    if (!(myPid in room.state.players)) {
      return null;
    }
    return (
      <div id="state-controller" className="control-box">
        <div className="control-header">Stack / state controls</div>
        <div className="control-group">
        <form onSubmit={() => false}>
          <label> <span className="label">Nick</span>
            <input type="text" name="username" value={username} disabled="true"/>
          </label>
        </form>
        </div>
        <div className="control-group">
        <div className="control-row">
        <form onSubmit={this.handleActive} className="simple-action">
          <input type="submit" name="activeInactive" disabled={active || !sitting} value="Jump in"/>
        </form>
        <form onSubmit={this.handleInactive} className="simple-action">
          <input type="submit" name="activeInactive" disabled={!active || !sitting} value="Sit out"/>
        </form>
        </div>
        <div className="control-row">
        <form onSubmit={this.handleSit} className="simple-action">
          <input type="submit" name="activeInactive" disabled={sitting} value="Sit down"/>
        </form>
        <form onSubmit={this.handleStand} className="simple-action">
          <input type="submit" name="activeInactive" disabled={!sitting} value="Stand up"/>
        </form>
        </div>
        </div>
        <div className="control-group">
        <form onSubmit={this.handleBuyIn}>
          <label> <span className="label">Buy in</span>
            <input type="text" name="buyInAmount" value={buyInAmount} onChange={this.handleChange}/>
          </label>
        <div className="control-row">
          <input type="submit" name="buyIn" disabled={active} value="Buy in!"/>
        </div>
        </form>
        </div>
      </div>
    );
  }
}

export default ActiveStateController;
