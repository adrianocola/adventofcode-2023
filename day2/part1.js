const fs = require('fs');

const GAME_REGEX = /Game (\d+)/;
const CUBE_REGEX = /(\d+) (green|red|blue)/;

const MAX = {
  red: 12,
  green: 13,
  blue: 14,
};

const run = (file) => {
  const lines = fs.readFileSync(file, 'utf8');
  const array = lines.split('\n');

  const result = array.map((line) => {
    if (!line) return 0;

    const tokens = line.split(/:|;/);
    const gameId = tokens[0].match(GAME_REGEX)[1];
    const possible = tokens.slice(1).every((setText) => {
      const itensTokens = setText.split(',');
      return itensTokens.every((itemToken) => {
        const match = itemToken.match(CUBE_REGEX);
        const color = match[2];
        const count = parseInt(match[1], 10);
        return count <= MAX[color];
      });
    });
    return possible ? parseInt(gameId, 10) : 0;
  });

  const sum = result.reduce((acc, number) => {
    return acc + number;
  }, 0);

  console.log(`RESULT (${file}):`, sum);
};

console.log();
run('sample.txt');
run('input.txt');
