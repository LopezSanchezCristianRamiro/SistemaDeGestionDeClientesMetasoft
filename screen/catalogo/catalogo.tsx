import { Toaster } from "@/components/Toaster";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { useResponsive } from "../../hooks/useResponsive";
import { ProspectoForm } from "./components/ProspectoForm";
import { ProspectoModal } from "./components/ProspectoModal";
import { SistemaCard } from "./components/SistemaCard";
import { SistemaDetalleModal } from "./components/SistemaDetalleModal";
import { useSistemas } from "./hooks/useSistemas";
import { Sistema } from "./types/sistema";

export function CatalogoScreen() {
  const { sistemas, loading, refresh } = useSistemas();
  const { isDesktop } = useResponsive();

  const [selectedSistema, setSelectedSistema] = React.useState<Sistema | null>(
    null,
  );
  const [modalVisible, setModalVisible] = React.useState(false);
  const [detailModalVisible, setDetailModalVisible] = React.useState(false);

  const spinValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  }, [loading]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleManualRefresh = useCallback(async () => {
    await refresh();
    Toast.show({
      type: "success",
      text1: "Catálogo actualizado",
      text2: "Los sistemas se han sincronizado correctamente.",
      visibilityTime: 2000,
    });
  }, [refresh]);

  const handleSelectSistema = useCallback(
    (id: number) => {
      const sistema = sistemas.find((s) => s.id === id);
      if (!sistema) return;
      setSelectedSistema(sistema);
      if (isDesktop) setModalVisible(true);
    },
    [sistemas, isDesktop],
  );

  const handleOpenDetailModal = useCallback(() => {
    if (selectedSistema) setDetailModalVisible(true);
  }, [selectedSistema]);

  const handleFormSuccess = useCallback(() => {
    setSelectedSistema(null);
  }, []);

  if (isDesktop) {
    return (
      <View className="flex-1 bg-surface">
        <DesktopHeader
          loading={loading}
          spin={spin}
          onRefresh={handleManualRefresh}
        />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 4,
            paddingVertical: 10,
            paddingBottom: 50,
          }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor="#E1007E"
            />
          }
        >
          {loading && sistemas.length === 0 ? (
            <View className="items-center">
              <ActivityIndicator
                size="large"
                color="#E1007E"
                className="mt-20"
              />
            </View>
          ) : (
            <View className="w-full flex-row flex-wrap justify-center">
              {sistemas.map((item) => (
                <SistemaCard
                  key={item.id}
                  sistema={item}
                  onPress={handleSelectSistema}
                />
              ))}
              {/* Elementos fantasma para alinear la última fila del flex-wrap */}
              {Array.from({ length: 4 }).map((_, i) => (
                <View
                  key={`phantom-${i}`}
                  style={{ width: 180, marginHorizontal: 6, height: 0 }}
                  pointerEvents="none"
                />
              ))}
            </View>
          )}

          {!loading && sistemas.length === 0 && (
            <View className="mt-20 items-center px-10">
              <ThemedText className="text-surface-dark/40 italic">
                No hay sistemas registrados.
              </ThemedText>
            </View>
          )}
        </ScrollView>

        <ProspectoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          sistema={selectedSistema}
        />
        <Toaster />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header mobile */}
      <View className="pt-14 pb-3 px-4 border-b border-surface-variant/20">
        <ThemedText className="text-brand-primary font-bold text-2xl">
          Metasoft Bolivia
        </ThemedText>
        <ThemedText className="text-surface-dark/50 text-sm">
          FEXCO 2026 • Event Mode
        </ThemedText>
      </View>

      {/* Carrusel de cards */}
      <View className="py-3">
        <View className="flex-row justify-between items-center px-4 mb-2">
          <ThemedText className="text-sm font-semibold text-surface-dark">
            Selecciona un sistema
          </ThemedText>
          <TouchableOpacity
            onPress={handleManualRefresh}
            disabled={loading}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="refresh" size={18} color="#E1007E" />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          style={{ height: 240 }}
        >
          {loading && sistemas.length === 0 ? (
            <View className="w-40 h-40 items-center justify-center">
              <ActivityIndicator color="#E1007E" />
            </View>
          ) : (
            sistemas.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedSistema(item)}
                className="mr-3 rounded-xl overflow-hidden border-2"
                style={
                  selectedSistema?.id === item.id
                    ? styles.cardSelected
                    : styles.cardDefault
                }
              >
                <SistemaCard
                  sistema={item}
                  onPress={() => setSelectedSistema(item)}
                />
              </TouchableOpacity>
            ))
          )}
          {!loading && sistemas.length === 0 && (
            <View className="py-4 px-4">
              <ThemedText className="text-surface-dark/40">
                No hay sistemas
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>

      {/*
       * Indicador del sistema seleccionado + acceso a detalle.
       * Se mantiene fuera de ProspectoForm porque depende del estado
       * de selección de card, que vive en CatalogoScreen.
       */}
      <View className="px-4">
        <TouchableOpacity
          onPress={handleOpenDetailModal}
          disabled={!selectedSistema}
          className="bg-surface-container p-4 rounded-xl border border-surface-variant mb-2 flex-row justify-between items-center"
        >
          <ThemedText
            className="text-surface-dark flex-1 mr-2"
            numberOfLines={1}
          >
            {selectedSistema
              ? `Sistema: ${selectedSistema.nombre}`
              : "Seleccione un sistema de la lista"}
          </ThemedText>
          {selectedSistema && (
            <ThemedText className="text-brand-primary text-xs font-bold">
              VER DETALLES
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {/*
       * Formulario de registro — ahora usa ProspectoForm directamente.
       *
       * Si no hay sistema seleccionado, ProspectoForm no se monta para
       * evitar renders innecesarios. Se muestra un placeholder en su lugar.
       *
       * key={selectedSistema.id} garantiza que el formulario se resetea
       * completamente cuando el usuario cambia de sistema seleccionado.
       */}
      {selectedSistema ? (
        <ProspectoForm
          key={selectedSistema.id}
          sistema={selectedSistema}
          onSuccess={handleFormSuccess}
          showCloseButton={false}
        />
      ) : (
        <MobileFormPlaceholder />
      )}

      <SistemaDetalleModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        sistema={selectedSistema}
      />

      <Toaster />
    </View>
  );
}

interface DesktopHeaderProps {
  loading: boolean;
  spin: Animated.AnimatedInterpolation<string>;
  onRefresh: () => void;
}

function DesktopHeader({ loading, spin, onRefresh }: DesktopHeaderProps) {
  return (
    <View className="flex-row justify-between items-center pt-10 pb-5 px-6 border-b border-surface-variant/20">
      <View>
        <ThemedText className="text-brand-primary font-bold text-3xl tracking-tight">
          Metasoft Bolivia
        </ThemedText>
        <ThemedText className="text-surface-dark/50 font-medium text-base">
          FEXCO 2026 • Event Mode
        </ThemedText>
      </View>
      <TouchableOpacity
        onPress={onRefresh}
        disabled={loading}
        activeOpacity={0.7}
        className="p-3 bg-brand-primary/10 rounded-full"
        accessibilityRole="button"
        accessibilityLabel="Actualizar catálogo"
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="refresh" size={20} color="#E1007E" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Placeholder que se muestra en mobile cuando aún no se seleccionó ningún sistema.
 * Guía al usuario a elegir una card del carrusel antes de ver el formulario.
 */
function MobileFormPlaceholder() {
  return (
    <View className="flex-1 items-center justify-center px-8 pb-16">
      <View className="bg-brand-primary/5 rounded-2xl p-8 items-center border border-brand-primary/10">
        <Ionicons name="hand-left-outline" size={40} color="#E1007E" />
        <ThemedText className="text-surface-dark font-bold text-base mt-4 text-center">
          Selecciona un sistema
        </ThemedText>
        <ThemedText className="text-surface-dark/40 text-sm text-center mt-1">
          Elige una opción del carrusel para ver el formulario de registro
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardSelected: {
    borderColor: "#E1007E",
  },
  cardDefault: {
    borderColor: "transparent",
  },
});
