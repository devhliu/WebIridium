import { useState } from "react";
import { useAtom } from "jotai";

import styles from "./simulation.module.css";
import Button from "@/components/Button";
import PlayIcon from "@/assets/icons//PlayIcon.svg?react";
import PropertyAccordion from "@/components/property-accordion/PropertyAccordion";
import PropertyAccordionItem from "@/components/property-accordion/PropertyAccordionItem";
import PropertyList from "@/components/property-list/PropertyList";
import { timeCourseParametersAtom } from "@/stores/workspace";
import { useSimulate } from "@/features/simulation/useSimulate";
import PropertyGenerator, {
  type Properties,
} from "@/components/property-list/PropertyGenerator";
import VariableList from "@/components/variable-list/VariableList";

export interface TimeCoursePanelProps {
  visible: boolean;
}

export const TimeCoursePanel = ({ visible }: TimeCoursePanelProps) => {
  const { isSimulating, simulateTimeCourse } = useSimulate();
  const [timeCourseParameters, setTimeCourseParameters] = useAtom(
    timeCourseParametersAtom,
  );
  const [abortSimulation, setAbortSimulation] =
    useState<AbortController | null>(null);

  const handleSimulateClick = () => {
    if (abortSimulation) {
      abortSimulation.abort();
    }

    const controller = new AbortController();
    setAbortSimulation(controller);

    void simulateTimeCourse(controller.signal);
  };

  const handleCancelClick = () => {
    if (abortSimulation) {
      abortSimulation.abort();
      setAbortSimulation(null);
    }
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

        <PropertyAccordion defaultValue={["sim-params", "dependent-variables"]}>
          <PropertyAccordionItem
            title="Simulation Parameters"
            value="sim-params"
          >
            <PropertyList>
              <PropertyGenerator
                properties={timeCourseParameters as unknown as Properties}
                setProperty={(parameter, newValue) =>
                  setTimeCourseParameters({
                    ...timeCourseParameters,
                    [parameter]: newValue,
                  })
                }
                names={{
                  startTime: "Start Time",
                  endTime: "End Time",
                  numberOfPoints: "Number of Points",
                }}
                restrictions={[
                  {
                    restriction: "range",
                    minProperty: "startTime",
                    maxProperty: "endTime",
                  },
                  {
                    restriction: "bounds",
                    properties: ["startTime", "endTime", "numberOfPoints"],
                    min: 0,
                    max: 1_000_000,
                  },
                  { restriction: "integer", property: "numberOfPoints" },
                ]}
              />
            </PropertyList>
          </PropertyAccordionItem>

          <PropertyAccordionItem
            title="Dependent Variables"
            value="dependent-variables"
          >
            <VariableList
              variables={[
                { name: "test", visible: false },
                { name: "test2", visible: false },
              ]}
            />
          </PropertyAccordionItem>
        </PropertyAccordion>
      </div>
    );
  }
};

export default TimeCoursePanel;
