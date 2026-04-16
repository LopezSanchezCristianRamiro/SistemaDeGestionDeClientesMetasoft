import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Stack } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "../../hooks/useResponsive";

export default function DrawerGroupLayout() {
  const navigation = useNavigation();
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();

  const CustomHeader = () => {
    if (!isMobile) return null;

    return (
      <View style={{ paddingTop: insets.top }} className="bg-surface">
        <View className="h-14 flex-row items-center px-4">
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            accessibilityRole="button"
            accessibilityLabel="Abrir menú"
            className="w-12 h-12 rounded-full bg-brand-primary items-center justify-center active:opacity-80"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <Ionicons name="menu-outline" size={24} color="white" />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <Stack
      screenOptions={{
        headerShown: isMobile,
        header: () => <CustomHeader />,
        gestureEnabled: isMobile,
        headerShadowVisible: false,
        headerTitle: "",
        headerTintColor: "#111827",
      }}
    >
      <Stack.Screen name="catalogo" />
      <Stack.Screen name="seguimiento" />
      <Stack.Screen name="reportes" />
    </Stack>
  );
}
