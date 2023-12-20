import exec from '../exec.js';

const parseModules = (array) => {
  const inputsMap = {};
  const modules = array.map((line) => {
    const [_, type, name, outputsStr] = line.match(/([%&]?)(\w+) -> (.*)/);
    const outputs = outputsStr.split(', ');

    outputs.forEach((output) => {
      const inputs = inputsMap[output] ?? [];
      inputs.push(name);
      inputsMap[output] = inputs;
    });

    const module = {name, outputs, signal: false};
    if (type) {
      module.type = type;
      if (type === '%') {
        module.state = false;
      }
    }
    return module;
  })

  const modulesMap = {};
  modules.forEach((module) => {
    if (module.type === '&' && inputsMap[module.name]) module.inputs = inputsMap[module.name];
    modulesMap[module.name] = module;
  });

  return modulesMap;
};

const processPulse = (modulesMap, pulse, counts) => {
  const module = modulesMap[pulse.to];

  if (!module) return;

  let broadcast = false;
  if (module.type === '%' && !pulse.signal) {
    module.signal = !module.signal;
    module.state = !module.state;
    broadcast = true;
  } else if (module.type === '&') {
    module.signal = !module.inputs.every((from) => modulesMap[from].signal);
    broadcast = true;
  } else if (module.name === 'broadcaster') {
    module.signal = pulse.signal;
    broadcast = true;
  }

  if (broadcast) {
    return module.outputs.map((output) => {
      counts[module.signal] += 1;
      return {from: module.name, to: output, signal: module.signal};
    });
  }
};

const pushButton = (modulesMap) => {
  const counts = {false: 1, true: 0};
  let pulses = [{from: 'button', to: 'broadcaster', signal: false}];

  do {
    const newPulses = [];

    pulses.forEach((pulse) => {
      processPulse(modulesMap, pulse, counts)?.forEach((newPulse) => newPulses.push(newPulse));
    });

    pulses = newPulses;
  } while(pulses.length);

  return counts;
};

const pushButtonMultiple = (modulesMap, times) => {
  const counts = {false: 0, true: 0};
  for (let i = 0; i < times; i++) {
    const result = pushButton(modulesMap);
    counts.true += result.true;
    counts.false += result.false;
  }
  return counts;
}

const run = (lines) => {
  const array = lines.split('\n').filter(Boolean);
  const modulesMap = parseModules(array);
  const counts = pushButtonMultiple(modulesMap, 1000);
  return counts.false * counts.true;
};

exec('sample1.txt', 32000000, run);
exec('sample2.txt', 11687500, run);
exec('input.txt', 807069600, run);
