// ============================================
// CONFIGURACIÓN CENTRAL DE TIPOGRAFÍAS
// ============================================
// Para cambiar la fuente de toda la app:
// 1. Cambia el valor de ACTIVE_FONT
// 2. Ajusta los mapeos en tailwind.config.js
// ============================================

// Importamos ESTÁTICAMENTE todas las fuentes que podamos usar
import * as manrope from "@expo-google-fonts/manrope";
// import * as inter from '@expo-google-fonts/inter';
// import * as roboto from '@expo-google-fonts/roboto';
// import * as montserrat from '@expo-google-fonts/montserrat';

// Configuración de cada fuente con sus assets y hooks
const fontConfigs = {
  manrope: {
    useFonts: manrope.useFonts,
    assets: {
      Manrope_400Regular: manrope.Manrope_400Regular,
      Manrope_500Medium: manrope.Manrope_500Medium,
      Manrope_600SemiBold: manrope.Manrope_600SemiBold,
      Manrope_700Bold: manrope.Manrope_700Bold,
      Manrope_800ExtraBold: manrope.Manrope_800ExtraBold,
    },
  },
  /*
  inter: {
    useFonts: inter.useFonts,
    assets: {
      Inter_400Regular: inter.Inter_400Regular,
      Inter_500Medium: inter.Inter_500Medium,
      Inter_600SemiBold: inter.Inter_600SemiBold,
      Inter_700Bold: inter.Inter_700Bold,
      Inter_800ExtraBold: inter.Inter_800ExtraBold,
    },
  },
  roboto: {
    useFonts: roboto.useFonts,
    assets: {
      Roboto_400Regular: roboto.Roboto_400Regular,
      Roboto_500Medium: roboto.Roboto_500Medium,
      Roboto_700Bold: roboto.Roboto_700Bold,
      Roboto_900Black: roboto.Roboto_900Black,
    },
  },
  montserrat: {
    useFonts: montserrat.useFonts,
    assets: {
      Montserrat_400Regular: montserrat.Montserrat_400Regular,
      Montserrat_500Medium: montserrat.Montserrat_500Medium,
      Montserrat_600SemiBold: montserrat.Montserrat_600SemiBold,
      Montserrat_700Bold: montserrat.Montserrat_700Bold,
      Montserrat_800ExtraBold: montserrat.Montserrat_800ExtraBold,
    },
  },
  */
} as const;

// Tipo derivado automáticamente de las claves reales de fontConfigs
export type FontFamily = keyof typeof fontConfigs;

// Fuente activa actual (solo puede ser una de las claves existentes)
export const ACTIVE_FONT: FontFamily = "manrope";

// Hook para cargar las fuentes (selecciona según ACTIVE_FONT)
export function useAppFonts() {
  const config = fontConfigs[ACTIVE_FONT];
  return config.useFonts(config.assets);
}
