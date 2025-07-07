import { useAtomValue, useSetAtom } from "jotai";

import styles from "./simulation.module.css";
import { useToast } from "@/components/Toast";
import Button from "@/components/Button";
import PlayIcon from "@/assets/icons//PlayIcon.svg?react";
import {
  cancelSimulationAtom,
  computeSteadyStateAtom,
  isSimulatingAtom,
} from "@/globals/workspace/simulation";
import { modelStatusAtom } from "@/globals/workspace/model";

export interface SteadyStatePanelProps {
  visible: boolean;
}

export const SteadyStatePanel = ({ visible }: SteadyStatePanelProps) => {
  const { toast } = useToast();
  const isSimulating = useAtomValue(isSimulatingAtom);
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
    <div
      data-testid="steadyStatePanel"
      className={styles.simulationPanel}
      style={visible ? {} : { display: "none" }}
    >
      <h1 className={styles.panelTitle}>Compute Steady State</h1>
      <Button
        icon={<PlayIcon />}
        isLoading={isSimulating || modelStatus.type === "loading"}
        onClick={handleSimulateClick}
        canCancel={isSimulating}
        onCancel={handleCancelClick}
      >
        Compute
      </Button>
    </div>
  );
};

export default SteadyStatePanel;
