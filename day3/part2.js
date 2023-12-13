import exec from '../exec.js';

const createEngineMap = (lines) => {
  const array = lines.split('\n');
  const numbersMap = {};
  let nextNumberId = 1;

  const engineMap = array.map((line) => {
    const lineParts = [];
    let numberParts = [];
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const isNumber = !!char.match(/\d/);
      if (isNumber) {
        numberParts.push(char);
      }

      if ((!isNumber || i === line.length - 1) && numberParts.length) {
        const numberId = nextNumberId++;
        const number = parseInt(numberParts.join(''), 10);
        for (let j = 0; j < numberParts.length; j++) {
          lineParts[j + i - numberParts.length] = numberId;
        }
        numbersMap[numberId] = number;
        numberParts = [];
      }

      lineParts.push(char);
    }

    return lineParts;
  });

  return {engineMap, numbersMap};
};

const getNumbersAdjacent = (map, numMap, posX, posY) => {
  const numbers = [];
  const foundNumbers = {};
  for (let y = posY - 1; y <= posY + 1; y++) {
    for (let x = posX - 1; x <= posX + 1; x++) {
      if (y === posY && x === posX) continue;
      if (typeof map[y]?.[x] === 'number') {
        const numberId = map[y][x];
        if (!foundNumbers[numberId]) {
          numbers.push(numMap[numberId]);
          foundNumbers[numberId] = true;
        }
      }
    }
  }
  return numbers;
};

const run = (lines) => {
  const {engineMap, numbersMap} = createEngineMap(lines);

  let sum = 0;
  for (let y = 0; y < engineMap.length; y++) {
    const engineLine = engineMap[y];
    for (let x = 0; x < engineLine.length; x++) {
      const char = engineLine[x];
      if (char !== '*') continue;

      const numbersAdjacent = getNumbersAdjacent(engineMap, numbersMap, x, y);
      if (numbersAdjacent.length === 2) {
        sum += numbersAdjacent[0] * numbersAdjacent[1];
      }
    }
  }

  return sum;
};

exec('sample.txt', 467835, run);
exec('input.txt',69527306, run);
