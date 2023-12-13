import exec from '../exec.js';

const transpose = (array) => {
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

const calcExpandedRows = (array) => {
  const expandedRows = new Array(array.length).fill(0);

  for (let y = 0; y < array.length; y++) {
    const row = array[y];
    const isEmpty = row.every((i) => i === '.');
    if (isEmpty) {
      expandedRows[y] = 1;
    }
  }

  return expandedRows;
};

const mapGalaxies = (array) => {
  const galaxies = [];
  for (let y = 0; y < array.length; y++) {
    const row = array[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '#') {
        galaxies.push({x, y});
      }
    }
  }

  return galaxies;
};

const calcGalaxiesDistance = (galaxy, otherGalaxy, expandedRows, expandedColumns, rate) => {
  const minY = Math.min(galaxy.y, otherGalaxy.y);
  const maxY = Math.max(galaxy.y, otherGalaxy.y);
  const minX = Math.min(galaxy.x, otherGalaxy.x);
  const maxX = Math.max(galaxy.x, otherGalaxy.x);

  let distanceY = 0;
  let distanceX = 0;
  for (let y = minY; y < maxY; y++) {
    distanceY += expandedRows[y] ? rate : 1;
  }
  for (let x = minX; x < maxX; x++) {
    distanceX += expandedColumns[x] ? rate : 1;
  }

  return distanceX + distanceY;
}

const calcAllGalaxiesDistances = (galaxies, expandedRows, expandedColumns, rate) => {
  let distancies = 0;
  for (let i = 0; i < galaxies.length; i++) {
    const galaxy = galaxies[i];
    for (let j = i + 1; j < galaxies.length; j++) {
      const otherGalaxy = galaxies[j];
      distancies += calcGalaxiesDistance(galaxy, otherGalaxy, expandedRows, expandedColumns, rate);
    }
  }

  return distancies;
};

const run = (lines, rate) => {
  const array = lines.split('\n').filter(Boolean).map((line) => {
    return Array.from(line);
  });

  const expandedRows = calcExpandedRows(array);
  const expandedColumns = calcExpandedRows(transpose(array));
  const galaxies = mapGalaxies(array);
  return calcAllGalaxiesDistances(galaxies, expandedRows, expandedColumns, rate)
};

exec('sample.txt', 374, run, 2);
exec('sample.txt', 1030, run, 10);
exec('sample.txt', 8410, run, 100);
exec('input.txt', 406725732046, run, 1000000);

