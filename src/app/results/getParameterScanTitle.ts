/**
 * Use for parameter scan, get title used in legend or table header for a particular variable
 * @param variable - the name of the variable
 * @param parameter - the name of the variable that was scanned
 * @param parameterValue - the value of the variable that was scanned
 *
 * @example
 * Get title for variable "A" when the parameter k1 was 0.2
 * ```
 * getParameterScanTitle("A", "k1", 0.2)
 * ```
 */
export const getParameterScanTitle = (
  variable: string,
  parameter: string,
  parameterValue: number,
) => {
  const title = `${variable} (${parameter}=${parameterValue.toFixed(3)})`;
  return title;
};
