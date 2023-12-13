import run from '../run.js';

const calcPossibleArrangements = (line, records) => {
  if (!line) {
    return records.length === 0 ? 1 : 0;
  }
  if (!records.length) {
    return line.includes('#') ? 0 : 1;
  }

  let result = 0;
  const firstChar = line[0];
  if (firstChar === '.' || firstChar === '?') {
    result += calcPossibleArrangements(line.substring(1), records);
  }
  if (firstChar === '#' || firstChar === '?') {
    const firstRecord = records[0];
    if (
      line.length >= firstRecord // line have the whole record
      && !line.substring(0, firstRecord).includes('.') // slice includes only damaged parts or unknown parts
      && (firstRecord === line.length || line[firstRecord] !== '#') // exacly the whole record or part after the slice is not damaged
    ) {
      result += calcPossibleArrangements(line.substring(records[0] + 1), records.slice(1));
    }
  }

  return result;
};

const fn = (lines) => {
  const array = lines.split('\n').filter(Boolean);

  return array.reduce((acc, line) => {
    const split = line.split(' ');
    const parts = split[0];
    const records = split[1].split(',').map((r) => parseInt(r, 10));
    const result = calcPossibleArrangements(parts, records);
    return acc + result;
  }, 0);
};

run('sample.txt', 21, fn);
run('input.txt', 7404, fn);

// Given up, I've used the solution from https://www.youtube.com/watch?v=g3Ms5e7Jdqo
