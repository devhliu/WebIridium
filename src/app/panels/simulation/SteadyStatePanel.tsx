import { useState } from "react";
import styles from "./simulation.module.css";
import { useSimulate } from "@/features/simulation/useSimulate";
import { useToast } from "@/components/Toast";
import Button from "@/components/Button";
import PlayIcon from "@/assets/icons//PlayIcon.svg?react";

export interface SteadyStatePanelProps {
  visible: boolean;
}

export const SteadyStatePanel = ({ visible }: SteadyStatePanelProps) => {
  const { toast } = useToast();
  const { isSimulating, computeSteadyState } = useSimulate();
  const [abortSimulation, setAbortSimulation] =
    useState<AbortController | null>(null);

  const handleSimulateClick = async () => {
    if (abortSimulation) {
      abortSimulation.abort();
    }

    const controller = new AbortController();
    setAbortSimulation(controller);

    const result = await computeSteadyState(controller.signal);
    if (result.type === "failure") {
      toast({
        type: "error",
        title: "Steady State Error",
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
      data-testid="steadyStatePanel"
      className={styles.simulationPanel}
      style={visible ? {} : { display: "none" }}
    >
      <h1 className={styles.panelTitle}>Compute Steady State</h1>
      <Button
        icon={<PlayIcon />}
        isLoading={isSimulating}
        onClick={handleSimulateClick}
        canCancel={isSimulating && !!abortSimulation}
        onCancel={handleCancelClick}
      >
        Compute
      </Button>
    </div>
  );
};

export default SteadyStatePanel;
