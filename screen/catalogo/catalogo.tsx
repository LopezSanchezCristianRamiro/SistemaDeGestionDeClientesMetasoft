import { ThemedText } from "@/components/ThemedText";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CatalogoScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6">
        {/* ===== HEADLINE PRINCIPAL ===== */}
        <ThemedText className="text-4xl font-extrabold text-gray-900 mb-1">
          Catálogo
        </ThemedText>
        <ThemedText className="text-base text-gray-500 mb-8">
          Explora nuestra colección
        </ThemedText>

        {/* ===== SECCIÓN: PESOS TIPOGRÁFICOS ===== */}
        <View className="mb-8">
          <ThemedText className="text-xl font-bold text-gray-800 mb-4">
            Pesos tipográficos
          </ThemedText>

          <View className="space-y-3">
            <View>
              <ThemedText className="text-xs text-gray-400 mb-1">
                Regular (400)
              </ThemedText>
              <ThemedText className="text-base">
                El zorro marrón rápido salta sobre el perro perezoso.
              </ThemedText>
            </View>

            <View>
              <ThemedText className="text-xs text-gray-400 mb-1">
                Medium (500)
              </ThemedText>
              <ThemedText className="text-base font-medium">
                El zorro marrón rápido salta sobre el perro perezoso.
              </ThemedText>
            </View>

            <View>
              <ThemedText className="text-xs text-gray-400 mb-1">
                SemiBold (600)
              </ThemedText>
              <ThemedText className="text-base font-semibold">
                El zorro marrón rápido salta sobre el perro perezoso.
              </ThemedText>
            </View>

            <View>
              <ThemedText className="text-xs text-gray-400 mb-1">
                Bold (700)
              </ThemedText>
              <ThemedText className="text-base font-bold">
                El zorro marrón rápido salta sobre el perro perezoso.
              </ThemedText>
            </View>

            <View>
              <ThemedText className="text-xs text-gray-400 mb-1">
                ExtraBold (800)
              </ThemedText>
              <ThemedText className="text-base font-extrabold">
                El zorro marrón rápido salta sobre el perro perezoso.
              </ThemedText>
            </View>
          </View>
        </View>

        {/* ===== SECCIÓN: TAMAÑOS ===== */}
        <View className="mb-8">
          <ThemedText className="text-xl font-bold text-gray-800 mb-4">
            Escala de tamaños
          </ThemedText>

          <View className="space-y-2">
            <ThemedText className="text-xs">text-xs · 12px</ThemedText>
            <ThemedText className="text-sm">text-sm · 14px</ThemedText>
            <ThemedText className="text-base">text-base · 16px</ThemedText>
            <ThemedText className="text-lg">text-lg · 18px</ThemedText>
            <ThemedText className="text-xl">text-xl · 20px</ThemedText>
            <ThemedText className="text-2xl">text-2xl · 24px</ThemedText>
            <ThemedText className="text-3xl">text-3xl · 30px</ThemedText>
            <ThemedText className="text-4xl">text-4xl · 36px</ThemedText>
          </View>
        </View>

        {/* ===== SECCIÓN: COMBINACIONES AVANZADAS ===== */}
        <View className="mb-8">
          <ThemedText className="text-xl font-bold text-gray-800 mb-4">
            Estilos combinados
          </ThemedText>

          {/* Tracking (letter-spacing) */}
          <View className="mb-3">
            <ThemedText className="text-xs text-gray-400 mb-1">
              Tracking ajustado
            </ThemedText>
            <ThemedText className="text-lg font-semibold tracking-tight text-brand-primary">
              METASOFT
            </ThemedText>
            <ThemedText className="text-sm tracking-wide text-gray-600">
              tracking-wide · espaciado amplio
            </ThemedText>
          </View>

          {/* Color + Peso */}
          <View className="mb-3">
            <ThemedText className="text-base font-bold text-brand-primary">
              Oferta especial
            </ThemedText>
            <ThemedText className="text-sm text-status-success font-medium">
              ✓ Disponible en stock
            </ThemedText>
          </View>

          {/* Mayúsculas / Capitalize */}
          <View className="mb-3">
            <ThemedText className="text-sm uppercase tracking-wider text-gray-500">
              categoría destacada
            </ThemedText>
            <ThemedText className="text-base capitalize text-gray-800">
              diseño de interiores
            </ThemedText>
          </View>
        </View>

        {/* ===== EJEMPLO DE TARJETA DE PRODUCTO ===== */}
        <View className="bg-surface-container p-5 rounded-xl mb-6 shadow-card">
          <ThemedText className="text-xs uppercase tracking-wider text-brand-primary mb-1">
            Nuevo
          </ThemedText>
          <ThemedText className="text-2xl font-bold text-gray-900 mb-1">
            Sistema POS
          </ThemedText>
          <ThemedText className="text-base text-gray-600 mb-3">
            Solución completa para punto de venta con inventario integrado.
          </ThemedText>
          <View className="flex-row justify-between items-end">
            <ThemedText className="text-3xl font-extrabold text-gray-900">
              $299
            </ThemedText>
            <ThemedText className="text-sm font-medium text-status-success">
              Envío gratis
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
