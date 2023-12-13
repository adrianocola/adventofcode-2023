import exec from '../exec.js';

const DIRECTION_REGEX = /(.+) = \((.+), (.+)\)/;

type Instruction = 0 | 1;
type Direction = [string, string];

function gcd(a: number, b: number) : number {
  let t = 0;
  a < b && (t = b, b = a, a = t); // swap them if a < b
  t = a%b;
  return t ? gcd(b,t) : b;
}

function lcm(a: number, b: number): number {
  return a/gcd(a,b)*b;
}

class Map {
  instructions: Instruction[] = [];
  directions: Record<string, Direction>;

  constructor(lines: string[]) {
    this.instructions = Array.from(lines[0]).map((i) => i === 'L' ? 0 : 1);
    this.directions = lines.slice(2).reduce((acc, line) => {
      if (!line) return acc;

      const [_, direction, left, right] = line.match(DIRECTION_REGEX)!;
      acc[direction] = [left, right];
      return acc;
    }, {} as Record<string, Direction>);
  }

  calculateSteps = () => {
    const mins: number[] = [];
    let minsSet = 0;
    let steps = 0;
    let currentList = Object.keys(this.directions).filter(key => key.endsWith('A'));
    let i = 0;

    do {
      const instruction = this.instructions[i];

      for (let j = 0; j < currentList.length; j++) {
        const current = currentList[j];
        if (current.endsWith('Z')) {
          if (!mins[j]) {
            mins[j] = steps;
            minsSet += 1;
          }
        }

        const directions = this.directions[current];
        currentList[j] = directions[instruction];
      }

      steps += 1;
      i = (i + 1) % this.instructions.length;
    } while(minsSet !== currentList.length);

    return mins.reduce(lcm);
  }
}

const run = (lines: string) => {
  const array = lines.split('\n');

  const map = new Map(array);
  return map.calculateSteps();
};

exec('sample3.txt', 6, run);
exec('input.txt', 21003205388413, run);
