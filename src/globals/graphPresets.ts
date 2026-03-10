import { type GraphSettings } from "@/features/savedData";
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

export const PROJECT_PRESET_NAME = "Custom";
const NEW_PRESET_NAME = "Shared";
export const graphPresetNameAtom = atom(PROJECT_PRESET_NAME);

const _graphPresetsAtom = atom({
  // this is the one you get per project
  project: defaultGraphSettings,
  builtins: builtinGraphPresets,
  // these ones are also shared, but the user creates them
  shared: {} as Record<string, GraphSettings | undefined>,
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

export const addGraphPresetAtom = atom(null, (get, set) => {
  const graphPresets = get(graphPresetsAtom);
  let chosenName: string;
  let i = 0;
  do {
    i += 1;
    chosenName = `${NEW_PRESET_NAME} ${i}`;
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
  set(graphPresetNameAtom, chosenName);
});

export type RenamePresetError = "cantRename" | "dupeName";

/**
 * @returns a RenamePresetError if any occurred, otherwise nothing
 */
export const renameCurrentGraphPresetAtom = atom(
  null,
  (get, set, newName: string): RenamePresetError | null => {
    const oldName = get(graphPresetNameAtom);
    const presets = get(_graphPresetsAtom);

    if (
      Object.hasOwn(presets.shared, newName) ||
      Object.hasOwn(presets.builtins, newName) ||
      newName === PROJECT_PRESET_NAME
    ) {
      return "dupeName";
    }

    if (oldName === PROJECT_PRESET_NAME) {
      return "cantRename";
    } else if (Object.hasOwn(presets.builtins, oldName)) {
      return "cantRename";
    } else if (Object.hasOwn(presets.shared, oldName)) {
      // Do an ugly swap since we don't have transactions/batching.
      // For a brief moment, both old and new name will be present,
      // but we immediately delete the old one when its safe (after
      // the graphPresetNameAtom changes).

      const settings = presets.shared[oldName];

      set(_graphPresetsAtom, {
        ...presets,
        shared: {
          ...presets.shared,
          [newName]: settings,
        },
      });

      set(graphPresetNameAtom, newName);

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

export const deleteCurrentGraphPresetAtom = atom(null, (get, set) => {
  const name = get(graphPresetNameAtom);
  const presets = get(_graphPresetsAtom);

  if (name === PROJECT_PRESET_NAME) {
    // not allowed, should not be possible via user interaction
    console.warn("Can't rename project-specific preset.");
  } else if (Object.hasOwn(presets.builtins, name)) {
    console.warn("Can't rename builtin preset.");
  } else if (Object.hasOwn(presets.shared, name)) {
    const { [name]: _, ...rest } = presets.shared;
    set(graphPresetNameAtom, PROJECT_PRESET_NAME);
    set(_graphPresetsAtom, {
      ...presets,
      shared: rest,
    });
  }
});

export const graphSettingsAtom = atom((get) => {
  const presets = get(_graphPresetsAtom);
  const name = get(graphPresetNameAtom);
  if (name === PROJECT_PRESET_NAME) {
    return presets.project;
  } else {
    return presets.builtins[name] ?? presets.shared[name] ?? presets.project;
  }
});

export const updateGraphSettingsAtom = atom(
  null,
  (get, set, newSettings: GraphSettings) => {
    const name = get(graphPresetNameAtom);
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
