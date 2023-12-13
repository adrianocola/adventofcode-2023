import fs from 'node:fs';
import ora from 'ora';
import colors from 'colors';

const run = (file, expected, fn) => {
  const lines = fs.readFileSync(file, 'utf8');
  const spinner = ora(file).start();
  const start = Date.now();
  const result = fn(lines);

  const duration = Date.now() - start;
  let durationText = `${duration}ms`
  if (duration > 2000) {
    durationText = `${(duration / 1000).toFixed(1)}s`
  }
  const success = result === expected;

  const color = success ? colors.green : colors.red;
  if (success) {
    spinner.succeed(color(`${file}: ${colors.brightWhite(result)} ${colors.grey(durationText)}`));
  } else {
    spinner.fail(color(`${file}: ${colors.green(`+${expected}`)} ${colors.red(`-${result}`)} ${colors.grey(durationText)}`));
  }
};

export default run;
