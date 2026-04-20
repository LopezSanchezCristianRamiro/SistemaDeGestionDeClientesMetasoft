import { Text, View } from "react-native";
import { RankingItem } from "../hooks/useReporte";

function formatMoney(n: number) {
  return "Bs. " + n.toLocaleString("es-BO");
}

interface Props {
  item: RankingItem;
  index: number;
}

export function RankingRow({ item, index }: Props) {
  const isFirst = index === 0;
  return (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <View
        className="w-7 h-7 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: isFirst ? "#E1007E15" : "#f3f4f6" }}
      >
        <Text
          className="text-xs font-semibold"
          style={{ color: isFirst ? "#E1007E" : "#9ca3af" }}
        >
          {index + 1}
        </Text>
      </View>
      <Text className="flex-1 text-sm text-gray-900">{item.nombre}</Text>
      <View className="items-end">
        <Text className="text-xs text-blue-600 font-medium">
          {item.totalProspectos} prospectos
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">
          {formatMoney(item.totalVentas)}
        </Text>
      </View>
    </View>
  );
}