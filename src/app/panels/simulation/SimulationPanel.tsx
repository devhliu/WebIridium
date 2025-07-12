import PanelTitle from "../PanelTitle";
import styles from "./simulation.module.css";

import SlidersIcon from "@/assets/icons/SlidersIcon.svg?react";

export interface SimulationPanelProps {
  title: string;
  visible: boolean;

  slidersPanelActive: boolean;
  onSlidersPanelToggle: (on: boolean) => void;

  children: React.ReactNode;

  ["data-testid"]?: string;
}

const SimulationPanel = ({
  title,
  visible,
  slidersPanelActive,
  onSlidersPanelToggle,
  children,
  ["data-testid"]: testId,
}: SimulationPanelProps) => {
  if (!visible) {
    return null;
  } else {
    return (
      <div data-testid={testId} className={styles.simulationPanel}>
        <PanelTitle title={title}>
          <button
            className={styles.slidersButton}
            aria-label="Sliders"
            aria-pressed={slidersPanelActive}
            onClick={() => onSlidersPanelToggle(!slidersPanelActive)}
          >
            <SlidersIcon aria-hidden width="1em" height="1em" />
          </button>
        </PanelTitle>

        {children}
      </div>
    );
  }
};

export default SimulationPanel;
