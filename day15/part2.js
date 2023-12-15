import exec from '../exec.js';

const calcStepHash = (step) => {
  return step.split('').reduce((acc, char) => {
    return (acc + char.charCodeAt(0)) * 17 % 256;
  }, 0);
};

const executeStep = (boxes, step) => {
  const [, label, oper, focalLengthStr] = step.match(/([a-z]+)([-=])(\d?)/)

  const boxId = calcStepHash(label);
  let box = boxes[boxId] ?? [];
  if (oper === '-') {
    box = box.filter((lamp) => lamp.label !== label);
  } else if (oper === '=') {
    const lampIndex = box.findIndex((lamp) => lamp.label === label);
    const focalLength = parseInt(focalLengthStr, 10);
    if (lampIndex === -1) {
      box.push({label, focalLength});
    } else {
      box[lampIndex].focalLength = focalLength;
    }
  }
  boxes[boxId] = box;
};

const calcTotalFocusingPower = (boxes) => {
  return boxes.reduce((acc, box, boxIndex) => {
    if (!box) return acc;
    return acc + box.reduce((acc, lamp, lampIndex) => {
      return acc + (boxIndex + 1) * (lampIndex + 1) * lamp.focalLength;
    }, 0);
  }, 0);
};

const run = (lines) => {
  const array = lines.split('\n').filter(Boolean);
  const steps = array[0].split(',');
  const boxes = [];
  steps.forEach((step) => executeStep(boxes, step));
  return calcTotalFocusingPower(boxes);
};

await exec('sample2.txt', 145, run);
await exec('input.txt', 236057, run);
