import { useAtomValue } from "jotai";
import { simulatorAtom } from "@/stores/workspace/simulation";

export const useScanIndependentVariable = (): string => {
  const simulator = useAtomValue(simulatorAtom);
  return simulator.scanIndependentVariableName;
};
