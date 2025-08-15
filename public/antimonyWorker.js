importScripts("libantimony.js", "antimony_wrap.js");

let antimony = null;

let loadedPromise = null;
const loadLibraries = () => {
  if (loadedPromise) {
    return loadedPromise;
  }

  loadedPromise = libantimony()
    .then((module) => (antimony = new AntimonyWrapper(module)))
    // if the load fails, reset the promise and try again next time
    .catch(() => (loadedPromise = null));

  return loadedPromise;
};

const handleMessage = async (e) => {
  await loadLibraries();

  const action = e.data;

  switch (action.type) {
    case "convertSbmlToAntimony": {
      const { sbml } = action.payload;

      const antimonyConversion = antimony.convertSBMLToAntimony(sbml);
      // TODO: notify user about these warnings
      if (antimonyConversion.getWarnings()) {
        console.warn(antimonyConversion.getWarnings());
      }
      if (!antimonyConversion.isSuccess()) {
        throw new Error(antimonyConversion.getResult());
      }

      self.postMessage({
        id: action.id,
        data: antimonyConversion.getResult(),
      });
      break;
    }

    case "convertAntimonyToSbml": {
      const { antimony: code } = action.payload;

      const sbmlConversion = antimony.convertAntimonyToSBML(code);
      // TODO: notify user about these warnings
      if (sbmlConversion.getWarnings()) {
        console.warn(antimonyConversion.getWarnings());
      }
      if (!sbmlConversion.isSuccess()) {
        throw new Error(sbmlConversion.getResult());
      }

      self.postMessage({
        id: action.id,
        data: sbmlConversion.getResult(),
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
