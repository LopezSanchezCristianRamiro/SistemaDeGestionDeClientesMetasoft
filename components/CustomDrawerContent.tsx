import { Ionicons } from "@expo/vector-icons";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Href, usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DrawerItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
}

const DRAWER_ITEMS: DrawerItem[] = [
  { label: "Catálogo", icon: "list", route: "/catalogo" },
  { label: "Seguimiento", icon: "time", route: "/seguimiento" },
  { label: "Reportes", icon: "bar-chart", route: "/reportes" },
];

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (route: Href) => pathname === route;

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header del Sidebar */}
      <View className="px-6 py-8 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Metasoft</Text>
        <Text className="text-sm text-gray-600 mt-1">Gestión de Clientes</Text>
      </View>

      {/* Lista de navegación */}
      <View className="flex-1 px-4 py-6">
        {DRAWER_ITEMS.map((item) => {
          const active = isActive(item.route);
          return (
            <Pressable
              key={String(item.route)}
              onPress={() => {
                router.push(item.route);
                props.navigation.closeDrawer();
              }}
              className={`flex-row items-center px-4 py-3 rounded-xl mb-2 ${
                active ? "bg-blue-50" : ""
              }`}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={active ? "#2563eb" : "#6b7280"}
              />
              <Text
                className={`ml-4 text-base font-medium ${
                  active ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Footer opcional */}
      <View className="px-6 py-4 border-t border-gray-200">
        <Text className="text-xs text-gray-400">v1.0.0 · Metasoft</Text>
      </View>
    </View>
  );
}
