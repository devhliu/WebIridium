/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext } from "react";
import type { ToastInfo } from "../Toast";
import { addMockToast } from "@/testing-utils/mockToast";

const ToastContext = createContext<true | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <ToastContext value={true}>{children}</ToastContext>;
};

export const useToast = () => {
  const isInContext = useContext(ToastContext);
  if (!isInContext) {
    throw new Error("can't use toast outside a toast context");
  }

  return {
    toast: (info: Omit<ToastInfo, "id">) => {
      addMockToast({
        id: 1,
        ...info,
      });
    },
  };
};
