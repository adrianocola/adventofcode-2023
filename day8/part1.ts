import {readFileSync } from 'fs';

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

const run = (file: string) => {
  const lines = readFileSync(file, 'utf8');
  const array = lines.split('\n');

  const map = new Map(array);

  const steps = map.calculateSteps('AAA', 'ZZZ');

  console.log(`RESULT (${file}):`, steps);
};

console.log();
run('sample1.txt');
run('sample2.txt');
run('input.txt');
