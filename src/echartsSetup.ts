import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

import { Line3DChart, Bar3DChart } from "echarts-gl/charts";
import { Grid3DComponent } from "echarts-gl/components";

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  VisualMapComponent,
} from "echarts/components";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  VisualMapComponent,
  LineChart,
  LabelLayout,
  CanvasRenderer,
  Line3DChart,
  Bar3DChart,
  Grid3DComponent,
]);
