import exec from '../exec.js';

const reduceParts = (conditions) => {
  const part = {x: 4000, m: 4000, a: 4000, s: 4000 };
  const groupedByProperty = {};
  conditions.forEach((condition) => {
    const group = groupedByProperty[condition.property] ?? {};
    const type = condition.comparator.startsWith('<') ? '<' : '>';
    if (!group[type]) {
      group[type] = condition;
    } else if (type === '<' && condition.value < group[type]?.value) {
      group[type] = condition;
    } else if (type === '>' && condition.value > group[type]?.value) {
      group[type] = condition;
    }
    groupedByProperty[condition.property] = group;
  });

  Object.entries(groupedByProperty).forEach(([property, group]) => {
    const conditionLower = group['<'];
    const conditionHigher = group['>'];
    if (conditionLower) {
      part[property] = conditionLower.value + (conditionLower.comparator === '<' ? -1 : 0);
    }
    if (conditionHigher) {
      part[property] = part[property] - conditionHigher.value + (conditionHigher.comparator === '>' ? 0 : 1);
    }
  });

  return part;
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

const acceptanceConditionsPaths = (instructions, instructionName, conditions = [], acceptConditions = []) => {
  if (instructionName === 'A') {
    acceptConditions.push(conditions);
    return;
  }
  if (instructionName === 'R') {
    return;
  }

  const invertedPrevConditions = [];
  instructions[instructionName].forEach((condition) => {
    const nextConditions = [...conditions, ...invertedPrevConditions];
    if (condition.property) nextConditions.push(condition);

    acceptanceConditionsPaths(instructions, condition.to, nextConditions, acceptConditions);
    invertedPrevConditions.push({
      ...condition,
      comparator: condition.comparator === '<' ? '>=' : '<=',
    })
  });

  return acceptConditions;
};

const getPossibleAcceptanceValues = (paths) => {
  return paths.reduce((acc, conditions) => {
    const part = reduceParts(conditions);

    return acc + Object.values(part).reduce((acc, value) => acc * value, 1);
  }, 0);
};

const run = (lines) => {
  const array = lines.split('\n');
  const instructions = parseInstructions(array);
  const paths = acceptanceConditionsPaths(instructions, 'in');
  return getPossibleAcceptanceValues(paths);
};

exec('sample.txt', 167409079868000, run);
exec('input.txt', 125051049836302, run);
