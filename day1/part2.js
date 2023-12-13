import exec from '../exec.js';

const LITERAL_NUMBERS_REGEX = /(?=(one|two|three|four|five|six|seven|eight|nine|\d))/g;

const NUMBER_MAP = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9
};

const findAllNumbers = (line) => {
  const matches = Array.from(line.matchAll(LITERAL_NUMBERS_REGEX)).flat()?.filter(v => v !== '');

  return matches?.map((number) => {
    if (number.length === 1) return parseInt(number, 10);
    return NUMBER_MAP[number] ?? 0;
  }) ?? [];
};

const run = (lines) => {
  const array = lines.split('\n');

  const result = array.map((line) => {
    const numbers = findAllNumbers(line);
    const firstNumber = numbers[0] ?? 0;
    const lastNumber = numbers[numbers.length -1] ?? 0;
    return parseInt(`${firstNumber}${lastNumber}`, 10);
  });

  return result.reduce((acc, number) => {
    return acc + number;
  }, 0);
};

exec('sample2.txt', 281, run);
exec('input.txt', 56017, run);

