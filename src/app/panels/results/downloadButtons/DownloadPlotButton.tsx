import { useAtomValue } from "jotai";
import * as echarts from "echarts/core";

import DownloadButtonBase from "./DownloadButtonBase";

import { simulationResultAtom } from "@/globals/workspace/simulation";
import {
  graphSettingsAtom,
  variableSettingssAtom,
  paletteAtom,
  independentVariableAtom,
  nameAtom,
} from "@/globals/workspace/settings";
import { useScanIndependentVariable } from "@/features/simulation/useScanIndependentVariable";
import { xAxisTitleAtom, yAxisTitleAtom } from "@/globals/workspace/plot";
import { generatePlotParameters } from "../generatePlotParameters";
import { promptDownloadUrl } from "@/features/download";

const WIDTH = 800;
const HEIGHT = 800;

const DownloadPlotButton = () => {
  const result = useAtomValue(simulationResultAtom);
  const variableSettingss = useAtomValue(variableSettingssAtom);
  const palette = useAtomValue(paletteAtom);
  const scanIndependentVariable = useScanIndependentVariable();
  const timeCourseIndependentVariable = useAtomValue(independentVariableAtom);
  const graphSettings = useAtomValue(graphSettingsAtom);
  const workspaceName = useAtomValue(nameAtom);
  const xAxisTitle = useAtomValue(xAxisTitleAtom);
  const yAxisTitle = useAtomValue(yAxisTitleAtom);

  const handleClick = () => {
    if (!result) return;

    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const { plotOptions } = generatePlotParameters(
      result,
      {
        ...graphSettings,
        legend: {
          ...graphSettings.legend,
          isFloating: false,
        },
      },
      variableSettingss,
      timeCourseIndependentVariable,
      scanIndependentVariable,
      palette,
      xAxisTitle,
      yAxisTitle,
    );

    const chart = echarts.init(canvas as unknown as HTMLCanvasElement);
    chart.setOption(plotOptions);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      promptDownloadUrl(`Plot of ${workspaceName}`, url);
      URL.revokeObjectURL(url);
    });
  };

  return <DownloadButtonBase onClick={handleClick} />;
};

export default DownloadPlotButton;
