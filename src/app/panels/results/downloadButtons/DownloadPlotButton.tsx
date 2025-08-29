import { useAtomValue } from "jotai";

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

  const handleClick = async () => {
    if (!result) return;

    const { plotData, layout } = generatePlotParameters(
      WIDTH,
      HEIGHT,
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

    const fakeContainer = document.createElement("div");
    const plot = await plotly.newPlot(fakeContainer, plotData, layout);
    const imageUrl = await plotly.toImage(plot, {
      format: "png",
      width: WIDTH,
      height: HEIGHT,
    });
    promptDownloadUrl(`Plot of ${workspaceName}`, imageUrl);
  };

  return <DownloadButtonBase onClick={handleClick} />;
};

export default DownloadPlotButton;
