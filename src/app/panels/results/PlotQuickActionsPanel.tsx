import { useAtom } from "jotai";
import clsx from "clsx";

import styles from "./results.module.css";
import buttonStyles from "@/components/Button.module.css";

import PropertyList from "@/components/property-list/PropertyList";
import BooleanProperty from "@/components/property-list/BooleanProperty";
import NumericProperty from "@/components/property-list/NumericProperty";

import CrossIcon from "@/assets/icons/CrossIcon.svg?react";
import PencilIcon from "@/assets/icons/PencilIcon.svg?react";

import {
  graphSettingsAtom,
  type GraphSettings,
} from "@/globals/workspace/settings";
import { currentVeryRightPanelAtom } from "@/globals/workspace/layout";

const PlotQuickActionsPanel = () => {
  const [graphSettings, setGraphSettings] = useAtom(graphSettingsAtom);

  const [currentVeryRightPanel, setCurrentVeryRightPanel] = useAtom(
    currentVeryRightPanelAtom,
  );

  const handleChangeFor = (
    setting: keyof GraphSettings,
  ): ((newValue: unknown) => void) => {
    return (newValue) => {
      setGraphSettings({ ...graphSettings, [setting]: newValue });
    };
  };

  return (
    <div className={styles.quickActionsContainer}>
      <div className={styles.quickActionsButtons}>
        {currentVeryRightPanel === "Plot Settings" ? (
          <button
            className={clsx(buttonStyles.default, styles.quickActionsButton)}
            onClick={() => setCurrentVeryRightPanel(null)}
          >
            <CrossIcon width="1em" height="1em" />
            Close Settings
          </button>
        ) : (
          <button
            className={clsx(buttonStyles.default, styles.quickActionsButton)}
            onClick={() => setCurrentVeryRightPanel("Plot Settings")}
          >
            <PencilIcon width="1em" height="1em" />
            Edit Graph
          </button>
        )}
      </div>

      <div className={styles.quickActionsSettings}>
        <PropertyList alignment="leftSmall">
          <BooleanProperty
            name="Show Legend"
            value={graphSettings.legend.visible}
            onChange={(visible) =>
              handleChangeFor("legend")({ ...graphSettings.legend, visible })
            }
          />
          <BooleanProperty
            name="Autoscale X"
            value={graphSettings.isAutoscaledX}
            onChange={handleChangeFor("isAutoscaledX")}
          />
          {!graphSettings.isAutoscaledX && (
            <NumericProperty
              name="X Minimum"
              value={graphSettings.minX}
              onChange={handleChangeFor("minX")}
              validator={(newValue) => newValue < graphSettings.maxX}
            />
          )}
          {!graphSettings.isAutoscaledX && (
            <NumericProperty
              name="X Maximum"
              value={graphSettings.maxX}
              onChange={handleChangeFor("maxX")}
              validator={(newValue) => newValue > graphSettings.minX}
            />
          )}

          <BooleanProperty
            name="Autoscale Y"
            value={graphSettings.isAutoscaledY}
            onChange={handleChangeFor("isAutoscaledY")}
          />
          {!graphSettings.isAutoscaledY && (
            <NumericProperty
              name="Y Minimum"
              value={graphSettings.minY}
              onChange={handleChangeFor("minY")}
              validator={(newValue) => newValue < graphSettings.maxY}
            />
          )}
          {!graphSettings.isAutoscaledY && (
            <NumericProperty
              name="Y Maximum"
              value={graphSettings.maxY}
              onChange={handleChangeFor("maxY")}
              validator={(newValue) => newValue > graphSettings.minY}
            />
          )}
        </PropertyList>
      </div>
    </div>
  );
};

export default PlotQuickActionsPanel;
