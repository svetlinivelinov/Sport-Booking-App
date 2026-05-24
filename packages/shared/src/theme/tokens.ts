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
    size32: number;
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
    backgroundTop: string;
    backgroundBottom: string;
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
  id: "night-arena",
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
    size32: 32,
    size64: 64,
  },
  radius: {
    size10: 10,
    size12: 12,
    size18: 18,
    pill: 999,
  },
  colors: {
    background: "#0a2240",
    backgroundTop: "#194b88",
    backgroundBottom: "#081a2b",
    surface: "#32485d",
    surfaceMuted: "#2a3f55",
    surfaceStrong: "#3a5470",
    foreground: "#eaf3ff",
    muted: "#a8bdd0",
    primary: "#25d7df",
    onPrimary: "#052229",
    accent: "#2f67ff",
    danger: "#e45757",
    dangerText: "#ff8b8b",
    borderSoft: "#4a617a",
    borderMuted: "#5a7390",
    statusOpenBg: "#163e3a",
    statusOpenBorder: "#2f8f86",
    statusOpenText: "#76e7db",
    statusDraftBg: "#16315a",
    statusDraftBorder: "#2f67ff",
    statusFinishedBg: "#253548",
    statusFinishedBorder: "#4a617a",
  },
};
