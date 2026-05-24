import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { appTheme } from "@sport-booking/shared";
import "./globals.css";

const brandSans = Manrope({
  variable: "--font-brand-sans",
  subsets: ["latin"],
});

const brandMono = JetBrains_Mono({
  variable: "--font-brand-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sport Booking App",
  description: "Multi-sport booking and session management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeVars: React.CSSProperties = {
    ["--app-bg" as string]: appTheme.colors.background,
    ["--app-bg-top" as string]: appTheme.colors.backgroundTop,
    ["--app-bg-bottom" as string]: appTheme.colors.backgroundBottom,
    ["--app-surface" as string]: appTheme.colors.surface,
    ["--app-surface-muted" as string]: appTheme.colors.surfaceMuted,
    ["--app-surface-strong" as string]: appTheme.colors.surfaceStrong,
    ["--app-fg" as string]: appTheme.colors.foreground,
    ["--app-muted" as string]: appTheme.colors.muted,
    ["--app-primary" as string]: appTheme.colors.primary,
    ["--app-on-primary" as string]: appTheme.colors.onPrimary,
    ["--app-accent" as string]: appTheme.colors.accent,
    ["--app-danger" as string]: appTheme.colors.danger,
    ["--app-danger-text" as string]: appTheme.colors.dangerText,
    ["--app-border-soft" as string]: appTheme.colors.borderSoft,
    ["--app-border-muted" as string]: appTheme.colors.borderMuted,
    ["--app-status-open-bg" as string]: appTheme.colors.statusOpenBg,
    ["--app-status-open-border" as string]: appTheme.colors.statusOpenBorder,
    ["--app-status-open-text" as string]: appTheme.colors.statusOpenText,
    ["--app-status-draft-bg" as string]: appTheme.colors.statusDraftBg,
    ["--app-status-draft-border" as string]: appTheme.colors.statusDraftBorder,
    ["--app-status-finished-bg" as string]: appTheme.colors.statusFinishedBg,
    ["--app-status-finished-border" as string]: appTheme.colors.statusFinishedBorder,
    ["--app-font-sans" as string]: appTheme.fonts.sans,
    ["--app-font-mono" as string]: appTheme.fonts.mono,
    ["--app-text-10" as string]: `${appTheme.typography.size10}px`,
    ["--app-text-12" as string]: `${appTheme.typography.size12}px`,
    ["--app-text-13" as string]: `${appTheme.typography.size13}px`,
    ["--app-text-14" as string]: `${appTheme.typography.size14}px`,
    ["--app-text-15" as string]: `${appTheme.typography.size15}px`,
    ["--app-text-16" as string]: `${appTheme.typography.size16}px`,
    ["--app-text-18" as string]: `${appTheme.typography.size18}px`,
    ["--app-text-24" as string]: `${appTheme.typography.size24}px`,
    ["--app-text-26" as string]: `${appTheme.typography.size26}px`,
    ["--app-text-28" as string]: `${appTheme.typography.size28}px`,
    ["--app-space-2" as string]: `${appTheme.spacing.size2}px`,
    ["--app-space-3" as string]: `${appTheme.spacing.size3}px`,
    ["--app-space-4" as string]: `${appTheme.spacing.size4}px`,
    ["--app-space-6" as string]: `${appTheme.spacing.size6}px`,
    ["--app-space-7" as string]: `${appTheme.spacing.size7}px`,
    ["--app-space-8" as string]: `${appTheme.spacing.size8}px`,
    ["--app-space-10" as string]: `${appTheme.spacing.size10}px`,
    ["--app-space-12" as string]: `${appTheme.spacing.size12}px`,
    ["--app-space-14" as string]: `${appTheme.spacing.size14}px`,
    ["--app-space-16" as string]: `${appTheme.spacing.size16}px`,
    ["--app-space-20" as string]: `${appTheme.spacing.size20}px`,
    ["--app-space-32" as string]: `${appTheme.spacing.size32}px`,
    ["--app-space-64" as string]: `${appTheme.spacing.size64}px`,
    ["--app-radius-10" as string]: `${appTheme.radius.size10}px`,
    ["--app-radius-12" as string]: `${appTheme.radius.size12}px`,
    ["--app-radius-18" as string]: `${appTheme.radius.size18}px`,
    ["--app-radius-pill" as string]: `${appTheme.radius.pill}px`,
  };

  return (
    <html
      lang="en"
      className={`${brandSans.variable} ${brandMono.variable} h-full antialiased`}
      data-theme={appTheme.id}
    >
      <body className="min-h-full flex flex-col" style={themeVars}>
        {children}
      </body>
    </html>
  );
}
