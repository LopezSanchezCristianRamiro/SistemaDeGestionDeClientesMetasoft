import { View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

type Variant = "light" | "lavender" | "magenta";

interface Props {
  title: string;
  value: string | number;
  suffix?: string;
  variant?: Variant;
}

const styles = {
  light: {
    bg: "#f2eef3",
    title: "#d10a78",
    value: "#17141f",
    suffix: "#d10a78",
  },
  lavender: {
    bg: "#e9e6fb",
    title: "#4b56b9",
    value: "#4b56b9",
    suffix: "#4b56b9",
  },
  magenta: {
    bg: "#d10a78",
    title: "#ffffff",
    value: "#ffffff",
    suffix: "#ffd6eb",
  },
};

export default function MetricCard({
  title,
  value,
  suffix,
  variant = "light",
}: Props) {
  const s = styles[variant];

  return (
    <View
      className="flex-1 rounded-[22px] p-5"
      style={{ backgroundColor: s.bg, minHeight: 128 }}
    >
      <ThemedText
        className="text-[11px] font-extrabold uppercase tracking-[1.2px]"
        style={{ color: s.title }}
      >
        {title}
      </ThemedText>

      <View className="mt-5 flex-row items-end">
        <ThemedText
          className="text-[52px] leading-[56px] font-extrabold"
          style={{ color: s.value }}
        >
          {value}
        </ThemedText>

        {!!suffix && (
          <ThemedText
            className="mb-2 ml-2 text-sm font-bold"
            style={{ color: s.suffix }}
          >
            {suffix}
          </ThemedText>
        )}
      </View>
    </View>
  );
}