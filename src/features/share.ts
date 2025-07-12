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

    const reader = compressedStream.getReader();
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      if (!result.value)
        return { type: "error", message: "Failed to compress" };

      // https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
      const base64Url: string = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(new Blob([result.value]));
      });
      base64Array.push(base64Url.slice(base64Url.indexOf(",") + 1));
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
    const dataStream = new ReadableStream({
      start: (controller) => {
        const binaryString = atob(fragment.slice(SHARE_URL_PREFIX.length));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        controller.enqueue(bytes);
        controller.close();
      },
    });
    const decompressedStream = dataStream.pipeThrough(
      new DecompressionStream("deflate-raw"),
    );

    const reader = decompressedStream
      .pipeThrough(new TextDecoderStream())
      .getReader();
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      if (!result.value)
        return { type: "error", message: "Failed to compress" };

      stringArray.push(result.value);
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

    return {
      type: "success",
      data: {
        version: data.version,
        name: data.name,
        code: data.code,
        simulation: {
          type: data.simulation.type,
          parameters: {
            startTime: data.simulation.parameters.startTime,
            endTime: data.simulation.parameters.endTime,
            numberOfPoints: data.simulation.parameters.numberOfPoints,
          },
        },
      },
    };
  } else if (data.simulation.type === "steadyState") {
    if (data.simulation.parameters !== null) {
      return { type: "error", message: "Invalid steady state parameters." };
    }

    return {
      type: "success",
      data: {
        version: data.version,
        name: data.name,
        code: data.code,
        simulation: {
          type: data.simulation.type,
          parameters: data.simulation.parameters,
        },
      },
    };
  } else {
    return { type: "error", message: "Invalid simulation type." };
  }
};
