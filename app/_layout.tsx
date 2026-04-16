// app/_layout.tsx
import { Drawer } from "expo-router/drawer";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CustomDrawerContent } from "../components/CustomDrawerContent";
import { useAppFonts } from "../constants/fonts";
import "../global.css";
import { useResponsive } from "../hooks/useResponsive";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  const { isPermanentDrawer, isMobile } = useResponsive();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerType: isPermanentDrawer ? "permanent" : "front",
            drawerStyle: {
              width: 280,
              // En modo permanente, quitamos sombra y borde
              ...(isPermanentDrawer && {
                shadowOpacity: 0,
                borderRightWidth: 0,
              }),
            },
            // Deshabilitar gesto de deslizar en modo permanente
            swipeEnabled: !isPermanentDrawer,
            // **CLAVE**: Ocultar el header del drawer cuando es permanente
            // (así desaparece la flecha)
            //headerShown: !isPermanentDrawer,
          }}
        >
          <Drawer.Screen
            name="(drawer)"
            options={{
              headerShown: false,
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </View>
  );
}
