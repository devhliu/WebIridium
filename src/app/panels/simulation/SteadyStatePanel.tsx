import { useAtomValue, useSetAtom } from "jotai";

import { useToast } from "@/components/Toast";
import PlayIcon from "@/assets/icons//PlayIcon.svg?react";
import CancellableButton from "@/components/CancellableButton";
import SimulationPanel from "./SimulationPanel";

import {
  cancelSimulationAtom,
  computeSteadyStateAtom,
  isSimulatingAtom,
} from "@/globals/workspace/simulation";
import { modelStatusAtom } from "@/globals/workspace/model";
import { isSliderSimulationQueuedAtom } from "@/globals/workspace/slider";

export interface SteadyStatePanelProps {
  visible: boolean;

  slidersPanelActive: boolean;
  onSlidersPanelToggle: (on: boolean) => void;
}

export const SteadyStatePanel = ({
  visible,
  slidersPanelActive,
  onSlidersPanelToggle,
}: SteadyStatePanelProps) => {
  const { toast } = useToast();
  const isSimulating = useAtomValue(isSimulatingAtom);
  const isSliderSimulationQueued = useAtomValue(isSliderSimulationQueuedAtom);
  const modelStatus = useAtomValue(modelStatusAtom);
  const computeSteadyState = useSetAtom(computeSteadyStateAtom);
  const cancelSimulation = useSetAtom(cancelSimulationAtom);

  const handleSimulateClick = async () => {
    const result = await computeSteadyState();
    if (result.type === "failure") {
      toast({
        type: "error",
        title: "Steady State Error",
        description: result.message,
      });
    }
  };

  const handleCancelClick = () => {
    cancelSimulation();
  };

  return (
    <SimulationPanel
      title="Compute Steady State"
      visible={visible}
      slidersPanelActive={slidersPanelActive}
      onSlidersPanelToggle={onSlidersPanelToggle}
      data-testid="steadyStatePanel"
    >
      <CancellableButton
        icon={<PlayIcon />}
        disabled={modelStatus.type === "loading"}
        isLoading={isSimulating || isSliderSimulationQueued}
        onClick={handleSimulateClick}
        canCancel={isSimulating}
        onCancel={handleCancelClick}
      >
        Compute
      </CancellableButton>
    </SimulationPanel>
  );
};

export default SteadyStatePanel;
