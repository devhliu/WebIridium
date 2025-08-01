import { useAtom } from "jotai";

import styles from "./globalSettings.module.css";
import PropertyList from "@/components/property-list/PropertyList";
import SelectProperty from "@/components/property-list/SelectProperty";

import { THEMES } from "@/features/theme";

import { editorFontSizeAtom, themeOptionAtom } from "@/globals/appearance";
import PropertyHeading from "@/components/property-list/PropertyHeading";
import NumericSliderProperty from "@/components/property-list/NumericSliderProperty";

const themeOptions: Record<string, string> = {
  Automatic: "Automatic",
};
for (const theme of THEMES) {
  themeOptions[theme] = theme;
}

const GlobalSettingsPanel = () => {
  const [themeOption, setThemeOption] = useAtom(themeOptionAtom);
  const [editorFontSize, setEditorFontSize] = useAtom(editorFontSizeAtom);

  return (
    <div className={styles.panel}>
      <div className={styles.list}>
        <PropertyList alignment="left">
          <PropertyHeading>Appearance</PropertyHeading>
          <SelectProperty
            name="Theme"
            options={themeOptions}
            value={themeOption}
            onChange={setThemeOption as (theme: string) => void}
          />
          <NumericSliderProperty
            name="Editor Font Size"
            min={8}
            max={32}
            value={editorFontSize}
            onChange={setEditorFontSize}
          />

          <PropertyHeading>Simulation</PropertyHeading>
          <SelectProperty
            name="Simulator"
            options={{ COPASI: "COPASI" }}
            value={"COPASI"}
            onChange={() => undefined}
          />
          <NumericSliderProperty
            name="Max Threads"
            min={1}
            max={12}
            value={4}
            onChange={() => undefined}
          />
        </PropertyList>
      </div>
    </div>
  );
};

export default GlobalSettingsPanel;
