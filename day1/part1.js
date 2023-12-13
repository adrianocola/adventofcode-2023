import exec from '../exec.js';

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

const run = (lines) => {
  const array = lines.split('\n');

  const result = array.map((line) => {
    const firstNumber = findNumber(line);
    const lastNumber = findNumber(line, true);
    return parseInt(`${firstNumber}${lastNumber}`, 10);
  });

  return result.reduce((acc, number) => {
    return acc + number;
  }, 0);
};

exec('sample1.txt', 142, run);
exec('input.txt', 56506, run);
