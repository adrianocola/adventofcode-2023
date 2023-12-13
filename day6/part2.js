import exec from '../exec.js';

const run = (lines) => {
  const array = lines.split('\n');
  const time = parseInt(array[0].split(/\s+/).slice(1).join(''), 10);
  const distance = parseInt(array[1].split(/\s+/).slice(1).join(''), 10);
  let waysToBeat = 0;

  const middleTime = Math.floor(time / 2);
  for (let j = middleTime + 1; j < time - 1; j++) {
    if (j * (time - j) <= distance) break;
    waysToBeat += 1;
  }
  for (let j = middleTime; j >=1; j--) {
    if (j * (time - j) <= distance) break;
    waysToBeat += 1;
  }

  return waysToBeat;
};

exec('sample.txt', 71503, run);
exec('input.txt', 30077773, run);
