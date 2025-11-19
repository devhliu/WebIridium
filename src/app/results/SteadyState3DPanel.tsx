import { useAtomValue, useAtom } from "jotai";

import styles from "./results.module.css";

import SelectProperty from "@/components/property-list/SelectProperty";
import BooleanProperty from "@/components/property-list/BooleanProperty";
import NumericProperty from "@/components/property-list/NumericProperty";
import PropertyList from "@/components/property-list/PropertyList";
import ArrayBarChart3D from "./visuals/ArrayBarChart3D";
import { Allotment } from "allotment";

import { simulationResultAtom } from "@/globals/simulation";
import { graphSettingsAtom, steadyState3DItemAtom } from "@/globals/settings";
import { PALETTES } from "@/features/colors";

const ITEMS = [
  "Jacobian",
  "Flux Control",
  "Concentration Control",
  "Elasticities",
];

const AXES: { [name: string]: { x: string; y: string; z: string } } = {
  Jacobian: { x: "X", y: "Y", z: "Z" },
  "Flux Control": { x: "Reaction", y: "Flux", z: "Coefficient" },
  "Concentration Control": { x: "Reaction", y: "Species", z: "Coefficient" },
  Elasticities: { x: "Species", y: "Reaction", z: "Elasticity" },
};

const ITEM_OPTIONS = Object.fromEntries(ITEMS.map((i) => [i, i]));

const SteadyState3DPanel = () => {
  const result = useAtomValue(simulationResultAtom);
  const [graphSettings, setGraphSettings] = useAtom(graphSettingsAtom);
  const [item, setItem] = useAtom(steadyState3DItemAtom);

  const handleZAxisChangeFor = (
    setting: keyof Pick<
      typeof graphSettings,
      "isAutoscaledZ" | "minZ" | "maxZ" | "colorScheme3D"
    >,
  ): ((newValue: unknown) => void) => {
    return (newValue) => {
      setGraphSettings({ ...graphSettings, [setting]: newValue });
    };
  };

  const colorSchemeOptions = Object.fromEntries(
    Object.keys(PALETTES).map((name) => [name, name]),
  );

  if (result?.type !== "steadyState") {
    return null;
  }

  // prettier-ignore
  const resultItem =
    item === "Jacobian" ? result.jacobian :
    item === "Flux Control" ? result.fluxControl :
    item === "Concentration Control" ? result.concentrationControl :
    result.elasticities;

  return (
    <div className={styles.panel}>
      <Allotment vertical>
        <div className={styles.plotContainer}>
          <div className={styles.steadyState3DPanel}>
            <SelectProperty
              name="Item"
              value={item}
              options={ITEM_OPTIONS}
              onChange={(newValue) => setItem(newValue as typeof item)}
            />

            <ArrayBarChart3D
              name={item}
              data={resultItem}
              x={AXES[item].x}
              y={AXES[item].y}
              z={AXES[item].z}
              isAutoscaledZ={graphSettings.isAutoscaledZ}
              minZ={graphSettings.minZ}
              maxZ={graphSettings.maxZ}
              colorScheme={graphSettings.colorScheme3D}
            />
          </div>
        </div>

        <Allotment.Pane preferredSize={200}>
          <div className={styles.quickActionsContainer}>
            <div className={styles.quickActionsSettings}>
              <PropertyList alignment="leftSmall">
                <BooleanProperty
                  name="Autoscale Z"
                  value={graphSettings.isAutoscaledZ}
                  onChange={handleZAxisChangeFor("isAutoscaledZ")}
                />
                {!graphSettings.isAutoscaledZ && (
                  <NumericProperty
                    name="Z Minimum"
                    value={graphSettings.minZ}
                    onChange={handleZAxisChangeFor("minZ")}
                    validator={(newValue) => newValue < graphSettings.maxZ}
                  />
                )}
                {!graphSettings.isAutoscaledZ && (
                  <NumericProperty
                    name="Z Maximum"
                    value={graphSettings.maxZ}
                    onChange={handleZAxisChangeFor("maxZ")}
                    validator={(newValue) => newValue > graphSettings.minZ}
                  />
                )}
                <SelectProperty
                  name="Color Scheme"
                  value={graphSettings.colorScheme3D}
                  options={colorSchemeOptions}
                  onChange={handleZAxisChangeFor("colorScheme3D") as (newValue: string) => void}
                />
              </PropertyList>
            </div>
          </div>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};

export default SteadyState3DPanel;
