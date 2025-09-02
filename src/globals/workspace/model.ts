import { atom } from "jotai";

import defaultModel from "@/assets/default.ant?raw";
import type {
  Variable,
  SettableVariable,
} from "@/features/simulation/Simulator";
import { TaskTermination } from "@/features/taskPool";
import { getDefaultColorForIndex } from "@/features/colors";

import { nameAtom, type VariableSettings } from "./settings";
import { simulatorAtom } from "./simulator";
import {
  independentVariableAtom,
  parameterScanOptionsAtom,
  variableSettingssAtom,
} from "./settings";
import { variableSliderStatesAtom } from "./slider";
import type { Atom } from "jotai";
import { simulationResultAtom } from "./simulation";

export type ModelStatus =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success" };

const MODEL_LOAD_DEBOUNCE = 200; // in ms

const _updateAbortControllerAtom = atom<AbortController | null>(null);
const _editorContentAtom = atom(defaultModel);
const _variablesAtom = atom<Variable[]>([]);
const _modelStatusAtom = atom<ModelStatus>({ type: "loading" });

export const editorContentAtom = atom((get) => get(_editorContentAtom));
export const modelStatusAtom = atom((get) => get(_modelStatusAtom));
export const variablesAtom = atom((get) => get(_variablesAtom));
export const variablesMapAtom: Atom<Map<string, Variable>> = atom(
  (get) => new Map(get(variablesAtom).map((v) => [v.name, v])),
);

// TODO: unit test this?
const patchVariablesSettings = (
  currentVariablesSettings: Record<string, VariableSettings>,
  newVariables: Variable[],
): Record<string, VariableSettings> => {
  let count = Object.keys(currentVariablesSettings).length;
  const adding: Record<string, VariableSettings> = {};

  const isPriorityVariable = (variable: Variable) =>
    variable.category === "Floating Species" || variable.category === "Time";

  // first pass for prioritized variables (this is so they get the good default colors)
  for (const variable of newVariables) {
    if (
      !currentVariablesSettings[variable.name] &&
      isPriorityVariable(variable)
    ) {
      adding[variable.name] = {
        displayName: variable.defaultDisplayName,
        visible: variable.category !== "Time",
        color: getDefaultColorForIndex(count),
        lineStyle: "solid",
        width: 2,
      };
      count += 1;
    }
  }

  // second pass for everything else
  for (const variable of newVariables) {
    if (
      !currentVariablesSettings[variable.name] &&
      !isPriorityVariable(variable)
    ) {
      adding[variable.name] = {
        displayName: variable.defaultDisplayName,
        visible: false,
        color: getDefaultColorForIndex(count),
        width: 2,
        lineStyle: "solid",
      };
      count += 1;
    }
  }

  if (Object.keys(adding).length === 0) {
    return currentVariablesSettings;
  } else {
    return { ...currentVariablesSettings, ...adding };
  }
};

/**
 * Update editor content and associated things like model info, variables, etc.
 * @returns `true` on successful model update, `false` on failed model update
 */
export const updateEditorContentAtom = atom(
  null,
  async (
    get,
    set,
    {
      content,
      skipDebounce = false,
    }: { content: string; skipDebounce?: boolean },
  ): Promise<boolean> => {
    // the !skipDebounce is for initial loads
    // if infinite loading errors on app initialization are experienced, check here
    if (get(editorContentAtom) === content && !skipDebounce) return true;

    const simulator = get(simulatorAtom);
    const variableSliderStates = get(variableSliderStatesAtom);
    const prevAbortController = get(_updateAbortControllerAtom);
    if (prevAbortController) {
      prevAbortController.abort();
    }

    const currentAbortController = new AbortController();
    set(_updateAbortControllerAtom, currentAbortController);

    set(_editorContentAtom, content);
    set(_modelStatusAtom, { type: "loading" });

    let newVariables: Variable[];
    try {
      // wait a bit in case the user is still typing
      if (!skipDebounce) {
        await new Promise((resolve) =>
          setTimeout(resolve, MODEL_LOAD_DEBOUNCE),
        );
        if (currentAbortController.signal.aborted) {
          throw new TaskTermination();
        }
      }

      newVariables = await simulator.loadModel(
        content,
        currentAbortController.signal,
      );
    } catch (err) {
      if (err instanceof TaskTermination) {
        return false;
      } else if (err instanceof Error) {
        set(_modelStatusAtom, {
          type: "error",
          message: err.message,
        });
        return false;
      } else {
        throw err;
      }
    }

    const independentVariable = get(independentVariableAtom);
    const parameterScanOptions = get(parameterScanOptionsAtom);

    // if the independent variable no longer exists, fallback to time if possible
    if (
      !independentVariable ||
      !newVariables.find((v) => v.name === independentVariable)
    ) {
      set(
        independentVariableAtom,
        newVariables.find(
          (v) => v.name === simulator.defaultIndependentVariableId,
        )?.name ?? null,
      );
    }

    // if the variable no longer exists, use the first available scannable parameter
    // for the parameter scan
    if (
      !parameterScanOptions.varyingParameter ||
      !newVariables.some(
        (v) =>
          v.type === "settable" &&
          v.setName === parameterScanOptions.varyingParameter,
      )
    ) {
      const firstAvailableParameter = newVariables.find(
        (v) => v.type === "settable" && v.category === "Parameters",
      ) as SettableVariable;
      set(parameterScanOptionsAtom, {
        ...parameterScanOptions,
        varyingParameter:
          // first try to use the first parameter
          firstAvailableParameter?.setName ??
          // if no parameteres found, use the first available
          newVariables.find((v) => v.type === "settable")?.setName,
      });
    }

    set(_variablesAtom, newVariables);
    set(
      variableSettingssAtom,
      patchVariablesSettings(get(variableSettingssAtom), newVariables),
    );
    set(_modelStatusAtom, { type: "success" });

    // TODO: unit test this
    // remove slider states that are no longer valid
    const newVariablesNameSet = new Set(newVariables.map((v) => v.name));
    if (
      Object.keys(variableSliderStates).some(
        (name) => !newVariablesNameSet.has(name),
      )
    ) {
      set(
        variableSliderStatesAtom,
        Object.fromEntries(
          Object.entries(variableSliderStates).filter(([name, _]) =>
            newVariablesNameSet.has(name),
          ),
        ),
      );
    }

    return true;
  },
);

export interface SetModelOptions {
  name: string;
  content: string;
}

/**
 * Set the model which updates the editor content, model name, and resets other relevant state.
 */
export const setModelAtom = atom(
  null,
  async (_get, set, { name, content }: SetModelOptions) => {
    set(nameAtom, name);
    set(simulationResultAtom, null);
    await set(updateEditorContentAtom, { content, skipDebounce: true });
  },
);

export const modelAtoms = [
  _updateAbortControllerAtom,
  _editorContentAtom,
  _modelStatusAtom,
  updateEditorContentAtom,

  editorContentAtom,
  modelStatusAtom,
  variablesAtom,
  variablesMapAtom,
  updateEditorContentAtom,
];
