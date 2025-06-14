/**
 * Get title used in legend or table header for variable in parameter scan.
 */
export const getParameterScanTitle = (
  variable: string,
  parameter: string,
  parameterValue: number,
) => {
  const title = `${variable} (${parameter}=${parameterValue.toFixed(3)})`;
  return title;
};
