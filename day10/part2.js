const fs = require('fs');
const colors = require('colors');

const ORTOGONAL_DIRECTIONS = [1, -1, 2, -2];

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

const PIPE_CORNER_MAP = {
  'L': true,
  'J': true,
  '7': true,
  'F': true,
};

const applyPosOffset = (pos, dir) => {
  const offset = DIRECTION_OFFSET[dir];
  return {x: pos.x + offset.x, y: pos.y + offset.y};
};

const getStartingPipeType = (lines, pos) => {
  const matchingPos = ORTOGONAL_DIRECTIONS.filter((dir) => {
    const adjPos = applyPosOffset(pos, dir);
    const adjPipe = lines[adjPos.y]?.[adjPos.x]?.pipe;
    if (!adjPipe || !PIPE_POS_MAP[adjPipe]) return false;

    return PIPE_POS_MAP[adjPipe].includes(dir * -1);
  });

  const mapPosEntry = Object.entries(PIPE_POS_MAP).find(([pipe, dirs]) => {
    return dirs.every((dir) => matchingPos.includes(dir));
  });

  if (!mapPosEntry) throw new Error('Unknown starting pipe');

  const pipe = mapPosEntry[0];
  lines[pos.y][pos.x].pipe = pipe;
  lines[pos.y][pos.x].start = true;
  return pipe;
};

const findStartingPos = (lines) => {
  const width = lines[0].length;
  const height = lines.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x ++) {
      if (lines[y]?.[x]?.pipe === 'S') {
        return {x, y};
      }
    }
  }
};

const pathIndex = (pos) => `${pos.x}:${pos.y}`;

const processMap = (lines, startingPos) => {
  let pos = startingPos;
  let fromDirection = 0;
  let pathMap = {};
  let pathArray = [];
  let step = 0;

  while(pos){
    pathMap[pathIndex(pos)] = true;
    pathArray.push(pos);

    const node = lines[pos.y]?.[pos.x];
    const pipe = node?.pipe;
    const directions = PIPE_POS_MAP[pipe];
    const otherDirection = directions.find((dir) => dir !== fromDirection);
    node.path = step++;
    node.from = fromDirection;

    pos = applyPosOffset(pos, otherDirection);
    fromDirection = otherDirection * -1;
    if (pos.x === startingPos.x && pos.y === startingPos.y) {
      break;
    }
  }

  return { pathMap, pathArray };
}

const isTouchingAny = (lines, pos, touching) => {
  return ORTOGONAL_DIRECTIONS.some((dir) => {
    const adjPos = applyPosOffset(pos, dir);
    const adjNode = lines[adjPos.y]?.[adjPos.x];
    const adjPipe = adjNode?.pipe;
    return touching.some((item) => {
      if (item === 'facingWall') {
        return adjNode?.walls?.includes(dir * -1);
      }
      return item === adjPipe || !!adjNode?.[item];
    });
  });
};

const spreadProperty = (lines, initialPos, pathMap, property) => {
  const processedMap = {};
  let positions = [initialPos];
  while(positions.length) {
    const nextPositions = [];
    positions.forEach((pos) => {
      const index = pathIndex(pos);
      if (pathMap[index] || processedMap[index]) return;

      const node = lines[pos.y]?.[pos.x];
      node[property] = true;
      processedMap[index] = true;

      ORTOGONAL_DIRECTIONS.forEach((dir) => {
        const adjPos = applyPosOffset(pos, dir);
        const adjNode = lines[adjPos.y]?.[adjPos.x];
        const adjIndex = pathIndex(adjPos);
        if (adjNode && !pathMap[adjIndex] && !processedMap[adjIndex]) {
          nextPositions.push(adjPos);
        }
      });
    });
    positions = nextPositions;
  }

  return processedMap;
};

const processExternalPipes = (lines, pathMap) => {
  const width = lines[0].length;
  const height = lines.length;
  let processedMap = {};

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x ++) {
      const index = pathIndex({x, y});
      if (pathMap[index] || processedMap[index]) continue;

      const pos = {x, y};
      if (isTouchingAny(lines, pos, [undefined, 'out'])) {
        const processed = spreadProperty(lines, pos, pathMap, 'out');
        processedMap = {...processedMap, ...processed};
      }
    }
  }
};

const addNodeWall = (node, wallDir) => {
  const walls = node.walls ?? [];
  if (walls.includes(wallDir)) return;

  if (PIPE_CORNER_MAP[node.pipe]) {
    const dirs = PIPE_POS_MAP[node.pipe];
    const inside = dirs.includes(wallDir);
    dirs.forEach((cornerDir) => {
      walls.push(inside ? cornerDir : cornerDir * -1);
    });
  } else {
    walls.push(wallDir);
  }

  node.walls = walls;
};

const processPipeLoopWalls = (lines, pathArray) => {
  // process pipes touching outside tiles
  pathArray.forEach((pos) => {
    const node = lines[pos.y][pos.x];
    ORTOGONAL_DIRECTIONS.forEach((dir) => {
      const adjPos = applyPosOffset(pos, dir);
      const adjNode = lines[adjPos.y]?.[adjPos.x];
      const adjPipe = adjNode?.pipe;

      if (!adjPipe || adjNode?.out) {
        addNodeWall(node, dir * -1);
      }
    });
  });

  let pendingCount = pathArray.filter((pos) => !lines[pos.y][pos.x].walls).length;
  let step = 0;
  // loop until all path pipes know their walls
  while(pendingCount) {
    const pos = pathArray[step];
    const node = lines[pos.y][pos.x];
    if (!node.walls) {
      const prevPos = node.start ? pathArray[pathArray.length - 1] : pathArray[step - 1];
      const prevNode = lines[prevPos.y]?.[prevPos.x];
      if (prevNode?.walls?.length) {
        const axis = prevNode?.walls.find((w) => {
          return Math.abs(w) !== Math.abs(node.from);
        });
        addNodeWall(node, axis);
        pendingCount -= 1;
      }
    }

    step = (step + 1) % pathArray.length;
  }
};

const processInternalEnclosures = (lines, pathMap) => {
  const width = lines[0].length;
  const height = lines.length;
  let processedMap = {};

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x ++) {
      const index = pathIndex({x, y});
      if (pathMap[index]) continue;

      const node = lines[y][x];
      if (node?.out || node?.enclosure) continue;

      const pos = {x, y};
      if (isTouchingAny(lines, {x, y}, ['enclosure', 'facingWall'])) {
        const processed = spreadProperty(lines, pos, pathMap, 'enclosure');
        processedMap = {...processedMap, ...processed};
      }
    }
  }
};

const countEnclosures = (array) => {
  return array.reduce((acc, line) => {
    return acc + line.reduce((acc, node) => {
      return acc + (node.enclosure ? 1 : 0);
    }, 0);
  }, 0);
}

const print = (array) => {
  array.forEach((line) => console.log(line.map(({pipe, path, enclosure, out, walls}) => {
    // if (path === 0) return colors.yellow(pipe);
    if (walls?.length) {
      if (walls.includes(1) && walls.includes(2)) return colors.cyan('↳');
      if (walls.includes(1) && walls.includes(-2)) return colors.cyan('↲');
      if (walls.includes(-1) && walls.includes(2)) return colors.cyan('↱');
      if (walls.includes(-1) && walls.includes(-2)) return colors.cyan('↰');
      if (walls[0] === 1) return colors.cyan('↑');
      if (walls[0] === 2) return colors.cyan('→');
      if (walls[0] === -1) return colors.cyan('↓');
      if (walls[0] === -2) return colors.cyan('←');
    }
    if (path !== undefined) return colors.magenta(pipe);
    if (enclosure) return colors.green(pipe);
    if (out) return colors.red(pipe);
    return pipe;
  }).join('')));
}

const run = (file) => {
  const lines = fs.readFileSync(file, 'utf8');
  const array = lines
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      return Array.from(line).map((c) => ({ pipe: c }));
    });

  const startingPos = findStartingPos(array);
  getStartingPipeType(array, startingPos);
  const { pathMap, pathArray } = processMap(array, startingPos);
  processExternalPipes(array, pathMap);
  processPipeLoopWalls(array, pathArray);
  processInternalEnclosures(array, pathMap);
  const result = countEnclosures(array);

  // print(array);

  console.log(`RESULT (${file}):`, result);
};

console.log();
// run('sample1.txt');
// run('sample2.txt');
// run('sample3.txt');
run('sample4.txt');
run('sample5.txt');
run('sample6.txt');
run('input.txt');

// FINAL ALGORITHM:
//   1. map the main loop
//   2. find areas touching the borders and the main loop pipes
//   3. for those pipes touching the outside tiles, determine the side of the pipe that is in and out
//   4. extrapolate that to the rest of the loop (simply looking the previous pipe side)
