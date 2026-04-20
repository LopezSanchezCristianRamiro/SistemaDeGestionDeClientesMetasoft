import { Text, View } from "react-native";

const ESTADO_COLORS: Record<string, string> = {
  Pendiente: "#FAC775",
  Completado: "#97C459",
  Vendido: "#5DCAA5",
  Cancelado: "#F09595",
  "En proceso": "#85B7EB",
};

function estadoColor(e: string) {
  return ESTADO_COLORS[e] ?? "#B4B2A9";
}

interface Props {
  estado: string;
  count: number;
  total: number;
}

export function EstadoBar({ estado, count, total }: Props) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className="text-sm text-gray-700">{estado}</Text>
        <Text className="text-sm font-medium text-gray-900">
          {count} ({Math.round(pct)}%)
        </Text>
      </View>
      <View className="w-full bg-gray-100 rounded-full h-2">
        <View
          style={{
            width: `${pct}%`,
            backgroundColor: estadoColor(estado),
            height: 8,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
}