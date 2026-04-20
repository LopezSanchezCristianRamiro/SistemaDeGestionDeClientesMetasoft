import { Text, View } from "react-native";
import { InteresProspectos } from "../hooks/useReporte";

const INTERES_COLORS = {
  Alto: "#5DCAA5",
  Medio: "#FAC775",
  Bajo: "#F09595",
};

interface Props {
  data: InteresProspectos;
}

export function InteresChart({ data }: Props) {
  const niveles = (["Alto", "Medio", "Bajo"] as const).filter(
    (k) => data[k] > 0
  );
  return (
    <View>
      {niveles.map((nivel) => {
        const pct = data.porcentajes[nivel];
        return (
          <View key={nivel} className="mb-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-700">{nivel}</Text>
              <Text className="text-sm font-medium text-gray-900">
                {data[nivel]} ({pct}%)
              </Text>
            </View>
            <View className="w-full bg-gray-100 rounded-full h-2">
              <View
                style={{
                  width: `${pct}%`,
                  backgroundColor: INTERES_COLORS[nivel],
                  height: 8,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}