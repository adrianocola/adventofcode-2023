const fs = require('fs');

const GAME_REGEX = /Game (\d+)/;
const CUBE_REGEX = /(\d+) (green|red|blue)/;

const run = (file) => {
  const lines = fs.readFileSync(file, 'utf8');
  const array = lines.split('\n');

  const result = array.map((line) => {
    if (!line) return 0;

    const tokens = line.split(/:|;/);
    const gameId = tokens[0].match(GAME_REGEX)[1];
    const mins = tokens.slice(1).reduce((acc, setText) => {
      const itensTokens = setText.split(',');
      itensTokens.forEach((itemToken) => {
        const match = itemToken.match(CUBE_REGEX);
        const color = match[2];
        const count = parseInt(match[1], 10);
        const max = acc[color] ?? 0;
        if (count > max) {
          acc[color] = count;
        }
      });
      return acc;
    }, {});

    const power = Object.values(mins).reduce((acc, count) => {
      return acc * count;
    }, 1);

    return power;
  });

  const sum = result.reduce((acc, number) => {
    return acc + number;
  }, 0);

  console.log(`RESULT (${file}):`, sum);
};

console.log();
run('sample.txt');
run('input.txt');
