// app/(drawer)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Stack } from "expo-router";
import { Pressable } from "react-native";
import { useResponsive } from "../../hooks/useResponsive";

export default function DrawerGroupLayout() {
  const navigation = useNavigation();
  const { isMobile } = useResponsive();

  return (
    <Stack
      screenOptions={{
        // En móvil: botón hamburguesa; en escritorio: un View vacío (sin flecha)
        headerLeft: () => {
          if (isMobile) {
            return (
              <Pressable
                onPress={() =>
                  navigation.dispatch(DrawerActions.toggleDrawer())
                }
                accessibilityRole="button"
                accessibilityLabel="Abrir menú"
                className="ml-4 w-10 h-10 rounded-full bg-brand-primary items-center justify-center active:opacity-80"
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <Ionicons name="menu-outline" size={24} color="white" />
              </Pressable>
            );
          }
          // Escritorio: retornamos null o un View vacío para que NO aparezca la flecha
          return null;
        },
        gestureEnabled: isMobile,
        headerStyle: { backgroundColor: "#ffffff" },
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
