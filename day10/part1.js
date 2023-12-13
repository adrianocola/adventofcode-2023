import exec from '../exec.js';

const ALL_DIRECTIONS = [1, -1, 2, -2];

const DIRECTION_OFFSET = {
  1: {x: 0, y: -1},
  2: {x: 1, y: 0},
  '-1': {x: 0, y: 1},
  '-2': {x: -1, y: 0},
};

// 1 = ⬆️, 2 = ➡️, -1 = ⬇️, -2 = ⬅️
const PIPE_POS_MAP = {
  '|': [1, -1],
  '-': [2, -2],
  'L': [1, 2],
  'J': [1, -2],
  '7': [-1, -2],
  'F': [-1, 2],
};

const applyPosOffset = (pos, dir) => {
  const offset = DIRECTION_OFFSET[dir];
  return {x: pos.x + offset.x, y: pos.y + offset.y};
};

const getStartingPipeType = (lines, pos) => {
  const matchingPos = ALL_DIRECTIONS.filter((dir) => {
    const adjPos = applyPosOffset(pos, dir);
    const adjPipe = lines[adjPos.y]?.[adjPos.x];
    if (!adjPipe || !PIPE_POS_MAP[adjPipe]) return false;

    return PIPE_POS_MAP[adjPipe].includes(dir * -1);
  });

  const mapPosEntry = Object.entries(PIPE_POS_MAP).find(([pipe, dirs]) => {
    return dirs.every((dir) => matchingPos.includes(dir));
  });

  if (!mapPosEntry) throw new Error('Unknown starting pipe');

  const pipe = mapPosEntry[0];
  lines[pos.y][pos.x] = pipe;
  return pipe;
};

const findStartingPos = (lines) => {
  const width = lines[0].length;
  const height = lines.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x ++) {
      if (lines[y]?.[x] === 'S') {
        return {x, y};
      }
    }
  }
};

const findFarthestDistanceFrom = (lines, startingPos, startingPipe) => {
  let step = 0;
  let positions = [startingPos];
  while(positions.length){
    const nextPositions = [];

    positions.forEach((pos) => {
      const pipe = lines[pos.y][pos.x];
      const directions = PIPE_POS_MAP[pipe];
      if (!directions) return;

      directions.forEach((dir) => {
        const nextPos = applyPosOffset(pos, dir);
        if (typeof lines[nextPos.y]?.[nextPos.x] === 'string') {
          nextPositions.push(nextPos);
        }
      });

      lines[pos.y][pos.x] = step;
    });

    positions = nextPositions;
    if (positions.length) step++;
  }

  return step;
}

const run = (lines) => {
  const array = lines.split('\n').map((line) => Array.from(line));

  const startingPos = findStartingPos(array);
  getStartingPipeType(array, startingPos);
  return findFarthestDistanceFrom(array, startingPos);
};

exec('sample1.txt', 4, run);
exec('sample2.txt', 8, run);
exec('input.txt', 6697, run);
