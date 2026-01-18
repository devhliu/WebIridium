import type { ProjectId, UnknownProjectData } from "@/features/projectData";

const files: Map<ProjectId, UnknownProjectData> = new Map();

export const resetMockFiles = () => {
  files.clear();
};

export const getMockFiles = () => files;

export const getMockFile = (name: string): UnknownProjectData | undefined => {
  return files.get(name as ProjectId);
};

export const setMockFile = (name: string, value: UnknownProjectData): void => {
  files.set(name as ProjectId, value);
};
