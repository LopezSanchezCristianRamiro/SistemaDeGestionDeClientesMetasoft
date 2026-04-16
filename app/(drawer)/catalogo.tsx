import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CatalogoScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Catálogo</Text>
        <Text className="text-lg text-gray-600 text-center">
          Aquí se mostrará la lista de productos o servicios.
        </Text>
      </View>
    </SafeAreaView>
  );
}
