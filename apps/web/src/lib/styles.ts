export const colors = {
  primary: "#3b82f6",
  primaryDark: "#2563eb",
  primaryLight: "#60a5fa",
  bgPrimary: "#0f172a",
  bgSecondary: "#1e293b",
  bgTertiary: "#334155",
  textPrimary: "#f1f5f9",
  textSecondary: "#cbd5e1",
  textMuted: "#94a3b8",
  border: "#475569",
  danger: "#ef4444",
  success: "#10b981",
  warning: "#f59e0b",
};

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
};

export const radius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
};

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
};

/* Common Component Styles */
export const baseButton = {
  padding: `${spacing.sm} ${spacing.md}`,
  borderRadius: radius.md,
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
  transition: "all 0.2s ease",
  display: "inline-flex",
  alignItems: "center",
  gap: spacing.sm,
} as const;

export const primaryButton = {
  ...baseButton,
  backgroundColor: colors.primary,
  color: colors.textPrimary,
  boxShadow: shadows.md,
} as const;

export const secondaryButton = {
  ...baseButton,
  backgroundColor: colors.bgTertiary,
  color: colors.textPrimary,
  border: `1px solid ${colors.border}`,
} as const;

export const dangerButton = {
  ...baseButton,
  backgroundColor: colors.danger,
  color: colors.textPrimary,
} as const;

export const baseCard = {
  backgroundColor: colors.bgSecondary,
  borderRadius: radius.lg,
  border: `1px solid ${colors.border}`,
  boxShadow: shadows.md,
  padding: spacing.md,
} as const;

export const baseInput = {
  backgroundColor: colors.bgSecondary,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  color: colors.textPrimary,
  padding: `${spacing.sm} ${spacing.md}`,
  fontSize: "14px",
  transition: "all 0.2s ease",
} as const;

export const baseModal = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
} as const;

export const modalContent = {
  backgroundColor: colors.bgSecondary,
  borderRadius: radius.lg,
  boxShadow: shadows.xl,
  border: `1px solid ${colors.border}`,
  padding: spacing.lg,
  maxWidth: "500px",
  width: "90%",
  animation: "slideInUp 0.3s ease-in-out",
} as const;
