import { useAtom } from "jotai";
import { useState } from "react";

import { useSimulate } from "@/features/simulation/useSimulate";
import { timeCourseParametersAtom } from "@/stores/workspace";

import styles from "./simulation.module.css";
import { useToast } from "@/components/Toast";
import Button from "@/components/Button";
import PlayIcon from "@/assets/icons//PlayIcon.svg?react";

import PropertyAccordion from "@/components/property-accordion/PropertyAccordion";
import PropertyAccordionItem from "@/components/property-accordion/PropertyAccordionItem";

import UncontrolledVariableList from "@/app/variable-list/UncontrolledVariableList";
import IndependentVariableSelector from "@/app/IndependentVariableSelector";
import TimeCoursePropertyList from "./TimeCoursePropertyList";

export interface TimeCoursePanelProps {
  visible: boolean;
}

export const TimeCoursePanel = ({ visible }: TimeCoursePanelProps) => {
  const { toast } = useToast();
  const { isSimulating, simulateTimeCourse } = useSimulate();
  const [abortSimulation, setAbortSimulation] =
    useState<AbortController | null>(null);
  const [timeCourseParameters, setTimeCourseParameters] = useAtom(
    timeCourseParametersAtom,
  );

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

  return (
    <div
      data-testid="timeCoursePanel"
      className={styles.simulationPanel}
      style={visible ? {} : { display: "none" }}
    >
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

      <PropertyAccordion
        defaultOpen={[
          "Simulation Parameters",
          "Independent Variable",
          "Dependent Variables",
        ]}
      >
        <PropertyAccordionItem title="Simulation Parameters">
          <TimeCoursePropertyList
            parameters={timeCourseParameters}
            onParameterChange={setTimeCourseParameters}
          />
        </PropertyAccordionItem>

        <PropertyAccordionItem title="Independent Variable">
          <IndependentVariableSelector />
        </PropertyAccordionItem>

        <PropertyAccordionItem title="Dependent Variables">
          <UncontrolledVariableList />
        </PropertyAccordionItem>
      </PropertyAccordion>
    </div>
  );
};

export default TimeCoursePanel;
