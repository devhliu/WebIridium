import { useAtomValue } from "jotai";
import Plot from "react-plotly.js";

import FloatingLegend from "./FloatingLegend";

import type { SimulationResult } from "@/features/simulation/Simulator";
import {
  graphSettingsAtom,
  independentVariableAtom,
  paletteAtom,
  variableSettingssAtom,
} from "@/globals/workspace/settings";
import { useScanIndependentVariable } from "@/features/simulation/useScanIndependentVariable";
import { generatePlotParameters } from "./generatePlotParameters";
import { xAxisTitleAtom, yAxisTitleAtom } from "@/globals/workspace/plot";

export interface ResultsPlotProps {
  result: SimulationResult;
  width: number;
  height: number;
}

const ResultsPlot = ({ result, width, height }: ResultsPlotProps) => {
  const variableSettingss = useAtomValue(variableSettingssAtom);
  const palette = useAtomValue(paletteAtom);
  const scanIndependentVariable = useScanIndependentVariable();
  const timeCourseIndependentVariable = useAtomValue(independentVariableAtom);
  const graphSettings = useAtomValue(graphSettingsAtom);
  const legendSettings = graphSettings.legend;
  const xAxisTitle = useAtomValue(xAxisTitleAtom);
  const yAxisTitle = useAtomValue(yAxisTitleAtom);

  const { plotData, layout, legendData } = generatePlotParameters(
    width,
    height,
    result,
    graphSettings,
    variableSettingss,
    timeCourseIndependentVariable,
    scanIndependentVariable,
    palette,
    xAxisTitle,
    yAxisTitle,
  );

  return (
    <>
      {legendSettings.visible &&
        legendSettings.isFloating &&
        legendData.length > 0 && (
          <FloatingLegend settings={legendSettings} data={legendData} />
        )}
      <Plot
        data-testid="results-plot"
        data={plotData}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
      />
    </>
  );
};

export default ResultsPlot;
