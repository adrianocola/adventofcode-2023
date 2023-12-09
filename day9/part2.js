const fs = require('fs');

const calculateDifferences = (numbers) => {
  if (numbers.every((n) => n === 0)) return 0;

  const differences = [];
  for (let i = 0; i < numbers.length - 1; i++) {
    differences.push(numbers[i + 1] - numbers[i]);
  }

  const first = numbers[0];
  return first - calculateDifferences(differences);
};

const run = (file) => {
  const lines = fs.readFileSync(file, 'utf8');
  const array = lines.split('\n');

  const total = array.reduce((acc, line) => {
    if (!line) return acc;
    const numbers = line.split(' ').map((n) => parseInt(n));
    return acc + calculateDifferences(numbers);
  }, 0);

  console.log(`RESULT (${file}):`, total);
};

console.log();
run('sample.txt');
run('input.txt');
