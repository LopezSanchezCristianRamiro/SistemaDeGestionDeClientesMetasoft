import { Platform, useWindowDimensions } from "react-native";

export const useResponsive = () => {
  const { width } = useWindowDimensions();

  const isMobileWidth = width < 768;
  const isTabletOrDesktopWidth = width >= 768;

  const isNative = Platform.OS !== "web";

  const isMobile = isNative || (Platform.OS === "web" && isMobileWidth);
  const isPermanentDrawer = Platform.OS === "web" && isTabletOrDesktopWidth;

  return {
    isMobile,
    isPermanentDrawer,
    width,
  };
};
