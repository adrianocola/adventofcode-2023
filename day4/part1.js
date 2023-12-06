const fs = require('fs');

const calculateScore = (winningNumbers, myNumbers) => {
  const intersection = winningNumbers.filter(value => myNumbers.includes(value));
  if (!intersection.length)  return 0;

  return Math.pow(2, intersection.length - 1);
};

const run = (file) => {
  const lines = fs.readFileSync(file, 'utf8');
  const array = lines.split('\n');

  const sum = array.reduce((acc, line) => {
    if (!line) return acc;

    const split = line.split(/:|\|/)
    const [game, winningText, myText] = split;
    const winningNumbers = winningText.trim().split(/\s+/).map(v => parseInt(v, 10));
    const myNumbers = myText.trim().split(/\s+/).map(v => parseInt(v, 10));
    return acc + calculateScore(winningNumbers, myNumbers);
  }, 0)

  console.log(`RESULT (${file}):`, sum);
};

console.log();
run('sample.txt');
run('input.txt');
