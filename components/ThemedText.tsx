import { Text, type TextProps } from "react-native";

/**
 * Componente de texto base que aplica automáticamente la fuente 'sans'.
 * Úsalo en lugar de <Text> en toda la app.
 */
export function ThemedText(props: TextProps) {
  const { className, ...rest } = props;
  return <Text {...rest} className={`font-sans ${className || ""}`} />;
}
