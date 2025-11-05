/**
 * This is used for steady state.
 */

import { useRef, useLayoutEffect, useEffect } from "react";
import * as echarts from "echarts/core";
import { type ECharts } from "echarts/core";

import styles from "./visuals.module.css";

import { type SteadyStateResultItem } from "@/features/simulation/Simulator";
import { getPaletteGradient } from "@/features/colors";
import type { Palette } from "@/features/colors";

const MAX_DECIMALS = 6;
const HOVER_COLOR = "#080";

const formatWithMaxDecimals = (n: number, maxDecimals: number): string => {
  return (Math.floor(n * 10 ** maxDecimals) / 10 ** maxDecimals).toString();
};

export interface ArrayBarChart3DProps {
  name: string;
  data: SteadyStateResultItem;
  x: string;
  y: string;
  z: string;
  isAutoscaledZ?: boolean;
  minZ?: number;
  maxZ?: number;
  colorScheme?: Exclude<Palette, "Custom">;
}

const ArrayBarChart3D = ({
  name,
  data,
  x,
  y,
  z,
  isAutoscaledZ = true,
  minZ,
  maxZ,
  colorScheme = "BlueRed",
}: ArrayBarChart3DProps) => {
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
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);

    // Use provided min/max or data min/max based on autoscale setting
    const min = isAutoscaledZ ? dataMin : (minZ ?? dataMin);
    const max = isAutoscaledZ ? dataMax : (maxZ ?? dataMax);

    const colorGradient = getPaletteGradient(colorScheme);

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
          name: x,
          type: "category",
          data: data.columns,
          axisPointer: {
            show: false,
          },
        },
        yAxis3D: {
          name: y,
          type: "category",
          data: data.rows,
          axisPointer: {
            show: false,
          },
        },
        zAxis3D: {
          name: z,
          type: "value",
          min: min,
          max: max,
          axisPointer: {
            show: false,
          },
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
            color: colorGradient,
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
            emphasis: {
              label: {
                show: false,
              },
              itemStyle: {
                color: HOVER_COLOR,
              },
            },
          },
        ],
      },
      false,
    );
  }, [name, data, x, y, z, isAutoscaledZ, minZ, maxZ, colorScheme]);

  return <div className={styles.arrayBarChart3D} ref={containerRef} />;
};

export default ArrayBarChart3D;
