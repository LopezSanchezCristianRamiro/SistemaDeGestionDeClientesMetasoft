import { Text, View } from "react-native";

interface Props {
  label: string;
  value: string | number;
}

export function MetricCard({ label, value }: Props) {
  return (
    <View className="flex-1 bg-surface-variant/20 rounded-xl p-4 mx-1">
      <Text className="text-xs text-surface-dark/50 mb-1">{label}</Text>
      <Text className="text-xl font-semibold text-gray-900" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}