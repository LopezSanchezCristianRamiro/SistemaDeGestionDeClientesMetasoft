import { clearStorage, getUsuarioData } from "@/storage/storage";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Href, usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const [usuario, setUsuario] = useState<{
    nombres: string;
    apellido?: string;
    rol: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    getUsuarioData().then((data) => {
      if (!mounted) return;
      if (data) {
        setUsuario({ nombres: data.nombres, apellido: data.apellido, rol: data.rol });
      }
      else setUsuario(null);
    });
    return () => {
      mounted = false;
    };
  }, [pathname]);
  const checkActive = (route: string): boolean => {
    if (!pathname) return false;
    const cleanPath = pathname.replace(/\/\([^)]+\)/g, "");
    return cleanPath === route || cleanPath.startsWith(route + "/");
  };

  const handleNavigation = (route: string) => {
    router.push(route as Href);
    props.navigation.closeDrawer();
  };

  const handleLogout = async () => {
    await clearStorage();
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-5 py-8">
        <View className="w-12 h-12 rounded-2xl items-center justify-center bg-brand-primary">
          <ThemedText className="text-xl font-bold text-white">
            {usuario?.nombres.charAt(0).toUpperCase() ?? "?"}
          </ThemedText>
        </View>
        <View className="ml-4 flex-1 flex-shrink">
          <ThemedText className="text-lg font-bold text-gray-900" numberOfLines={2}>
            {usuario ? `${usuario.nombres} ${usuario.apellido ?? ""}`.trim() : "—"}
          </ThemedText>
          <ThemedText className="text-sm text-gray-500 font-medium" numberOfLines={1}>
            {usuario?.rol ?? "—"}
          </ThemedText>
        </View>
      </View>

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
                  isActive ? "text-white font-bold" : "text-gray-800 font-medium"
                }`}
              >
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View className="p-6 gap-3">
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center gap-3"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <ThemedText className="text-sm font-semibold text-red-500">
            Cerrar sesión
          </ThemedText>
        </Pressable>
        <ThemedText className="text-xs text-gray-400 font-medium">
          Versión 1.0.4
        </ThemedText>
      </View>
    </View>
  );
}