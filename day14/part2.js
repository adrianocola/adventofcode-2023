import exec from '../exec.js';

const calcIndex = (array, dir) => {
  return array.map((line) => line.join(',')).join(':') + '|' + dir;
};

// 1 = ⬆️, 2 = ⬅️, 3 = ⬇️, 4 = ➡️
const tiltToDirection = (array, dir) => {
  const height = array.length;
  const width = array[0].length;
  const newArray = new Array(height).fill('.').map(() => new Array(width).fill('.'));

  const dirVertical = dir % 2 === 1;
  const dirPositive = dir < 3;

  const axis1Property = dirVertical ? width : height;
  const axis2Property = dirVertical ? height : width;

  const axis1Start = 0;
  const axis1End = axis1Property;

  const axis2Start = dirPositive ? axis2Property - 1 : 0;
  const axis2End = dirPositive ? 0 : axis2Property;

  const axis2Step = dirPositive ? -1 : 1;

  // exec.log({ axis1Start, axis1End, axis2Start, axis2End, dirVertical, dirPositive, axis2Step });

  for (let axis1 = axis1Start; axis1 < axis1End; axis1++) {
    let rockCount = 0;
    for (let axis2 = axis2Start; axis2Step === 1 ? axis2 < axis2End : axis2 >= axis2End; axis2 += axis2Step) {
      const y = dirVertical ? axis2 : axis1;
      const x = dirVertical ? axis1 : axis2;
      const nextY = dirVertical ? axis2 + axis2Step : axis1;
      const nextX = dirVertical ? axis1 : axis2 + axis2Step;
      const item = array[y][x];
      const nextItem = array[nextY]?.[nextX];

      if (item === 'O') {
        rockCount++;
      } else {
        newArray[y][x] = item;
      }

      if (rockCount && (!nextItem || nextItem === '#')) {
        for (let i = 0; i < rockCount; i++) {
          const newY = dirVertical ? y - (i * axis2Step) : y;
          const newX = dirVertical ? x : x - (i * axis2Step);
          newArray[newY][newX] = 'O';
        }
        rockCount = 0;
      }
    }
  }

  return newArray;
};

const weightStones = (array) => {
  let weight = 0;
  for (let y = 0; y < array.length; y++) {
    const stones = array[y].filter((it) => it === 'O').length;
    weight += stones * (array.length - y);
  }
  return weight;
}

const count = 1000000000;
const run = (lines) => {
  const array = lines.split('\n').filter(Boolean).map((line) => line.split(''));
  const resultsMap = {};
  let tilted = array;
  let found = false;
  for (let i = 0; i < count; i += 1) {
    for (let d = 0; d < 4; d += 1) {
      tilted = tiltToDirection(tilted, d + 1);
    }

    if (!found)  {
      const index = calcIndex(tilted, 4)
      // check if detected a loop
      const loopIndex = resultsMap[index];
      if (loopIndex !== undefined) {
        found = true;
        const diff = i - loopIndex;
        // fast forward if known loop
        i = Math.floor(count / diff - 1) * diff + loopIndex;
      }
      resultsMap[index] = i;
    }

  }
  // exec.log(tilted.map((r) => r.join('')).join('\n'));

  return weightStones(tilted);
};

exec('sample.txt', 64, run);
exec('input.txt', 95736, run);
