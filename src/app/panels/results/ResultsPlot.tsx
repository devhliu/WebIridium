import { useState, type RefObject, useEffect } from "react";
import { useAtomValue } from "jotai";
import Plot from "react-plotly.js";
import type { Data } from "plotly.js";

import type { SimulationResult } from "@/features/simulation/Simulator";
import {
  graphSettingsAtom,
  independentVariableAtom,
  paletteAtom,
  variablesAtom,
} from "@/stores/workspace";
import { getParameterScanTitle } from "./shared";
import { useScanIndependentVariable } from "@/features/simulation/useScanIndependentVariable";
import {
  getDefaultParameterScanColor,
  getPaletteColor,
} from "@/features/colors";

export interface ResultsPlotProps {
  result: SimulationResult;
  /** Used to size the plot */
  containerRef: RefObject<HTMLElement | null>;
  /** Number from [0-1) representing how much width of the container it takes up. */
  containerPercentWidth?: number;
  /** Number from [0-1] representing how much height of the container it takes up. */
  containerPercentHeight?: number;
}

const ResultsPlot = ({
  result,
  containerRef,
  containerPercentWidth = 1,
  containerPercentHeight = 1,
}: ResultsPlotProps) => {
  const variables = useAtomValue(variablesAtom);
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
  } = useAtomValue(graphSettingsAtom);

  const [[width, height], setDimensions] = useState([1, 1]);

  // when using useLayoutEffect, it breaks when rendered not at the start
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // ResizeObserver API is really weird, for newer browsers, contentBoxSize is an array,
        // for older ones (old Firefox) it is a single object.
        const contentBoxSize = entry.contentBoxSize[0] ?? entry.contentBoxSize;
        setDimensions((prev) => {
          if (
            contentBoxSize.inlineSize !== width ||
            contentBoxSize.blockSize !== height
          ) {
            return [
              contentBoxSize.inlineSize * containerPercentWidth,
              contentBoxSize.blockSize * containerPercentHeight,
            ];
          }
          return prev;
        });
      }
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [
    containerRef,
    width,
    height,
    containerPercentWidth,
    containerPercentHeight,
  ]);

  const plotData = [];

  const rangeX = isAutoscaledX ? undefined : [minX, maxX];
  const rangeY = isAutoscaledY ? undefined : [minY, maxY];

  if (result.type === "timeCourse") {
    // TODO: error if the independent variable column is not present
    const independentVariableColumn =
      result.columns.find((c) => c.title === independentVariable) ?? [];
    for (const { title, values } of result.columns) {
      if (title === independentVariable) continue;
      const variable = variables.find((v) => v.name === title);
      if (!variable?.visible) continue;

      plotData.push({
        x: independentVariableColumn.values,
        y: values,
        type: "scatter",
        mode: "lines",
        marker: { color: variable.color },
        line: { width: variable.width },
        name: variable?.displayName ?? title,
      });
    }
  } else if (
    result.type === "parameterScan" &&
    result.method === "timeCourse"
  ) {
    for (const scan of result.scans) {
      const independentVariableColumn =
        scan.columns.find((c) => c.title === scanIndependentVariable) ?? [];
      for (const { title, values } of scan.columns) {
        if (title === scanIndependentVariable) continue;
        const variable = variables.find((v) => v.name === title);
        if (!variable?.visible) continue;

        let finalColor: string;
        if (scanPalette !== "Custom") {
          finalColor = "red"; // it will get set later
        } else {
          finalColor = getDefaultParameterScanColor(
            variable.color,
            scan.scanPercent,
          );
        }

        plotData.push({
          x: independentVariableColumn.values,
          y: values,
          type: "scatter",
          mode: "lines",
          marker: { color: finalColor },
          line: { width: variable.width },
          name: getParameterScanTitle(
            variable.displayName,
            result.parameter,
            scan.parameterValue,
          ),
        });
      }
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
        yaxis: {
          title: { text: "Concentrations" },
          range: rangeY,
        },
        xaxis: {
          title: { text: "Time" },
          range: rangeX,
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
