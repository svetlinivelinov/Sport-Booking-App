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
    ["--app-surface" as string]: appTheme.colors.surface,
    ["--app-fg" as string]: appTheme.colors.foreground,
    ["--app-muted" as string]: appTheme.colors.muted,
    ["--app-primary" as string]: appTheme.colors.primary,
    ["--app-accent" as string]: appTheme.colors.accent,
    ["--app-danger" as string]: appTheme.colors.danger,
    ["--app-font-sans" as string]: appTheme.fonts.sans,
    ["--app-font-mono" as string]: appTheme.fonts.mono,
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
