import run from '../run.js';

const cache = {};

const calcPossibleArrangements = (line, records) => {
  if (!line) {
    return records.length === 0 ? 1 : 0;
  }
  if (!records.length) {
    return line.includes('#') ? 0 : 1;
  }

  const paramsStr = `${line}-${records.join(',')}`;
  if (cache[paramsStr] !== undefined) return cache[paramsStr];

  let result = 0;
  const firstChar = line[0];
  if (firstChar === '.' || firstChar === '?') {
    result += calcPossibleArrangements(line.substring(1), records);
  }
  if (firstChar === '#' || firstChar === '?') {
    const firstRecord = records[0];
    if (line.length >= firstRecord && !line.substring(0, firstRecord).includes('.') && (firstRecord === line.length || line[firstRecord] !== '#')) {
      result += calcPossibleArrangements(line.substring(records[0] + 1), records.slice(1));
    }
  }

  cache[paramsStr] = result;

  return result;
};

const fn = (lines) => {
  const array = lines.split('\n').filter(Boolean);

  return array.reduce((acc, line, i) => {
    const [partsStr, recordsStr] = line.split(' ');
    const parts = new Array(5).fill(0).map(() => partsStr).join('?');
    const records = new Array(5).fill(0).map(() => recordsStr).join(',').split(',').map((r) => parseInt(r, 10));
    const result = calcPossibleArrangements(parts, records);
    return acc + result;
  }, 0);
};

run('sample.txt', 525152, fn);
run('input.txt', 3384337640277, fn);

// sulution 1 + cache
