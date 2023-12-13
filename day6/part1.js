import exec from '../exec.js';

const run = (lines) => {
  const array = lines.split('\n');
  const times = array[0].split(/\s+/).slice(1);
  const distances = array[1].split(/\s+/).slice(1);
  const waysToBeat = [];

  for (let i = 0; i < times.length; i++) {
    const time = parseInt(times[i], 10);
    const distance = parseInt(distances[i], 10);
    const middleTime = Math.floor(time / 2);
    for (let j = middleTime + 1; j < time - 1; j++) {
      if (j * (time - j) <= distance) break;
      waysToBeat[i] = (waysToBeat[i] ?? 0) + 1;
    }
    for (let j = middleTime; j >=1; j--) {
      if (j * (time - j) <= distance) break;
      waysToBeat[i] = (waysToBeat[i] ?? 0) + 1;
    }
  }

  return waysToBeat.reduce((acc, item) => acc * item, 1);
};

exec('sample.txt', 288, run);
exec('input.txt', 4811940, run);
