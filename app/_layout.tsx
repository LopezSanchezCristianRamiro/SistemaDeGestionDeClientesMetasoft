import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CustomDrawerContent } from "../components/CustomDrawerContent";
import "../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          drawerStyle: {
            width: 280,
          },
        }}
      >
        <Drawer.Screen
          name="(drawer)"
          options={{
            headerShown: false, // Ocultamos el header del Drawer para manejarlo dentro del Stack
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
