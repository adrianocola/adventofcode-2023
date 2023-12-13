import exec from '../exec.js';

const transpose = (array, ofStrings) => {
  const height = array.length;
  const width = array[0].length;
  const newArray = new Array(width).fill(0).map(() => new Array(height).fill(0));
  for (let y = 0; y < height; y++) {
    const row = array[y];
    for (let x = 0; x < width; x++) {
      newArray[x][y] = row[x];
    }
  }

  return ofStrings ? newArray.map((line) => line.join('')) : newArray;
};

const getBlocks = (array) => {
  const blocks = [];
  let i = 0;
  let currentBlock = [];
  do {
    const line = array[i];
    if (!line) {
      if (currentBlock.length) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
    } else {
      currentBlock.push(line);
    }
    i++;
  } while(i < array.length);

  return blocks;
};

const checkPossibleSmudge = (line1, line2) => {
  if (line1 === line2 || !line1 || !line2) return false;

  let foundDiff = false;
  for (let i = 0; i < line1.length; i++) {
    if (line1[i] !== line2[i]) {
      if (foundDiff) return false;
      foundDiff = true;
    }
  }

  return foundDiff;
}

const checkReflectionLine = (block, start) => {
  if (!start) return false;

  const startLine = block[start];
  const prevLine = block[start-1];
  const smudge = checkPossibleSmudge(startLine, prevLine);
  if (startLine !== prevLine && !smudge) return false;

  let lineReflection = start;
  let smudgeFound = smudge;

  for (let y = start + 1; y < block.length; y++) {
    const line = block[y];
    const mirrorIndex = 2 * lineReflection - y - 1;
    if (smudgeFound && mirrorIndex < 0) break;

    let mirrorLine = block[mirrorIndex];

    if (!smudgeFound) {
      const smudge = checkPossibleSmudge(line, mirrorLine);
      if (smudge) {
        mirrorLine = line;
        smudgeFound = true;
      }
    }
    if (line !== mirrorLine) {
      return false;
    }
  }

  return smudgeFound;
};

const calcReflections = (block, transposed) => {
  let lineReflection;
  for (let y = 1; y < block.length; y++) {
    if (checkReflectionLine(block, y)) {
      lineReflection = y;
      break;
    }
  }
  if (lineReflection !== undefined) return transposed ? lineReflection : lineReflection * 100;

  if (!transposed) return calcReflections(transpose(block, true), true);
};

const run = (lines) => {
  const array = lines.split('\n');
  const blocks = getBlocks(array);

  return blocks.reduce((acc, block) => {
    const result = calcReflections(block);
    return acc + result;
  }, 0);
};

exec('sample.txt', 400, run);
exec('input.txt', 37876, run);
