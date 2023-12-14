import fs from 'node:fs';
import ora from 'ora';
import colors from 'colors';

const exec = (file, expected, fn, ...params) => {
  const fileWithParams = `${file}${params.length ? ` (${params.join(',')})` : ''}`;
  const lines = fs.readFileSync(file, 'utf8');
  const spinner = ora(fileWithParams).start();
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
    spinner.fail(color(`${fileWithParams}: ${colors.green(`+${expected}`)} ${colors.red(`-${result}`)} ${colors.grey(durationText)}`));
  }
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

let firstLog = true;
exec.log = (...msg) => {
  if (firstLog) {
    console.log();
    firstLog = false;
  }
  console.log(...msg);
};

export default exec;
