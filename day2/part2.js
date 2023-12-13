import exec from '../exec.js';

const GAME_REGEX = /Game (\d+)/;
const CUBE_REGEX = /(\d+) (green|red|blue)/;

const run = (lines) => {
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

  return result.reduce((acc, number) => {
    return acc + number;
  }, 0);
};

exec('sample.txt', 2286, run);
exec('input.txt', 83105, run);
