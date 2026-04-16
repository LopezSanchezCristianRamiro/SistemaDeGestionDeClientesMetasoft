/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screen/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Colores Primarios y de Marca
        brand: {
          primary: "#E1007E", // Rosa vibrante principal (Metasoft)
          dark: "#B40064", // Rosa oscuro para estados hover/active
          light: "#FDF8FD", // Fondo rosado muy sutil para capas tonales
        },
        // Escala de Grises y Fondos
        surface: {
          DEFAULT: "#F7F2F8", // Fondo general de la aplicación
          container: "#FFFFFF", // Fondo de tarjetas y contenedores blancos
          variant: "#EBE7EC", // Gris claro para campos de entrada y separadores
          dark: "#1C1B1F", // Gris casi negro para textos principales y modo oscuro
        },
        // Colores de Estado (Semánticos)
        status: {
          success: "#14C270", // Verde para estados positivos/completados
          pending: "#F9A825", // Ámbar para estados en espera
          error: "#FF5252", // Rojo para errores o alertas
          info: "#2196F3", // Azul para información neutral
        },
        // Colores de Interés (Basados en el diseño)
        interest: {
          high: "#E1007E", // Alto: Rosa principal
          medium: "#FFB800", // Medio: Naranja/Oro
          low: "#9E9E9E", // Bajo: Gris
        },
      },
      fontFamily: {
        sans: ["Manrope_400Regular"], // Texto base
        medium: ["Manrope_500Medium"], // font-medium
        semibold: ["Manrope_600SemiBold"], // font-semibold
        bold: ["Manrope_700Bold"], // font-bold
        extrabold: ["Manrope_800ExtraBold"], // font-extrabold
      },
      borderRadius: {
        // Sistema de redondeo
        xl: "24px", // Para tarjetas principales y modales
        lg: "16px", // Para botones y campos de entrada
      },
      boxShadow: {
        // Elevaciones del sistema
        soft: "0 20px 40px rgba(28, 27, 31, 0.06)",
        card: "0 4px 12px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
