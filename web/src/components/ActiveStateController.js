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
      myStack: 0,
      buyInAmount: 0
    }
  }

  componentDidMount() {
    console.log('ActiveStateController did mount', this.props);
    const {room} = this.props;
    const {sessionId: myPid} = room;
    room.onStateChange((state) => {
      this.setState({
        myStack: state.players[myPid].stack
      });
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
    const {myStack, buyInAmount} = this.state;
    const {room} = this.props;
    if (room === undefined) {
      return null;
    }
    console.log(room);
    const {state, sessionId: myPid} = room;
    if (!(myPid in state.players)) {
      return null;
    }
    const {active, sitting} = state.players[myPid];
      
    return (
      <div id="state-controller" className="control-box">
        <div className="control-header">Stack / state controls</div>
        <div className="control-group">
        <form onSubmit={this.handleActive} className="simple-action">
          <input type="submit" name="activeInactive" disabled={active || !sitting} value="Jump in"/>
        </form>
        <form onSubmit={this.handleInactive} className="simple-action">
          <input type="submit" name="activeInactive" disabled={!active || !sitting} value="Sit out"/>
        </form>
        </div>
        <div className="control-group">
        <form onSubmit={this.handleSit} className="simple-action">
          <input type="submit" name="activeInactive" disabled={sitting} value="Sit down"/>
        </form>
        <form onSubmit={this.handleStand} className="simple-action">
          <input type="submit" name="activeInactive" disabled={!sitting} value="Stand up"/>
        </form>
        </div>
        <div className="control-group">
        <form onSubmit={this.handleBuyIn}>
          <label> <span className="label">Buy in</span>
            <input type="text" name="buyInAmount" value={buyInAmount} onChange={this.handleChange}/>
          </label>
          <input type="submit" name="buyIn" disabled={active} value="Buy in!"/>
        </form>
        </div>
      </div>
    );
  }
}

export default ActiveStateController;
