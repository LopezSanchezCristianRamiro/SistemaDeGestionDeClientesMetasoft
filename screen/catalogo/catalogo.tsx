import React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { SistemaCard } from "./components/SistemaCard";
import { useSistemas } from "./hooks/useSistemas";

/**
 * CatalogoScreen: Arquitectura de Layout Fluido Full Responsive.
 * Implementa flexbox puro con el patrón de Elementos Fantasma para
 * prevenir la hiper-expansión (widow stretching) en la última fila,
 * manteniendo la adaptabilidad sin cálculos de JS.
 */
export function CatalogoScreen() {
  const { sistemas, loading, refresh } = useSistemas();

  const handleSelectSistema = (id: number) => {
    console.log(`Sistema seleccionado: ${id}`);
  };

  if (loading && sistemas.length === 0) {
    return (
      <View className="flex-1 min-w-[260px] max-w-[450px] rounded-xl overflow-hidden bg-surface-variant/20 border border-surface-variant/30 aspect-[4/5] mx-1 my-1.5">
        {/* Espacio de la imagen */}
        <View className="flex-1 bg-surface-variant/40" />

        {/* Espacio del texto inferior */}
        <View className="h-14 bg-white/50 px-4 justify-center">
          <View className="h-3 w-3/4 bg-surface-variant/30 rounded-full self-center" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header institucional Metasoft */}
      <View className=" pt-14 pb-5 px-6 border-b border-surface-variant/20">
        <ThemedText className="text-brand-primary font-bold text-3xl tracking-tight">
          Metasoft Bolivia
        </ThemedText>
        <ThemedText className="text-surface-dark/50 font-medium text-base">
          FEXCO 2024 • Event Mode
        </ThemedText>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 10, paddingBottom: 50 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={["#E1007E"]}
            tintColor="#E1007E"
          />
        }
      >
        {sistemas.length > 0 ? (
          <View className="w-full flex-row flex-wrap justify-center gap-1">
            {/* Renderizado de Datos Reales */}
            {sistemas.map((item) => (
              <SistemaCard
                key={item.id}
                sistema={item}
                onPress={handleSelectSistema}
              />
            ))}

            {/* Patrón Phantom Elements:
              Se inyectan 4 vistas invisibles (suficientes para cubrir el ancho de 
              pantallas móviles y tablets estándar). Estas vistas obligan a la última 
              fila de componentes reales a mantener la simetría de las columnas superiores.
            */}
            {Array.from({ length: 4 }).map((_, index) => (
              <View
                key={`phantom-${index}`}
                // Debe compartir exactamente las mismas clases de anchura y margen que SistemaCard
                className="flex-1 min-w-[260px] max-w-[450px] mx-1 pointer-events-none"
                style={{ height: 0, marginVertical: 0, paddingVertical: 0 }}
              />
            ))}
          </View>
        ) : (
          !loading && (
            <View className="mt-20 items-center px-10">
              <ThemedText className="text-surface-dark/40 text-center font-medium italic">
                No se han encontrado registros en el catálogo.
              </ThemedText>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}
