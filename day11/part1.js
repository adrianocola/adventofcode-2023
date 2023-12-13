import exec from '../exec.js';

const transpose = (array, reverse) => {
  const height = array.length;
  const width = array[0].length;
  const newArray = new Array(width).fill(0).map(() => new Array(height).fill(0));
  for (let y = 0; y < height; y++) {
    const row = array[y];
    for (let x = 0; x < width; x++) {
      newArray[x][y] = row[x];
    }
  }

  return newArray;
};

const expandUniverse = (array) => {
  const galaxy = [];
  for (let y = 0; y < array.length; y++) {
    const row = array[y];
    const isEmpty = row.every((i) => i === '.');
    if (isEmpty) {
      galaxy.push([...row]);
    }
    galaxy.push([...row]);
  }

  return galaxy;
};

const mapGalaxies = (universe) => {
  const galaxies = [];
  for (let y = 0; y < universe.length; y++) {
    const row = universe[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '#') {
        galaxies.push({x, y});
      }
    }
  }

  return galaxies;
};

const calcGalaxiesDistances = (galaxies) => {
  let distancies = 0;
  for (let i = 0; i < galaxies.length; i++) {
    const galaxy = galaxies[i];
    for (let j = i + 1; j < galaxies.length; j++) {
      const otherGalaxy = galaxies[j];
      const offsetX = Math.abs(galaxy.x - otherGalaxy.x);
      const offsetY = Math.abs(galaxy.y - otherGalaxy.y);
      distancies += offsetX + offsetY;
    }
  }

  return distancies;
};

const run = (lines) => {
  const array = lines.split('\n').filter(Boolean).map((line) => {
    return Array.from(line);
  });

  const universeIter1 = expandUniverse(array);
  const transposedIter1 = transpose(universeIter1);
  const universeIter2 = expandUniverse(transposedIter1);
  const universe = transpose(universeIter2);

  const galaxies = mapGalaxies(universe);
  return calcGalaxiesDistances(galaxies)
};

exec('sample.txt', 374, run);
exec('input.txt', 9545480, run);

