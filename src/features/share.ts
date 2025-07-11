import type { EditableTimeCourseParameters } from "@/globals/workspace/settings";
import type { SteadyStateParameters } from "./simulation/Simulator";

/**
 * Data shared between workspaces when using the share feature.
 */
export interface ShareWorkspaceData {
  version: 0;
  name: string;
  code: string;
  /** Data about simulation. Parameters scans cannnot be shared because they are compute-intensive. */
  simulation:
    | {
        type: "timeCourse";
        parameters: EditableTimeCourseParameters;
      }
    | {
        type: "steadyState";
        // NOTE: if steady state parameters are ever added, make sure to create an EditableSteadyStateParameters type and use that instead.
        parameters: SteadyStateParameters;
      };
}

const SHARE_URL_PREFIX = "s=";
const CURRENT_VERSION = 0;

export type GetShareUrlFragmentResult =
  | { type: "success"; fragment: string }
  | { type: "error"; message: string };

export const getShareUrlFragment = async (
  data: ShareWorkspaceData,
): Promise<GetShareUrlFragmentResult> => {
  const base64Array = [];
  try {
    const json = JSON.stringify(data);
    const dataStream = new Blob([json]).stream();
    const compressedStream = dataStream.pipeThrough(
      // i chose deflate-raw because it omits the header/footer. not sure what impact that will have
      new CompressionStream("deflate-raw"),
    );

    const reader = compressedStream
      .pipeThrough(new TextDecoderStream())
      .getReader();
    while (true) {
      const result = await reader.read();
      if (!result.value)
        return { type: "error", message: "Failed to compress" };

      base64Array.push(btoa(result.value));

      if (result.done) {
        break;
      }
    }
  } catch (e) {
    return { type: "error", message: String(e) };
  }

  return { type: "success", fragment: SHARE_URL_PREFIX + base64Array.join("") };
};

export type ReadShareUrlFragmentResult =
  | { type: "success"; data: ShareWorkspaceData }
  | { type: "error"; message: string }
  | { type: "notShare" };

export const readShareUrlFragment = async (
  fragment: string,
): Promise<ReadShareUrlFragmentResult> => {
  if (!fragment.startsWith(SHARE_URL_PREFIX)) {
    return { type: "notShare" };
  }

  const stringArray = [];
  try {
    const dataStream = new Blob([
      fragment.slice(SHARE_URL_PREFIX.length + 1),
    ]).stream();
    const decompressedStream = dataStream.pipeThrough(
      new DecompressionStream("deflate-raw"),
    );

    const reader = decompressedStream
      .pipeThrough(new TextDecoderStream())
      .getReader();
    while (true) {
      const result = await reader.read();
      if (!result.value)
        return { type: "error", message: "Failed to decompress" };

      stringArray.push(atob(result.value));

      if (result.done) {
        break;
      }
    }
  } catch (e) {
    return { type: "error", message: String(e) };
  }

  try {
    const json = JSON.parse(stringArray.join("")) as unknown;
    return parseShareData(json);
  } catch (e) {
    return { type: "error", message: String(e) };
  }
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

// This exported so it can be tested.
export const parseShareData = (data: unknown): ReadShareUrlFragmentResult => {
  if (!isObject(data)) {
    return { type: "error", message: "Invalid data. Not an object." };
  }

  if (data.version !== CURRENT_VERSION) {
    return { type: "error", message: "Incompatible version." };
  }

  if (typeof data.name !== "string") {
    return { type: "error", message: "Missing name." };
  }

  if (typeof data.code !== "string") {
    return { type: "error", message: "Missing code." };
  }

  if (!isObject(data.simulation)) {
    return { type: "error", message: "Missing simulation data." };
  }

  if (data.simulation.type === "timeCourse") {
    if (!isObject(data.simulation.parameters)) {
      return { type: "error", message: "Invalid time course parameters" };
    }

    if (
      typeof data.simulation.parameters.startTime !== "number" ||
      data.simulation.parameters.startTime < 0
    ) {
      return { type: "error", message: "Invalid time course start time." };
    }

    if (
      typeof data.simulation.parameters.endTime !== "number" ||
      data.simulation.parameters.endTime < data.simulation.parameters.startTime
    ) {
      return { type: "error", message: "Invalid time course end time." };
    }

    if (
      typeof data.simulation.parameters.numberOfPoints !== "number" ||
      data.simulation.parameters.numberOfPoints !==
        Math.floor(data.simulation.parameters.numberOfPoints)
    ) {
      return {
        type: "error",
        message: "Invalid time course number of points.",
      };
    }
  } else if (data.simulation.type === "steadyState") {
    if (data.simulation.parameters !== null) {
      return { type: "error", message: "Invalid steady state parameters." };
    }
  } else {
    return { type: "error", message: "Invalid simulation type." };
  }

  // might contain extra parameters, but that is OK
  return { type: "success", data: data as unknown as ShareWorkspaceData };
};
