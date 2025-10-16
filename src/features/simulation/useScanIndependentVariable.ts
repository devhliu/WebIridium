import { useAtomValue } from "jotai";
import { simulatorAtom } from "@/globals/simulator";

export const useScanIndependentVariable = (): string => {
  const simulator = useAtomValue(simulatorAtom);
  return simulator.scanIndependentVariableName;
};
