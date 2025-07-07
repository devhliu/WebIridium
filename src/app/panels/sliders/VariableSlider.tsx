import clsx from "clsx";
import { memo } from "react";

import styles from "./SlidersPanel.module.css";

import type { SettableVariable } from "@/features/simulation/Simulator";
import type { VariableSettings } from "@/stores/workspace/settings";
import type { VariableSliderState } from "@/stores/workspace/slider";

import Slider from "@/components/input/Slider";
import Checkbox from "@/components/input/Checkbox";
import NumberBox from "@/components/input/NumberBox";

export interface VariableSliderProps {
  variable: SettableVariable;
  settings: VariableSettings;
  sliderState: VariableSliderState | undefined;
  onChange: (
    variableName: string,
    newValue: VariableSliderState | undefined,
  ) => void;
}

const SLIDER_TOTAL_STEPS = 100;

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

const VariableSlider = memo(
  ({ variable, settings, sliderState, onChange }: VariableSliderProps) => {
    const handleToggle = () => {
      if (sliderState) {
        onChange(variable.name, undefined);
      } else {
        onChange(variable.name, getInitialSliderState(variable));
      }
    };

    const handleChangeFor = (property: keyof VariableSliderState) => {
      if (!sliderState) throw new Error("sliderState is uninitialized");
      return (newValue: unknown) => {
        onChange(variable.name, {
          ...sliderState,
          [property]: newValue,
        });
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
          />
          <label
            className={styles.sliderTitleMainLabel}
            htmlFor={variable.name}
          >
            {settings.displayName}
          </label>

          {sliderState && (
            <>
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
              />
            </>
          )}
        </p>

        {sliderState && (
          <Slider
            min={sliderState.min}
            max={sliderState.max}
            step={(sliderState.max - sliderState.min) / SLIDER_TOTAL_STEPS}
            value={sliderState.value}
            onChange={handleChangeFor("value")}
          />
        )}
      </div>
    );
  },
);

export default VariableSlider;
