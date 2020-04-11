import React, {Component} from 'react';
import {ReactComponent as TableBg} from './table.opt.svg';
import ActionBar from './ActionBar';
import {cardPropType} from './Card';
import Board, {MAX_BOARD, STREETS} from './Board';
import Pot from './Pot';
import Offering from './Offering';
import PlayerBadge from './PlayerBadge';
import Button from './Button';
import PropTypes from 'prop-types';
import lodash from 'lodash';

const VIEW_HEIGHT = 600;
const positions6 = [
  {
    index: 0,
    badge: [90, 250],
    button: [148, 289],
    offer: [210, 270]
  },
  {
    index: 3,
    badge: [715, 258],
    button: [654, 227],
    offer: [600, 250]
  },
  {
    index: 1,
    badge: [268, 435],
    button: [317, 382],
    offer: [275, 360]
  },
  {
    index: 4,
    badge: [570, 80],
    button: [510, 130],
    offer: [500, 160]
  },
  {
    index: 2,
    badge: [528, 435],
    button: [560, 377],
    offer: [520, 360]
  },
  {
    index: 5,
    badge: [230, 80],
    button: [230, 133],
    offer: [295, 165]
  }
];

function getPositions(n) {
  if (n <= 6) {
    const usedPositions = positions6.slice(0, n);
    usedPositions.sort((a,b) => a.index - b.index);
    return usedPositions.map((pos) => {
      const {index, ...posData} = pos;
      const posDataReflected = Object.fromEntries(
        Object.entries(posData).map(
          ([k, v]) => {
            if (v.length === 2) {
              return [k, [v[0], VIEW_HEIGHT-v[1]]];
            }
            else {
              return [k, v];
            }
          }));
      return posDataReflected;
    });
  }
  else {
    throw `Cannot seat > 6 players: ${n}`;
  }
}

class Table extends Component {
  static propTypes = {
    pots: PropTypes.array,
    nextToAct: PropTypes.number,
    myIndex: PropTypes.number,
    myCards: PropTypes.arrayOf(cardPropType),
    orderedPlayers: PropTypes.array,
    running: PropTypes.bool,
    board: PropTypes.array,
    toCall: PropTypes.number,
    minRaise: PropTypes.number,
    button: PropTypes.number,
    showdown: PropTypes.object,
    send: PropTypes.func
  };
  constructor() {
    super();
    this.doShowdown = this.doShowdown.bind(this);
    this.queueUpdateState = this.queueUpdateState.bind(this);
    this.updateStateFromProps = this.updateStateFromProps.bind(this);
    this.pendingUpdate = null;
    this.state = {
      positions: [],
      showdown: null,
      pots: [],
      nextToAct: 0,
      myIndex: 0,
      myCards: [],
      orderedPlayers: [],
      running: false,
      board: [],
      toCall: 0,
      minRaise: 0,
      button: 0,
      send: () => {}
    }
  }

  queueUpdateState(props) {
    const {showdown} = this.state;
    if (showdown === null) {
      this.updateStateFromProps(props);
      this.pendingUpdate = null;
    }
    else {
      this.pendingUpdate = props;
    }
  }

  updateStateFromProps(props, callback) {
    const {orderedPlayers, showdown, ...restProps} = props;
    const cloneRestProps = lodash.cloneDeep(restProps);
    this.setState({
      positions: getPositions(orderedPlayers.length),
      orderedPlayers: lodash.cloneDeep(orderedPlayers),
      ...cloneRestProps
    }, callback);
  }

  componentDidMount() {
    console.log('Table mount!');
    const {showdown} = this.props;
    if (showdown !== null && showdown !== undefined) {
      this.doShowdown(showdown);
      this.pendingUpdate = this.props;
    }
    else {
      this.queueUpdateState(this.props);
    }
  }

  componentDidUpdate(prevProps) {
    const {showdown} = this.props;
    if (showdown !== null && prevProps.showdown !== showdown) {
      console.log('Table got new showdown');
      this.doShowdown(showdown);
      this.pendingUpdate = this.props;
    }
    else if (this.props !== prevProps) {
      console.log('Table update props');
      console.log(this.props);
      this.queueUpdateState(this.props);
    }
  }

  doShowdown(showdown) {
    this.setState({showdown, board: showdown.board});
    setTimeout(() => {
      console.log('Cleaning up showdown with pending update', this.pendingUpdate);
      this.updateStateFromProps(this.pendingUpdate, () => {
        this.pendingUpdate = null;
        this.setState({showdown: null});
      });
    }, 8000);
  }

  render() {
    const {
      positions, showdown, pots, nextToAct, myIndex, myCards, orderedPlayers,
      running, board, button, toCall, minRaise, bigBlind, send
    } = this.state;
    if (positions.length !== orderedPlayers.length) {
      return null;
    }
    console.log('render', this.state);
    let buttonElt = null;
    if (button !== undefined) {
      const pos = positions[button];
      if (pos !== undefined) {
        const buttonPos = positions[button].button;
        buttonElt = <g transform={`translate(${buttonPos[0]},${buttonPos[1]})`}><Button/></g>;
      }
    }

    const offerElts = orderedPlayers.map((player, index) => {
      const {offer: offerPos} = positions[index];
      return <g transform={`translate(${offerPos[0]}, ${offerPos[1]})`}>
        <Offering offer={player.offering}/>
      </g>;
    });
    
    const playerBadges = orderedPlayers.map((player, index) => {
      const pos = positions[index];
      const isMe = index == myIndex;
      const badgeProps = {
        isMe,
        isNextToAct: (index == nextToAct && running),
        isActive: player.active,
        isShowing: false // TODO
      }
      let cards = myCards;
      let isShowing = false;
      console.log(`Render player ${index}`, player.sessionId);
      console.log(`Showdown non null? ${showdown !== null}`);
      console.log('Player in showdown cards', showdown !== null && player.sessionId in showdown.cards);
      if (showdown !== null && player.sessionId in showdown.cards) {
        cards = showdown.cards[player.sessionId];
        console.log('Player', player.sessionId, 'cards', cards);
        isShowing = true; // TODO: Muck?
      }
      else if (!isMe) {
        // TODO: For now just inferring whether players have cards, is there
        // a better (more robust) way?
        if (player.active && running) {
          cards = [{rank: -1, suit: -1}, {rank: -1, suit: -1}];
        }
        else {
          cards = [];
        }
      }
      const key = `player-${index}`;
      const {badge} = pos;
      return (
        <g transform={`translate(${badge[0]},${badge[1]})`}>
          <PlayerBadge key={key} username={player.username} stack={player.stack}
          {...badgeProps} cards={cards} isShowing={isShowing} isFolded={player.folded}/>
        </g>
      );
    });
    const boardElt = <g transform="translate(400,310)">
      <Board cards={board}/>
          </g>;
    const potElt = <g transform="translate(400,385)">
      <Pot pots={pots}/>
    </g>;

    const myPlayer = orderedPlayers[myIndex];
    let actionBarElt = null;
    if (myPlayer !== undefined) {
      const actionBarProps = {
        send, toCall, minRaise, bigBlind,
        offer: myPlayer.offering,
        stack: myPlayer.stack,
        enabled: (!myPlayer.folded && myPlayer.active),
      };
      actionBarElt = <ActionBar {...actionBarProps}/>;
    }

    return (
      <div id="table-viewport">
        <svg id="game-canvas">
          <TableBg/>
          {playerBadges}
          {offerElts}
          {buttonElt}
          {potElt}
          {boardElt}
        </svg>
        {actionBarElt}
      </div>
    );
  }
}

export default Table;
