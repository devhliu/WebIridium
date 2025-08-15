import type { Data, Layout } from "plotly.js";

import type { SimulationResult } from "@/features/simulation/Simulator";
import type {
  GraphSettings,
  VariableSettings,
} from "@/globals/workspace/settings";

import type { LegendDataItem } from "./FloatingLegend";
import { getColumnsFromResult } from "./getColumnsFromResult";
import { getParameterScanTitle } from "./shared";
import {
  getDefaultParameterScanColor,
  getPaletteColor,
  type Palette,
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

export const generatePlotParameters = (
  width: number,
  height: number,
  result: SimulationResult,
  graphSettings: GraphSettings,
  variableSettingss: Record<string, VariableSettings>,
  timeCourseIndependentVariable: string | null,
  scanIndependentVariable: string,
  palette: Palette,
  xAxisTitle: string,
  yAxisTitle: string,
): {
  plotData: Data[];
  layout: Partial<Layout>;
  legendData: LegendDataItem[];
} => {
  const {
    backgroundColor,
    drawingAreaColor,
    includeTitle,
    title,
    titleColor,
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
  } = graphSettings;

  const [columns, independentVariableName] = getColumnsFromResult(
    result,
    timeCourseIndependentVariable,
    scanIndependentVariable,
  );

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

  if (independentVariableColumn) {
    for (const {
      variableName,
      values,
      parameterValue,
      scanPercent,
    } of columns) {
      if (variableName === independentVariableName) continue;

      const settings = variableSettingss[variableName];
      console.log(variableSettingss, variableName);
      if (!settings.visible) continue;
      let finalColor: string = "red";
      if (palette === "Custom") {
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

  if (palette !== "Custom") {
    for (const [i, data] of plotData.entries()) {
      data.marker.color = getPaletteColor(palette, i / (plotData.length - 1));
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

  return {
    legendData,
    plotData: plotData as unknown as Data[],
    layout: {
      width,
      height,
      title: !includeTitle
        ? undefined
        : {
            text: title,
            font: {
              color: titleColor,
            },
          },
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
      showlegend:
        legendSettings.visible &&
        !legendSettings.isFloating &&
        legendData.length > 0,
      legend: {
        // disable click toggling the item in the view since we want to control variable visibility manually
        itemclick: false,
      },
    },
  };
};
