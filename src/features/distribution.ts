export const getLinearDistribution = (
  min: number,
  max: number,
  numberOfValues: number,
): number[] => {
  const list = [];
  const stepSize = (max - min) / (numberOfValues - 1);
  for (let i = 0; i < numberOfValues; i++) {
    list.push(min + i * stepSize);
  }
  return list;
};

export const getLogarithmicDistribution = (
  min: number,
  max: number,
  numberOfValues: number,
): number[] => {
  const list = [];

  const logMin = Math.log10(min);
  const logMax = Math.log10(max);
  const logStepSize = (logMax - logMin) / (numberOfValues - 1);

  for (let i = 0; i < numberOfValues; i++) {
    const logValue = logMin + i * logStepSize;
    list.push(Math.pow(10, logValue));
  }

  return list;
};
