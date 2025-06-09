import { useState } from "react";
import { useAtom } from "jotai";
import Button from "@/components/Button";
import styles from "./simulation.module.css";
import { useSimulate } from "@/features/simulation/useSimulate";
import PlayIcon from "@/assets/icons//PlayIcon.svg?react";
import PropertyAccordion from "@/components/property-accordion/PropertyAccordion";
import PropertyAccordionItem from "@/components/property-accordion/PropertyAccordionItem";
import { modelInfoAtom, parameterScanParametersAtom } from "@/stores/workspace";
import PropertyList from "@/components/property-list/PropertyList";
import BooleanProperty from "@/components/property-list/BooleanProperty";
import PropertyGenerator, {
  type Properties,
} from "@/components/property-list/PropertyGenerator";
import { useAtomValue } from "jotai";
import { useSimulator } from "@/features/workspace";

export interface ParameterScanPanelProps {
  visible: boolean;
}

const ParameterScanPanel = ({ visible }: ParameterScanPanelProps) => {
  const simulator = useSimulator();
  const [parameterScanParameters, setParameterScanParameters] = useAtom(
    parameterScanParametersAtom,
  );
  const modelInfo = useAtomValue(modelInfoAtom);
  const { isSimulating, runParameterScan } = useSimulate();
  const [abortSimulation, setAbortSimulation] =
    useState<AbortController | null>(null);

  const handleSimulateClick = () => {
    if (abortSimulation) {
      abortSimulation.abort();
    }

    const controller = new AbortController();
    setAbortSimulation(controller);

    void runParameterScan(controller.signal);
  };

  const handleCancelClick = () => {
    if (abortSimulation) {
      abortSimulation.abort();
      setAbortSimulation(null);
    }
  };

  const setProperty = (name: string, value: unknown) => {
    setParameterScanParameters({
      ...parameterScanParameters,
      [name]: value,
    });
  };

  if (!visible) {
    return null;
  } else {
    return (
      <div data-testid="parameterScanPanel" className={styles.simulationPanel}>
        <h1 className={styles.panelTitle}>Parameter Scan</h1>
        <Button
          icon={<PlayIcon />}
          isLoading={isSimulating}
          onClick={handleSimulateClick}
          canCancel={isSimulating && !!abortSimulation}
          onCancel={handleCancelClick}
        >
          Run
        </Button>

        <PropertyAccordion defaultValue={["first-parameter"]}>
          <PropertyAccordionItem
            title="First Parameter"
            value="first-parameter"
          >
            <PropertyList>
              <PropertyGenerator
                properties={parameterScanParameters as unknown as Properties}
                setProperty={setProperty}
                names={{
                  varyingParameter: "Parameter",
                  min: "Min",
                  max: "Max",
                  numberOfValues: "Number of Values",
                }}
                restrictions={[
                  {
                    restriction: "selectWithGroups",
                    property: "varyingParameter",
                    groups: {
                      Parameters: Object.fromEntries(
                        modelInfo?.global_parameters.map((param) => [
                          param.name,
                          param.name,
                        ]) ?? [],
                      ),
                      Species: Object.fromEntries(
                        modelInfo?.species.map((specie) => [
                          specie.name,
                          simulator.getParameterFromSpecies(specie.name),
                        ]) ?? [],
                      ),
                    },
                  },
                  {
                    restriction: "range",
                    minProperty: "min",
                    maxProperty: "max",
                  },
                  {
                    restriction: "bounds",
                    properties: ["min", "max"],
                    min: 0,
                    max: 1_000_000,
                  },
                  {
                    restriction: "bounds",
                    property: "numberOfValues",
                    min: 2,
                    max: 1_000_000,
                  },
                  {
                    restriction: "integer",
                    properties: ["min", "max", "numberOfValues"],
                  },
                ]}
              />
              <BooleanProperty
                asideMode
                name="Use logarithmic distribution"
                value={parameterScanParameters.useLogarithmicDistribution}
                onChange={(value) =>
                  setProperty("useLogarithmicDistribution", value)
                }
              />
            </PropertyList>
          </PropertyAccordionItem>
        </PropertyAccordion>
      </div>
    );
  }
};

export default ParameterScanPanel;
