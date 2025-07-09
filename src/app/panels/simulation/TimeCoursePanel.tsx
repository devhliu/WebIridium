import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { timeCourseParametersAtom } from "@/globals/workspace/settings";

import { useToast } from "@/components/Toast";
import CancellableButton from "@/components/CancellableButton";
import PlayIcon from "@/assets/icons//PlayIcon.svg?react";

import PropertyAccordion from "@/components/property-accordion/PropertyAccordion";
import PropertyAccordionItem from "@/components/property-accordion/PropertyAccordionItem";

import UncontrolledVariableList from "@/app/variable-list/UncontrolledVariableList";
import IndependentVariableSelector from "@/app/IndependentVariableSelector";
import TimeCoursePropertyList from "./TimeCoursePropertyList";
import SimulationPanel from "./SimulationPanel";

import {
  simulateTimeCourseAtom,
  cancelSimulationAtom,
  isSimulatingAtom,
} from "@/globals/workspace/simulation";
import { modelStatusAtom } from "@/globals/workspace/model";
import { isSliderSimulationQueuedAtom } from "@/globals/workspace/slider";

export interface TimeCoursePanelProps {
  visible: boolean;

  slidersPanelActive: boolean;
  onSlidersPanelToggle: (on: boolean) => void;
}

export const TimeCoursePanel = ({
  visible,
  slidersPanelActive,
  onSlidersPanelToggle,
}: TimeCoursePanelProps) => {
  const { toast } = useToast();
  const isSimulating = useAtomValue(isSimulatingAtom);
  const isSliderSimulationQueued = useAtomValue(isSliderSimulationQueuedAtom);
  const modelStatus = useAtomValue(modelStatusAtom);
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
    <SimulationPanel
      title="Time Course Simulation"
      visible={visible}
      slidersPanelActive={slidersPanelActive}
      onSlidersPanelToggle={onSlidersPanelToggle}
      data-testid="timeCoursePanel"
    >
      <CancellableButton
        icon={<PlayIcon />}
        disabled={modelStatus.type === "loading"}
        isLoading={isSimulating || isSliderSimulationQueued}
        onClick={handleSimulateClick}
        canCancel={isSimulating}
        onCancel={handleCancelClick}
      >
        Simulate
      </CancellableButton>

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
    </SimulationPanel>
  );
};

export default TimeCoursePanel;
