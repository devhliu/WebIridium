import type { IridiumDataV2 } from "./v2_simulationParameters";

export type IridiumDataV3 = Omit<IridiumDataV2, "versionTag"> & {
  versionTag: 3;
  currentGraphPreset: string;
};

export const migrateIridiumDataV2V3 = (data: IridiumDataV2): IridiumDataV3 => {
  return {
    ...data,
    versionTag: 3,
    currentGraphPreset: "Custom",
  };
};
