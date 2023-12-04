const fs = require('fs');

const NUMBER_REGEX = /\d/;

const findNumber = (line, fromEnd) => {
  const start = fromEnd ? line.length - 1 : 0;
  const step = fromEnd ? -1 : 1;
  for (let i = start; fromEnd ? i >= 0 : i < line.length; i += step) {
    const char = line.charAt(i);
    if (NUMBER_REGEX.test(char)) {
      return parseInt(char, 10);
    }
  }

  return 0;
};

const part1 = (file) => {
  const lines = fs.readFileSync(file, 'utf8');
  const array = lines.split('\n');

  const result = array.map((line) => {
    const firstNumber = findNumber(line);
    const lastNumber = findNumber(line, true);
    return parseInt(`${firstNumber}${lastNumber}`, 10);
  });

  const sum = result.reduce((acc, number) => {
    return acc + number;
  }, 0);

  console.log(`PART 1 RESULT ${file}`, sum);
};

console.log();
part1('sample1.txt');
part1('input.txt');
