import React, {Component} from 'react';

class Controller extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      smallBlind: null,
      bigBlind: null
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
  
  render() {
    const {smallBlind, bigBlind} = this.state;
    return (
      <div id="game-controls">
        <div id="game-control-header">Table controls</div>
        <form>
          <label> <span className="label">Small</span>
            <input type="text" name="smallBlind" value={smallBlind} onChange={this.handleChange}/>
          </label>
          <label> <span className="label">Big</span>
            <input type="text" name="bigBlind" value={bigBlind} onChange={this.handleChange}/>
          </label>
        </form>
      </div>
    );
  }
}

export default Controller;
