// screen/reporte/reportesScreen.tsx
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useReportes } from "./hooks/useReporte";

function formatMoney(n: number) {
  if (n >= 1000) return "Bs. " + (n / 1000).toFixed(1) + "K";
  return "Bs. " + n.toLocaleString("es-BO");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const ESTADO_COLORS: Record<string, string> = {
  "En proceso": "#E1007E",
  Cerrado: "#7C3AED",
  Pendiente: "#0EA5E9",
  Ganado: "#10B981",
  Perdido: "#EF4444",
};

const INTERES_COLORS: Record<string, string> = {
  Alto: "#E1007E",
  Medio: "#7C3AED",
  Bajo: "#CBD5E1",
};

const AVATAR_COLORS = ["#E1007E", "#7C3AED", "#0EA5E9", "#10B981", "#F59E0B"];

export default function ReportesScreen() {
  const { metrics, interesProspectos, sistemasMasSolicitados, seguimientos, rankingProductividad, loading, error, refetch } =
    useReportes();

  const maxLeads = sistemasMasSolicitados?.[0]?.leads ?? 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F7FF" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#F0EEFF",
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1E0A3C" }}>Reportes</Text>
          <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>Reportes varios del sistema.</Text>
        </View>
        <Pressable
          onPress={refetch}
          disabled={loading}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: "#E1007E",
          }}
        >
          <Text style={{ fontSize: 13, color: "#E1007E", fontWeight: "600" }}>
            {loading ? "..." : "Actualizar"}
          </Text>
        </Pressable>
      </View>

      {loading && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#E1007E" />
          <Text style={{ color: "#9CA3AF", marginTop: 12, fontSize: 14 }}>Obteniendo reportes…</Text>
        </View>
      )}

      {!loading && error && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ color: "#EF4444", textAlign: "center", marginBottom: 16 }}>{error}</Text>
          <Pressable
            onPress={refetch}
            style={{ backgroundColor: "#E1007E", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >

          {/* ── MÉTRICAS TOP ── */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>TOTAL PROSPECTOS</Text>
              <Text style={styles.metricValue}>{metrics?.totalProspectos ?? 0}</Text>
              <Text style={styles.metricSub}>↑ activos este mes</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: "#E1007E" }]}>
              <Text style={[styles.metricLabel, { color: "rgba(255,255,255,0.7)" }]}>GANANCIA POTENCIAL</Text>
              <Text style={[styles.metricValue, { color: "#fff" }]}>
                {formatMoney(metrics?.gananciaPotencial ?? 0)}
              </Text>
              <Text style={[styles.metricSub, { color: "rgba(255,255,255,0.6)" }]}>Basado en los adelantos</Text>
            </View>
          </View>

          {/* ── ESTADO DE SEGUIMIENTOS ── */}
          <View style={styles.sectionCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 14 }}>
              <Text style={styles.sectionTitle}>Estado de Seguimientos</Text>
              <Text style={styles.sectionTitle}>Grado de interés</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {/* Estados */}
                {Object.entries(metrics?.estadoCounts ?? {}).map(([estado, count], i) => (
                  <View
                    key={estado}
                    style={[
                      styles.estadoChip,
                      i === 0 && { borderColor: ESTADO_COLORS[estado] ?? "#E1007E", borderWidth: 2 },
                    ]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: ESTADO_COLORS[estado] ?? "#E1007E",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{i + 1}</Text>
                      </View>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: ESTADO_COLORS[estado] ?? "#E1007E", textTransform: "uppercase" }}>
                        {estado}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 26, fontWeight: "800", color: "#1E0A3C" }}>{count}</Text>
                    <Text style={{ fontSize: 11, color: "#9CA3AF" }}>Prospectos</Text>
                  </View>
                ))}

                {/* Interés */}
                {Object.entries(interesProspectos?.porcentajes ?? {}).map(([nivel, pct], i) => (
                  <View key={nivel} style={styles.estadoChip}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: INTERES_COLORS[nivel] ?? "#CBD5E1",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{i + 1}</Text>
                      </View>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: INTERES_COLORS[nivel] ?? "#9CA3AF", textTransform: "uppercase" }}>
                        {nivel}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 26, fontWeight: "800", color: "#1E0A3C" }}>
                      {interesProspectos?.[nivel as "Alto" | "Medio" | "Bajo"] ?? 0}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#9CA3AF" }}>Prospectos</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ── SEGUIMIENTOS TABLE ── */}
          <View style={styles.sectionCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Text style={styles.sectionTitle}>Seguimiento</Text>
              <Text style={{ fontSize: 13, color: "#E1007E", fontWeight: "600" }}>Ver lista detallada →</Text>
            </View>
            {/* Headers */}
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              {["NOMBRE DE PROSPECTO", "SISTEMA", "ADELANTO", "ESTADO"].map((h) => (
                <Text key={h} style={{ flex: 1, fontSize: 9, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase" }}>
                  {h}
                </Text>
              ))}
            </View>
            {seguimientos?.slice(0, 5).map((s: any, i: number) => (
              <View
                key={s.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: "#F3F4F6",
                }}
              >
                {/* Nombre */}
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                      {getInitials(s.nombre)}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#1E0A3C" }} numberOfLines={1}>
                      {s.nombre}
                    </Text>
                    <Text style={{ fontSize: 10, color: "#9CA3AF" }} numberOfLines={1}>
                      {s.empresa}
                    </Text>
                  </View>
                </View>
                {/* Sistema */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      backgroundColor: "#F0EEFF",
                      borderRadius: 20,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text style={{ fontSize: 10, color: "#7C3AED", fontWeight: "600" }} numberOfLines={1}>
                      {s.sistemaRequerido}
                    </Text>
                  </View>
                </View>
                {/* Adelanto */}
                <Text style={{ flex: 0.8, fontSize: 12, fontWeight: "600", color: "#1E0A3C" }}>
                  Bs. {s.adelanto.toLocaleString("es-BO")}
                </Text>
                {/* Estado */}
                <View style={{ flex: 0.9 }}>
                  <View
                    style={{
                      backgroundColor:
                        s.estadoSeguimiento === "Pendiente"
                          ? "#E0F2FE"
                          : s.estadoSeguimiento === "Cerrado"
                          ? "#F3F4F6"
                          : "#FDF2F8",
                      borderRadius: 20,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color:
                          s.estadoSeguimiento === "Pendiente"
                            ? "#0EA5E9"
                            : s.estadoSeguimiento === "Cerrado"
                            ? "#6B7280"
                            : "#E1007E",
                      }}
                      numberOfLines={1}
                    >
                      {s.estadoSeguimiento}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* ── INTERÉS + SISTEMAS (lado a lado) ── */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            {/* Donut Interés */}
            <View style={[styles.sectionCard, { flex: 1 }]}>
              <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Interés de Prospectos</Text>
              <View style={{ alignItems: "center", marginBottom: 10 }}>
                <DonutChart data={interesProspectos} />
              </View>
              {Object.entries(INTERES_COLORS).map(([nivel, color]) => (
                <View key={nivel} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
                  <Text style={{ fontSize: 11, color: "#6B7280", flex: 1 }}>{nivel}</Text>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#1E0A3C" }}>
                    {interesProspectos?.porcentajes?.[nivel as "Alto" | "Medio" | "Bajo"] ?? 0}%
                  </Text>
                </View>
              ))}
            </View>

            {/* Sistemas */}
            <View style={[styles.sectionCard, { flex: 1 }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={styles.sectionTitle}>Sistema Popular</Text>
                <View style={{ backgroundColor: "#F0EEFF", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 8, fontWeight: "700", color: "#7C3AED" }}>LEAD VOLUME</Text>
                </View>
              </View>
              {sistemasMasSolicitados?.slice(0, 4).map((s: any) => (
                <View key={s.nombre} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={{ fontSize: 11, color: "#374151", fontWeight: "500" }} numberOfLines={1}>
                      {s.nombre}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#E1007E", fontWeight: "700" }}>{s.leads} Leads</Text>
                  </View>
                  <View style={{ height: 5, backgroundColor: "#F3F4F6", borderRadius: 3 }}>
                    <View
                      style={{
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: "#E1007E",
                        width: `${(s.leads / maxLeads) * 100}%`,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ── RANKING ── */}
          <View style={styles.sectionCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <View>
                <Text style={styles.sectionTitle}>Ranking de Productividad (Personal)</Text>
                <Text style={{ fontSize: 11, color: "#9CA3AF" }}>Desempeño mensual de azafatas e impulsadores</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FDF2F8", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ fontSize: 11, color: "#E1007E" }}>🏅</Text>
                <Text style={{ fontSize: 11, color: "#E1007E", fontWeight: "600" }}>Personal Destacado</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {rankingProductividad?.map((item: any, i: number) => (
                  <View
                    key={item.idUsuario}
                    style={[
                      styles.rankingCard,
                      i === 0 && { borderColor: "#E1007E", borderWidth: 2 },
                    ]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {i === 0 ? (
                          <Text style={{ fontSize: 16 }}>⭐</Text>
                        ) : (
                          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                            {getInitials(item.nombre)}
                          </Text>
                        )}
                      </View>
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E0A3C" }}>{item.nombre}</Text>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: i === 0 ? "#E1007E" : "#7C3AED" }}>
                          {i === 0 ? "IMPULSADORA SENIOR" : i === 1 ? "AZAFATA DE MARCA" : "IMPULSADORA"}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", gap: 16 }}>
                      <View>
                        <Text style={{ fontSize: 10, color: "#9CA3AF" }}>Prospectos:</Text>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E0A3C" }}>{item.totalProspectos}</Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 10, color: "#9CA3AF" }}>Ventas:</Text>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E0A3C" }}>
                          Bs. {item.totalVentas.toLocaleString("es-BO")}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Mini Donut Chart (SVG-free, pure RN) ──
function DonutChart({ data }: { data: any }) {
  const total = data?.total ?? 1;
  const alto = data?.Alto ?? 0;
  const medio = data?.Medio ?? 0;

  const pctAlto = alto / total;
  const pctMedio = medio / total;

  const SIZE = 100;
  const STROKE = 14;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;

  const altoLen = pctAlto * CIRC;
  const medioLen = pctMedio * CIRC;
  const bajoLen = CIRC - altoLen - medioLen;

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
      {/* Fake donut using nested rings — RN has no SVG built-in */}
      <View
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          borderWidth: STROKE,
          borderColor: "#CBD5E1",
          position: "absolute",
        }}
      />
      <View
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          borderWidth: STROKE,
          borderColor: "#7C3AED",
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          position: "absolute",
          transform: [{ rotate: `${pctAlto * 360 - 90}deg` }],
        }}
      />
      <View
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          borderWidth: STROKE,
          borderTopColor: "#E1007E",
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          position: "absolute",
          transform: [{ rotate: "-90deg" }],
        }}
      />
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E0A3C" }}>{total >= 1000 ? (total / 1000).toFixed(1) + "K" : total}</Text>
        <Text style={{ fontSize: 9, color: "#9CA3AF", fontWeight: "600" }}>LEADS</Text>
      </View>
    </View>
  );
}

const styles = {
  metricCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase" as const,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: "#1E0A3C",
    marginBottom: 4,
  },
  metricSub: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "500" as const,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#1E0A3C",
  },
  estadoChip: {
    backgroundColor: "#F8F7FF",
    borderRadius: 16,
    padding: 14,
    minWidth: 120,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  rankingCard: {
    backgroundColor: "#F8F7FF",
    borderRadius: 16,
    padding: 16,
    width: 200,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
};