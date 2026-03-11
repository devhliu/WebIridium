import { useEffect } from "react";
import {
  deletePresetRaw,
  getAllPresetNamesRaw,
  readPresetRaw,
  renamePresetRaw,
  writePresetRaw,
} from "@/features/fileSystem";
import { type GraphSettings } from "@/features/savedData";
import { useSetAtom } from "jotai";
import { atom } from "jotai";

export const defaultGraphSettings: GraphSettings = {
  versionTag: 1,

  backgroundColor: "#ffffff",
  drawingAreaColor: "#f1e7f4",

  includeTitle: true,
  title: "Transition of substances in chemical reaction",
  titleColor: "#000000",

  includeBorder: true,
  borderColor: "#000000",
  borderThickness: 0.5,

  globalWidth: 1,

  isAutoscaledX: true,
  minX: 0,
  maxX: 10,

  isAutoscaledY: true,
  minY: 0,
  maxY: 10,

  margin: 70,

  xAxis: {
    includeTitle: true,
    title: "", // empty means use placeholder
    color: "#000",
  },

  yAxis: {
    includeTitle: true,
    title: "", // empty means use placeholder
    color: "#000",
  },

  majorGrid: {
    enabled: { x: false, y: false },
    xColor: "#888",
    yColor: "#888",
    xWidth: 0.5,
    yWidth: 0.5,
    numXGrids: 4,
    numYGrids: 4,
  },

  minorGrid: {
    enabled: { x: false, y: false },
    xColor: "#888",
    yColor: "#888",
    xWidth: 0.5,
    yWidth: 0.5,
    numXGrids: 4,
    numYGrids: 4,
  },

  legend: {
    visible: true,
    isFloating: true,

    textColor: "#000",
    backgroundColor: "#fff",
    borderColor: "#000",
    borderThickness: 1,
    padding: 15,
    lineLength: 50,
  },
};

export const builtinGraphPresets: Record<string, GraphSettings> = {
  Dark: {
    ...defaultGraphSettings,
    backgroundColor: "#000000",
    drawingAreaColor: "#111111",
    titleColor: "#ffffff",
    borderColor: "#ffffff",
    xAxis: {
      ...defaultGraphSettings.xAxis,
      color: "#ffffff",
    },
    yAxis: {
      ...defaultGraphSettings.yAxis,
      color: "#ffffff",
    },
    legend: {
      ...defaultGraphSettings.legend,
      textColor: "#fff",
      backgroundColor: "#000",
      borderColor: "#fff",
    },
  },

  Winter: {
    ...defaultGraphSettings,
    backgroundColor: "#72b7f7",
    drawingAreaColor: "#b6d5f2",
    titleColor: "#010a12",
    borderColor: "#010a12",
    xAxis: {
      ...defaultGraphSettings.xAxis,
      color: "#010a12",
    },
    yAxis: {
      ...defaultGraphSettings.yAxis,
      color: "#010a12",
    },
    legend: {
      ...defaultGraphSettings.legend,
      textColor: "#010a12",
      backgroundColor: "#b6f1f2",
      borderColor: "#010a12",
    },
  },

  Beach: {
    ...defaultGraphSettings,
    backgroundColor: "#e8e1c3",
    drawingAreaColor: "#faf8f2",
    titleColor: "#080600",
    borderColor: "#080600",
    xAxis: {
      ...defaultGraphSettings.xAxis,
      color: "#080600",
    },
    yAxis: {
      ...defaultGraphSettings.yAxis,
      color: "#080600",
    },
    legend: {
      ...defaultGraphSettings.legend,
      textColor: "#080600",
      backgroundColor: "#e8c6ba",
      borderColor: "#080600",
    },
  },
};

export interface GraphPresetStatus {
  /** Name of the current preset in-use. */
  current: string;
  /** Name of the preset they are trying to load. */
  pending?: string;
}

export const PROJECT_PRESET_NAME = "Custom";
const NEW_PRESET_NAME_PREFIX = "Shared"; // becomes "Shared 1", "Shared 2", etc.

const _graphPresetStatusAtom = atom<GraphPresetStatus>({
  current: PROJECT_PRESET_NAME,
});
export const graphPresetStatusAtom = atom((get) => get(_graphPresetStatusAtom));
export const currentPresetAtom = atom(
  (get) => get(_graphPresetStatusAtom).current,
);
export const loadingPresetAtom = atom(
  (get) => get(_graphPresetStatusAtom).pending,
);

const unloadedSymbol = Symbol("unloaded preset");
type UnloadedSymbol = typeof unloadedSymbol;

type GraphPresets = {
  // this is the one you get per project
  project: GraphSettings;
  // these ones are shared and builtin
  builtins: Record<
    keyof typeof builtinGraphPresets,
    GraphSettings | UnloadedSymbol
  >;
  // these ones are also shared, but the user creates them
  shared: Record<string, GraphSettings | UnloadedSymbol | undefined>;
};

const getPreset = (
  presets: GraphPresets,
  name: string,
): GraphSettings | UnloadedSymbol | undefined => {
  if (name === PROJECT_PRESET_NAME) {
    return presets.project;
  } else {
    return presets.builtins[name] ?? presets.shared[name];
  }
};

const _graphPresetsAtom = atom<GraphPresets>({
  project: defaultGraphSettings,
  builtins: Object.fromEntries(
    Object.keys(builtinGraphPresets).map((name) => [name, unloadedSymbol]),
  ) as Record<keyof typeof builtinGraphPresets, GraphSettings | UnloadedSymbol>,
  shared: {},
});

export const graphPresetsAtom = atom((get) => get(_graphPresetsAtom));

export const projectGraphSettingsAtom = atom(
  (get) => get(_graphPresetsAtom).project,
  (get, set, newValue: GraphSettings) => {
    set(_graphPresetsAtom, {
      ...get(_graphPresetsAtom),
      project: newValue,
    });
  },
);

/**
 * Tries to update the current preset, loading from the file system if necessary.
 */
export const updateCurrentPresetAtom = atom(
  null,
  async (get, set, newName: string) => {
    const originalName = get(_graphPresetStatusAtom).current;
    if (originalName === newName) return;

    const presets = get(_graphPresetsAtom);

    if (typeof getPreset(presets, newName) === "object") {
      set(_graphPresetStatusAtom, {
        current: newName,
      });
    } else {
      set(_graphPresetStatusAtom, {
        current: originalName,
        pending: newName,
      });

      // check for if someone else tried to update while we did
      const wasInterrupted = () =>
        get(_graphPresetStatusAtom).pending !== newName;

      if (presets.builtins[newName] === unloadedSymbol) {
        try {
          // try to load it
          const data = await readPresetRaw(newName);
          if (wasInterrupted()) return;

          const newPresets = get(_graphPresetsAtom);
          set(_graphPresetsAtom, {
            ...newPresets,
            shared: {
              ...newPresets.shared,
              [newName]: data,
            },
          });
          set(_graphPresetStatusAtom, {
            current: newName,
          });
        } catch (_) {
          if (wasInterrupted()) return;
          // might've not had a save yet. fill in with default.
          if (Object.hasOwn(builtinGraphPresets, newName)) {
            const newPresets = get(_graphPresetsAtom);
            set(_graphPresetsAtom, {
              ...newPresets,
              builtins: {
                ...newPresets.builtins,
                [newName]: builtinGraphPresets[newName],
              },
            });
            set(_graphPresetStatusAtom, {
              current: newName,
            });
          } else {
            // revert if the builtin has no defaults??
            set(_graphPresetStatusAtom, {
              current: originalName,
            });
          }
        }
      } else if (presets.shared[newName] === unloadedSymbol) {
        try {
          const data = await readPresetRaw(newName);
          if (wasInterrupted()) return;

          const newPresets = get(_graphPresetsAtom);
          set(_graphPresetsAtom, {
            ...newPresets,
            shared: {
              ...newPresets.shared,
              [newName]: data,
            },
          });
          set(_graphPresetStatusAtom, {
            current: newName,
          });
        } catch (e) {
          if (wasInterrupted()) return;
          console.warn(e);
          set(_graphPresetStatusAtom, {
            current: originalName,
          });
        }
      } else {
        // doesn't exist?? abort
        set(_graphPresetStatusAtom, {
          current: originalName,
        });
      }
    }
  },
);

export const addGraphPresetAtom = atom(null, (get, set) => {
  const graphPresets = get(graphPresetsAtom);
  let chosenName: string;
  let i = 0;
  do {
    i += 1;
    chosenName = `${NEW_PRESET_NAME_PREFIX} ${i}`;
  } while (
    Object.hasOwn(graphPresets.builtins, chosenName) ||
    Object.hasOwn(graphPresets.shared, chosenName) ||
    chosenName === PROJECT_PRESET_NAME
  );

  set(_graphPresetsAtom, {
    ...graphPresets,
    shared: {
      ...graphPresets.shared,
      [chosenName]: defaultGraphSettings,
    },
  });
  set(_graphPresetStatusAtom, {
    current: chosenName,
  });
});

export type RenamePresetError = "cantRename" | "invalidName" | "dupeName";

const isPresetNameValid = (name: string): boolean => {
  return (
    /^[A-Za-z0-9_ -]+$/.test(name) && 1 <= name.length && name.length <= 20
  );
};

/**
 * @returns a RenamePresetError if any occurred, otherwise nothing
 */
export const renameGraphPresetAtom = atom(
  null,
  async (
    get,
    set,
    {
      oldName,
      newName,
      isOriginator = true,
    }: {
      oldName: string;
      newName: string;
      /** whether this change came from this tab */
      isOriginator?: boolean;
    },
  ): Promise<RenamePresetError | null> => {
    if (oldName === newName) return null;
    if (!isPresetNameValid(newName)) {
      console.log({ newName });
      return "invalidName";
    }

    const presets = get(_graphPresetsAtom);

    if (getPreset(presets, newName)) {
      return "dupeName";
    }

    if (oldName === PROJECT_PRESET_NAME) {
      return "cantRename";
    } else if (Object.hasOwn(presets.builtins, oldName)) {
      return "cantRename";
    } else if (Object.hasOwn(presets.shared, oldName)) {
      if (isOriginator) {
        const presets = get(_graphPresetsAtom);
        const settings = getPreset(presets, oldName);
        if (typeof settings === "object") {
          await renamePresetRaw(oldName, newName, settings);
        }
      }

      // Do an ugly swap since we don't have transactions/batching.
      // For a brief moment, both old and new name will be present,
      // but we immediately delete the old one when its safe (after
      // updating the preset name).

      const settings = presets.shared[oldName];

      set(_graphPresetsAtom, {
        ...presets,
        shared: {
          ...presets.shared,
          [newName]: settings,
        },
      });

      if (oldName === get(graphPresetStatusAtom).current) {
        set(_graphPresetStatusAtom, {
          current: newName,
        });
      }

      const { [oldName]: _, ...rest } = presets.shared;
      set(_graphPresetsAtom, {
        ...presets,
        shared: {
          ...rest,
          [newName]: settings,
        },
      });
    }

    return null;
  },
);

export const deleteGraphPresetAtom = atom(
  null,
  async (
    get,
    set,
    { name, isOriginator = false }: { name: string; isOriginator?: boolean },
  ) => {
    const presets = get(_graphPresetsAtom);

    if (name === PROJECT_PRESET_NAME) {
      // not allowed, should not be possible via user interaction
      console.warn("Can't rename project-specific preset.");
    } else if (Object.hasOwn(presets.builtins, name)) {
      console.warn("Can't rename builtin preset.");
    } else if (Object.hasOwn(presets.shared, name)) {
      if (isOriginator) {
        await deletePresetRaw(name);
      }

      const { [name]: _, ...rest } = presets.shared;

      if (get(_graphPresetStatusAtom).current === name) {
        set(_graphPresetStatusAtom, {
          current: PROJECT_PRESET_NAME,
        });
      }

      set(_graphPresetsAtom, {
        ...presets,
        shared: rest,
      });
    }
  },
);

export const graphSettingsAtom = atom((get): GraphSettings => {
  const presets = get(_graphPresetsAtom);
  const settings = getPreset(presets, get(_graphPresetStatusAtom).current);
  if (typeof settings === "object") {
    return settings;
  } else {
    return presets.project;
  }
});

export const updateGraphSettingsAtom = atom(
  null,
  (get, set, newSettings: GraphSettings) => {
    const name = get(_graphPresetStatusAtom).current;
    const presets = get(_graphPresetsAtom);
    if (name === PROJECT_PRESET_NAME) {
      set(_graphPresetsAtom, {
        ...presets,
        project: newSettings,
      });
    } else if (Object.hasOwn(presets.builtins, name)) {
      set(_graphPresetsAtom, {
        ...presets,
        builtins: {
          ...presets.builtins,
          [name]: newSettings,
        },
      });
    } else if (Object.hasOwn(presets.shared, name)) {
      set(_graphPresetsAtom, {
        ...presets,
        shared: {
          ...presets.shared,
          [name]: newSettings,
        },
      });
    }
  },
);

// Saving & Syncing

export const savedPresetAtom = atom((get) => {
  const name = get(currentPresetAtom);
  const settings = get(graphSettingsAtom);
  return { name, settings };
});

export const savePresetAtom = atom(
  null,
  async (get, _set, data: { name: string; settings: GraphSettings }) => {
    if (
      data.name === PROJECT_PRESET_NAME ||
      Object.hasOwn(get(_graphPresetsAtom).builtins, data.name)
    ) {
      return;
    }

    try {
      await writePresetRaw(data.name, data.settings);
    } catch (e) {
      console.error(e);
    }
  },
);

const loadSharedPresetNamesAtom = atom(null, async (get, set) => {
  const names = await getAllPresetNamesRaw();
  const presets = get(_graphPresetsAtom);
  const newShared = { ...presets.shared };

  for (const name of names) {
    if (newShared[name] === undefined) {
      newShared[name] = unloadedSymbol;
    }
  }

  set(_graphPresetsAtom, {
    ...presets,
    shared: newShared,
  });
});

export const useGraphPresetSync = () => {
  const loadSharedPresetNames = useSetAtom(loadSharedPresetNamesAtom);

  useEffect(() => {
    void loadSharedPresetNames();
  }, [loadSharedPresetNames]);
};
