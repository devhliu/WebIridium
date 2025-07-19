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
import Button from "@/components/Button";

import EyeIcon from "@/assets/icons/EyeIcon.svg?react";
import ClosedEyeIcon from "@/assets/icons/ClosedEyeIcon.svg?react";
import CrossIcon from "@/assets/icons/CrossIcon.svg?react";

const SLIDER_CATEGORY_ORDER = [
  "Parameters",
  "Floating Species",
  "Boundary Species",
];

const getInitialSliderState = (
  variable: SettableVariable,
): VariableSliderState => {
  const baseScale = variable.defaultValue || 1;
  let result;
  if (variable.defaultValue >= 0) {
    result = {
      value: variable.defaultValue,
      min: Math.round(100 * (0.1 * baseScale)) / 100,
      max: Math.round(100 * (5 * baseScale)) / 100,
    };
  } else {
    result = {
      value: variable.defaultValue,
      min: Math.round(100 * (5 * baseScale)) / 100,
      max: Math.round(100 * (0.1 * baseScale)) / 100,
    };
  }

  // sometimes the baseScale is so small, min and max get rounded to zero
  if (result.min === result.max) {
    result.max += 1;
  }

  return result;
};

export interface SlidersPanelProps {
  onClose: () => void;
}

const SlidersPanel = ({ onClose }: SlidersPanelProps) => {
  const variables = useAtomValue(variablesAtom);
  const variableSettingss = useAtomValue(variableSettingssAtom);
  const [variableSliderStates, setVariableSliderStates] = useAtom(
    variableSliderStatesAtom,
  );
  const updateVariableSliderValue = useSetAtom(updateVariableSliderValueAtom);

  const [searchTerm, setSearchTerm] = useState("");
  const [showingInactive, setShowingInactive] = useState(true);

  const filteredVariables = variables
    .filter((v) => showingInactive || variableSliderStates[v.id])
    .filter((v) => v.type === "settable")
    .filter(
      (v) =>
        variableSettingss[v.id].displayName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const unfilteredGroups = new Map(
    groupVariables(
      variables.filter((v) => v.type === "settable"),
      SLIDER_CATEGORY_ORDER,
    ),
  );
  const filteredGroups = groupVariables(
    filteredVariables,
    SLIDER_CATEGORY_ORDER,
  );

  const handleValueChange = useCallback(
    (variable: SettableVariable, newValue: number) => {
      updateVariableSliderValue({
        variableName: variable.id,
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
            [variable.id]: getInitialSliderState(variable),
          };
        } else {
          const { [variable.id]: _, ...rest } = old;
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
        [variable.id]: newState,
      }));
    },
    [setVariableSliderStates],
  );

  return (
    <div className={styles.panel} data-testid="sliders-panel">
      <div className={styles.topbar}>
        <SearchBox
          className={styles.searchBox}
          name="slider-variable-search"
          placeholder="Variable Name"
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <Button onClick={() => setShowingInactive(!showingInactive)}>
          {showingInactive ? (
            <ClosedEyeIcon width="1em" height="1em" />
          ) : (
            <EyeIcon width="1em" height="1em" />
          )}
          {showingInactive ? "Hide Inactive" : "Show Inactive"}
        </Button>

        <Button
          className={styles.close}
          aria-label="Close"
          onClick={onClose}
          style="ghostText"
          iconOnly
        >
          <CrossIcon width="1em" height="1em" aria-hidden />
        </Button>
      </div>

      <div className={styles.sliders}>
        {filteredVariables.length === 0 ? (
          <p className={styles.noVariables}>No Variables</p>
        ) : (
          filteredGroups.map(([group, vars]) => {
            const unfilteredVars = unfilteredGroups.get(group)!;
            // prettier-ignore
            const checkboxState =
              unfilteredVars.every((v) => variableSliderStates[v.id]) ? true
              : unfilteredVars.some((v) => variableSliderStates[v.id]) ? "indeterminate"
              : false;

            const handleGroupToggle = (on: boolean) => {
              for (const v of unfilteredVars) {
                handleToggle(v, on);
              }
            };

            return (
              <div key={group} className={styles.group}>
                <h3 className={styles.groupTitle}>
                  {searchTerm.length === 0 && (
                    <Checkbox
                      name={`slider-group-${group}`}
                      value={checkboxState}
                      onChange={handleGroupToggle}
                    />
                  )}
                  <label htmlFor={`slider-group-${group}`}>{group}</label>
                </h3>
                {vars.map((v) => (
                  <VariableSlider
                    key={v.id}
                    variable={v}
                    settings={variableSettingss[v.id]}
                    sliderState={variableSliderStates[v.id]}
                    onToggle={handleToggle}
                    onValueChange={handleValueChange}
                    onStateChange={handleStateChange}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SlidersPanel;
