const fs = require('fs');

const run = (file) => {
  const lines = fs.readFileSync(file, 'utf8');
  const array = lines.split('\n');
  const time = parseInt(array[0].split(/\s+/).slice(1).join(''), 10);
  const distance = parseInt(array[1].split(/\s+/).slice(1).join(''), 10);
  let waysToBeat = 0;

  const middleTime = Math.floor(time / 2);
  for (let j = middleTime + 1; j < time - 1; j++) {
    if (j * (time - j) <= distance) break;
    waysToBeat += 1;
  }
  for (let j = middleTime; j >=1; j--) {
    if (j * (time - j) <= distance) break;
    waysToBeat += 1;
  }

  console.log(`RESULT (${file}):`, waysToBeat);
};

console.log();
run('sample.txt');
run('input.txt');
