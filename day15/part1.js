import exec from '../exec.js';

const calcHash = (string) => {
  const steps = string.split(',');
  return steps.reduce((acc, step) => {
    return acc + step.split('').reduce((acc, char) => {
      return (acc + char.charCodeAt(0)) * 17 % 256;
    }, 0);
  }, 0);
};

const run = (lines) => {
  const array = lines.split('\n').filter(Boolean);
  return calcHash(array[0]);
};

exec('sample1.txt', 52, run);
exec('sample2.txt', 1320, run);
exec('input.txt', 511215, run);
