import { useAtomValue } from "jotai";
import * as echarts from "echarts/core";

import DownloadIcon from "@/assets/icons/DownloadIcon.svg?react";

import IconButton from "@/components/IconButton";
import {
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/DropdownMenu";

import { simulationResultAtom } from "@/globals/simulation";
import {
  variableSettingssAtom,
  independentVariableAtom,
  nameAtom,
  graphSettingsAtom,
} from "@/globals/settings";
import { useScanIndependentVariable } from "@/features/simulation/useScanIndependentVariable";
import { getColumnsFromResult } from "../getColumnsFromResult";
import { getDefaultParameterScanColor } from "@/features/colors";
import { getParameterScanTitle } from "../getParameterScanTitle";
import { DASH_ARRAYS } from "@/features/lineStyle";
import { promptDownloadString, promptDownloadUrl } from "@/features/download";

const WIDTH = 800;
const HEIGHT = 800;
const MAX_TITLES_TO_SHOW = 12;

const DownloadPlot3DButton = () => {
  const result = useAtomValue(simulationResultAtom);
  const variableSettingss = useAtomValue(variableSettingssAtom);
  const scanIndependentVariable = useScanIndependentVariable();
  const timeCourseIndependentVariable = useAtomValue(independentVariableAtom);
  const workspaceName = useAtomValue(nameAtom);
  const graphSettings = useAtomValue(graphSettingsAtom);

  const downloadName = `3D Plot of ${workspaceName}`;

  const getPlotOptions = () => {
    if (!result || result.type === "steadyState") return;

    const [columns, independentVariableName] = getColumnsFromResult(
      result,
      timeCourseIndependentVariable,
      scanIndependentVariable,
    );
    const independentVariableColumn = columns.find(
      (c) => c.variableName === independentVariableName,
    );
    const parameterSettings =
      result.type === "parameterScan"
        ? variableSettingss[result.parameter]
        : null;
    if (!independentVariableColumn) return;

    const series = [];
    const titles = [];

    for (const {
      variableName,
      values,
      parameterValue,
      scanPercent,
    } of columns) {
      if (variableName === independentVariableName) continue;

      const settings = variableSettingss[variableName];
      if (!settings.visible) continue;
      let finalColor: string = settings.color;
      if (result.type === "parameterScan" && result.mode === "timeCourse") {
        finalColor = getDefaultParameterScanColor(settings.color, scanPercent!);
      }

      const title =
        parameterValue !== undefined
          ? getParameterScanTitle(
              settings.displayName,
              parameterSettings!.displayName,
              parameterValue,
            )
          : settings.displayName;

      series.push({
        name: title,
        data: values.map((v, i) => [
          independentVariableColumn.values[i],
          title,
          v,
        ]),
        type: "line3D",
        lineStyle: {
          width: 4 * settings.width,
          color: finalColor,
          type: DASH_ARRAYS[settings.lineStyle],
        },
        itemStyle: {
          color: finalColor,
          opacity: 0,
        },
      });

      titles.push(title);
    }

    return {
      backgroundColor: graphSettings.backgroundColor,
      title: {
        text: "Transition of substances in chemical reaction",
        left: "center",
        textStyle: {
          fontSize: 20,
          fontWeight: "normal",
        },
      },
      tooltip: {},
      animation: false,
      xAxis3D: {
        name: independentVariableName,
        type: "value",
        nameLocation: "end",
        nameGap: 20,
        nameTextStyle: {
          fontSize: 14,
          color: "#000",
        },
        nameRotate: 0,
        axisPointer: {
          show: false,
        },
        axisLabel: {
          show: true,
          color: "#000",
          fontSize: 12,
        },
      },
      yAxis3D: {
        name: "Variable",
        type: "category",
        data: titles,
        nameLocation: "middle",
        nameGap: 20,
        nameTextStyle: {
          fontSize: 14,
          color: "#000",
        },
        nameRotate: 90,
        axisPointer: {
          show: false,
        },
        axisLabel: {
          show: titles.length <= MAX_TITLES_TO_SHOW,
          interval: 0,
          color: "#000",
          fontSize: 12,
        },
      },
      zAxis3D: {
        name: "Concentrations",
        type: "value",
        nameLocation: "end",
        nameGap: 15,
        nameTextStyle: {
          fontSize: 14,
          color: "#000",
        },
        axisPointer: {
          show: false,
        },
        axisLabel: {
          show: true,
          color: "#000",
          fontSize: 12,
        },
      },
      grid3D: {
        viewControl: {
          projection: "orthogonal",
          distance: 250,
          alpha: 30,
          beta: 40,
          rotateSensitivity: 1,
          zoomSensitivity: 1,
          panSensitivity: 1,
          autoRotate: false,
        },
        environment: "#ffffff",
        axisLine: {
          lineStyle: {
            color: "#333",
          },
        },
        axisLabel: {
          textStyle: {
            color: "#000",
          },
        },
      },
      series: series,
    };
  };

  const handlePngDownload = () => {
    const plotOptions = getPlotOptions();
    if (!plotOptions) return;

    // Create container and add to DOM (hidden) - WebGL needs DOM element
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = `${WIDTH}px`;
    container.style.height = `${HEIGHT}px`;
    document.body.appendChild(container);

    const chart = echarts.init(container, null, {
      renderer: "canvas",
      width: WIDTH,
      height: HEIGHT,
    });
    chart.setOption(plotOptions);
    // Force resize to ensure everything renders
    chart.resize();

    // Wait for chart to finish rendering - need extra delay for 3D axis titles
    const capturePng = () => {
      if (!container.parentNode) return;
      // Force another resize to ensure axis titles render
      chart.resize();
      const canvas = chart.getRenderedCanvas();
      if (canvas) {
        canvas.toBlob((blob) => {
          if (!blob) {
            document.body.removeChild(container);
            chart.dispose();
            return;
          }

          const url = URL.createObjectURL(blob);
          promptDownloadUrl(downloadName, url);
          URL.revokeObjectURL(url);
          document.body.removeChild(container);
          chart.dispose();
        });
      } else {
        document.body.removeChild(container);
        chart.dispose();
      }
    };

    chart.on("finished", () => {
      // Extra delay to ensure axis titles are fully rendered
      setTimeout(capturePng, 500);
    });

    // Fallback timeout - longer for 3D rendering with axis titles
    setTimeout(capturePng, 2000);
  };

  const handleSvgDownload = () => {
    // 3D charts use WebGL which cannot be exported as SVG
    // Convert the canvas to a data URL and embed it in SVG instead
    const plotOptions = getPlotOptions();
    if (!plotOptions) return;

    // Create container and add to DOM (hidden) - WebGL needs DOM element
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = `${WIDTH}px`;
    container.style.height = `${HEIGHT}px`;
    document.body.appendChild(container);

    const chart = echarts.init(container, null, {
      renderer: "canvas",
      width: WIDTH,
      height: HEIGHT,
    });
    chart.setOption(plotOptions);
    // Force resize to ensure everything renders
    chart.resize();

    // Wait for chart to finish rendering - need extra delay for 3D axis titles
    const captureSvg = () => {
      if (!container.parentNode) return;
      // Force another resize to ensure axis titles render
      chart.resize();
      const canvas = chart.getRenderedCanvas();
      if (canvas) {
        const dataUrl = canvas.toDataURL("image/png");
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="${WIDTH}" height="${HEIGHT}" xlink:href="${dataUrl}"/>
</svg>`;
        promptDownloadString(downloadName, svg, "image/svg+xml");
      }
      if (container.parentNode) {
        document.body.removeChild(container);
      }
      chart.dispose();
    };

    chart.on("finished", () => {
      // Extra delay to ensure axis titles are fully rendered
      setTimeout(captureSvg, 500);
    });

    // Fallback timeout - longer for 3D rendering with axis titles
    setTimeout(captureSvg, 2000);
  };

  const handlePdfDownload = async () => {
    const plotOptions = getPlotOptions();
    if (!plotOptions) return;

    // lazy import so it doesn't get downloaded at start
    const { jsPDF } = await import("jspdf");

    // Create container and add to DOM (hidden) - WebGL needs DOM element
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = `${WIDTH}px`;
    container.style.height = `${HEIGHT}px`;
    document.body.appendChild(container);

    const chart = echarts.init(container, null, {
      renderer: "canvas",
      width: WIDTH,
      height: HEIGHT,
    });
    chart.setOption(plotOptions);
    // Force resize to ensure everything renders
    chart.resize();

    // Wait for chart to finish rendering - need extra delay for 3D axis titles
    const captureAndSave = () => {
      if (!container.parentNode) return;
      // Force another resize to ensure axis titles render
      chart.resize();
      const canvas = chart.getRenderedCanvas();
      if (canvas) {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [WIDTH, HEIGHT],
        });
        pdf.addImage(canvas, "png", 0, 0, WIDTH, HEIGHT);
        pdf.save(`${downloadName}.pdf`);
      }
      if (container.parentNode) {
        document.body.removeChild(container);
      }
      chart.dispose();
    };

    chart.on("finished", () => {
      // Extra delay to ensure axis titles are fully rendered
      setTimeout(captureAndSave, 500);
    });

    // Fallback timeout - longer for 3D rendering with axis titles
    setTimeout(captureAndSave, 2000);
  };

  if (!result || result.type === "steadyState") {
    return null;
  }

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <IconButton label="Download">
          <DownloadIcon width="1em" height="1em" />
        </IconButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem name="Download as PNG" onSelect={handlePngDownload} />
        <DropdownMenuItem name="Download as SVG" onSelect={handleSvgDownload} />
        <DropdownMenuItem name="Download as PDF" onSelect={handlePdfDownload} />
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};

export default DownloadPlot3DButton;

