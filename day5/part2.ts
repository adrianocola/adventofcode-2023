import exec from '../exec.js';

interface SeedRange {
  start: number;
  length: number;
}

class MapRange {
  readonly source: number;
  readonly destination: number;
  readonly length: number;

  constructor(source: number, destination: number, length: number) {
    this.source = source;
    this.destination = destination;
    this.length = length;
  }

  isInRange = (source: number): boolean => {
    return source >= this.source && source < this.source + this.length;
  }

  getOutput = (source: number): number => {
    return (source - this.source) + this.destination;
  }
}

class FarmMap {
  private ranges: MapRange[] = [];
  private readonly nextMap?: FarmMap;
  private lastUsedRange?: MapRange;

  constructor(nextMap?: FarmMap) {
    this.nextMap = nextMap;
  }

  public addRange = (line: string): void => {
    const [destination, source, length] = line.split(' ');

    this.ranges.push(new MapRange(
      parseInt(source, 10),
      parseInt(destination, 10),
      parseInt(length, 10)
    ));
  }

  public findOutput = (source: number): number => {
    const range = this.lastUsedRange?.isInRange(source)
      ? this.lastUsedRange
      : this.ranges.find((range) => range.isInRange(source));

    this.lastUsedRange = range;

    const destination = range ? range.getOutput(source) : source;
    return this.nextMap ? this.nextMap.findOutput(destination) : destination;
  }
}

class Farm {
  private firstFarmMap: FarmMap;
  private seedRanges: SeedRange[];

  constructor(linesArray: string[]) {
    this.firstFarmMap = this.generateFarmsMapTree(linesArray);
    this.seedRanges = this.generateSeedRanges(linesArray[0]);
  }

  private generateFarmsMapTree = (linesArray: string[]) => {
    let farmMap: FarmMap;
    linesArray.slice(2).filter((l) => !!l).reverse().forEach((line, index, array) => {
      if (index === array.length - 1) return;

      if (line.endsWith('map:')) {
        farmMap = new FarmMap(farmMap);
      } else {
        if (!farmMap) {
          farmMap = new FarmMap(farmMap);
        }
        farmMap.addRange(line);
      }
    });

    return farmMap!;
  };

  private generateSeedRanges = (seedsLine: string) => {
    const ranges = seedsLine.split(' ').slice(1).map((item) => parseInt(item, 10));
    const seedRanges: SeedRange[] = [];
    for (let i = 0; i < ranges.length; i += 2) {
      seedRanges.push({ start: ranges[i], length: ranges[i + 1] });
    }

    return seedRanges;
  };

  getLowestLocation = () => {
    let tests = 0;
    return Math.min(...this.seedRanges.map((seedRange, index) => {
      let min = Number.MAX_VALUE;
      for (let i = 0; i < seedRange.length; i++) {
        const seedNumber = i + seedRange.start;
        const output = this.firstFarmMap.findOutput(seedNumber);
        if (output < min) {
          min = output;
        }
      }
      return min;
    }));
  };
}

const run = (lines: string) => {
  const array = lines.split('\n');

  const farm = new Farm(array);
  return farm.getLowestLocation();
};

exec('sample.txt', 46, run);
exec('input.txt', 20283860, run);
