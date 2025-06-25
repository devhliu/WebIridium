import { useState, type RefObject, useEffect } from "react";
import { useAtomValue } from "jotai";
import Plot from "react-plotly.js";
import type { Data } from "plotly.js";

import type { SimulationResult } from "@/features/simulation/Simulator";
import {
  graphSettingsAtom,
  timeCourseParametersAtom,
} from "@/stores/workspace";
import { getParameterScanTitle } from "./shared";

const palette = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];

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
  const simulationParameters = useAtomValue(timeCourseParametersAtom);
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

  // TODO: do not update range whenever input changes, only when simulation is ran.
  const rangeX = isAutoscaledX
    ? [simulationParameters.startTime, simulationParameters.endTime]
    : [minX, maxX];
  const rangeY = isAutoscaledY ? undefined : [minY, maxY];

  switch (result.type) {
    case "timeCourse": {
      const timeColumn = result.columns[0];
      for (let i = 1; i < result.columns.length; i++) {
        const { title, values } = result.columns[i];
        plotData.push({
          x: timeColumn.values,
          y: values,
          type: "scatter",
          mode: "lines",
          marker: { color: palette[i % palette.length] },
          name: title,
        });
      }
      break;
    }

    case "parameterScan": {
      switch (result.method) {
        case "timeCourse": {
          let colorIndex = 0;
          for (const scan of result.scans) {
            const timeColumn = scan.columns[0];
            for (let i = 1; i < scan.columns.length; colorIndex++, i++) {
              const { title, values } = scan.columns[i];
              plotData.push({
                x: timeColumn.values,
                y: values,
                type: "scatter",
                mode: "lines",
                marker: { color: palette[colorIndex % palette.length] },
                line: {
                  width: 2, // TODO: add setting for this
                },
                name: getParameterScanTitle(
                  title,
                  result.parameter,
                  scan.parameterValue,
                ),
              });
            }
          }
          break;
        }

        case "steadyState": {
          break;
        }
      }
      break;
    }

    case "steadyState": {
      break;
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
