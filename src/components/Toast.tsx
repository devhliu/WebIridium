/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useReducer, type Dispatch } from "react";
import styles from "./toast.module.css";
import { Toast as RadixToast } from "radix-ui";

import CloseIcon from "@/assets/icons/CloseIcon.svg?react";
import ErrorIcon from "@/assets/icons/ErrorIcon.svg?react";
import SuccessIcon from "@/assets/icons/SuccessIcon.svg?react";
import WarningIcon from "@/assets/icons/WarningIcon.svg?react";
import InfoIcon from "@/assets/icons/InfoIcon.svg?react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastInfo {
  id: number;
  title: string;
  description: string;
  type: ToastType;
}

export interface ToastContext {
  idCounter: number;
  toasts: ToastInfo[];
}

type ToastAction =
  | { type: "create"; info: Omit<ToastInfo, "id"> }
  | { type: "remove"; id: number };

const TOAST_DURATION = 10_000;

export const ToastContext = createContext<ToastContext | null>(null);
export const ToastDispatchContext = createContext<Dispatch<ToastAction> | null>(
  null,
);

const typeIcons: Record<
  ToastType,
  React.ComponentType<{ className: string }>
> = {
  error: ErrorIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  info: InfoIcon,
};

const toastReducer = (state: ToastContext, action: ToastAction) => {
  switch (action.type) {
    case "create": {
      return {
        ...state,
        idCounter: state.idCounter + 1,
        toasts: [
          ...state.toasts,
          {
            id: state.idCounter,
            ...action.info,
          },
        ],
      };
    }
    case "remove":
      return {
        ...state,
        toasts: state.toasts.filter((info) => info.id !== action.id),
      };
    default:
      return state;
  }
};

export const ToastProvider = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [prop: string]: unknown;
}) => {
  const [value, dispatch] = useReducer(toastReducer, {
    idCounter: 0,
    toasts: [],
  } as ToastContext);

  return (
    <ToastDispatchContext value={dispatch}>
      <RadixToast.Provider swipeDirection="right" {...props}>
        {children}

        {value.toasts.map((info) => {
          const Icon = typeIcons[info.type];
          const remove = () => {
            dispatch({ type: "remove", id: info.id });
          };

          return (
            <RadixToast.Root
              key={info.id}
              className={styles.root}
              duration={TOAST_DURATION}
              onAnimationEnd={(anim) => {
                if (
                  anim.animationName === styles.slideOut ||
                  anim.animationName === styles.fade
                )
                  remove();
              }}
              data-type={info.type}
            >
              <RadixToast.Title className={styles.title}>
                <Icon className={styles.icon} />
                {info.title}
              </RadixToast.Title>
              <RadixToast.Description className={styles.description}>
                {info.description}
              </RadixToast.Description>
              <RadixToast.Close className={styles.close}>
                <CloseIcon className={styles.closeIcon} />
              </RadixToast.Close>
            </RadixToast.Root>
          );
        })}

        <RadixToast.Viewport className={styles.viewport} />
      </RadixToast.Provider>
    </ToastDispatchContext>
  );
};

export const useToast = () => {
  const dispatch = useContext(ToastDispatchContext);
  if (dispatch === null) {
    throw new Error("can't use toast outside a toast context");
  }

  return {
    toast: (info: Omit<ToastInfo, "id">) => {
      dispatch({
        type: "create",
        info: info,
      });
    },
  };
};
