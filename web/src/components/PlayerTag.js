import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './player-tag.css';

/** Tag below badge to indicate state */
const TAG_WIDTH = 80;
class PlayerTag extends Component {
  static propTypes = {
    className: PropTypes.string,
    text: PropTypes.string,
    textDark: PropTypes.bool
  };
  render() {
    const {className, text, textDark} = this.props;
    const textClass = textDark ? "dark" : "light";
    return <g className={`player-tag ${className}`}>
      <g transform={`translate(-${TAG_WIDTH/2},-15)`}>
      <rect width={TAG_WIDTH} height="25" rx="3" ry="3"/>
      <text x={TAG_WIDTH/2} y="17" className={textClass}>{text}</text>
      </g>
    </g>;
  }
}

export class ReadyTag extends Component {
  render() {
    return <PlayerTag text="READY" className="ready" textDark={true}/>;
  }
}
export class SittingTag extends Component {
  render() {
    return <PlayerTag text="SITTING" className="sitting" textDark={true}/>;
  }
}
export class FoldedTag extends Component {
  render() {
    return <PlayerTag text="FOLDED" className="folded" textDark={true}/>;
  }
}
export class NextTag extends Component {
  static propTypes = {
    isMe: PropTypes.bool
  };
  render() {
    const {isMe} = this.props
    const text = isMe ? "YOUR TURN" : "THEIR TURN";
    return <PlayerTag text={text} className="next-to-act" textDark={false}/>;
  }
}

export default PlayerTag;
