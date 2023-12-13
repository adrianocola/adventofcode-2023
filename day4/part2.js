import exec from '../exec.js';

const calculateNumber = (winningNumbers, myNumbers) => {
  const intersection = winningNumbers.filter(value => myNumbers.includes(value));
  if (!intersection.length)  return 0;

  return Math.pow(2, intersection.length - 1);
};

const run = (lines) => {
  const array = lines.split('\n');
  const cardsCount = {};

  return array.reduce((acc, line) => {
    if (!line) return acc;

    const split = line.split(/:|\|/)
    const [card, winningText, myText] = split;
    const cardId = parseInt(card.match(/(\d+)/)[1]);
    const winningNumbers = winningText.trim().split(/\s+/).map(v => parseInt(v, 10));
    const myNumbers = myText.trim().split(/\s+/).map(v => parseInt(v, 10));
    const successes = winningNumbers.filter(value => myNumbers.includes(value));

    const cardCount = (cardsCount[cardId] ?? 0) + 1;

    for (let i = 1; i <= successes.length; i++) {
      const nextCardId = cardId + i;
      if (nextCardId < array.length) {
        cardsCount[nextCardId] = (cardsCount[nextCardId] ?? 0) + cardCount;
      }
    }

    return acc + cardCount;
  }, 0);
};

exec('sample.txt', 30, run);
exec('input.txt', 9496801, run);
