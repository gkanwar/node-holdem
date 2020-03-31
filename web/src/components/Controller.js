import React, {Component} from 'react';

class Controller extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.state = {
      smallBlind: 0,
      bigBlind: 0
    }
  }

  componentDidMount() {
    const {room} = this.props;
    room.onStateChange((state) => {
      this.setState({
        smallBlind: state.smallBlind,
        bigBlind: state.bigBlind
      });
    });
  }

  handleChange(event) {
    const {target: {name, value}} = event;
    this.setState({[name]: value});
    const {room} = this.props;
    room.send({[name]: value});
  }

  handleStart(event) {
    const {room} = this.props;
    this.setState({running: true});
    room.send({running: true});
    event.preventDefault();
  }
  
  render() {
    const {smallBlind, bigBlind, running} = this.state;
    return (
      <div id="game-controls">
        <div id="game-control-header">Table controls</div>
        <form onSubmit={this.handleStart}>
          <label> <span className="label">Small</span>
            <input type="text" name="smallBlind" value={smallBlind} onChange={this.handleChange}/>
          </label>
          <label> <span className="label">Big</span>
            <input type="text" name="bigBlind" value={bigBlind} onChange={this.handleChange}/>
          </label>
          <input type="submit" name="startGame" disabled={running} value="Start game!"/>
        </form>
      </div>
    );
  }
}

export default Controller;
