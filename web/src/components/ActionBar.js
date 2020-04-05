import React, {Component} from 'react';

class ActionBar extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleFold = this.handleFold.bind(this);
    this.handleBet = this.handleBet.bind(this);
    this.state = {
      betValue: 0
    };
  }

  handleChange(event) {
    const {target: {name, value}} = event;
    this.setState({[name]: value});
  }

  handleFold(event) {
    const {room} = this.props;
    room.send({action: {type: 'fold'}});
    event.preventDefault();
  }

  handleBet(event) {
    const {room} = this.props;
    const {betValue} = this.state;
    room.send({action: {type: 'bet', value: parseInt(betValue)}});
    this.setState({betValue: 0});
    event.preventDefault();
  }

  render() {
    const {betValue} = this.state;
    return (
      <div id="actions-bar" className="control-box">
        <div className="control-header">Actions</div>
        <div className="control-row">
          <form onSubmit={this.handleFold}>
            <input type="submit" value="Fold"/>
          </form>
          <form onSubmit={this.handleBet}>
            <input type="text" name="betValue" value={betValue} type="number"
             onChange={this.handleChange} style={{width: '50px'}}/>
            <input type="submit" value="Bet"/>
          </form>
        </div>
      </div>
    );
  }
}

export default ActionBar;
