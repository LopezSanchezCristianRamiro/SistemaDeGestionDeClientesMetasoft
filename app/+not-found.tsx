import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-xl font-bold text-gray-900">
          Esta pantalla no existe.
        </Text>
        <Link href="/catalogo">
          <Text className="text-blue-600 mt-4 py-4">Ir a Catálogo</Text>
        </Link>
      </View>
    </>
  );
}
