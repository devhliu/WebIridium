import { useState } from "react";
import { useAtom } from "jotai";

import { useSimulate } from "@/features/simulation/useSimulate";

import styles from "./simulation.module.css";
import { useToast } from "@/components/Toast";
import Button from "@/components/Button";
import PlayIcon from "@/assets/icons//PlayIcon.svg?react";

import PropertyAccordion from "@/components/property-accordion/PropertyAccordion";
import PropertyAccordionItem from "@/components/property-accordion/PropertyAccordionItem";
import PropertyList from "@/components/property-list/PropertyList";
import NumericProperty from "@/components/property-list/NumericProperty";
import { timeCourseParametersAtom } from "@/stores/workspace";
import type { TimeCourseParameters } from "@/features/simulation/Simulator";

import UncontrolledVariableList from "@/app/panels/simulation/UncontrolledVariableList";
import IndependentVariableSelector from "@/app/IndependentVariableSelector";
import { MissingDataForVariablesIndicator } from "@/app/MissingDataForVariablesIndicator";

export interface TimeCoursePanelProps {
  visible: boolean;
}

const MAX_PARAMETER_VALUE = 1_0000_000;

const isParameterInRange = (value: number) =>
  0 <= value && value <= MAX_PARAMETER_VALUE;

export const TimeCoursePanel = ({ visible }: TimeCoursePanelProps) => {
  const { toast } = useToast();
  const { isSimulating, simulateTimeCourse } = useSimulate();
  const [timeCourseParameters, setTimeCourseParameters] = useAtom(
    timeCourseParametersAtom,
  );
  const [abortSimulation, setAbortSimulation] =
    useState<AbortController | null>(null);

  const handleSimulateClick = async () => {
    if (abortSimulation) {
      abortSimulation.abort();
    }

    const controller = new AbortController();
    setAbortSimulation(controller);

    const result = await simulateTimeCourse(controller.signal);
    if (result.type === "failure") {
      toast({
        type: "error",
        title: "Time Course Error",
        description: result.message,
      });
    }
  };

  const handleCancelClick = () => {
    if (abortSimulation) {
      abortSimulation.abort();
      setAbortSimulation(null);
    }
  };

  const handleChangeFor = (parameter: keyof TimeCourseParameters) => {
    return (newValue: number) => {
      setTimeCourseParameters({
        ...timeCourseParameters,
        [parameter]: newValue,
      });
    };
  };

  if (!visible) {
    return null;
  } else {
    return (
      <div data-testid="timeCoursePanel" className={styles.simulationPanel}>
        <h1 className={styles.panelTitle}>Time Course Simulation</h1>
        <Button
          icon={<PlayIcon />}
          isLoading={isSimulating}
          onClick={handleSimulateClick}
          canCancel={isSimulating && !!abortSimulation}
          onCancel={handleCancelClick}
        >
          Simulate
        </Button>
        <MissingDataForVariablesIndicator />

        <PropertyAccordion
          defaultValue={[
            "sim-params",
            "independent-variables",
            "dependent-variables",
          ]}
        >
          <PropertyAccordionItem
            title="Simulation Parameters"
            value="sim-params"
          >
            <PropertyList alignment="left">
              <NumericProperty
                name="Start Time"
                value={timeCourseParameters.startTime}
                onChange={handleChangeFor("startTime")}
                validator={(value) =>
                  isParameterInRange(value) &&
                  value < timeCourseParameters.endTime
                }
              />
              <NumericProperty
                name="End Time"
                value={timeCourseParameters.endTime}
                onChange={handleChangeFor("endTime")}
                validator={(value) =>
                  isParameterInRange(value) &&
                  value > timeCourseParameters.startTime
                }
              />
              <NumericProperty
                name="Number of Points"
                value={timeCourseParameters.numberOfPoints}
                onChange={handleChangeFor("numberOfPoints")}
                validator={(value) =>
                  isParameterInRange(value) && value === Math.floor(value)
                }
              />
            </PropertyList>
          </PropertyAccordionItem>

          <PropertyAccordionItem
            title="Independent Variable"
            value="independent-variables"
          >
            <IndependentVariableSelector />
          </PropertyAccordionItem>

          <PropertyAccordionItem
            title="Dependent Variables"
            value="dependent-variables"
          >
            <UncontrolledVariableList />
          </PropertyAccordionItem>
        </PropertyAccordion>
      </div>
    );
  }
};

export default TimeCoursePanel;
