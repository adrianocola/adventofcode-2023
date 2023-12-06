const fs = require('fs');

const calculateNumber = (winningNumbers, myNumbers) => {
  const intersection = winningNumbers.filter(value => myNumbers.includes(value));
  if (!intersection.length)  return 0;

  return Math.pow(2, intersection.length - 1);
};

const run = (file) => {
  const lines = fs.readFileSync(file, 'utf8');
  const array = lines.split('\n');
  const cardsCount = {};

  const sum = array.reduce((acc, line) => {
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

    console.log(cardId, successes.length, cardCount);

    return acc + cardCount;
  }, 0)

  console.log(`RESULT (${file}):`, sum);
};

console.log();
run('sample.txt');
run('input.txt');
