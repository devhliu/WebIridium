import { useState } from "react";
import styles from "./simulation.module.css";
import Button from "@/components/Button";
import PlayIcon from "@/assets/icons//PlayIcon.svg?react";
import { useSimulate } from "@/features/simulation/useSimulate";

export interface SteadyStatePanelProps {
  visible: boolean;
}

export const SteadyStatePanel = ({ visible }: SteadyStatePanelProps) => {
  const { isSimulating, computeSteadyState } = useSimulate();
  const [abortSimulation, setAbortSimulation] =
    useState<AbortController | null>(null);

  const handleSimulateClick = () => {
    if (abortSimulation) {
      abortSimulation.abort();
    }

    const controller = new AbortController();
    setAbortSimulation(controller);

    void computeSteadyState(controller.signal);
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
      <div data-testid="steadyStatePanel" className={styles.simulationPanel}>
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
  }
};

export default SteadyStatePanel;
