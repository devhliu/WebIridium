import { useCallback, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import styles from "./SlidersPanel.module.css";

import { type SettableVariable } from "@/features/simulation/Simulator";

import { variablesAtom } from "@/globals/workspace/model";
import {
  updateVariableSliderValueAtom,
  variableSliderStatesAtom,
  type VariableSliderState,
} from "@/globals/workspace/slider";
import { variableSettingssAtom } from "@/globals/workspace/settings";
import { groupVariables } from "@/features/category";

import VariableSlider from "./VariableSlider";
import SearchBox from "@/components/input/SearchBox";
import Checkbox from "@/components/input/Checkbox";

const SLIDER_CATEGORY_ORDER = ["Parameters", "Species"];

const getInitialSliderState = (
  variable: SettableVariable,
): VariableSliderState => {
  const baseScale = variable.defaultValue || 1;
  if (variable.defaultValue >= 0) {
    return {
      value: variable.defaultValue,
      min: Math.round(100 * (0.1 * baseScale)) / 100,
      max: Math.round(100 * (5 * baseScale)) / 100,
    };
  } else {
    return {
      value: variable.defaultValue,
      min: Math.round(100 * (5 * baseScale)) / 100,
      max: Math.round(100 * (0.1 * baseScale)) / 100,
    };
  }
};

const SlidersPanel = () => {
  const variables = useAtomValue(variablesAtom);
  const variableSettingss = useAtomValue(variableSettingssAtom);
  const [variableSliderStates, setVariableSliderStates] = useAtom(
    variableSliderStatesAtom,
  );

  const [searchTerm, setSearchTerm] = useState("");

  const filteredVariables = variables
    .filter((v) => v.type === "settable")
    .filter(
      (v) =>
        variableSettingss[v.name].displayName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  const groups = groupVariables(filteredVariables, SLIDER_CATEGORY_ORDER);

  const updateVariableSliderValue = useSetAtom(updateVariableSliderValueAtom);

  const handleValueChange = useCallback(
    (variable: SettableVariable, newValue: number) => {
      updateVariableSliderValue({
        variableName: variable.name,
        value: newValue,
      });
    },
    [updateVariableSliderValue],
  );

  const handleToggle = useCallback(
    (variable: SettableVariable, on: boolean) => {
      setVariableSliderStates((old) => {
        if (on) {
          return {
            ...old,
            [variable.name]: getInitialSliderState(variable),
          };
        } else {
          const { [variable.name]: _, ...rest } = old;
          return rest;
        }
      });
    },
    [setVariableSliderStates],
  );

  const handleStateChange = useCallback(
    (variable: SettableVariable, newState: VariableSliderState) => {
      setVariableSliderStates((old) => ({
        ...old,
        [variable.name]: newState,
      }));
    },
    [setVariableSliderStates],
  );

  return (
    <div className={styles.panel}>
      <SearchBox
        name="slider-variable-search"
        placeholder="Variable Name"
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <div className={styles.sliders}>
        {groups.map(([group, vars]) => {
          const checkboxState = vars.every((v) => variableSliderStates[v.name])
            ? true
            : vars.some((v) => variableSliderStates[v.name])
              ? "indeterminate"
              : false;

          const handleGroupToggle = (on: boolean) => {
            for (const v of vars) {
              handleToggle(v, on);
            }
          };

          return (
            <div key={group} className={styles.group}>
              <h3 className={styles.groupTitle}>
                <Checkbox
                  name={`slider-group-${group}`}
                  value={checkboxState}
                  onChange={handleGroupToggle}
                />
                {group}
              </h3>
              {vars.map((v) => (
                <VariableSlider
                  key={v.name}
                  variable={v}
                  settings={variableSettingss[v.name]}
                  sliderState={variableSliderStates[v.name]}
                  onToggle={handleToggle}
                  onValueChange={handleValueChange}
                  onStateChange={handleStateChange}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SlidersPanel;
