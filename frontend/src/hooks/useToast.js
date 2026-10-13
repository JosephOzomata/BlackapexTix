import { useUIStore } from "../stores/uiStore";
import toast from "react-hot-toast";
import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import React from "react";

/**
 * Thin wrapper around react-hot-toast so we can style consistently and
 * centralise behaviour (haptics later, analytics later, etc.).
 */
function renderIcon(type) {
  const common = { size: 18, strokeWidth: 2.5 };
  switch (type) {
    case "success":
      return React.createElement(CheckCircle2, {
        ...common,
        className: "text-emerald-400",
      });
    case "error":
      return React.createElement(XCircle, {
        ...common,
        className: "text-red-400",
      });
    case "warning":
      return React.createElement(AlertTriangle, {
        ...common,
        className: "text-amber-400",
      });
    default:
      return React.createElement(Info, {
        ...common,
        className: "text-sky-400",
      });
  }
}

export function useToast() {
  const openModal = useUIStore((s) => s.openModal);

  const show = (type) => (message, options = {}) =>
    toast(message, {
      duration: options.duration ?? 3800,
      icon: renderIcon(type),
      ...options,
    });

  return {
    success: show("success"),
    error: show("error"),
    warning: show("warning"),
    info: show("info"),
    dismiss: toast.dismiss,
    openModal,
  };
}

export default useToast;