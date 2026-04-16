import { Text, type TextProps } from "react-native";

export function ThemedText(props: TextProps) {
  const { className, ...rest } = props;
  return <Text {...rest} className={`font-sans ${className || ""}`} />;
}
