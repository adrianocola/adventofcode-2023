import exec from '../exec.js';

const calculateScore = (winningNumbers, myNumbers) => {
  const intersection = winningNumbers.filter(value => myNumbers.includes(value));
  if (!intersection.length)  return 0;

  return Math.pow(2, intersection.length - 1);
};

const run = (lines) => {
  const array = lines.split('\n');

  return array.reduce((acc, line) => {
    if (!line) return acc;

    const split = line.split(/:|\|/)
    const [game, winningText, myText] = split;
    const winningNumbers = winningText.trim().split(/\s+/).map(v => parseInt(v, 10));
    const myNumbers = myText.trim().split(/\s+/).map(v => parseInt(v, 10));
    return acc + calculateScore(winningNumbers, myNumbers);
  }, 0)
};

exec('sample.txt', 13, run);
exec('input.txt', 27845, run);
