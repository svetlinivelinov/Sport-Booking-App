export interface AppTheme {
  id: string;
  fonts: {
    sans: string;
    mono: string;
  };
  colors: {
    background: string;
    surface: string;
    foreground: string;
    muted: string;
    primary: string;
    accent: string;
    danger: string;
  };
}

export const appTheme: AppTheme = {
  id: "ocean-field",
  fonts: {
    sans: "var(--font-brand-sans)",
    mono: "var(--font-brand-mono)",
  },
  colors: {
    background: "#f5f8ff",
    surface: "#ffffff",
    foreground: "#10203a",
    muted: "#5c6b85",
    primary: "#1d5cff",
    accent: "#11a36b",
    danger: "#d33a2c",
  },
};
