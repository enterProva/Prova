import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#25344F",
    background: "#FFFFFF",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#617891",
    primary: "#D5B893",
    primaryForeground: "#25344F",
    accent: "#F5EBDD",
    accentForeground: "#25344F",
    success: "#10B981",
    successForeground: "#FFFFFF",
    warning: "#F59E0B",
    warningForeground: "#FFFFFF",
    destructive: "#F43F3F",
    destructiveForeground: "#FFFFFF",
    border: "#D5B893",
    input: "#F6FAFB",
  },

  dark: {
    text: "#FFFFFF",
    background: "#25344F",
    backgroundElement: "#314563",
    backgroundSelected: "#3E5270",
    textSecondary: "#617891",
    primary: "#D5B893",
    primaryForeground: "#25344F",
    accent: "#D5B893",
    accentForeground: "#25344F",
    success: "#10B981",
    successForeground: "#FFFFFF",
    warning: "#F59E0B",
    warningForeground: "#FFFFFF",
    destructive: "#F43F3F",
    destructiveForeground: "#FFFFFF",
    border: "#617891",
    input: "#314563",
  },
} as const;


export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;


export const Fonts = {
  qalisso: "Qalisso",
  text: "TextFont",
  mono: Platform.select({
    ios: "ui-monospace",
    android: "monospace",
    web: "var(--font-mono)",
    default: "monospace",
  }),
};


export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;


export const BottomTabInset =
  Platform.select({
    ios: 50,
    android: 80,
  }) ?? 0;


export const MaxContentWidth = 800;