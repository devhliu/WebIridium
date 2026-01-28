export interface AxisSettings {
  includeTitle: boolean;
  title: string;
  color: string;
}

export interface GridSettings {
  enabled: {
    x: boolean;
    y: boolean;
  };
  xColor: string;
  yColor: string;
  xWidth: number;
  yWidth: number;
  numXGrids: number;
  numYGrids: number;
}

export interface LegendSettings {
  visible: boolean;
  isFloating: boolean;

  // Floating only
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderThickness: number;
  padding: number;
  lineLength: number;
}

export interface GraphSettings {
  backgroundColor: string;
  drawingAreaColor: string;

  includeTitle: boolean;
  title: string;
  titleColor: string;

  includeBorder: boolean;
  borderColor: string;
  borderThickness: number;

  globalWidth: number;

  isAutoscaledX: boolean;
  minX: number;
  maxX: number;

  isAutoscaledY: boolean;
  minY: number;
  maxY: number;

  margin: number;

  xAxis: AxisSettings;
  yAxis: AxisSettings;

  majorGrid: GridSettings;
  minorGrid: GridSettings;

  legend: LegendSettings;
}

export const defaultGraphSettings: GraphSettings = {
  backgroundColor: "#ffffff",
  drawingAreaColor: "#f1e7f4",

  includeTitle: true,
  title: "Transition of substances in chemical reaction",
  titleColor: "#000000",

  includeBorder: true,
  borderColor: "#000000",
  borderThickness: 0.5,

  globalWidth: 1,

  isAutoscaledX: true,
  minX: 0,
  maxX: 10,

  isAutoscaledY: true,
  minY: 0,
  maxY: 10,

  margin: 70,

  xAxis: {
    includeTitle: true,
    title: "", // empty means use placeholder
    color: "#000",
  },

  yAxis: {
    includeTitle: true,
    title: "", // empty means use placeholder
    color: "#000",
  },

  majorGrid: {
    enabled: { x: false, y: false },
    xColor: "#888",
    yColor: "#888",
    xWidth: 0.5,
    yWidth: 0.5,
    numXGrids: 4,
    numYGrids: 4,
  },

  minorGrid: {
    enabled: { x: false, y: false },
    xColor: "#888",
    yColor: "#888",
    xWidth: 0.5,
    yWidth: 0.5,
    numXGrids: 4,
    numYGrids: 4,
  },

  legend: {
    visible: true,
    isFloating: true,

    textColor: "#000",
    backgroundColor: "#fff",
    borderColor: "#000",
    borderThickness: 1,
    padding: 15,
    lineLength: 50,
  },
};

export const graphPresets = {
  Dark: {
    ...defaultGraphSettings,
    backgroundColor: "#000000",
    drawingAreaColor: "#111111",
    titleColor: "#ffffff",
    borderColor: "#ffffff",
    xAxis: {
      ...defaultGraphSettings.xAxis,
      color: "#ffffff",
    },
    yAxis: {
      ...defaultGraphSettings.yAxis,
      color: "#ffffff",
    },
    legend: {
      ...defaultGraphSettings.legend,
      textColor: "#fff",
      backgroundColor: "#000",
      borderColor: "#fff",
    },
  } satisfies GraphSettings,

  Winter: {
    ...defaultGraphSettings,
    backgroundColor: "#72b7f7",
    drawingAreaColor: "#b6d5f2",
    titleColor: "#010a12",
    borderColor: "#010a12",
    xAxis: {
      ...defaultGraphSettings.xAxis,
      color: "#010a12",
    },
    yAxis: {
      ...defaultGraphSettings.yAxis,
      color: "#010a12",
    },
    legend: {
      ...defaultGraphSettings.legend,
      textColor: "#010a12",
      backgroundColor: "#b6f1f2",
      borderColor: "#010a12",
    },
  } satisfies GraphSettings,

  Beach: {
    ...defaultGraphSettings,
    backgroundColor: "#e8e1c3",
    drawingAreaColor: "#faf8f2",
    titleColor: "#080600",
    borderColor: "#080600",
    xAxis: {
      ...defaultGraphSettings.xAxis,
      color: "#080600",
    },
    yAxis: {
      ...defaultGraphSettings.yAxis,
      color: "#080600",
    },
    legend: {
      ...defaultGraphSettings.legend,
      textColor: "#080600",
      backgroundColor: "#e8c6ba",
      borderColor: "#080600",
    },
  } satisfies GraphSettings,
} as const;
