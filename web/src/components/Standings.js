import React, {Component} from 'react';

function statusToString(player) {
  if (!player.connected) {
    return 'disconnected';
  }
  else if (player.active) {
    return 'active';
  }
  else if (player.sitting) {
    return 'sitting out';
  }
  else {
    return 'standing';
  }
}

// function playerValue(player) {
//   return player.offering + player.stack;
// }

function makeSignedValue(value) {
  let className;
  if (value > 0) {
    return <span className="pos value">+{value}</span>;
  }
  else if (value < 0) {
    return <span className="neg value">{value}</span>;
  }
  else {
    return <span className="zero value">{value}</span>;
  }
}

class Standings extends Component {
  constructor() {
    super();
    this.state = {
      players: []
    };
  }

  componentDidMount() {
    const {room} = this.props;
    room.onStateChange((state) => {
      const {players} = state;
      this.setState({players});
    });
  }
  
  render() {
    const {players} = this.state;
    console.log('players', players);
    const playerValues = Object.values(players).sort(
      (p1, p2) => (p2.lastValue + p2.bankroll)-(p1.lastValue + p1.bankroll));
    console.log('playerValues', playerValues);
    const rowElts = playerValues.map(
      (player, index) => (
        <tr key={`status-${Object.keys(players)[index]}`}>
          <td>{index+1}</td>
          <td className="text-col">{player.username} ({statusToString(player)})</td>
          <td>{makeSignedValue(player.bankroll)}</td>
          <td>{makeSignedValue(player.lastValue)}</td>
          <td>{makeSignedValue(player.bankroll + player.lastValue)}</td>
        </tr>
      ));
    return (
      <div id="standings-box" className="control-box">
        <div className="control-header">Standings</div>
        <table className="clean-table">
        <thead>
          <tr>
          <th>#</th>
          <th className="text-col">Nick (status)</th>
          <th>Buy-in</th>
          <th>Value</th>
          <th>Net</th>
          </tr>
        </thead>
        <tbody>{rowElts}</tbody>
        </table>
      </div>
    );
  }
}

export default Standings;
