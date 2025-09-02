import { useRef, useLayoutEffect, useEffect } from "react";
import * as echarts from "echarts/core";
import { type ECharts } from "echarts/core";

import styles from "./results.module.css";

import { type SteadyStateResultItem } from "@/features/simulation/Simulator";

const MAX_DECIMALS = 6;

const formatWithMaxDecimals = (n: number, maxDecimals: number): string => {
  return (Math.floor(n * 10 ** maxDecimals) / 10 ** maxDecimals).toString();
};

export interface ResultsThreeDBarChartProps {
  name: string;
  data: SteadyStateResultItem;
}

const Results3DBarChart = ({ name, data }: ResultsThreeDBarChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);

  // sychronize size
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.resize();
      }
    };

    updateSize();

    const observer = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        updateSize();
      }
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [containerRef]);

  // sychronize data
  useEffect(() => {
    if (containerRef.current && !chartRef.current) {
      chartRef.current = echarts.init(containerRef.current);
    }

    const allValues = data.values.flat();
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);

    chartRef.current?.setOption(
      {
        title: {
          text: name,
          left: "center",
          textStyle: {
            fontSize: 20,
            fontWeight: "normal",
          },
        },
        animation: false,
        xAxis3D: {
          type: "category",
          data: data.columns,
        },
        yAxis3D: {
          type: "category",
          data: data.rows,
        },
        zAxis3D: {
          type: "value",
        },
        tooltip: {
          formatter: (params: {
            seriesName: string;
            value: [number, number, number];
          }) =>
            `(${data.columns[params.value[0]]}, ${data.rows[params.value[1]]}): ${formatWithMaxDecimals(params.value[2], MAX_DECIMALS)}`,
        },
        visualMap: {
          min,
          max,
          show: false,
          inRange: {
            color: [
              "#313695",
              "#4575b4",
              "#74add1",
              "#abd9e9",
              "#e0f3f8",
              "#ffffbf",
              "#fee090",
              "#fdae61",
              "#f46d43",
              "#d73027",
              "#a50026",
            ],
          },
        },
        grid3D: {
          boxWidth: 80,
          boxDepth: 80,
          light: {
            main: {
              intensity: 1.2,
              shadow: false,
            },
            ambient: {
              intensity: 0.3,
            },
          },
        },
        series: [
          {
            type: "bar3D",
            shading: "lambert",
            data: data.values.flatMap((row, y) =>
              row.map((value, x) => [x, y, value]),
            ),
          },
        ],
      },
      false,
    );
  }, [name, data]);

  return <div className={styles.steadyStateThreeDChart} ref={containerRef} />;
};

export default Results3DBarChart;
