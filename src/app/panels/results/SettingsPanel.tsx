import { useAtom } from "jotai";
import { graphSettingsAtom } from "@/stores/workspace";
import styles from "./results.module.css";
import PropertyList from "@/components/property-list/PropertyList";
import BooleanProperty from "@/components/property-list/BooleanProperty";
import NumericProperty from "@/components/property-list/NumericProperty";
import NumericSliderProperty from "@/components/property-list/NumericSliderProperty";
import PropertyAccordion from "@/components/property-accordion/PropertyAccordion";
import PropertyAccordionItem from "@/components/property-accordion/PropertyAccordionItem";
import StringProperty from "@/components/property-list/StringProperty";
import ColorProperty from "@/components/property-list/ColorProperty";

// NOTE: Might be a good idea to have more atomic state updates.
//       Right now every single component is updated when one property is updated.
//       Not an issue at the moment...
const SettingsPanel = () => {
  const [graphSettings, setGraphSettings] = useAtom(graphSettingsAtom);

  const changeHandlerFor = (
    setting: keyof typeof graphSettings,
  ): ((newValue: unknown) => void) => {
    return (newValue) => {
      setGraphSettings({ ...graphSettings, [setting]: newValue });
    };
  };

  return (
    <div className={styles.settingsContainer}>
      <PropertyAccordion defaultValue={["bounds"]}>
        <PropertyAccordionItem title="Bounds" value="bounds">
          <PropertyList alignment="center">
            <BooleanProperty
              name="Autoscale X"
              value={graphSettings.isAutoscaledX}
              onChange={changeHandlerFor("isAutoscaledX")}
            />
            {!graphSettings.isAutoscaledX && (
              <NumericProperty
                name="X Minimum"
                value={graphSettings.minX}
                onChange={changeHandlerFor("minX")}
                validator={(newValue) => newValue < graphSettings.maxX}
              />
            )}
            {!graphSettings.isAutoscaledX && (
              <NumericProperty
                name="X Maximum"
                value={graphSettings.maxX}
                onChange={changeHandlerFor("maxX")}
                validator={(newValue) => newValue > graphSettings.minX}
              />
            )}

            <BooleanProperty
              name="Autoscale Y"
              value={graphSettings.isAutoscaledY}
              onChange={changeHandlerFor("isAutoscaledY")}
            />
            {!graphSettings.isAutoscaledY && (
              <NumericProperty
                name="Y Minimum"
                value={graphSettings.minY}
                onChange={changeHandlerFor("minY")}
                validator={(newValue) => newValue < graphSettings.maxY}
              />
            )}
            {!graphSettings.isAutoscaledY && (
              <NumericProperty
                name="Y Maximum"
                value={graphSettings.maxY}
                onChange={changeHandlerFor("maxY")}
                validator={(newValue) => newValue > graphSettings.minY}
              />
            )}
          </PropertyList>
        </PropertyAccordionItem>

        <PropertyAccordionItem title="Graph" value="graph">
          <PropertyList alignment="center">
            <ColorProperty
              name="Background Color"
              value={graphSettings.backgroundColor}
              onChange={changeHandlerFor("backgroundColor")}
            />
            <ColorProperty
              name="Drawing Area Color"
              value={graphSettings.drawingAreaColor}
              onChange={changeHandlerFor("drawingAreaColor")}
            />

            <BooleanProperty
              name="Include Title"
              value={graphSettings.includeTitle}
              onChange={changeHandlerFor("includeTitle")}
            />
            {graphSettings.includeTitle && (
              <StringProperty
                name="Title"
                value={graphSettings.title}
                onChange={changeHandlerFor("title")}
              />
            )}

            <BooleanProperty
              name="Include Border"
              value={graphSettings.includeBorder}
              onChange={changeHandlerFor("includeBorder")}
            />
            {graphSettings.includeBorder && (
              <ColorProperty
                name="Border Color"
                value={graphSettings.borderColor}
                onChange={changeHandlerFor("borderColor")}
              />
            )}
            {graphSettings.includeBorder && (
              <NumericSliderProperty
                name="Border Thickness"
                value={graphSettings.borderThickness}
                onChange={changeHandlerFor("borderThickness")}
                min={0}
                max={10}
                step={0.5}
              />
            )}
          </PropertyList>
        </PropertyAccordionItem>
      </PropertyAccordion>
    </div>
  );
};

export default SettingsPanel;
