import exec, {DIRECTIONS_LIST, getNextMatrixPos} from '../exec.js';

const findStart = (gardenMap) => {
  for (let y = 0; y < gardenMap.length; y++) {
    for (let x = 0; x < gardenMap[y].length; x++) {
      if (gardenMap[y][x] === 'S') {
        return {x, y};
      }
    }
  }

  return gardenMap;
};

const getPosIndex = (pos) => `${pos.x}:${pos.y}`;

const runSteps = (gardenMap, startPos, steps) => {
  let positions = {[getPosIndex(startPos)]: startPos};

  for (let i = 0; i < steps; i += 1) {
    const newPositions = {};
    Object.values(positions).forEach((pos) => {
      DIRECTIONS_LIST.forEach((dir) => {
        const newPos = getNextMatrixPos(pos, dir);
        const space = gardenMap[newPos.y]?.[newPos.x];
        if (space === '.' || space === 'S') {
          newPositions[getPosIndex(newPos)] = newPos;
        }
      });
    });
    positions = newPositions;
  }

  return Object.keys(positions).length;
};

const run = (lines, steps) => {
  const gardenMap = lines.split('\n').filter(Boolean).map((line) => line.split(''));
  const start = findStart(gardenMap);
  return runSteps(gardenMap, start, steps);
};

exec('sample.txt', 16, run, 6);
exec('input.txt', 3740, run, 64);
