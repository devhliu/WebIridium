import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { timeCourseParametersAtom } from "@/globals/workspace/settings";

import styles from "./simulation.module.css";
import { useToast } from "@/components/Toast";
import Button from "@/components/Button";
import PlayIcon from "@/assets/icons//PlayIcon.svg?react";

import PropertyAccordion from "@/components/property-accordion/PropertyAccordion";
import PropertyAccordionItem from "@/components/property-accordion/PropertyAccordionItem";

import UncontrolledVariableList from "@/app/variable-list/UncontrolledVariableList";
import IndependentVariableSelector from "@/app/IndependentVariableSelector";
import TimeCoursePropertyList from "./TimeCoursePropertyList";

import {
  simulateTimeCourseAtom,
  currentSimulationTypeAtom,
  cancelSimulationAtom,
} from "@/globals/workspace/simulation";

export interface TimeCoursePanelProps {
  visible: boolean;
}

export const TimeCoursePanel = ({ visible }: TimeCoursePanelProps) => {
  const { toast } = useToast();
  const currentSimulationType = useAtomValue(currentSimulationTypeAtom);
  const simulateTimeCourse = useSetAtom(simulateTimeCourseAtom);
  const cancelSimulation = useSetAtom(cancelSimulationAtom);
  const [timeCourseParameters, setTimeCourseParameters] = useAtom(
    timeCourseParametersAtom,
  );

  const handleSimulateClick = async () => {
    const result = await simulateTimeCourse();
    if (result.type === "failure") {
      toast({
        type: "error",
        title: "Time Course Error",
        description: result.message,
      });
    }
  };

  const handleCancelClick = () => {
    cancelSimulation();
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
        isLoading={Boolean(currentSimulationType)}
        onClick={handleSimulateClick}
        canCancel={currentSimulationType === "timeCourse"}
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
