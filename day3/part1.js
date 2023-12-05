const fs = require('fs');

const createEngineMap = (file) => {
  const lines = fs.readFileSync(file, 'utf8');
  const array = lines.split('\n');

  return array.map((line) => {
    return [...line].map((char) => {
      if (char === '.') return undefined;
      if (char.match(/\d/)) return parseInt(char, 10);
      return char;
    });
  });
};

const isAdjacentToSymbol = (map, posX, posY) => {
  for (let y = posY - 1; y <= posY + 1; y++) {
    for (let x = posX - 1; x <= posX + 1; x++) {
      if (y === posY && x === posX) continue;
      if (typeof map[y]?.[x] === 'string') return true;
    }
  }
};

const run = (file) => {
  const engineMap = createEngineMap(file);

  let sum = 0;
  for (let y = 0; y < engineMap.length; y++) {
    const engineLine = engineMap[y];
    let numberStr = '';
    let validNumber = false;
    for (let x = 0; x < engineLine.length; x++) {
      const char = engineLine[x];

      if (typeof char !== 'number') {
        if (validNumber) {
          sum += parseInt(numberStr, 10);
        }

        numberStr = '';
        validNumber = false;
        continue;
      }

      numberStr += char;

      if (isAdjacentToSymbol(engineMap, x, y)) {
        validNumber = true;
      }

      if (validNumber && x === engineLine.length - 1) {
        sum += parseInt(numberStr, 10);
      }
    }
  }

  console.log(`RESULT (${file}):`, sum);
};

console.log();
run('sample.txt');
run('input.txt');
