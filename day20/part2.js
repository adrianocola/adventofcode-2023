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

    const module = {name, outputs, freqs: {}, lastPulse: {}, signal: false};
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
    if (inputsMap[module.name]) module.inputs = inputsMap[module.name];
    modulesMap[module.name] = module;
  });

  return modulesMap;
};

const processPulse = (modulesMap, pulse, time) => {
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
    if (module.lastPulse[module.signal]) {
      module.freqs[module.signal] = (time - module.lastPulse[module.signal]) || 1;
    } else {
      module.lastPulse[module.signal] = time;
    }

    module.lastPulse[module.signal] = time;
    return module.outputs.map((output) => {
      return {from: module.name, to: output, signal: module.signal};
    });
  }
};

const pushButton = (modulesMap, time) => {
  let pulses = [{from: 'button', to: 'broadcaster', signal: false}];
  let foundRx = false;
  let pulseCount = 0;

  do {
    pulseCount += 1;
    const newPulses = [];

    pulses.forEach((pulse) => {
      processPulse(modulesMap, pulse, time)?.forEach((newPulse) => {
        newPulses.push(newPulse);
      });
    });

    pulses = newPulses;
  } while(pulses.length && !foundRx);

  return foundRx;
};

const checkPendingModules = (pendingModules, modulesMap) => {
  delete pendingModules.broadcaster;
  const newPendingModules = {};

  Object.values(pendingModules).forEach((module) => {
    if (!module.freqs.false || !module.freqs.true) {
      newPendingModules[module.name] = module;
    }
    if (module.type === '&') {
      if (!module.freqs.false) {
        const everyInputFreq = module.inputs.reduce((acc, input) => acc * (modulesMap[input].freqs.true ?? 0), 1);
        if (everyInputFreq) {
          module.freqs.false =  everyInputFreq;
        }
      }
    }
  });

  return newPendingModules;
};

const pushButtonUntilFoundModulesFrequency = (modulesMap) => {
  let pushCount = 0;
  let pendingModules = checkPendingModules({...modulesMap}, modulesMap);

  do {
    pushCount += 1;
    pushButton(modulesMap, pushCount);
    pendingModules = checkPendingModules(pendingModules, modulesMap);
  } while (Object.keys(pendingModules).length);
};

const findRxLowPushes = (modulesMap) => {
  const moduleToRx = Object.values(modulesMap).find((module) => module.outputs.includes('rx'));

  return moduleToRx.freqs.false;
}

const run = (lines) => {
  const array = lines.split('\n').filter(Boolean);
  const modulesMap = parseModules(array);
  pushButtonUntilFoundModulesFrequency(modulesMap);
  return findRxLowPushes(modulesMap);
};

exec('input.txt', 221453937522197, run);
