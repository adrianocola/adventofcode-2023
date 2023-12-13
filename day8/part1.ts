import exec from '../exec.js';

const DIRECTION_REGEX = /(.+) = \((.+), (.+)\)/;

type Instruction = 'L' | 'R';
type Direction = [string, string];

class Map {
  instructions: Instruction[] = [];
  directions: Record<string, Direction>;

  constructor(lines: string[]) {
    this.instructions = Array.from(lines[0]) as Instruction[];
    this.directions = lines.slice(2).reduce((acc, line) => {
      if (!line) return acc;

      const [_, direction, left, right] = line.match(DIRECTION_REGEX)!;
      acc[direction] = [left, right];
      return acc;
    }, {} as Record<string, Direction>);
  }

  calculateSteps = (origin: string, destination: string) => {
    let steps = 0;
    let current = origin;
    let i = 0;
    do {
      const instruction = this.instructions[i];
      const directions = this.directions[current];

      current = directions[instruction === 'L' ? 0 : 1];

      steps += 1;
      i = (i + 1) % this.instructions.length;
    } while(current !== destination);
    return steps;
  }
}

const run = (lines: string) => {
  const array = lines.split('\n');

  const map = new Map(array);

  return map.calculateSteps('AAA', 'ZZZ');
};

exec('sample1.txt', 2, run);
exec('sample2.txt', 6, run);
exec('input.txt', 19631, run);
