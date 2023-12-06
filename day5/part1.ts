import {readFileSync} from 'fs';

class Range {
  private readonly source: number;
  private readonly destination: number;
  private readonly length: number;

  constructor(source: number, destination: number, length: number) {
    this.source = source;
    this.destination = destination;
    this.length = length;
  }

  isInRange = (source: number): boolean => {
    return source >= this.source && source <= this.source + this.length;
  }

  getOutput = (source: number): number => {
    return (source - this.source) + this.destination;
  }
}

class FarmMap {
  private ranges: Range[] = [];
  private readonly nextMap?: FarmMap;

  constructor(nextMap?: FarmMap) {
    this.nextMap = nextMap;
  }

  private findInternalOutput = (source: number): number => {
    const range = this.ranges.find((range) => range.isInRange(source));
    return range ? range.getOutput(source) : source;
  }

  public addRange = (line: string): void => {
    const [destination, source, length] = line.split(' ');
    this.ranges.push(new Range(
      parseInt(source, 10),
      parseInt(destination, 10),
      parseInt(length, 10)
    ));
  }

  public findOutput = (source: number): number => {
    const internalOutput = this.findInternalOutput(source);
    return this.nextMap ? this.nextMap.findOutput(internalOutput) : internalOutput;
  }
}

class Farm {
  private firstFarmMap: FarmMap;
  private seeds: number[];

  constructor(linesArray: string[]) {
    this.firstFarmMap = this.generateFarmsMapTree(linesArray);
    this.seeds = this.generateSeeds(linesArray[0]);
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

  private generateSeeds = (seedsLine: string) => {
    return seedsLine.split(' ').slice(1).map((item) => parseInt(item, 10));
  };

  getLowestLocation = () => {
    return Math.min(...this.seeds.map((seed) => this.firstFarmMap.findOutput(seed)));
  };
}

const run = (file: string) => {
  const lines = readFileSync(file, 'utf8');
  const array = lines.split('\n');

  const farm = new Farm(array);
  const lowestLocation = farm.getLowestLocation();

  console.log(`RESULT (${file}):`, lowestLocation);
};

console.log();
run('sample.txt');
run('input.txt');
