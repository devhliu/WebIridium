import { useAtomValue } from "jotai";
import Plot from "react-plotly.js";
import type { Data } from "plotly.js";

import DraggableLegend, { type LegendDataItem } from "./DraggableLegend";

import type { SimulationResult } from "@/features/simulation/Simulator";
import {
  graphSettingsAtom,
  independentVariableAtom,
  paletteAtom,
  variableSettingssAtom,
} from "@/globals/workspace/settings";
import { getParameterScanTitle } from "./shared";
import { useScanIndependentVariable } from "@/features/simulation/useScanIndependentVariable";
import {
  getDefaultParameterScanColor,
  getPaletteColor,
} from "@/features/colors";

const RANGE_ROUND_PERCENT = 0.05;

/**
 * Calculates min and max for a list of values.
 */
const calculateBounds = (values: number[]): [number, number] => {
  const min = values.reduce((acc, current) => Math.min(acc, current), Infinity);
  const max = values.reduce(
    (acc, current) => Math.max(acc, current),
    -Infinity,
  );
  return [min, max];
};

export interface ResultsPlotProps {
  result: SimulationResult;
  width: number;
  height: number;
}

const ResultsPlot = ({ result, width, height }: ResultsPlotProps) => {
  const variableSettingss = useAtomValue(variableSettingssAtom);
  const scanPalette = useAtomValue(paletteAtom);
  const scanIndependentVariable = useScanIndependentVariable();
  const timeCourseIndependentVariable = useAtomValue(independentVariableAtom);
  const {
    backgroundColor,
    drawingAreaColor,
    includeTitle,
    title,
    includeBorder,
    borderColor,
    borderThickness,
    isAutoscaledX,
    minX,
    maxX,
    isAutoscaledY,
    minY,
    maxY,
    margin,
    xAxis,
    yAxis,
    majorGrid,
    minorGrid,
    legend: legendSettings,
  } = useAtomValue(graphSettingsAtom);

  // variable name -> column values
  const columns: {
    variableName: string;
    values: number[];

    // only used in parameter scan results
    scanPercent?: number;
    parameterValue?: number;
  }[] = [];
  let independentVariableName: string = "";

  // Collect columns
  if (result.type === "timeCourse") {
    independentVariableName = timeCourseIndependentVariable ?? "";

    for (const { title, values } of result.columns) {
      columns.push({ variableName: title, values });
    }
  } else if (result.type === "parameterScan" && result.mode === "timeCourse") {
    independentVariableName = scanIndependentVariable;

    for (const scan of result.scans) {
      for (const { title, values } of scan.columns) {
        columns.push({
          variableName: title,
          parameterValue: scan.parameterValue,
          scanPercent: scan.scanPercent,
          values,
        });
      }
    }
  } else if (result.type === "parameterScan" && result.mode === "steadyState") {
    independentVariableName = result.parameter;
    columns.push({
      variableName: result.parameter,
      values: result.scans.map((s) => s.parameterValue),
    });

    const concentrationsMap = new Map<string, number[]>();

    // transpose
    for (const scan of result.scans) {
      for (const { name, value } of scan.concentrations) {
        if (!concentrationsMap.has(name)) {
          concentrationsMap.set(name, [value]);
        } else {
          concentrationsMap.get(name)!.push(value);
        }
      }
    }

    for (const [variableName, concentrations] of concentrationsMap.entries()) {
      columns.push({ variableName, values: concentrations });
    }
  } else {
    return null;
  }

  // Format data

  const plotData = [];
  const legendData: LegendDataItem[] = [];
  // note that independent variable column might be null for time course if data was not collected for it
  const independentVariableColumn = columns.find(
    (c) => c.variableName === independentVariableName,
  );
  const parameterSettings =
    result.type === "parameterScan"
      ? variableSettingss[result.parameter]
      : null;

  const xAxisTitle = xAxis.useDefaultTitle
    ? variableSettingss[independentVariableName].displayName
    : xAxis.title;
  const yAxisTitle = yAxis.useDefaultTitle ? "Concentrations" : yAxis.title;

  if (independentVariableColumn) {
    for (const {
      variableName,
      values,
      parameterValue,
      scanPercent,
    } of columns) {
      if (variableName === independentVariableName) continue;

      const settings = variableSettingss[variableName];
      if (!settings.visible) continue;
      let finalColor: string = "red";
      if (scanPalette === "Custom") {
        if (result.type === "parameterScan" && result.mode === "timeCourse") {
          finalColor = getDefaultParameterScanColor(
            settings.color,
            scanPercent!,
          );
        } else {
          finalColor = settings.color;
        }
      } // otherwise the color will get overwritten later

      const title =
        parameterValue !== undefined
          ? getParameterScanTitle(
              settings.displayName,
              parameterSettings!.displayName,
              parameterValue,
            )
          : settings.displayName;

      plotData.push({
        x: independentVariableColumn?.values,
        y: values,
        type: "scatter",
        mode: "lines",
        marker: { color: finalColor },
        line: { width: settings.width, dash: settings.lineStyle },
        name: title,
      });

      legendData.push({
        title,
        color: finalColor,
        dash: settings.lineStyle,
      });
    }
  }

  if (scanPalette !== "Custom") {
    for (const [i, data] of plotData.entries()) {
      data.marker.color = getPaletteColor(
        scanPalette,
        i / (plotData.length - 1),
      );
    }
  }

  // Other settings

  const [rangeMinX, rangeMaxX] =
    isAutoscaledX && independentVariableColumn
      ? calculateBounds(independentVariableColumn.values)
      : [minX, maxX];
  const [rangeMinY, rangeMaxY] = isAutoscaledY
    ? calculateBounds(plotData.map((data) => data.y).flat())
    : [minY, maxY];
  const yPadding = (rangeMaxY - rangeMinY) * RANGE_ROUND_PERCENT;

  const xMajorGridSettings = {
    gridcolor: majorGrid.xColor,
    gridwidth: majorGrid.xWidth,
    dtick: (rangeMaxX - rangeMinX) / (majorGrid.numXGrids + 1),
    showgrid: majorGrid.enabled.x,
    showticklabels: xAxis.showMajorTicks,
  };
  const yMajorGridSettings = {
    gridcolor: majorGrid.yColor,
    gridwidth: majorGrid.yWidth,
    dtick: (rangeMaxY - rangeMinY) / (majorGrid.numYGrids + 1),
    showgrid: majorGrid.enabled.y,
    showticklabels: yAxis.showMajorTicks,
  };
  const xMinorGridSettings = {
    gridcolor: minorGrid.xColor,
    gridwidth: minorGrid.xWidth,
    dtick: xMajorGridSettings.dtick / (minorGrid.numXGrids + 1),
    showgrid: minorGrid.enabled.x,
  };
  const yMinorGridSettings = {
    gridcolor: minorGrid.yColor,
    gridwidth: minorGrid.yWidth,
    dtick: yMajorGridSettings.dtick / (minorGrid.numYGrids + 1),
    showgrid: minorGrid.enabled.y,
  };

  return (
    <>
      {legendSettings.visible && legendData.length > 0 && (
        <DraggableLegend settings={legendSettings} data={legendData} />
      )}
      <Plot
        data-testid="results-plot"
        data={plotData as unknown as Data[]}
        style={{ position: "relative" }}
        layout={{
          width,
          height,
          title: !includeTitle
            ? undefined
            : {
                text: title,
              },
          showlegend: false,
          paper_bgcolor: backgroundColor,
          plot_bgcolor: drawingAreaColor,
          xaxis: {
            title: !xAxis.includeTitle ? undefined : { text: xAxisTitle },
            range: [rangeMinX, rangeMaxX],
            color: xAxis.color,
            minor: xMinorGridSettings,
            ...xMajorGridSettings,
          },
          yaxis: {
            title: !yAxis.includeTitle ? undefined : { text: yAxisTitle },
            range: [rangeMinY - yPadding, rangeMaxY + yPadding],
            color: yAxis.color,
            minor: yMinorGridSettings,
            ...yMajorGridSettings,
          },
          margin: {
            l: margin,
            r: margin,
            b: margin,
            t: margin,
          },
          shapes: !includeBorder
            ? undefined
            : [
                {
                  type: "rect",
                  xref: "paper",
                  yref: "paper",
                  x0: 0,
                  y0: 0,
                  x1: 1,
                  y1: 1,
                  line: {
                    color: borderColor,
                    width: borderThickness,
                  },
                },
              ],
        }}
        config={{ responsive: true, displayModeBar: false }}
      />
    </>
  );
};

export default ResultsPlot;
