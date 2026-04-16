import { DrawerToggleButton } from "@react-navigation/drawer";
import { Stack } from "expo-router";

export default function DrawerGroupLayout() {
  return (
    <Stack
      screenOptions={{
        // Muestra el botón de menú (☰) en la esquina izquierda
        headerLeft: () => <DrawerToggleButton tintColor="#2563eb" />,
        // Asegura que el gesto de deslizar para abrir el drawer funcione
        gestureEnabled: true,
        // Estilo opcional para el header
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#111827",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen name="catalogo" options={{ title: "Catálogo" }} />
      <Stack.Screen name="seguimiento" options={{ title: "Seguimiento" }} />
      <Stack.Screen name="reportes" options={{ title: "Reportes" }} />
    </Stack>
  );
}
