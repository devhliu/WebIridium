import { useAtom } from "jotai";
import { useState } from "react";
import styles from "./results.module.css";
import { graphSettingsAtom, paletteAtom } from "@/globals/workspace/settings";
import { PALETTES, type Palette } from "@/features/colors";

import BooleanProperty from "@/components/property-list/BooleanProperty";
import NumericProperty from "@/components/property-list/NumericProperty";
import NumericSliderProperty from "@/components/property-list/NumericSliderProperty";
import StringProperty from "@/components/property-list/StringProperty";
import ColorProperty from "@/components/property-list/ColorProperty";
import SelectProperty from "@/components/property-list/SelectProperty";

import PropertyList from "@/components/property-list/PropertyList";
import PropertyAccordion from "@/components/property-accordion/PropertyAccordion";
import PropertyAccordionItem from "@/components/property-accordion/PropertyAccordionItem";
import {
  ToggleGroupButton,
  ToggleGroupContainer,
} from "@/components/input/ToggleGroup";

const SettingsPanel = () => {
  const [graphSettings, setGraphSettings] = useAtom(graphSettingsAtom);
  const [scanPalette, setScanPalette] = useAtom(paletteAtom);

  const [selectedAxis, setSelectedAxis] = useState<"xAxis" | "yAxis">("xAxis");
  const axisSettings = graphSettings[selectedAxis];

  const handleChangeFor = (
    setting: keyof typeof graphSettings,
  ): ((newValue: unknown) => void) => {
    return (newValue) => {
      setGraphSettings({ ...graphSettings, [setting]: newValue });
    };
  };

  const handleAxisChangeFor = (
    setting: keyof typeof axisSettings,
  ): ((newValue: unknown) => void) => {
    return (newValue) => {
      setGraphSettings({
        ...graphSettings,
        [selectedAxis]: {
          ...axisSettings,
          [setting]: newValue,
        },
      });
    };
  };

  return (
    <div className={styles.settingsContainer}>
      <PropertyAccordion defaultOpen={["Bounds"]}>
        <PropertyAccordionItem title="Bounds">
          <PropertyList alignment="center">
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
        </PropertyAccordionItem>

        <PropertyAccordionItem title="Graph">
          <PropertyList alignment="center">
            <ColorProperty
              name="Background Color"
              value={graphSettings.backgroundColor}
              onChange={handleChangeFor("backgroundColor")}
            />
            <ColorProperty
              name="Drawing Area Color"
              value={graphSettings.drawingAreaColor}
              onChange={handleChangeFor("drawingAreaColor")}
            />

            <BooleanProperty
              name="Include Title"
              value={graphSettings.includeTitle}
              onChange={handleChangeFor("includeTitle")}
            />
            {graphSettings.includeTitle && (
              <StringProperty
                name="Title"
                value={graphSettings.title}
                onChange={handleChangeFor("title")}
              />
            )}

            <BooleanProperty
              name="Include Border"
              value={graphSettings.includeBorder}
              onChange={handleChangeFor("includeBorder")}
            />
            {graphSettings.includeBorder && (
              <ColorProperty
                name="Border Color"
                value={graphSettings.borderColor}
                onChange={handleChangeFor("borderColor")}
              />
            )}
            {graphSettings.includeBorder && (
              <NumericSliderProperty
                name="Border Thickness"
                value={graphSettings.borderThickness}
                onChange={handleChangeFor("borderThickness")}
                min={0}
                max={10}
                step={0.5}
              />
            )}
          </PropertyList>
        </PropertyAccordionItem>

        <PropertyAccordionItem title="Series">
          <PropertyList alignment="center">
            <SelectProperty
              name="Palette"
              value={scanPalette}
              options={Object.fromEntries(
                ["Custom"]
                  .concat(Object.keys(PALETTES))
                  .map((name) => [name, name]),
              )}
              onChange={(sp) => setScanPalette(sp as Palette)}
            />
          </PropertyList>
        </PropertyAccordionItem>

        <PropertyAccordionItem title="Axes">
          <PropertyList alignment="center">
            <ToggleGroupContainer
              value={selectedAxis}
              onValueChange={setSelectedAxis as (val: string) => void}
            >
              <ToggleGroupButton value="xAxis">X-Axis</ToggleGroupButton>
              <ToggleGroupButton value="yAxis">Y-Axis</ToggleGroupButton>
            </ToggleGroupContainer>

            <BooleanProperty
              name="Include Axis Title"
              value={axisSettings["includeTitle"]}
              onChange={handleAxisChangeFor("includeTitle")}
            />

            {axisSettings.includeTitle && (
              <BooleanProperty
                name="Use Default Title"
                value={axisSettings["useDefaultTitle"]}
                onChange={handleAxisChangeFor("useDefaultTitle")}
              />
            )}

            {axisSettings.includeTitle && !axisSettings.useDefaultTitle && (
              <StringProperty
                name="Axis Title"
                value={axisSettings["title"]}
                onChange={handleAxisChangeFor("title")}
              />
            )}

            <ColorProperty
              name="Axis Color"
              value={axisSettings["color"]}
              onChange={handleAxisChangeFor("color")}
            />

            <BooleanProperty
              name="Show Major Ticks"
              value={axisSettings["showMajorTicks"]}
              onChange={handleAxisChangeFor("showMajorTicks")}
            />
            <BooleanProperty
              name="Show Minor Ticks"
              value={axisSettings["showMinorTicks"]}
              onChange={handleAxisChangeFor("showMinorTicks")}
            />
          </PropertyList>
        </PropertyAccordionItem>
      </PropertyAccordion>
    </div>
  );
};

export default SettingsPanel;
