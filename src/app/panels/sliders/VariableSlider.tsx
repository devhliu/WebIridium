import clsx from "clsx";
import { memo } from "react";

import styles from "./SlidersPanel.module.css";

import type { SettableVariable } from "@/features/simulation/Simulator";
import type { VariableSettings } from "@/globals/workspace/settings";
import type { VariableSliderState } from "@/globals/workspace/slider";

import Slider from "@/components/input/Slider";
import Checkbox from "@/components/input/Checkbox";
import NumberBox from "@/components/input/NumberBox";

export interface VariableSliderProps {
  variable: SettableVariable;
  settings: VariableSettings;
  sliderState: VariableSliderState | undefined;
  onToggle: (variable: SettableVariable, on: boolean) => void;
  onStateChange: (
    variable: SettableVariable,
    newState: VariableSliderState,
  ) => void;
  onValueChange: (variable: SettableVariable, newValue: number) => void;
}

const SLIDER_TOTAL_STEPS = 100;

const VariableSlider = memo(
  ({
    variable,
    settings,
    sliderState,
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
            name={variable.id}
            value={Boolean(sliderState)}
            onChange={handleToggle}
          />
          <label className={styles.sliderTitleMainLabel} htmlFor={variable.id}>
            {settings.displayName}
          </label>

          {sliderState && (
            <>
              <label
                className={styles.sliderTitleLabel}
                htmlFor={`${variable.id}-value`}
              >
                Value
              </label>
              <NumberBox
                className={styles.sliderNumberBox}
                name={`${variable.id}-value`}
                value={sliderState.value}
                onChange={handleChangeFor("value")}
              />

              <label
                className={styles.sliderTitleLabel}
                htmlFor={`${variable.id}-min`}
              >
                Min
              </label>
              <NumberBox
                className={styles.sliderNumberBox}
                name={`${variable.id}-min`}
                value={sliderState.min}
                onChange={handleChangeFor("min")}
                validator={(value) => value < sliderState.max}
              />

              <label
                className={styles.sliderTitleLabel}
                htmlFor={`${variable.id}-max`}
              >
                Max
              </label>
              <NumberBox
                className={styles.sliderNumberBox}
                name={`${variable.id}-max`}
                value={sliderState.max}
                onChange={handleChangeFor("max")}
                validator={(value) => value > sliderState.min}
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
          />
        )}
      </div>
    );
  },
);

export default VariableSlider;
