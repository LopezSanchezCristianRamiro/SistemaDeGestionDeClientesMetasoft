import { Ionicons } from "@expo/vector-icons";
import { Href, Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomDrawerContent } from "../../components/CustomDrawerContent";
import { ThemedText } from "../../components/ThemedText";
import { useResponsive } from "../../hooks/useResponsive";
import { getToken } from "../../storage/storage";

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
  { label: "Perfil", route: "/perfil", icon: "person-outline" } as const,
];

const STUB_DRAWER_PROPS = {
  navigation: { closeDrawer: () => {} },
} as any;

export default function DrawerGroupLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDesktop } = useResponsive();
  const insets = useSafeAreaInsets();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    getToken().then((token) => {
      if (!token) {
        router.replace("/(auth)/login");
      } else {
        setAuthenticated(true);
      }
      setChecking(false);
    });
  }, []);

    if (checking) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#E1007E" />
        </View>
      );
    }
    if (!authenticated) return null;

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

  if (isDesktop) {
    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Sidebar fijo */}
        <View
          style={{
            width: 240,
            borderRightWidth: 1,
            borderRightColor: "#e5e7eb",
          }}
        >
          <CustomDrawerContent {...STUB_DRAWER_PROPS} />
        </View>

        {/* Contenido principal */}
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen name="catalogo" />
            <Stack.Screen name="seguimiento" />
            <Stack.Screen name="reportes" />
            <Stack.Screen name="perfil" />
          </Stack>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingBottom: 64 }}>
        <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
          <Stack.Screen name="catalogo" />
          <Stack.Screen name="seguimiento" />
          <Stack.Screen name="reportes" />
          <Stack.Screen name="perfil" />
        </Stack>
      </View>
      <BottomTabs />
    </View>
  );
}
