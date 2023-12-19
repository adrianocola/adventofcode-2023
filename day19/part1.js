import exec from '../exec.js';

const compare = (part, condition) => {
  const partValue = part[condition.property];
  return condition.comparator === '<' ? partValue < condition.value : partValue > condition.value;
};

const parseInstructions = (array) => {
  const instructionsLines = array.filter((line) => line && !line.startsWith('{'));

  const instructionsMap = {};
  instructionsLines.forEach((line) => {
    const [_, name, conditionsText] = line.match(/(\w+){(.*)}/);
    const conditionsTokens = conditionsText.split(',');
    instructionsMap[name] = conditionsTokens.map((condition, index) => {
      if (index === conditionsTokens.length - 1) {
        return {to: condition};
      }
      const [_, property, comparator, value, to] = condition.match(/(\w)([<>])(\d+):(\w+)/);
      return {property, comparator, value: parseInt(value, 10), to};
    });
  });

  return instructionsMap;
};

const parseParts = (array) => {
  const partsLines = array.filter((line) => line.startsWith('{'));
  return partsLines.map((line) => {
    const part = {};
    const matches = line.match(/\w=\d+/g);
    matches.forEach((item) => {
      const [_, property, value] = item.match(/(\w)=(\d+)/);
      part[property] = parseInt(value, 10);
    });
    return part;
  });
};

const getAcceptedParts = (instructions, parts) => {
  const acceptedParts = [];
  parts.forEach((part) => {
    let currInstruction = 'in';
    do {
      const conditions = instructions[currInstruction];
      for (let condition of conditions) {
        if (!condition.property) {
          currInstruction = condition.to;
          break;
        }
        if (compare(part, condition)) {
          currInstruction = condition.to;
          break;
        }
      }
    } while(currInstruction !== 'A' && currInstruction !== 'R');

    if (currInstruction === 'A') acceptedParts.push(part);
  });

  return acceptedParts;
}

const sumPartsProperties = (parts) => {
  return parts.reduce((acc, part) => {
    return acc + Object.values(part).reduce((acc, value) => acc + value, 0);
  }, 0);
};

const run = (lines) => {
  const array = lines.split('\n');
  const instructions = parseInstructions(array);
  const parts = parseParts(array);
  const acceptedParts = getAcceptedParts(instructions, parts);
  return sumPartsProperties(acceptedParts);
};

exec('sample.txt', 19114, run);
exec('input.txt', 389114, run);
