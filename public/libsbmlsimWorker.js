importScripts("libsbmlsim.js", "libantimony.js", "antimony_wrap.js");

let simulator = null;
let antimony = null;

/**
 * Converts a emscripten vector to an array.
 */
const vectorToArray = (vector) => {
  let array = [];
  for (let i = 0; i < vector.size(); i++) {
    array.push(vector.get(i));
  }
  return array;
};

let loadedPromise = null;
const loadLibraries = () => {
  if (loadedPromise) {
    return loadedPromise;
  }

  loadedPromise = Promise.all([
    libsbmlsim().then((module) => (simulator = new module.Simulator())),
    libantimony().then((module) => (antimony = new AntimonyWrapper(module))),
    // if the load fails, reset the promise and try again next time
  ]).catch(() => (loadedPromise = null));

  return loadedPromise;
};

let cachedSpecies = null;
let cachedParameters = null;
const handleMessage = async (e) => {
  await loadLibraries();

  const action = e.data;

  // Update loaded model if it changed
  const antimonyCode = action.internalState;
  if (antimonyCode) {
    const sbmlConversion = antimony.convertAntimonyToSBML(antimonyCode);
    // TODO: notify user about these warnings
    if (sbmlConversion.getWarnings()) {
      console.warn(sbmlConversion.getWarnings());
    }
    if (!sbmlConversion.isSuccess()) {
      throw new Error(sbmlConversion.getResult());
    }

    const success = simulator.LoadSbml(sbmlConversion.getResult());
    if (!success) {
      throw new Error(simulator.GetLastError());
    }

    cachedSpecies = vectorToArray(simulator.GetSpecies());
    cachedParameters = vectorToArray(simulator.GetParameters());
  }

  switch (action.type) {
    case "timeCourse": {
      const { parameters, variableValues, parameterScanOptions } =
        action.payload;

      // TODO: make work with the start time
      const simulationResult = simulator.SimulateTimeCourse(
        parameters.endTime,
        parameters.numberOfPoints,
      );

      if (!simulationResult) {
        throw new Error(simulator.GetLastError());
      }

      const columns = [];
      for (let i = 0; i < simulationResult.columns.size(); i++) {
        const column = simulationResult.columns.get(i);
        if (parameters.includedVariables.includes(column.name)) {
          columns.push({
            title: column.name,
            values: vectorToArray(column.values),
          });
        }
      }

      simulationResult.delete();

      self.postMessage({
        id: action.id,
        data: { columns },
      });
      break;
    }

    case "steadyState": {
      break;
    }

    case "loadModel": {
      self.postMessage({
        id: action.id,
        data: {
          species: cachedSpecies,
          parameters: cachedParameters,
        },
      });
      break;
    }

    default:
      throw new Error(`invalid action type: ${action.type}`);
  }
};

self.onmessage = async (e) => {
  // when the messgae handler fails, its error must be manually propagated
  // since it will get eaten up by the promise otherwise
  try {
    await handleMessage(e);
  } catch (err) {
    console.error(err, err?.stack);
    self.postMessage({ id: e.data.id, errorMessage: err.message });
  }
};
