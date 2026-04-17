import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { ProspectoModal } from "./components/ProspectoModal";
import { SistemaCard } from "./components/SistemaCard";
import { useSistemas } from "./hooks/useSistemas";
import { Sistema } from "./types/sistema";

export function CatalogoScreen() {
  const { sistemas, loading, refresh } = useSistemas();
  const [selectedSistema, setSelectedSistema] = React.useState<Sistema | null>(
    null,
  );
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleSelectSistema = (id: number) => {
    const sistema = sistemas.find((s) => s.id === id);
    if (sistema) {
      setSelectedSistema(sistema);
      setModalVisible(true);
    }
  };
  return (
    <View className="flex-1 bg-surface">
      <View className="pt-14 pb-5 px-6 border-b border-surface-variant/20">
        <ThemedText className="text-brand-primary font-bold text-3xl tracking-tight">
          Metasoft Bolivia
        </ThemedText>
        <ThemedText className="text-surface-dark/50 font-medium text-base">
          FEXCO 2026 • Event Mode
        </ThemedText>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 10, paddingBottom: 50 }}
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
            <ActivityIndicator size="large" color="#E1007E" className="mt-20" />
          </View>
        ) : (
          <View className="w-full flex-row flex-wrap justify-center gap-1">
            {sistemas.map((item) => (
              <SistemaCard
                key={item.id}
                sistema={item}
                onPress={handleSelectSistema}
              />
            ))}

            {Array.from({ length: 4 }).map((_, i) => (
              <View
                key={i}
                className="flex-1 min-w-[260px] max-w-[450px] mx-1"
                style={{ height: 0 }}
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
    </View>
  );
}
