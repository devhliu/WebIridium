import { useAtom } from "jotai";

import styles from "./simulation.module.css";

import PanelTitle from "../../components/PanelTitle";
import SlidersIcon from "@/assets/icons/SlidersIcon.svg?react";

import { currentBottomPanelAtom } from "@/globals/workspace/layout";
import { Tooltip } from "@/components/Tooltip";

export interface SimulationPanelProps {
  title: string;
  visible: boolean;

  children: React.ReactNode;

  ["data-testid"]?: string;
}

const SimulationPanel = ({
  title,
  visible,
  children,
  ["data-testid"]: testId,
}: SimulationPanelProps) => {
  const [currentBottomPanel, setCurrentBottomPanel] = useAtom(
    currentBottomPanelAtom,
  );

  const toggleSliders = () => {
    if (currentBottomPanel === "Sliders") {
      setCurrentBottomPanel(null);
    } else {
      setCurrentBottomPanel("Sliders");
    }
  };

  if (!visible) {
    return null;
  } else {
    return (
      <div data-testid={testId} className={styles.simulationPanel}>
        <PanelTitle title={title}>
          <button
            className={styles.slidersButton}
            aria-label="Sliders"
            aria-pressed={currentBottomPanel === "Sliders"}
            onClick={toggleSliders}
          >
            <Tooltip text="Sliders">
              <SlidersIcon aria-hidden width="1em" height="1em" />
            </Tooltip>
          </button>
        </PanelTitle>

        {children}
      </div>
    );
  }
};

export default SimulationPanel;
