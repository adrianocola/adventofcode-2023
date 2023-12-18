import exec, {DIRECTIONS, DIRECTIONS_LIST, DIRECTIONS_OPPOSITE, getNextMatrixPos} from '../exec.js';

// prioritize bottom right directions
const SORTED_DIRECTIONS_LIST = [DIRECTIONS.BOTTOM, DIRECTIONS.RIGHT, DIRECTIONS.LEFT, DIRECTIONS.TOP];

const parseGrid = (array) => {
  const height = array.length;
  const width = array[0].length;
  const grid = new Array(height).fill(0).map(() => new Array(width).fill(0));

  for (let y = 0; y < array.length; y += 1) {
    for (let x = 0; x < array[0].length; x += 1) {
      grid[y][x] = {loss: parseInt(array[y][x], 10), inputs: {}};
    }
  }
  const maxFoud = (width + height) * 9;
  const meta = { width, height, minFound: maxFoud };

  return {meta, grid}
};



const calcHeatLoss = (grid, pos, dir, loss, lineCount, steps, meta) => {
  if (loss >= meta.minFound) return Number.POSITIVE_INFINITY;

  const item = grid[pos.y]?.[pos.x];
  if (item === undefined) return Number.POSITIVE_INFINITY;

  const inputsIndex = `${dir}:${lineCount}`;
  if (loss >= item.inputs[inputsIndex]) return Number.POSITIVE_INFINITY;
  item.inputs[inputsIndex] = loss;

  if (pos.y === grid.length - 1 && pos.x === grid[0].length - 1) {
    const lossFound = loss + item.loss;
    if (lossFound < meta.minFound) {
      meta.minFound = lossFound;
    }
    return lossFound;
  }

  const oppositeDir = DIRECTIONS_OPPOSITE[dir];
  const possibleDirs = SORTED_DIRECTIONS_LIST.filter(d => d !== oppositeDir);

  let minHeatLoss = Number.POSITIVE_INFINITY;
  for (const newDir of possibleDirs) {
    const sameDir = dir === newDir;
    if (sameDir && lineCount === 3) continue;

    const nextLoss = calcHeatLoss(grid, getNextMatrixPos(pos, newDir), newDir, loss + item.loss, sameDir ? lineCount + 1 : 1, steps + 1, meta);
    if (nextLoss < minHeatLoss) {
      minHeatLoss = nextLoss;
    }
  }

  return minHeatLoss + (dir ? 0 : -item.loss);
};

const run = (lines) => {
  const array = lines.split('\n').filter(Boolean);
  const {grid, meta} = parseGrid(array);
  return calcHeatLoss(grid, {x: 0, y: 0}, undefined, 0, 1, 1, meta);
};

exec('sample.txt', 102, run);
exec('input.txt', 1155, run);
