import { Ionicons } from "@expo/vector-icons";
import { Href, Stack, usePathname, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "../../components/ThemedText";
import { useResponsive } from "../../hooks/useResponsive";

// Rutas literales para evitar problemas de tipado en la key
const TAB_ITEMS = [
  { label: "Catálogo", route: "/catalogo", icon: "grid-outline" } as const,
  {
    label: "Seguimiento",
    route: "/seguimiento",
    icon: "time-outline",
  } as const,
  {
    label: "Reportes",
    route: "/reportes",
    icon: "stats-chart-outline",
  } as const,
];

export default function DrawerGroupLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDesktop } = useResponsive();
  const insets = useSafeAreaInsets();

  const BottomTabs = () => {
    const activeRoute = TAB_ITEMS.find(
      (item) =>
        pathname === item.route || pathname.startsWith(item.route + "/"),
    );

    return (
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-surface-variant/20"
        style={{ paddingBottom: insets.bottom }}
      >
        <View className="flex-row justify-around items-end h-16">
          {TAB_ITEMS.map((item) => {
            const isActive = activeRoute?.route === item.route;
            return (
              <Pressable
                key={item.route}
                onPress={() => router.push(item.route as Href)}
                className="flex-1 items-center justify-center h-full"
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={item.label}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={isActive ? "#E1007E" : "#9E9E9E"}
                />
                <ThemedText
                  className={`text-xs font-medium mt-0.5 ${
                    isActive ? "text-brand-primary" : "text-surface-dark/50"
                  }`}
                >
                  {item.label}
                </ThemedText>
                {isActive && (
                  <View className="absolute -top-0.5 left-0 right-0 h-0.5 bg-brand-primary rounded-full" />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingBottom: !isDesktop ? 64 : 0 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            gestureEnabled: !isDesktop,
          }}
        >
          <Stack.Screen name="catalogo" />
          <Stack.Screen name="seguimiento" />
          <Stack.Screen name="reportes" />
        </Stack>
      </View>
      {!isDesktop && <BottomTabs />}
    </View>
  );
}
