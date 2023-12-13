import exec from '../exec.js';

const calculateDifferences = (numbers) => {
  if (numbers.every((n) => n === 0)) return 0;

  const differences = [];
  for (let i = 0; i < numbers.length - 1; i++) {
    differences.push(numbers[i + 1] - numbers[i]);
  }

  const first = numbers[0];
  return first - calculateDifferences(differences);
};

const run = (lines) => {
  const array = lines.split('\n');

  return array.reduce((acc, line) => {
    if (!line) return acc;
    const numbers = line.split(' ').map((n) => parseInt(n));
    return acc + calculateDifferences(numbers);
  }, 0);
};

console.log();
exec('sample.txt', 2, run);
exec('input.txt', 1019, run);
