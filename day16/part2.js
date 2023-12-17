import exec, {DIRECTIONS, getNextMatrixPos} from '../exec.js';

const parseGrid = (array) => {
  const grid = new Array(array.length).fill(0).map(() => new Array(array[0].length).fill(0));

  for (let y = 0; y < array.length; y += 1) {
    for (let x = 0; x < array[0].length; x += 1) {
      grid[y][x] = {type: array[y][x], inputs: {}};
    }
  }

  return grid;
};

const calcBeamBounces = (grid, pos, dir) => {
  const item = grid[pos.y]?.[pos.x];
  if (!item || item.inputs[dir]) return;

  item.inputs[dir] = true;
  item.energized = true;
  if (item.type === '.') {
    calcBeamBounces(grid, getNextMatrixPos(pos, dir), dir);
  } else if (item.type === '/') {
    if (dir === DIRECTIONS.TOP) {
      calcBeamBounces(grid, getNextMatrixPos(pos, DIRECTIONS.RIGHT), DIRECTIONS.RIGHT);
    } else if (dir === DIRECTIONS.BOTTOM) {
      calcBeamBounces(grid, getNextMatrixPos(pos, DIRECTIONS.LEFT), DIRECTIONS.LEFT);
    } else if (dir === DIRECTIONS.LEFT) {
      calcBeamBounces(grid, getNextMatrixPos(pos, DIRECTIONS.BOTTOM), DIRECTIONS.BOTTOM);
    } else if (dir === DIRECTIONS.RIGHT) {
      calcBeamBounces(grid, getNextMatrixPos(pos, DIRECTIONS.TOP), DIRECTIONS.TOP);
    }
  } else if (item.type === '\\') {
    if (dir === DIRECTIONS.TOP) {
      calcBeamBounces(grid, getNextMatrixPos(pos, DIRECTIONS.LEFT), DIRECTIONS.LEFT);
    } else if (dir === DIRECTIONS.BOTTOM) {
      calcBeamBounces(grid, getNextMatrixPos(pos, DIRECTIONS.RIGHT), DIRECTIONS.RIGHT);
    } else if (dir === DIRECTIONS.LEFT) {
      calcBeamBounces(grid, getNextMatrixPos(pos, DIRECTIONS.TOP), DIRECTIONS.TOP);
    } else if (dir === DIRECTIONS.RIGHT) {
      calcBeamBounces(grid, getNextMatrixPos(pos, DIRECTIONS.BOTTOM), DIRECTIONS.BOTTOM);
    }
  } else if (item.type === '|') {
    if (dir === DIRECTIONS.TOP || dir === DIRECTIONS.BOTTOM) {
      calcBeamBounces(grid, getNextMatrixPos(pos, dir), dir);
    } else if (dir === DIRECTIONS.LEFT || dir === DIRECTIONS.RIGHT) {
      calcBeamBounces(grid, getNextMatrixPos(pos, DIRECTIONS.TOP), DIRECTIONS.TOP);
      calcBeamBounces(grid, getNextMatrixPos(pos, DIRECTIONS.BOTTOM), DIRECTIONS.BOTTOM);
    }
  } else if (item.type === '-') {
    if (dir === DIRECTIONS.LEFT || dir === DIRECTIONS.RIGHT) {
      calcBeamBounces(grid, getNextMatrixPos(pos, dir), dir);
    } else if (dir === DIRECTIONS.TOP || dir === DIRECTIONS.BOTTOM) {
      calcBeamBounces(grid, getNextMatrixPos(pos, DIRECTIONS.LEFT), DIRECTIONS.LEFT);
      calcBeamBounces(grid, getNextMatrixPos(pos, DIRECTIONS.RIGHT), DIRECTIONS.RIGHT);
    }
  }
};

const countEnergized = (grid) => {
  let energized = 0;
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[0].length; x += 1) {
      if (grid[y][x].energized) {
        energized += 1;
      }
    }
  }

  return energized;
};

const countTotalEnergized = (array, pos, dir) => {
  const grid = parseGrid(array);
  calcBeamBounces(grid, pos, dir);
  return countEnergized(grid);
}

const run = (lines) => {
  const array = lines.split('\n').filter(Boolean);

  let maxEnergized = 0;
  for (let y = 0; y < array.length; y += 1) {
    const fromLeftMax = countTotalEnergized(array, {y, x: 0}, DIRECTIONS.RIGHT);
    if (fromLeftMax > maxEnergized) {
      maxEnergized = fromLeftMax;
    }

    const fromRightMax = countTotalEnergized(array, {y, x: array[0].length - 1}, DIRECTIONS.LEFT);
    if (fromRightMax > maxEnergized) {
      maxEnergized = fromRightMax;
    }
  }

  for (let x = 0; x < array[0].length; x += 1) {
    const fromTopMax = countTotalEnergized(array, {y: 0, x}, DIRECTIONS.BOTTOM);
    if (fromTopMax > maxEnergized) {
      maxEnergized = fromTopMax;
    }

    const fromBottomMax = countTotalEnergized(array, {y: array.length - 1, x}, DIRECTIONS.TOP);
    if (fromBottomMax > maxEnergized) {
      maxEnergized = fromBottomMax;
    }
  }

  return maxEnergized;
};

exec('sample.txt', 51, run);
exec('input.txt', 8185, run);
