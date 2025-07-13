import { useAtom } from "jotai";

import styles from "./results.module.css";

import PropertyList from "@/components/property-list/PropertyList";
import BooleanProperty from "@/components/property-list/BooleanProperty";
import NumericProperty from "@/components/property-list/NumericProperty";

import PencilIcon from "@/assets/icons/PencilIcon.svg?react";

import {
  graphSettingsAtom,
  type GraphSettings,
} from "@/globals/workspace/settings";
import Button from "@/components/Button";

const PlotQuickActionsPanel = () => {
  const [graphSettings, setGraphSettings] = useAtom(graphSettingsAtom);

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
        <Button className={styles.quickActionsButton}>
          <PencilIcon width="1em" height="1em" />
          Edit Graph
        </Button>
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
