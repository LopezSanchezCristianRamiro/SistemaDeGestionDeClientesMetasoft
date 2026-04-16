import { Ionicons } from "@expo/vector-icons";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Href, usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./ThemedText";

interface DrawerItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const DRAWER_ITEMS: DrawerItem[] = [
  { label: "Catálogo", icon: "grid-outline", route: "/catalogo" },
  { label: "Seguimiento", icon: "time-outline", route: "/seguimiento" },
  { label: "Reportes", icon: "stats-chart-outline", route: "/reportes" },
];

const COLORS = {
  magenta: "#b0005d",
  grayIcon: "#6b7280",
};

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const checkActive = (route: string): boolean => {
    if (!pathname) return false;
    const cleanPath = pathname.replace(/\/\([^)]+\)/g, "");
    const isActive = cleanPath === route || cleanPath.startsWith(route + "/");
    console.log(
      `[Drawer] pathname: "${pathname}" -> clean: "${cleanPath}" | route: "${route}" | active: ${isActive}`,
    );
    return isActive;
  };

  const handleNavigation = (route: string) => {
    router.push(route as Href);
    props.navigation.closeDrawer();
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header: Perfil */}
      <View className="flex-row items-center px-5 py-8">
        <View className="w-12 h-12 rounded-2xl items-center justify-center bg-brand-primary">
          <Ionicons name="person-outline" size={26} color="white" />
        </View>
        <View className="ml-4">
          <ThemedText className="text-lg font-bold text-gray-900">
            Juan Perez
          </ThemedText>
          <ThemedText className="text-sm text-gray-500 font-medium">
            Azafata
          </ThemedText>
        </View>
      </View>

      {/* Lista de Navegación */}
      <View className="flex-1 mt-2">
        {DRAWER_ITEMS.map((item) => {
          const isActive = checkActive(item.route);
          return (
            <Pressable
              key={item.label}
              onPress={() => handleNavigation(item.route)}
              accessibilityRole="button"
              className={`flex-row items-center py-4 px-6 ${
                isActive ? "bg-brand-primary" : "bg-transparent"
              }`}
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={isActive ? "#ffffff" : COLORS.grayIcon}
              />
              <ThemedText
                className={`ml-5 text-base ${
                  isActive
                    ? "text-white font-bold"
                    : "text-gray-800 font-medium"
                }`}
              >
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Footer */}
      <View className="p-6">
        <ThemedText className="text-xs text-gray-400 font-medium">
          Versión 1.0.4
        </ThemedText>
      </View>
    </View>
  );
}
