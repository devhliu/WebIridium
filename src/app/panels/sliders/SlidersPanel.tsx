import { useCallback, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import styles from "./SlidersPanel.module.css";

import { type SettableVariable } from "@/features/simulation/Simulator";

import { variablesAtom } from "@/globals/workspace/model";
import {
  getInitialSliderState,
  updateAndSimulateVariableSlidersAtom,
  variableSliderStatesAtom,
  type VariableSliderState,
} from "@/globals/workspace/slider";
import {
  parameterScanOptionsAtom,
  variableSettingssAtom,
} from "@/globals/workspace/settings";
import { groupVariables } from "@/features/category";
import { simulationResultAtom } from "@/globals/workspace/simulation";

import VariableSlider from "./VariableSlider";
import AddAsCommentButton from "./AddAsCommentButton";
import SearchBox from "@/components/input/SearchBox";
import Button from "@/components/Button";

import EyeIcon from "@/assets/icons/EyeIcon.svg?react";
import ClosedEyeIcon from "@/assets/icons/ClosedEyeIcon.svg?react";
import CrossIcon from "@/assets/icons/CrossIcon.svg?react";
import IconButton from "@/components/IconButton";

const SLIDER_CATEGORY_ORDER = [
  "Parameters",
  "Floating Species",
  "Boundary Species",
];
export interface SlidersPanelProps {
  onClose: () => void;
}

const SlidersPanel = ({ onClose }: SlidersPanelProps) => {
  const variables = useAtomValue(variablesAtom);
  const variableSettingss = useAtomValue(variableSettingssAtom);
  const [variableSliderStates, setVariableSliderStates] = useAtom(
    variableSliderStatesAtom,
  );
  const updateAndSimulateVariableSliders = useSetAtom(
    updateAndSimulateVariableSlidersAtom,
  );
  const parameterScanOptions = useAtomValue(parameterScanOptionsAtom);
  const simulationResult = useAtomValue(simulationResultAtom);

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

  const filteredGroups = groupVariables(
    filteredVariables,
    SLIDER_CATEGORY_ORDER,
  );

  const handleValueChange = useCallback(
    (variable: SettableVariable, newValue: number) => {
      updateAndSimulateVariableSliders({
        patchIn: {
          [variable.id]: newValue,
        },
      });
    },
    [updateAndSimulateVariableSliders],
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

        <AddAsCommentButton />

        <Button onClick={() => setShowingInactive(!showingInactive)}>
          {showingInactive ? (
            <ClosedEyeIcon width="1em" height="1em" />
          ) : (
            <EyeIcon width="1em" height="1em" />
          )}
          {showingInactive ? "Hide Inactive" : "Show Inactive"}
        </Button>

        <IconButton label="Close" onClick={onClose}>
          <CrossIcon width="1em" height="1em" aria-hidden />
        </IconButton>
      </div>

      <div className={styles.sliders}>
        {filteredVariables.length === 0 ? (
          <p className={styles.noVariables}>No Variables</p>
        ) : (
          filteredGroups.map(([group, vars]) => {
            const allActive = vars.every((v) => variableSliderStates[v.id]);

            const handleGroupToggle = (on: boolean) => {
              for (const v of vars) {
                if (!variableSliderStates[v.id]) {
                  handleToggle(v, on);
                }
              }
            };

            return (
              <div key={group} className={styles.group}>
                <h3 className={styles.groupTitle}>
                  {group}
                  {searchTerm.length === 0 && (
                    <Button onClick={() => handleGroupToggle(!allActive)}>
                      {allActive ? <>Deactivate All</> : <>Activate All</>}
                    </Button>
                  )}
                </h3>
                {vars.map((v) => (
                  <VariableSlider
                    key={v.id}
                    variable={v}
                    settings={variableSettingss[v.id]}
                    sliderState={variableSliderStates[v.id]}
                    disabled={
                      simulationResult?.type === "parameterScan" &&
                      parameterScanOptions.varyingParameter === v.id
                    }
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
