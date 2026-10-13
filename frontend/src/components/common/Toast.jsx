import { Toaster } from "react-hot-toast";

/**
 * Global toast container. Mounted once in App.jsx.
 * Styling uses our CSS variables so it blends with the design system.
 */
export function ToastContainer() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: 3800,
        style: {
          background: "var(--color-card-elevated)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "10px 14px",
          fontSize: "0.875rem",
          maxWidth: "420px",
          boxShadow: "var(--shadow-lg)",
        },
        success: {
          iconTheme: {
            primary: "var(--color-success)",
            secondary: "var(--color-card-elevated)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--color-danger)",
            secondary: "var(--color-card-elevated)",
          },
        },
      }}
    />
  );
}

export default ToastContainer;