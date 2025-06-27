import { type ToastInfo } from "@/components/Toast";

let toastHistory: ToastInfo[] = [];

export const addMockToast = (info: ToastInfo) => {
  toastHistory.push(info);
};

export const getToastHistory = () => {
  return toastHistory;
};

export const resetToastHistory = () => {
  toastHistory = [];
};
