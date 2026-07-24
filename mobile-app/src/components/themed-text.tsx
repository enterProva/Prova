import { Platform, StyleSheet, Text, type TextProps } from "react-native";

import { Fonts, ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ThemedTextProps = TextProps & {
  type?:
    | "default"
    | "title"
    | "small"
    | "smallBold"
    | "subtitle"
    | "link"
    | "linkPrimary"
    | "code";
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  type = "default",
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        {
          color: theme[themeColor ?? "text"],
        },

       
        styles.default,

        
        type === "title" && styles.title,
        type === "subtitle" && styles.subtitle,
        type === "small" && styles.small,
        type === "smallBold" && styles.smallBold,
        type === "link" && styles.link,
        type === "linkPrimary" && styles.linkPrimary,
        type === "code" && styles.code,

        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({

  default: {
    fontFamily: Fonts.text,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },

  title: {
    fontFamily: Fonts.qalisso,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "400",
    letterSpacing: 0.5,
  },

 
  subtitle: {
    fontFamily: Fonts.text,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

 
  small: {
    fontFamily: Fonts.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },

  smallBold: {
    fontFamily: Fonts.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },

  
  link: {
    fontFamily: Fonts.text,
    fontSize: 14,
    lineHeight: 30,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  linkPrimary: {
    fontFamily: Fonts.text,
    fontSize: 14,
    lineHeight: 30,
    fontWeight: "700",
  },

  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    fontWeight:
      Platform.select({
        android: "700",
        ios: "700",
        web: "700",
      }) ?? "500",
  },
});