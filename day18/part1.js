import exec, {DIRECTIONS, DIRECTIONS_LIST, DIRECTIONS_OPPOSITE, getNextMatrixPos} from '../exec.js';

const DIR_MAP = {
  'L': DIRECTIONS.LEFT,
  'R': DIRECTIONS.RIGHT,
  'U': DIRECTIONS.TOP,
  'D': DIRECTIONS.BOTTOM,
}

const IN_MAP = {
  [DIRECTIONS.TOP]: '↑',
  [DIRECTIONS.BOTTOM]: '↓',
  [DIRECTIONS.LEFT]: '←',
  [DIRECTIONS.RIGHT]: '→',
}

const parseInstructions = (array) => {
  return array.map((line) => {
    const [_, ori, count, color] = line.match(/(\w) (\d+) \(#(.+)\)/);
    return {ori, count, color};
  });
};

const addBorder = (item, wallDir) => {
  if (!item.in.includes(wallDir)) {
    item.in.push(wallDir);
  }
};

const findWalls = (grid, path) => {
  path.forEach((pos, index) => {
    const item = grid[pos.y][pos.x];

    if (!item.corner && item.in?.length === 1) return;
    if (item.corner && item.in?.length === 2) return;

    const prevIndex = index === 0 ? path.length - 1 : index - 1;
    const prevPos = path[prevIndex];
    const prevItem = grid[prevPos.y][prevPos.x];

    if (prevItem?.in?.length) {
      if (item.dir === prevItem.dir && item.from === prevItem.from) {
        item.in = prevItem.in;
      } else {
        const oppositeFrom = DIRECTIONS_OPPOSITE[item.from];
        const prevIn = prevItem.in.filter((d) => d !== item.from && d !== oppositeFrom)[0];
        addBorder(item, prevIn);
        if (item.corner) {
          addBorder(item, prevIn === item.dir ? DIRECTIONS_OPPOSITE[item.from] : item.from);
        }
      }
    }
  });
};

const digOuterHoles = (instructions) => {
  const limits = { x: [0, 0], y: [0, 0] };
  const map = {};
  const path = [];
  let pos = {x: 0, y: 0};
  instructions.forEach(({ ori, count, color }) => {
    for (let i = 0; i < count; i += 1) {
      const dir = DIR_MAP[ori];
      map[`${pos.x}:${pos.y}`] = dir;
      path.push(pos);
      pos = getNextMatrixPos(pos, dir);
    }
    if (pos.x < limits.x[0] ) {
      limits.x[0] = pos.x;
    }
    if (pos.x > limits.x[1]) {
      limits.x[1] = pos.x;
    }
    if (pos.y < limits.y[0]) {
      limits.y[0] = pos.y;
    }
    if (pos.y > limits.y[1]) {
      limits.y[1] = pos.y;
    }
  });
  const minY = limits.y[0];
  const minX = limits.x[0];
  const minYAbs = Math.abs(minY);
  const minXAbs = Math.abs(minX);
  const height = minYAbs + limits.y[1] + 1;
  const width = minXAbs + limits.x[1] + 1;

  const grid = new Array(height).fill(0).map(() => new Array(width).fill(undefined));

  let prevItem;
  path.forEach((pos, index) => {
    pos.y += minYAbs;
    pos.x += minXAbs;

    const dir = map[`${pos.x + minX}:${pos.y + minY}`]
    const item = {dir, deep: 0, in: []};

    if (prevItem) {
      item.from = prevItem.dir;
      if (item.dir !== item.from) {
        item.corner = true;
      }
    }
    if (index === path.length - 1) {
      const first = grid[path[0].y][path[0].x];
      first.from = dir;
      if (first.dir !== first.from) {
        first.corner = true;
      }
    }

    if (item.dir !== item.from) {
      item.corner = true;
    }

    if (pos.x === 0) {
      addBorder(item, DIRECTIONS.RIGHT);
    } else if (pos.x === width - 1) {
      addBorder(item, DIRECTIONS.LEFT);
    } else if (pos.y === 0) {
      addBorder(item, DIRECTIONS.BOTTOM);
    } else if (pos.y === height - 1) {
      addBorder(item, DIRECTIONS.TOP);
    }

    grid[pos.y][pos.x] = item;
    prevItem = item;
  });

  findWalls(grid, path);
  findWalls(grid, path);

  return { grid, path };
};

const digNextHoles = (grid, path, deep) => {
  const newHoles = [];
  path.forEach((pos) => {
    const item = grid[pos.y][pos.x];
    const walls = item.in ?? DIRECTIONS_LIST;
    walls.forEach((wall) => {
      const nextToWallPos = getNextMatrixPos(pos, wall);
      const nextToWallItem = grid[nextToWallPos.y][nextToWallPos.x];
      if (!nextToWallItem) {
        newHoles.push(nextToWallPos);
        grid[nextToWallPos.y][nextToWallPos.x] = {deep};
      }
    })
  });

  return newHoles;
};

const digInnerHoles = (grid, path) => {
  let deep = 0;
  let holes = path;
  while (holes.length) {
    deep += 1;
    holes = digNextHoles(grid, holes, deep);
  }

  return deep - 1;
};

const countHoles = (grid) => {
  let count = 0;
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[0].length; x += 1) {
      if (grid[y][x]) {
        count += 1;
      }
    }
  }

  return count;
}

const printGrid = (grid, showIn) => {
  for (let y = 0; y < grid.length; y += 1) {
    let line = [];
    for (let x = 0; x < grid[0].length; x += 1) {
      const item = grid[y][x];
      line.push(item ? showIn && !item.corner && item.deep === 0 ? IN_MAP[item.in[0]] : item.deep : '.');
    }
    console.log(line.join(''));
  }
};

const run = (lines) => {
  const array = lines.split('\n').filter(Boolean);
  const instructions = parseInstructions(array);
  const { grid, path } = digOuterHoles(instructions);
  digInnerHoles(grid, path);
  return countHoles(grid);
};

exec('sample.txt', 62, run);
exec('input.txt', 108909, run);
