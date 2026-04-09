"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./GlobalAlertHost.module.css";

const AppDialogContext = createContext({
  confirm: async () => false,
});

const buildDialogId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function formatDialogMessage(value) {
  if (value instanceof Error) {
    return value.message || "Something went wrong.";
  }

  if (typeof value === "string") {
    return value.trim() || "Something went wrong.";
  }

  if (value == null) {
    return "Something went wrong.";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

export function useAppDialog() {
  return useContext(AppDialogContext);
}

export default function GlobalAlertHost({ children }) {
  const originalAlertRef = useRef(null);
  const [alertQueue, setAlertQueue] = useState([]);
  const [confirmQueue, setConfirmQueue] = useState([]);
  const activeAlert = alertQueue[0] || null;
  const activeConfirm = confirmQueue[0] || null;

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    originalAlertRef.current = window.alert.bind(window);

    window.alert = (message) => {
      setAlertQueue((currentQueue) => [
        ...currentQueue,
        {
          id: buildDialogId(),
          message: formatDialogMessage(message),
        },
      ]);
    };

    return () => {
      if (originalAlertRef.current) {
        window.alert = originalAlertRef.current;
      }
    };
  }, []);

  const confirm = useCallback(
    ({
      title = "Please Confirm",
      message,
      confirmLabel = "OK",
      cancelLabel = "Cancel",
    }) =>
      new Promise((resolve) => {
        setConfirmQueue((currentQueue) => [
          ...currentQueue,
          {
            id: buildDialogId(),
            title,
            message: formatDialogMessage(message),
            confirmLabel,
            cancelLabel,
            resolve,
          },
        ]);
      }),
    []
  );

  const contextValue = useMemo(
    () => ({
      confirm,
    }),
    [confirm]
  );

  const closeAlert = () => {
    setAlertQueue((currentQueue) => currentQueue.slice(1));
  };

  const closeConfirm = (confirmed) => {
    setConfirmQueue((currentQueue) => {
      const currentDialog = currentQueue[0];

      if (currentDialog?.resolve) {
        currentDialog.resolve(confirmed);
      }

      return currentQueue.slice(1);
    });
  };

  return (
    <AppDialogContext.Provider value={contextValue}>
      {children}

      {activeAlert ? (
        <div className={styles.overlay} role="presentation">
          <div
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="global-alert-title"
            aria-describedby="global-alert-message"
          >
            <h2 id="global-alert-title">UTSAVAS</h2>
            <p id="global-alert-message">{activeAlert.message}</p>
            <button type="button" className={styles.button} onClick={closeAlert}>
              OK
            </button>
          </div>
        </div>
      ) : null}

      {activeConfirm ? (
        <div className={styles.overlay} role="presentation">
          <div
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="global-confirm-title"
            aria-describedby="global-confirm-message"
          >
            <h2 id="global-confirm-title">{activeConfirm.title}</h2>
            <p id="global-confirm-message">{activeConfirm.message}</p>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => closeConfirm(false)}
              >
                {activeConfirm.cancelLabel}
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => closeConfirm(true)}
              >
                {activeConfirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppDialogContext.Provider>
  );
}
