import {Card} from './HoldemState';
import PokerHand from 'poker-hand-evaluator';

export function makeDeck() {
  let deck = [];
  for (var rank = 0; rank < 13; ++rank) {
    for (var suit = 0; suit < 4; ++suit) {
      deck.push(new Card(rank, suit));
    }
  }
  return deck;
}

export function randomInt(max) {
  return Math.floor(Math.random() * max);
}

export function randomDraw(deck) {
  const index = randomInt(deck.length);
  const [value] = deck.splice(index, 1);
  return value;
}

// Lower is better.
export function getHandScore(board, cards) {
  // Do it the dumb way: enumerate all 5-card hands
  const allCards = board.concat(cards);
  let bestScore = null;
  let bestHand = null;
  let bestRank = null;
  for (var skip1 = 0; skip1 < 7; skip1++) {
    for (var skip2 = 0; skip2 < skip1; skip2++) {
      const hand = allCards.filter(
        (val, index) => (index != skip1 && index != skip2));
      const handStr = hand.map(x => x.toString());
      const pokerHand = new PokerHand(handStr.join(' '))
      const score = pokerHand.getScore();
      if (bestScore === null || score < bestScore) {
        bestScore = score;
        bestHand = handStr;
        bestRank = pokerHand.getRank()
      }
    }
  }
  console.log(`Best hand ${bestHand} with score ${bestScore} (${bestRank})`);
  return bestScore;
}
