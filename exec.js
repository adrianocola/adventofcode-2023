import {
  Worker, isMainThread, parentPort, workerData,
} from 'node:worker_threads';
import fs from 'node:fs';
import ora from 'ora';
import colors from 'colors';

let spinnerInstance;

const originalConsoleLog = console.log;
console.log = (...args) => {
  if (spinnerInstance) {
    spinnerInstance.clear();
    spinnerInstance.frame();
  }
  originalConsoleLog(...args);
};

const exec = (file, expected, fn, ...params) => {
  const fileWithParams = `${file}${params.length ? ` (${params.join(',')})` : ''}`;
  const lines = fs.readFileSync(file, 'utf8');
  const spinner = ora(fileWithParams).start();
  spinnerInstance = spinner;
  const start = Date.now();
  const result = fn(lines, ...params);

  const duration = Date.now() - start;
  let durationText = `${duration}ms`
  if (duration > 2000) {
    durationText = `${(duration / 1000).toFixed(1)}s`
  }
  const success = result === expected;

  const color = success ? colors.green : colors.red;
  if (success) {
    spinner.succeed(color(`${fileWithParams}: ${colors.brightWhite(result)} ${colors.grey(durationText)}`));
  } else {
    spinner.fail(color(`${fileWithParams}: ${colors.green(`${expected}`)} ${colors.red(`${result}`)} ${colors.grey(durationText)}`));
  }
  spinnerInstance = undefined;
};

export const transpose = (array, joinStrings) => {
  const height = array.length;
  const width = array[0].length;
  const newArray = new Array(width).fill(0).map(() => new Array(height).fill(0));
  for (let y = 0; y < height; y++) {
    const row = array[y];
    for (let x = 0; x < width; x++) {
      newArray[x][y] = row[x];
    }
  }

  return joinStrings ? newArray.map((line) => line.join('')) : newArray;
};

export const isEqualDeep = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqualDeep(a[i], b[i])) return false;
    }
    return true;
  } else if (typeof a === 'object' && typeof b === 'object') {
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    for (const key of keys) {
      if (!isEqualDeep(a[key], b[key])) return false;
    }
    return true;
  }
  return a === b;
};

export const DIRECTIONS = {
  TOP: 1,
  LEFT: 2,
  BOTTOM: 3,
  RIGHT: 4,
};

export const getNextMatrixPos = (pos, dir) => {
  if (dir === 1) {
    return {x: pos.x, y: pos.y - 1};
  }
  if (dir === 2) {
    return {x: pos.x - 1, y: pos.y};
  }
  if (dir === 3) {
    return {x: pos.x, y: pos.y + 1};
  }
  if (dir === 4) {
    return {x: pos.x + 1, y: pos.y};
  }
};

export const iterMatrixRow = (matrix, row, reverse, fn) => {
  if (typeof reverse === 'function') {
    fn = reverse;
    reverse = false;
  }

  const width = matrix[0].length;

  const start = reverse ? width - 1 : 0;
  const end = reverse ? 0 : width - 1;
  const step = reverse ? - 1 : 1;

  for (let x = start; reverse ? x >= end : x <= end; x += step) {
    const result = fn(matrix[row]?.[x], x, row);
    if (result === false) break;
  }
};

export const iterMatrixColumn = (matrix, column, reverse, fn) => {
  if (typeof reverse === 'function') {
    fn = reverse;
    reverse = false;
  }

  const height = matrix.length;

  const start = reverse ? height - 1 : 0;
  const end = reverse ? 0 : height - 1;
  const step = reverse ? - 1 : 1;

  for (let y = start; reverse ? y >= end : y <= end; y += step) {
    const result = fn(matrix[y]?.[column], y, column);
    if (result === false) break;
  }
};

export default exec;
