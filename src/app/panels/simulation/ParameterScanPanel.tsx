// TODO: fix having <=1 number of values causing an error
// TODO: make sure your min can't be more than max (and add validators for the rest of the stuff)
import { useState } from "react";
import { useAtom, useAtomValue } from "jotai";

import styles from "./simulation.module.css";
import { useSimulate } from "@/features/simulation/useSimulate";
import { parameterScanOptionsAtom, variablesAtom } from "@/stores/workspace";

import { useToast } from "@/components/Toast";
import Button from "@/components/Button";
import PlayIcon from "@/assets/icons//PlayIcon.svg?react";

import PropertyAccordion from "@/components/property-accordion/PropertyAccordion";
import PropertyAccordionItem from "@/components/property-accordion/PropertyAccordionItem";
import PropertyList from "@/components/property-list/PropertyList";

import BooleanProperty from "@/components/property-list/BooleanProperty";
import NumericProperty from "@/components/property-list/NumericProperty";
import SelectProperty from "@/components/property-list/SelectProperty";
import { groupVariablesForSelectComponent } from "@/features/category";

export interface ParameterScanPanelProps {
  visible: boolean;
}

const ParameterScanPanel = ({ visible }: ParameterScanPanelProps) => {
  const { toast } = useToast();
  const variables = useAtomValue(variablesAtom);
  const [parameterScanOptions, setParameterScanOptions] = useAtom(
    parameterScanOptionsAtom,
  );
  const { isSimulating, runParameterScan } = useSimulate();
  const [abortSimulation, setAbortSimulation] =
    useState<AbortController | null>(null);

  const handleSimulateClick = async () => {
    if (abortSimulation) {
      abortSimulation.abort();
    }

    const controller = new AbortController();
    setAbortSimulation(controller);

    const result = await runParameterScan(controller.signal);
    if (result.type === "failure") {
      toast({
        type: "error",
        title: "Parameter Scan Error",
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

  const handleChangeFor = (property: keyof typeof parameterScanOptions) => {
    return (newValue: unknown) => {
      setParameterScanOptions({
        ...parameterScanOptions,
        [property]: newValue,
      });
    };
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
              {parameterScanOptions.varyingParameter && (
                <SelectProperty
                  name="Parameter"
                  value={parameterScanOptions.varyingParameter}
                  onChange={handleChangeFor("varyingParameter")}
                  groups={groupVariablesForSelectComponent(
                    variables.filter((v) => v.scanName),
                    (v) => v.scanName!,
                  )}
                />
              )}
              <NumericProperty
                name="Min"
                value={parameterScanOptions.min}
                onChange={handleChangeFor("min")}
              />
              <NumericProperty
                name="Max"
                value={parameterScanOptions.max}
                onChange={handleChangeFor("max")}
              />
              <NumericProperty
                name="Number of Values"
                value={parameterScanOptions.numberOfValues}
                onChange={handleChangeFor("numberOfValues")}
              />
              <BooleanProperty
                asideMode
                name="Use logarithmic distribution"
                value={parameterScanOptions.useLogarithmicDistribution}
                onChange={handleChangeFor("useLogarithmicDistribution")}
              />
            </PropertyList>
          </PropertyAccordionItem>
        </PropertyAccordion>
      </div>
    );
  }
};

export default ParameterScanPanel;
