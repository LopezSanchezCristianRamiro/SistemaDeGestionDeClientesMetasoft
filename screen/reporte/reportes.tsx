import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EstadoBar } from "./components/EstadoBar";
import { InteresChart } from "./components/InteresChart";
import { MetricCard } from "./components/MetricCard";
import { RankingRow } from "./components/RankingRow";
import { SistemasChart } from "./components/SistemasChart";
import { useReportes } from "./hooks/useReporte";

function formatMoney(n: number) {
  return "Bs. " + n.toLocaleString("es-BO");
}

export default function ReportesScreen() {
  const {
    ranking,
    metrics,
    interesProspectos,
    sistemasMasSolicitados,
    loading,
    error,
    refetch,
  } = useReportes();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Reportes</Text>
        <Pressable
          onPress={refetch}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg border border-gray-200"
        >
          <Text className="text-sm text-gray-600">
            {loading ? "Cargando…" : "Actualizar"}
          </Text>
        </Pressable>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#E1007E" />
          <Text className="text-gray-500 mt-3 text-sm">Obteniendo reportes…</Text>
        </View>
      )}

      {!loading && error && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <Pressable onPress={refetch} className="bg-brand-primary px-5 py-2.5 rounded-xl">
            <Text className="text-white font-medium">Reintentar</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row mb-3 -mx-1">
            <MetricCard label="Prospectos" value={metrics.totalProspectos} />
            <MetricCard label="Ganancia potencial" value={formatMoney(metrics.gananciaPotencial)} />
          </View>
          <View className="flex-row mb-5 -mx-1">
            <MetricCard label="Adelantos cobrados" value={formatMoney(metrics.totalAdelantos)} />
            <MetricCard label="Vendedores" value={metrics.totalVendedores} />
          </View>

          <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Estado de seguimientos
            </Text>
            {Object.entries(metrics.estadoCounts).map(([estado, count]) => (
              <EstadoBar
                key={estado}
                estado={estado}
                count={count}
                total={metrics.totalProspectos}
              />
            ))}
            {Object.keys(metrics.estadoCounts).length === 0 && (
              <Text className="text-gray-400 text-sm text-center py-2">Sin datos</Text>
            )}
          </View>

          {interesProspectos && (
            <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Nivel de interés
              </Text>
              <InteresChart data={interesProspectos} />
            </View>
          )}

          <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Sistemas más solicitados
            </Text>
            <SistemasChart sistemas={sistemasMasSolicitados} />
          </View>

          <View className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Ranking de productividad
            </Text>
            {ranking.map((item, i) => (
              <RankingRow key={item.idUsuario} item={item} index={i} />
            ))}
            {ranking.length === 0 && (
              <Text className="text-gray-400 text-sm text-center py-4">Sin datos</Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}