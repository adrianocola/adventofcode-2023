import colors from 'colors';
import exec, {DIRECTIONS, DIRECTIONS_OPPOSITE, getNextMatrixPos} from '../exec.js';

const DIR_MAP = {
  '0': DIRECTIONS.RIGHT,
  '1': DIRECTIONS.BOTTOM,
  '2': DIRECTIONS.LEFT,
  '3': DIRECTIONS.TOP,
}

const configureInstructionWall = (instructions, instruction, index) => {
  if (instruction.end.y === 0) {
    instruction.wall = DIRECTIONS.BOTTOM;
  } else if (instruction.end.x === 0) {
    instruction.wall = DIRECTIONS.RIGHT
  } else {
    const prevInstruction = instructions[index === 0 ? instructions.length - 1 : index - 1];
    if (prevInstruction.wall && !instruction.wall) {
      instruction.wall = prevInstruction.wall === instruction.dir ? DIRECTIONS_OPPOSITE[prevInstruction.dir] : prevInstruction.dir;
    }
  }

  return instruction;
};

const configureAllInstructionsWalls = (instructions) => {
  instructions.forEach((instruction, index) => configureInstructionWall(instructions, instruction, index));
  instructions.forEach((instruction, index) => configureInstructionWall(instructions, instruction, index));
};

const parseInstructions = (array) => {
  let pos = {x: 0, y: 0};
  const limits = {x: [0, 0], y: [0,0]};
  const instructions = array.map((line) => {
    const [_, hex, ori] = line.match(/\w \d+ \(#(.{5})(\d)\)/);
    const dir = DIR_MAP[ori];
    const length = parseInt(hex, 16);
    const start = pos;
    const end = getNextMatrixPos(start, dir, length - 1);
    pos = getNextMatrixPos(end, dir);

    if (start.y > limits.y[1] || end.y > limits.y[1]) {
      limits.y[1] = Math.max(start.y, end.y);
    }
    if (start.x > limits.x[1] || end.x > limits.x[1]) {
      limits.x[1] = Math.max(start.x, end.x);
    }
    if (start.y < limits.y[0] || end.y < limits.y[0]) {
      limits.y[0] = Math.min(start.y, end.y);
    }
    if (start.x < limits.x[0] || end.x < limits.x[0]) {
      limits.x[0] = Math.min(start.x, end.x);
    }

    return {dir, length, start, end};
  });

  const minYAbs = Math.abs(limits.y[0]);
  const minXAbs = Math.abs(limits.x[0]);

  return instructions.map((instruction, index) => configureInstructionWall(instructions, {
    ...instruction,
    start: {x: instruction.start.x + minXAbs, y: instruction.start.y + minYAbs},
    end: {x: instruction.end.x + minXAbs, y: instruction.end.y + minYAbs},
  }, index));
};

const checkIfOverlaps = (instructions, rectStart, rectEnd, maxExpected) => {
  const minY = Math.min(rectStart.y, rectEnd.y);
  const maxY = Math.max(rectStart.y, rectEnd.y);
  const minX = Math.min(rectStart.x, rectEnd.x);
  const maxX = Math.max(rectStart.x, rectEnd.x);

  let overlaps = 0;

  for (let i = 0; i < instructions.length; i += 1) {
    const inst = instructions[i];
    if (inst.start.y >= minY && inst.start.y <= maxY && inst.start.x >= minX && inst.start.x <= maxX) {
      overlaps += 1;
    } else if (inst.end.y >= minY && inst.end.y <= maxY && inst.end.x >= minX && inst.end.x <= maxX) {
      overlaps += 1;
    }
  }

  return overlaps > maxExpected;
}

const processSize = (instructions) => {
  let size = 0;
  let index = 2;
  let iter = 0;
  do {
    let removeIndex;

    const inst = instructions[index];
    const oppositeDir = DIRECTIONS_OPPOSITE[inst.dir];

    const indexBefore = (index - 1 + instructions.length) % instructions.length;
    const instBefore = instructions[indexBefore];

    const indexOpposite = (index - 2 + instructions.length) % instructions.length;
    const instOpposite = instructions[indexOpposite];

    if (!instOpposite.length) {
      removeIndex = indexOpposite;
    } else if (inst.dir === instBefore.dir) {
      instBefore.length += inst.length;
      instBefore.end = inst.end;
      removeIndex = index;
    } else if (oppositeDir === instOpposite.dir && instOpposite.wall === instBefore.dir) {
      if (inst.length <= instOpposite.length) {
        const instNextPos = getNextMatrixPos(inst.end, inst.dir);
        const squarePos = getNextMatrixPos(instNextPos, DIRECTIONS_OPPOSITE[instBefore.dir], instBefore.length);
        const overlaps = checkIfOverlaps(instructions, inst.start, squarePos, 4);
        if (!overlaps) {
          const removeSize = inst.length;
          size += inst.length * (instBefore.length + 1);
          // console.log('REMOVED <=', inst.length * (instBefore.length + 1));
          removeIndex = index;

          instOpposite.length -= removeSize;
          instOpposite.end = getNextMatrixPos(instOpposite.end, inst.dir, removeSize);

          instBefore.start = getNextMatrixPos(instBefore.start, inst.dir, removeSize);
          instBefore.end = getNextMatrixPos(instBefore.end, inst.dir, removeSize);
        }
      } else {
        const overlaps = checkIfOverlaps(instructions, inst.start, instOpposite.start, 3);
        if (!overlaps) {
          const removeSize = instOpposite.length;
          size += instOpposite.length * (instBefore.length + 1);
          // console.log('REMOVED >', instOpposite.length * (instBefore.length + 1));
          removeIndex = indexOpposite;

          inst.length -= removeSize;
          inst.start = getNextMatrixPos(inst.start, inst.dir, removeSize);

          instBefore.start = getNextMatrixPos(instBefore.start, inst.dir, removeSize);
          instBefore.end = getNextMatrixPos(instBefore.end, inst.dir, removeSize);
        }
      }
    }

    if (removeIndex !== undefined) {
      // console.log('\ninstsToRemove', instsToRemove);
      instructions = instructions.filter((_, instIndex) => instIndex !== removeIndex);
      index = index % instructions.length;
      // printInstructions(instructions);
    } else {
      index = (index + 1) % instructions.length;
    }

    iter += 1;
  } while(instructions.length > 4);

  const lastSize = (instructions[0].length + 1) * (instructions[1].length + 1);
  // console.log('lastSize', lastSize, instructions);

  return size + lastSize;
};

const printInstructions = (instructions) => {
  const max = {x: 0, y: 0};

  instructions.forEach(({start, end}) => {
    if (start.y > max.y || end.y > max.y) {
      max.y = Math.max(start.y, end.y);
    }
    if (start.x > max.x || end.x > max.x) {
      max.x = Math.max(start.x, end.x);
    }
  });

  const height = max.y + 1;
  const width = max.x + 1;

  const grid = new Array(height).fill('.').map(() => new Array(width).fill('.'));

  instructions.forEach(({start, dir, length}, index) => {
    for (let i = 0; i < length; i += 1) {
      const pos = getNextMatrixPos(start, dir, i);
      if (!grid[pos.y]) console.log(pos, dir, start, i);
      grid[pos.y][pos.x] = index === 0 ? colors.green('!') : index % 2 === 0 ? colors.red('#') : colors.blue('@');
    }
  });

  console.log('INSTRUCTIONS', instructions.length);
  for (let y = 0; y < height; y += 1) {
    let line = [];
    for (let x = 0; x < width; x += 1) {
      line.push(grid[y][x]);
    }
    console.log(line.join(''));
  }
};


const run = (lines) => {
  const array = lines.split('\n').filter(Boolean);
  const instructions = parseInstructions(array);
  configureAllInstructionsWalls(instructions);
  // printInstructions(instructions);
  return processSize(instructions);
};

exec('sample.txt', 952408144115, run);
exec('input.txt', 133125706867777, run);
