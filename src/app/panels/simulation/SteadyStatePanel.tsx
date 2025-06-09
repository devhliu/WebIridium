import { useState } from "react";
import styles from "./simulation.module.css";
import Button from "@/components/Button";
import PlayIcon from "@/assets/icons//PlayIcon.svg?react";
import { useSimulate } from "@/features/simulation/useSimulate";

export const SteadyStatePanel = () => {
  const { isSimulating, computeSteadyState } = useSimulate();
  const [abortSimulation, setAbortSimulation] = useState<AbortController | null>(null);

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

  return (
    <div className={styles.simulationPanel}>
      <h1 className={styles.panelTitle}>Steady State Simulation</h1>
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
