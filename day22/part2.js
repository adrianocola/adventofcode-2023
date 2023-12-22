import exec from '../exec.js';

const parseBricks = (array) => {
  let size = {x: 0, y: 0, z: 0};
  const bricks = array.map((line, index) => {
    const [start, end] = line.split('~');
    const startSplit = start.split(',');
    const endSplit = end.split(',');
    const brick = {
      index: index + 1,
      start: {
        x: parseInt(startSplit[0], 10),
        y: parseInt(startSplit[1], 10),
        z: parseInt(startSplit[2], 10),
      },
      end: {
        x: parseInt(endSplit[0], 10),
        y: parseInt(endSplit[1], 10),
        z: parseInt(endSplit[2], 10),
      }
    };

    brick.height = brick.end.z - brick.start.z + 1;

    if (brick.end.x > size.x) size.x = brick.end.x;
    if (brick.end.y > size.y) size.y = brick.end.y;
    if (brick.end.z > size.z) size.z = brick.end.z;

    return brick;
  }).sort((brick1, brick2) => brick1.start.z - brick2.start.z);

  const bricksMap = {};
  bricks.forEach((brick) => {
    bricksMap[brick.index] = brick;
  });

  return { bricks, bricksMap, size};
};

const create3DMap = (size) => {
  return new Array(size.z + 1).fill(0)
    .map(() => new Array(size.y + 1).fill(0)
      .map(() => new Array(size.x + 1).fill(0)));
};

const findBrickSettleHeight = (map, brick, bricksMap) => {
  const supportedBy = {};
  let height = 0;
  for (let z = brick.start.z - 1; z > 0; z -= 1) {
    for (let y = brick.start.y; y <= brick.end.y; y += 1) {
      for (let x = brick.start.x; x <= brick.end.x; x += 1) {
        const value = map[z][y][x];
        if (value) {
          height = z + 1;
          supportedBy[value] = true;
        }
      }
    }
    if (height) break;
  }

  if (height) {
    brick.supportedBy = Object.keys(supportedBy);
    brick.supportedBy.forEach((brickIndex) => {
      const supportedByBrick = bricksMap[brickIndex];
      const supports = supportedByBrick.supports ?? [];
      supports.push(brick.index);
      supportedByBrick.supports = supports;
    })
    return height;
  }

  return 1;
};

const settleBrinkOnTheMap = (map, brick, height) => {
  for (let z = 0; z <= brick.end.z - brick.start.z; z += 1) {
    for (let y = brick.start.y; y <= brick.end.y; y += 1) {
      for (let x = brick.start.x; x <= brick.end.x; x += 1) {
        map[z + height][y][x] = brick.index;
      }
    }
  }

  brick.settle = height;
};


const fallBricks = (map, bricks, bricksMap) => {
  bricks.forEach((brick) => {
    const settleHeight = findBrickSettleHeight(map, brick, bricksMap);
    settleBrinkOnTheMap(map, brick, settleHeight);
  });
};

const calculateBrickDisintegrationChain = (brick, bricksMap) => {
  const allThatFalls = {[brick.index]: true};
  let falling = {[brick.index]: brick};
  do {
    let newFalling = {};
    Object.values(falling).forEach((fallingBrick) => {
      fallingBrick.supports?.forEach((brickIndex) => {
        const supportedBrick = bricksMap[brickIndex];
        if (supportedBrick.supportedBy?.every((supportedByIndex) => allThatFalls[supportedByIndex])) {
          allThatFalls[supportedBrick.index] = supportedBrick;
          newFalling[supportedBrick.index] = supportedBrick;
        }
      });
      falling = newFalling;
    });
  } while (Object.keys(falling).length);

  return Object.keys(allThatFalls).length - 1;
}

const countBricksThatWouldFall = (map, bricks, bricksMap) => {
  return bricks.reduce((acc, brick) => {
    return acc + calculateBrickDisintegrationChain(brick, bricksMap);
  }, 0);
};

const run = (lines) => {
  const array = lines.split('\n').filter(Boolean);
  const {bricks, bricksMap, size} = parseBricks(array);
  const map = create3DMap(size);
  fallBricks(map, bricks, bricksMap);
  return countBricksThatWouldFall(map, bricks, bricksMap);
};

exec('sample.txt', 7, run);
exec('input.txt', 102770, run);
