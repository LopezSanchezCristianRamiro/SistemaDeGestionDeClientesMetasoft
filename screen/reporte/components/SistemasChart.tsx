import { ScrollView, Text, View } from "react-native";
import { SistemaItem } from "../hooks/useReporte";

interface Props {
  sistemas: SistemaItem[];
}

export function SistemasChart({ sistemas }: Props) {
  if (sistemas.length === 0) return null;
  const maxLeads = Math.max(...sistemas.map((s) => s.leads), 1);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row items-end" style={{ height: 120, gap: 8 }}>
        {sistemas.map((s, i) => {
          const h = Math.max((s.leads / maxLeads) * 100, 8);
          return (
            <View key={i} className="items-center" style={{ width: 56 }}>
              <Text className="text-xs text-gray-500 mb-1">{s.leads}</Text>
              <View
                style={{
                  width: 36,
                  height: h,
                  backgroundColor: "#85B7EB",
                  borderRadius: 4,
                }}
              />
              <Text
                className="text-xs text-gray-400 mt-1"
                numberOfLines={2}
                style={{ width: 56, textAlign: "center" }}
              >
                {s.nombre}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}