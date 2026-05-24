export interface AppTheme {
  id: string;
  fonts: {
    sans: string;
    mono: string;
  };
  typography: {
    size10: number;
    size12: number;
    size13: number;
    size14: number;
    size15: number;
    size16: number;
    size18: number;
    size24: number;
    size26: number;
    size28: number;
  };
  spacing: {
    size2: number;
    size3: number;
    size4: number;
    size6: number;
    size7: number;
    size8: number;
    size10: number;
    size12: number;
    size14: number;
    size16: number;
    size20: number;
    size64: number;
  };
  radius: {
    size10: number;
    size12: number;
    size18: number;
    pill: number;
  };
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    surfaceStrong: string;
    foreground: string;
    muted: string;
    primary: string;
    onPrimary: string;
    accent: string;
    danger: string;
    dangerText: string;
    borderSoft: string;
    borderMuted: string;
    statusOpenBg: string;
    statusOpenBorder: string;
    statusOpenText: string;
    statusDraftBg: string;
    statusDraftBorder: string;
    statusFinishedBg: string;
    statusFinishedBorder: string;
  };
}

export const appTheme: AppTheme = {
  id: "ocean-field",
  fonts: {
    sans: "var(--font-brand-sans)",
    mono: "var(--font-brand-mono)",
  },
  typography: {
    size10: 10,
    size12: 12,
    size13: 13,
    size14: 14,
    size15: 15,
    size16: 16,
    size18: 18,
    size24: 24,
    size26: 26,
    size28: 28,
  },
  spacing: {
    size2: 2,
    size3: 3,
    size4: 4,
    size6: 6,
    size7: 7,
    size8: 8,
    size10: 10,
    size12: 12,
    size14: 14,
    size16: 16,
    size20: 20,
    size64: 64,
  },
  radius: {
    size10: 10,
    size12: 12,
    size18: 18,
    pill: 999,
  },
  colors: {
    background: "#f5f8ff",
    surface: "#ffffff",
    surfaceMuted: "#eef2fa",
    surfaceStrong: "#e7edf9",
    foreground: "#10203a",
    muted: "#5c6b85",
    primary: "#1d5cff",
    onPrimary: "#ffffff",
    accent: "#11a36b",
    danger: "#d33a2c",
    dangerText: "#b42318",
    borderSoft: "#dbe2f0",
    borderMuted: "#d2d7e5",
    statusOpenBg: "#e8f7ef",
    statusOpenBorder: "#9dd8b8",
    statusOpenText: "#0c7a48",
    statusDraftBg: "#e9f0ff",
    statusDraftBorder: "#bdd1ff",
    statusFinishedBg: "#f1f3f8",
    statusFinishedBorder: "#d2d7e5",
  },
};
