import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './action-bar.css';

class ActionBar extends Component {
  static propTypes = {
    send: PropTypes.func.required,
    toCall: PropTypes.number.required,
    minRaise: PropTypes.number.required,
    offer: PropTypes.number.required,
    stack: PropTypes.number.required,
    enabled: PropTypes.bool.required
  };
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleFold = this.handleFold.bind(this);
    this.handleRaise = this.handleRaise.bind(this);
    this.handleCheckCall = this.handleCheckCall.bind(this);
    this.sendBet = this.sendBet.bind(this);
    this.computeMinRaiseValue = this.computeMinRaiseValue.bind(this);
    this.state = {
      raiseValue: 0
    };
  }

  handleChange(event) {
    const {target: {name, value}} = event;
    this.setState({[name]: value});
  }

  handleFold(event) {
    event.preventDefault();
    const {send} = this.props;
    send({action: {type: 'fold'}});
  }

  sendBet(value) {
    const {send} = this.props;
    send({action: {type: 'bet', value: parseInt(value)}});
  }

  computeMinRaiseValue() {
    const {toCall, minRaise} = this.props;
    return toCall + minRaise;
  }

  componentDidUpdate(lastProps) {
    const {toCall, minRaise, offer} = this.props;
    if (lastProps.toCall !== toCall || lastProps.minRaise !== minRaise
        || lastProps.offer !== offer) {
      const {raiseValue} = this.state;
      this.setState({raiseValue: Math.max(this.computeMinRaiseValue(), raiseValue)});
    }
  }
  componentDidMount() {
    const {toCall, minRaise, offer} = this.props;
    const {raiseValue} = this.state;
    this.setState({raiseValue: Math.max(this.computeMinRaiseValue(), raiseValue)});
  }

  handleRaise(event) {
    event.preventDefault();
    const {offer} = this.props
    const {raiseValue} = this.state;
    this.sendBet(raiseValue - offer);
  }

  handleCheckCall(event) {
    event.preventDefault();
    const {toCall, offer} = this.props;
    const callValue = toCall - offer;
    this.sendBet(callValue);
  }

  render() {
    const {toCall, minRaise, offer, stack, enabled} = this.props;
    const callValue = toCall - offer;
    const checkCall = callValue > 0 ? 'Call' : 'Check';
    const {raiseValue} = this.state;
    return (
      <div id="actions-bar" className="control-box">
        <div className="control-header">Actions</div>
        <div className="control-row">
          <form onSubmit={this.handleFold}>
            <input type="submit" value="Fold" disabled={!enabled}/>
          </form>
          <form onSubmit={this.handleCheckCall}>
            <input type="submit" value={checkCall} disabled={!enabled}/>
          </form>
          <div className="spacer"></div>
          <form onSubmit={this.handleRaise}>
            <input type="submit" value="Raise to" disabled={!enabled}/>
            <input type="text" name="raiseValue" value={raiseValue} type="number"
             min={this.computeMinRaiseValue()} max={stack} step={minRaise}
             disabled={!enabled}
             onChange={this.handleChange} style={{width: '50px'}}/>
          </form>
        </div>
      </div>
    );
  }
}

export default ActionBar;
