const files: Map<string, unknown> = new Map();

export const resetMockFiles = () => {
  files.clear();
};

export const getMockFiles = () => files;

export const getMockFile = (name: string): unknown => {
  return files.get(name);
};

export const setMockFile = (name: string, value: unknown): void => {
  files.set(name, value);
};

export const removeMockFile = (name: string): void => {
  files.delete(name);
};
