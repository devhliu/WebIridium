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
import { useToast } from "@/components/Toast";

import { simulationResultAtom } from "@/globals/simulation";
import { graphSettingsAtom, nameAtom, steadyState3DItemAtom } from "@/globals/settings";
import { getPaletteGradient } from "@/features/colors";
import { promptDownloadString, promptDownloadUrl } from "@/features/download";

const WIDTH = 800;
const HEIGHT = 800;
const MAX_DECIMALS = 6;

const formatWithMaxDecimals = (n: number, maxDecimals: number): string => {
  return (Math.floor(n * 10 ** maxDecimals) / 10 ** maxDecimals).toString();
};

const DownloadSteadyState3DButton = () => {
  const result = useAtomValue(simulationResultAtom);
  const graphSettings = useAtomValue(graphSettingsAtom);
  const workspaceName = useAtomValue(nameAtom);
  const item = useAtomValue(steadyState3DItemAtom);

  const { toast } = useToast();

  const downloadName = `3D Plot of ${workspaceName}`;

  const AXES: { [name: string]: { x: string; y: string; z: string } } = {
    Jacobian: { x: "X", y: "Y", z: "Z" },
    "Flux Control": { x: "Reaction", y: "Flux", z: "Coefficient" },
    "Concentration Control": { x: "Reaction", y: "Species", z: "Coefficient" },
    Elasticities: { x: "Species", y: "Reaction", z: "Elasticity" },
  };

  const getPlotOptions = () => {
    if (result?.type !== "steadyState") return;

    // prettier-ignore
    const data =
      item === "Jacobian" ? result.jacobian :
      item === "Flux Control" ? result.fluxControl :
      item === "Concentration Control" ? result.concentrationControl :
      result.elasticities;

    const name = item;
    const { x, y, z } = AXES[item];

    const allValues = data.values.flat();
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);

    const min = graphSettings.isAutoscaledZ
      ? dataMin
      : graphSettings.minZ ?? dataMin;
    const max = graphSettings.isAutoscaledZ
      ? dataMax
      : graphSettings.maxZ ?? dataMax;

    const colorGradient = getPaletteGradient(graphSettings.colorScheme3D);

    return {
      backgroundColor: graphSettings.backgroundColor,
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
        nameLocation: "middle",
        nameGap: 30,
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
      yAxis3D: {
        name: y,
        type: "category",
        data: data.rows,
        nameLocation: "middle",
        nameGap: 30,
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
      zAxis3D: {
        name: z,
        type: "value",
        min: min,
        max: max,
        nameLocation: "middle",
        nameGap: 30,
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
        viewControl: {
          distance: 250,
          alpha: 30,
          beta: 40,
          rotateSensitivity: 1,
          zoomSensitivity: 1,
          panSensitivity: 1,
          autoRotate: false,
        },
        environment: "#ffffff",
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
              color: "#080",
            },
          },
        },
      ],
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

    // Wait for chart to finish rendering
    chart.on("finished", () => {
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
    });

    // Fallback timeout in case 'finished' event doesn't fire
    setTimeout(() => {
      if (container.parentNode) {
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
      }
    }, 1000);
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

    // Wait for chart to finish rendering - need extra delay for 3D labels
    const captureSvg = () => {
      if (!container.parentNode) return;
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
      // Extra delay to ensure axis labels are fully rendered
      setTimeout(captureSvg, 300);
    });

    // Fallback timeout - longer for 3D rendering
    setTimeout(captureSvg, 1500);
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

    // Wait for chart to finish rendering - need extra delay for 3D labels
    const captureAndSave = () => {
      if (!container.parentNode) return;
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
      // Extra delay to ensure axis labels are fully rendered
      setTimeout(captureAndSave, 300);
    });

    // Fallback timeout - longer for 3D rendering
    setTimeout(captureAndSave, 1500);
  };

  if (result?.type !== "steadyState") {
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

export default DownloadSteadyState3DButton;

