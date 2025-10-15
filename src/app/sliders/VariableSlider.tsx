import clsx from "clsx";
import { memo } from "react";

import styles from "./SlidersPanel.module.css";

import type { SettableVariable } from "@/features/simulation/Simulator";
import type { VariableSettings } from "@/globals/workspace/settings";
import {
  type VariableSliderState,
  getInitialSliderState,
} from "@/globals/workspace/slider";

import ResetIcon from "@/assets/icons/ResetIcon.svg?react";

import Slider from "@/components/input/Slider";
import Checkbox from "@/components/input/Checkbox";
import NumberBox from "@/components/input/NumberBox";
import { getVariableSetDisplayName } from "@/features/simulation/variableNames";
import IconButton from "@/components/IconButton";

export interface VariableSliderProps {
  variable: SettableVariable;
  settings: VariableSettings;
  sliderState: VariableSliderState | undefined;
  disabled?: boolean;
  onToggle: (variable: SettableVariable, on: boolean) => void;
  onStateChange: (
    variable: SettableVariable,
    newState: VariableSliderState,
  ) => void;
  /** Specifically for `value` changes. Should also trigger a resimulation. */
  onValueChange: (variable: SettableVariable, newValue: number) => void;
}

const SLIDER_TOTAL_STEPS = 100;

const VariableSlider = memo(
  ({
    variable,
    settings,
    sliderState,
    disabled = false,
    onToggle,
    onValueChange,
    onStateChange,
  }: VariableSliderProps) => {
    const handleToggle = () => {
      if (sliderState) {
        onToggle(variable, false);
      } else {
        onToggle(variable, true);
      }
    };

    const handleChangeFor = (property: keyof VariableSliderState) => {
      if (!sliderState) throw new Error("sliderState is uninitialized");
      return (newValue: unknown) => {
        if (property === "value") {
          onValueChange(variable, newValue as number);
        } else {
          onStateChange(variable, {
            ...sliderState,
            [property]: newValue,
          });
        }
      };
    };

    return (
      <div
        className={clsx(
          styles.sliderContainer,
          !sliderState && styles.disabled,
        )}
      >
        <p className={styles.sliderTitle}>
          {/* TODO: what should the checkbox's name/id really be? */}
          <Checkbox
            className={styles.sliderCheckbox}
            name={variable.name}
            value={Boolean(sliderState)}
            onChange={handleToggle}
            disabled={disabled}
          />
          <label
            className={styles.sliderTitleMainLabel}
            htmlFor={variable.name}
          >
            {getVariableSetDisplayName(variable, settings)}
          </label>

          {sliderState && (
            <>
              <IconButton
                label="Reset"
                onClick={() => {
                  const newState = getInitialSliderState(variable);
                  onStateChange(variable, newState);
                  onValueChange(variable, newState.value);
                }}
              >
                <ResetIcon width="1em" height="1em" />
              </IconButton>
              <label
                className={styles.sliderTitleLabel}
                htmlFor={`${variable.name}-value`}
              >
                Value
              </label>
              <NumberBox
                className={styles.sliderNumberBox}
                name={`${variable.name}-value`}
                value={sliderState.value}
                onChange={handleChangeFor("value")}
                disabled={disabled}
              />

              <label
                className={styles.sliderTitleLabel}
                htmlFor={`${variable.name}-min`}
              >
                Min
              </label>
              <NumberBox
                className={styles.sliderNumberBox}
                name={`${variable.name}-min`}
                value={sliderState.min}
                onChange={handleChangeFor("min")}
                validator={(value) => value < sliderState.max}
                disabled={disabled}
              />

              <label
                className={styles.sliderTitleLabel}
                htmlFor={`${variable.name}-max`}
              >
                Max
              </label>
              <NumberBox
                className={styles.sliderNumberBox}
                name={`${variable.name}-max`}
                value={sliderState.max}
                onChange={handleChangeFor("max")}
                validator={(value) => value > sliderState.min}
                disabled={disabled}
              />
            </>
          )}
        </p>

        {sliderState && (
          <Slider
            className={styles.sliderActualSlider}
            min={sliderState.min}
            max={sliderState.max}
            step={(sliderState.max - sliderState.min) / SLIDER_TOTAL_STEPS}
            value={sliderState.value}
            onChange={handleChangeFor("value")}
            disabled={disabled}
          />
        )}
      </div>
    );
  },
);

export default VariableSlider;
