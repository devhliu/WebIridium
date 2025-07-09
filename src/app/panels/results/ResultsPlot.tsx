import { useAtomValue } from "jotai";
import { useEffect, useReducer } from "react";
import Plot from "react-plotly.js";
import type { Data } from "plotly.js";

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

export interface ResultsPlotProps {
  result: SimulationResult;
  width: number;
  height: number;
}

const ResultsPlot = ({ result, width, height }: ResultsPlotProps) => {
  const variableSettingss = useAtomValue(variableSettingssAtom);
  const scanPalette = useAtomValue(paletteAtom);
  const scanIndependentVariable = useScanIndependentVariable();
  const independentVariable = useAtomValue(independentVariableAtom);
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
  } = useAtomValue(graphSettingsAtom);

  // For whatever reason, plotly gets messed up whenever
  // we update some of the properties.
  //
  // So, we have to use a key to forcefully re-render the plot
  // every time these properties update.
  // TODO: FIND A BETTER SOLUTION??? This seems to an issue with the autoscale
  //       so we might have to do that manually
  const [key, incrementKey] = useReducer((prevKey) => prevKey + 1, 0);
  useEffect(() => {
    incrementKey();
  }, [
    xAxis,
    yAxis,
  ]);

  const plotData = [];

  // if we do undefined, plotly autoscales for us
  const rangeX = isAutoscaledX ? undefined : [minX, maxX];
  const rangeY = isAutoscaledY ? undefined : [minY, maxY];

  let xAxisTitle = xAxis.useDefaultTitle ? "Time" : xAxis.title;
  const yAxisTitle = yAxis.useDefaultTitle ? "Concentrations" : yAxis.title;

  if (result.type === "timeCourse") {
    // axis titles
    if (xAxis.useDefaultTitle) {
      xAxisTitle =
        variableSettingss[independentVariable!]?.displayName ?? xAxisTitle;
    }

    // columns
    const independentVariableColumn =
      result.columns.find((c) => c.title === independentVariable) ?? [];
    for (const { title, values } of result.columns) {
      if (title === independentVariable) continue;
      const settings = variableSettingss[title];
      if (!settings?.visible) continue;

      plotData.push({
        x: independentVariableColumn.values,
        y: values,
        type: "scatter",
        mode: "lines",
        marker: { color: settings.color },
        line: { width: settings.width, dash: settings.lineStyle },
        name: settings?.displayName ?? title,
      });
    }
  } else if (result.type === "parameterScan" && result.mode === "timeCourse") {
    // axis titles
    if (xAxis.useDefaultTitle) {
      xAxisTitle =
        variableSettingss[scanIndependentVariable]?.displayName ?? xAxisTitle;
    }

    // columns
    for (const scan of result.scans) {
      const independentVariableColumn =
        scan.columns.find((c) => c.title === scanIndependentVariable) ?? [];
      for (const { title, values } of scan.columns) {
        if (title === scanIndependentVariable) continue;
        const settings = variableSettingss[title];
        if (!settings?.visible) continue;

        let finalColor: string;
        if (scanPalette !== "Custom") {
          finalColor = "red"; // it will get set later
        } else {
          finalColor = getDefaultParameterScanColor(
            settings.color,
            scan.scanPercent,
          );
        }

        plotData.push({
          x: independentVariableColumn.values,
          y: values,
          type: "scatter",
          mode: "lines",
          marker: { color: finalColor },
          line: { width: settings.width, dash: settings.lineStyle },
          name: getParameterScanTitle(
            settings.displayName,
            result.parameter,
            scan.parameterValue,
          ),
        });
      }
    }
  } else if (result.type === "parameterScan" && result.mode === "steadyState") {
    // axis titles
    if (xAxis.useDefaultTitle) {
      xAxisTitle =
        variableSettingss[result.parameter]?.displayName ?? xAxisTitle;
    }

    // column
    const parameterValues = result.scans.map((s) => s.parameterValue);
    const concentrationsMap = new Map<string, number[]>();
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
      const settings = variableSettingss[variableName];
      if (!settings?.visible) continue;

      plotData.push({
        x: parameterValues,
        y: concentrations,
        type: "scatter",
        mode: "lines",
        marker: { color: settings.color },
        line: { width: settings.width, dash: settings.lineStyle },
        name: settings.displayName,
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

  return (
    <Plot
      data-testid="results-plot"
      key={key}
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
          range: rangeX,
          color: xAxis.color,
          autorange: isAutoscaledX,
          showticklabels: xAxis.showMajorTicks,
        },
        yaxis: {
          title: !yAxis.includeTitle ? undefined : { text: yAxisTitle },
          range: rangeY,
          color: yAxis.color,
          autorange: isAutoscaledY,
          showticklabels: yAxis.showMajorTicks,
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
  );
};

export default ResultsPlot;
