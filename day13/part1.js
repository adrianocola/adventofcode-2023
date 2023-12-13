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

const calcReflections = (block, transposed) => {
  let lineReflection;
  let lineCompleteReflection = false;
  for (let y = 0; y < block.length; y++) {
    const line = block[y];
    if (lineCompleteReflection) {
      const mirrorIndex = 2 * lineReflection - y - 1;
      if (mirrorIndex < 0) break;
      if (line !== block[mirrorIndex]) {
        lineCompleteReflection = false;
      }
    } else if (y && line === block[y-1]) {
      lineReflection = y;
      lineCompleteReflection = true;
    }
  }
  if (lineCompleteReflection) return transposed ? lineReflection : lineReflection * 100;

  if (!transposed) return calcReflections(transpose(block, true), true);

  return undefined;
};

const run = (lines) => {
  const array = lines.split('\n');
  const blocks = getBlocks(array);

  return blocks.reduce((acc, block) => {
    const result = calcReflections(block);
    return acc + result;
  }, 0);
};

exec('sample.txt', 405, run);
exec('input.txt', 30802, run);
