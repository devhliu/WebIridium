// TODO: fix having <=1 number of values causing an error
// TODO: make sure your min can't be more than max (and add validators for the rest of the stuff)
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import styles from "./simulation.module.css";
import {
  cancelSimulationAtom,
  isSimulatingAtom,
  runParameterScanAtom,
} from "@/globals/workspace/simulation";
import { modelStatusAtom, variablesAtom } from "@/globals/workspace/model";
import {
  parameterScanOptionsAtom,
  variableSettingssAtom,
} from "@/globals/workspace/settings";

import { useToast } from "@/components/Toast";
import CancellableButton from "@/components/CancellableButton";
import PlayIcon from "@/assets/icons//PlayIcon.svg?react";

import PropertyAccordion from "@/components/property-accordion/PropertyAccordion";
import PropertyAccordionItem from "@/components/property-accordion/PropertyAccordionItem";
import PropertyList from "@/components/property-list/PropertyList";

import BooleanProperty from "@/components/property-list/BooleanProperty";
import NumericProperty from "@/components/property-list/NumericProperty";
import SelectProperty from "@/components/property-list/SelectProperty";
import UncontrolledVariableList from "@/app/variable-list/UncontrolledVariableList";
import { groupVariablesForSelectComponent } from "@/features/category";
import TimeCoursePropertyList from "./TimeCoursePropertyList";
import {
  ToggleGroupButton,
  ToggleGroupContainer,
} from "@/components/input/ToggleGroup";
import { isSliderSimulationQueuedAtom } from "@/globals/workspace/slider";

export interface ParameterScanPanelProps {
  visible: boolean;
}

const ParameterScanPanel = ({ visible }: ParameterScanPanelProps) => {
  const { toast } = useToast();

  const variables = useAtomValue(variablesAtom);
  const variableSettingss = useAtomValue(variableSettingssAtom);
  const [parameterScanOptions, setParameterScanOptions] = useAtom(
    parameterScanOptionsAtom,
  );
  const isSimulating = useAtomValue(isSimulatingAtom);
  const isSliderSimulationQueued = useAtomValue(isSliderSimulationQueuedAtom);
  const modelStatus = useAtomValue(modelStatusAtom);
  const runParameterScan = useSetAtom(runParameterScanAtom);
  const cancelSimulation = useSetAtom(cancelSimulationAtom);

  const handleSimulateClick = async () => {
    const result = await runParameterScan();
    if (result.type === "failure") {
      toast({
        type: "error",
        title: "Parameter Scan Error",
        description: result.message,
      });
    }
  };

  const handleCancelClick = () => {
    cancelSimulation();
  };

  const handleChangeFor = (property: keyof typeof parameterScanOptions) => {
    return (newValue: unknown) => {
      setParameterScanOptions({
        ...parameterScanOptions,
        [property]: newValue,
      });
    };
  };

  return (
    <div
      data-testid="parameterScanPanel"
      className={styles.simulationPanel}
      style={visible ? {} : { display: "none" }}
    >
      <h1 className={styles.panelTitle}>Parameter Scan</h1>
      <CancellableButton
        icon={<PlayIcon />}
        isLoading={
          isSimulating ||
          isSliderSimulationQueued ||
          modelStatus.type === "loading"
        }
        onClick={handleSimulateClick}
        canCancel={isSimulating}
        onCancel={handleCancelClick}
      >
        Run
      </CancellableButton>

      <PropertyAccordion
        defaultOpen={["Simulation", "First Parameter", "Variables"]}
      >
        <PropertyAccordionItem title="Simulation">
          <ToggleGroupContainer
            className={styles.modeToggleGroup}
            value={parameterScanOptions.mode}
            onValueChange={handleChangeFor("mode")}
          >
            <ToggleGroupButton value="timeCourse">
              Time Course
            </ToggleGroupButton>
            <ToggleGroupButton value="steadyState">
              Steady State
            </ToggleGroupButton>
          </ToggleGroupContainer>

          {parameterScanOptions.mode === "timeCourse" && (
            <TimeCoursePropertyList
              parameters={parameterScanOptions.timeCourseParameters}
              onParameterChange={(newParams) =>
                setParameterScanOptions({
                  ...parameterScanOptions,
                  timeCourseParameters: newParams,
                })
              }
            />
          )}
        </PropertyAccordionItem>

        <PropertyAccordionItem title="First Parameter">
          <PropertyList alignment="left">
            {parameterScanOptions.varyingParameter && (
              <SelectProperty
                name="Parameter"
                value={parameterScanOptions.varyingParameter}
                onChange={handleChangeFor("varyingParameter")}
                groups={groupVariablesForSelectComponent(
                  variables.filter((v) => v.type === "settable"),
                  variableSettingss,
                  (v) => v.setName,
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

        <PropertyAccordionItem title="Variables">
          <UncontrolledVariableList />
        </PropertyAccordionItem>
      </PropertyAccordion>
    </div>
  );
};

export default ParameterScanPanel;
