// TODO: Actual rendering of cards
const rankToString = {
  0: 'A', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7', 7: '8', 8: '9',
  9: '10', 10: 'J', 11: 'Q', 12: 'K', '?': '?'
};
const suitToString = {
  0: 'S', 1: 'D', 2: 'H', 3: 'C', '?': '?'
};
export function cardToString(card) {
  if (card === '??') {
    return card;
  }
  return rankToString[card.rank] + suitToString[card.suit];
}
