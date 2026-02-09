export const theme = {
  colors: {
    background: "#0f172a",
    foreground: "#f8fafc",
    slate: {
      800: "#1e293b",
      900: "#0f172a",
    },
    indigo: "#6366f1",
    purple: "#a855f7",
    red: "#ef4444",
    green: "#22c55e",
  },
  styles: {
    glass: {
      background: "rgba(30, 41, 59, 0.7)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "16px",
    },
    button: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    primaryButton: {
      background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
      color: "white",
      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
    },
    input: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      background: "rgba(15, 23, 42, 0.5)",
      color: "white",
      outline: "none",
      fontSize: "14px",
    },
  },
};
