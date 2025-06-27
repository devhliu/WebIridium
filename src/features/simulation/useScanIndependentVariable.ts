import { useSimulator } from "../workspace";

export const useScanIndependentVariable = (): string => {
  const simulator = useSimulator();
  return simulator.scanIndependentVariableName;
};
