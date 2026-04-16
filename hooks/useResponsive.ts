// hooks/useResponsive.ts
import { Platform, useWindowDimensions } from "react-native";

export const useResponsive = () => {
  const { width } = useWindowDimensions();

  // Breakpoints: móvil < 768, tablet/desktop >= 768
  const isMobileWidth = width < 768;
  const isTabletOrDesktopWidth = width >= 768;

  // Detectar si es nativo (iOS/Android) - ahí siempre queremos móvil
  const isNative = Platform.OS !== "web";

  // Regla final:
  // - Nativo -> móvil siempre
  // - Web con ancho < 768 -> móvil
  // - Web con ancho >= 768 -> drawer permanente (tablet o desktop)
  const isMobile = isNative || (Platform.OS === "web" && isMobileWidth);
  const isPermanentDrawer = Platform.OS === "web" && isTabletOrDesktopWidth;

  return {
    isMobile,
    isPermanentDrawer,
    width,
  };
};
