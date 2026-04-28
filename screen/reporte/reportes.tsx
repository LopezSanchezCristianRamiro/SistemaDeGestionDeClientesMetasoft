import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUsuarioData } from "../../storage/storage";
import { CalendarPicker } from "./components/CalendarPicker";
import { ProspectoDetalleModal } from "./components/ProspectoDetalleModal";
import { useReportes } from "./hooks/useReporte";
/* ─── helpers ─── */
function formatMoney(n: number) {
  if (n >= 1000) return "Bs. " + (n / 1000).toFixed(1) + "K";
  return "Bs. " + n.toLocaleString("es-BO");
}
function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function formatDateLabel(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${d} ${meses[parseInt(m) - 1]} ${y}`;
}

/* ─── colores ─── */
const ESTADO_COLORS: Record<string, string> = {
  "En proceso": "#E1007E",
  Cerrado: "#7C3AED",
  Pendiente: "#0EA5E9",
  Ganado: "#10B981",
  Perdido: "#EF4444",
  Cancelado: "#F59E0B",
};
const INTERES_COLORS: Record<string, string> = {
  Alto: "#E1007E",
  Medio: "#7C3AED",
  Bajo: "#CBD5E1",
};
const AVATAR_COLORS = ["#E1007E", "#7C3AED", "#0EA5E9", "#10B981", "#F59E0B"];

function prevMonthLast() {
  const d = new Date(); d.setDate(0);
  return d.toISOString().split("T")[0];
}

export default function ReportesScreen() {
  const [userRol, setUserRol] = useState<string | null>(null);
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  useEffect(() => {
    getUsuarioData().then((data) => {
      if (data?.rol) setUserRol(data.rol);
    });
  }, []);

  const esAdmin = userRol?.toLowerCase() === "admin" || userRol?.toLowerCase() === "administrador";
  const {
    metrics, interesProspectos, sistemasMasSolicitados,
    seguimientos, rankingProductividad,
    loading, error, refetch,
    desde, hasta, setFiltro,
  } = useReportes();
  const [filtroInteres, setFiltroInteres] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null); 
  const [mostrarTodosSeguimientos, setMostrarTodosSeguimientos] = useState(false);
  const [buscarFiltro, setBuscarFiltro] = useState("");
  
  const maxLeads = sistemasMasSolicitados?.[0]?.leads ?? 1;
  const seguimientosFiltrados = seguimientos?.filter((s: any) => {
    const passInteres = filtroInteres ? s.nivelInteres === filtroInteres : true;
    const passEstado  = filtroEstado  ? s.estadoSeguimientoReal === filtroEstado : true;

    const termino = buscarFiltro.trim().toLowerCase();
    if (termino.length === 0) return passInteres && passEstado;

    const nombre  = String(s.nombre  ?? "").toLowerCase();
    const empresa = String(s.empresa ?? "").toLowerCase();
    const celular = String(s.celular ?? "").replace(/\D/g, "");
    const terminoNumeros = termino.replace(/\D/g, "");

    const passBuscar =
      nombre.includes(termino) ||
      empresa.includes(termino) ||
      (terminoNumeros.length > 0 && celular.includes(terminoNumeros));

    return passInteres && passEstado && passBuscar;
  });

  const conteoPorEstado = seguimientos?.reduce((acc: Record<string, number>, s: any) => {
    const estado = s.estadoSeguimientoReal ?? "Sin seguimiento";
    acc[estado] = (acc[estado] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F7FF" }}>

      {/* ── HEADER ── */}
      <View style={{
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F0EEFF",
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#1E0A3C" }}>Reportes</Text>
            <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>Reportes varios del sistema.</Text>
          </View>
          <Pressable
            onPress={refetch}
            disabled={loading}
            style={{
              paddingHorizontal: 14, paddingVertical: 7,
              borderRadius: 20, borderWidth: 1.5, borderColor: "#E1007E",
            }}
          >
            <Text style={{ fontSize: 13, color: "#E1007E", fontWeight: "600" }}>
              {loading ? "..." : "Actualizar"}
            </Text>
          </Pressable>
        </View>

        <CalendarPicker
          desde={desde}
          hasta={hasta}
          onChange={(d, h) => setFiltro(d, h)}
        />
      </View>

      {loading && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#E1007E" />
          <Text style={{ color: "#9CA3AF", marginTop: 12, fontSize: 14 }}>Obteniendo reportes…</Text>
        </View>
      )}

      {/* ── ERROR ── */}
      {!loading && error && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ color: "#EF4444", textAlign: "center", marginBottom: 16 }}>{error}</Text>
          <Pressable onPress={refetch} style={{ backgroundColor: "#E1007E", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {/* ── CONTENIDO ── */}
      {!loading && !error && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* MÉTRICAS TOP — solo admin */}
          {esAdmin && (
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>TOTAL PROSPECTOS</Text>
                <Text style={styles.metricValue}>{metrics?.totalProspectos ?? 0}</Text>
                <Text style={styles.metricSub}>↑ activos este período</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: "#E1007E" }]}>
                <Text style={[styles.metricLabel, { color: "rgba(255,255,255,0.7)" }]}>GANANCIA POTENCIAL</Text>
                <Text style={[styles.metricValue, { color: "#fff" }]}>{formatMoney(metrics?.gananciaPotencial ?? 0)}</Text>
                <Text style={[styles.metricSub, { color: "rgba(255,255,255,0.6)" }]}>Basado en adelantos</Text>
              </View>
            </View>
          )}
          {/* UNA SOLA FILA — Interés + Estado */}
          <View style={styles.sectionCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 10 }}>

                {/* Chips de Interés */}
                {(["Alto", "Medio", "Bajo"] as const).map((nivel, i) => {
                  const isSelected = filtroInteres === nivel;
                  return (
                    <TouchableOpacity
                      key={nivel}
                      onPress={() => {
                        setFiltroInteres(isSelected ? null : nivel);
                        setFiltroEstado(null); // ← limpia el otro
                        setMostrarTodosSeguimientos(false);
                      }}
                      style={[styles.estadoChip, isSelected && { borderColor: INTERES_COLORS[nivel], borderWidth: 2, backgroundColor: "#FDF2F8" }]}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: INTERES_COLORS[nivel], alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{i + 1}</Text>
                        </View>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: INTERES_COLORS[nivel], textTransform: "uppercase" }}>{nivel}</Text>
                        {isSelected && <Text style={{ fontSize: 10, color: INTERES_COLORS[nivel] }}>✓</Text>}
                      </View>
                      <Text style={{ fontSize: 26, fontWeight: "800", color: "#1E0A3C" }}>{interesProspectos?.[nivel] ?? 0}</Text>
                      <Text style={{ fontSize: 11, color: "#9CA3AF" }}>Prospectos</Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Separador visual */}
                <View style={{ width: 1, backgroundColor: "#F3F4F6", marginHorizontal: 4 }} />

                {/* Chips de Estado */}
                {Object.entries(conteoPorEstado ?? {}).map(([estado, count], i) => {
                  const isSelected = filtroEstado === estado;
                  return (
                    <TouchableOpacity
                      key={estado}
                      onPress={() => {
                        setFiltroEstado(isSelected ? null : estado);
                        setFiltroInteres(null); // ← limpia el otro
                        setMostrarTodosSeguimientos(false);
                      }}
                      style={[styles.estadoChip, isSelected && { borderColor: ESTADO_COLORS[estado] ?? "#E1007E", borderWidth: 2, backgroundColor: "#FDF2F8" }]}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: ESTADO_COLORS[estado] ?? "#E1007E", alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{i + 1}</Text>
                        </View>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: ESTADO_COLORS[estado] ?? "#E1007E", textTransform: "uppercase" }}>{estado}</Text>
                        {isSelected && <Text style={{ fontSize: 10, color: ESTADO_COLORS[estado] }}>✓</Text>}
                      </View>
                      <Text style={{ fontSize: 26, fontWeight: "800", color: "#1E0A3C" }}>{count}</Text>
                      <Text style={{ fontSize: 11, color: "#9CA3AF" }}>Prospectos</Text>
                    </TouchableOpacity>
                  );
                })}

              </View>
            </ScrollView>
          </View>
          
          {esAdmin && (
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: buscarFiltro.length > 0 ? "#E1007E" : "#E5E7EB",
              paddingHorizontal: 12,
              paddingVertical: 10,
              gap: 8,
              marginBottom: 14,
            }}>
              <Feather name="search" size={16} color="#9CA3AF" />
              <TextInput
                placeholder="Buscar por nombre, empresa o celular..."
                placeholderTextColor="#CBD5E1"
                value={buscarFiltro}
                onChangeText={(t) => { setBuscarFiltro(t); setMostrarTodosSeguimientos(false); }}
                keyboardType="default"
                underlineColorAndroid="transparent"
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: "#1E0A3C",
                  paddingVertical: 0,
                  borderWidth: 0,
                  outline: "none",
                }}
              />
              {buscarFiltro.length > 0 && (
                <TouchableOpacity
                  onPress={() => setBuscarFiltro("")}
                  style={{
                    backgroundColor: "#F3F4F6",
                    borderRadius: 20,
                    width: 20,
                    height: 20,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "700" }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── TABLA SEGUIMIENTOS ── */}
          <View style={styles.sectionCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Text style={styles.sectionTitle}>Seguimientos</Text>
              <View style={{ backgroundColor: "#F0EEFF", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 11, color: "#7C3AED", fontWeight: "700" }}>{seguimientosFiltrados?.length ?? 0} total{filtroInteres ? ` · ${filtroInteres}` : ""} {filtroEstado ? ` · ${filtroEstado}` : ""}</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ minWidth: 720 }}>

                {/* HEADERS */}
                <View style={{ flexDirection: "row", marginBottom: 8, paddingHorizontal: 4 }}>
                  {[
                    { label: "PROSPECTO",  w: 160 },
                    ...(esAdmin ? [{ label: "CELULAR", w: 110 }] : [{ label: "INTERÉS", w: 90 }]),
                    { label: "SISTEMA",    w: 120 },
                    { label: "ADELANTO",   w: 90  },
                    { label: "AZAFATA",    w: 130 },
                    
                    { label: "ESTADO",     w: 130 },
                  ].map((col) => (
                    <Text key={col.label} style={{ width: col.w, fontSize: 9, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase" }}>
                      {col.label}
                    </Text>
                  ))}
                </View>

                {/* FILAS */}
                {(mostrarTodosSeguimientos ? seguimientosFiltrados : seguimientosFiltrados?.slice(0, 5))?.map((s: any, i: number) => (
                  <TouchableOpacity
                      key={s.id}
                      onPress={() => setIdSeleccionado(s.id)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 10,
                        paddingHorizontal: 4,
                        borderTopWidth: i === 0 ? 0 : 1,
                        borderTopColor: "#F3F4F6",
                      }}
                    >
                    {/* Nombre + empresa */}
                    <View style={{ width: 160, flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{getInitials(s.nombre)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: "#1E0A3C" }} numberOfLines={1}>{s.nombre}</Text>
                        <Text style={{ fontSize: 10, color: "#9CA3AF" }} numberOfLines={1}>{s.empresa}</Text>
                      </View>
                    </View>
                    {esAdmin ? (
                      <View style={{ width: 110 }}>
                        {s.celular && s.celular !== "Sin número" ? (
                          <TouchableOpacity
                            onPress={() => {
                              const numero = s.celular.replace(/\D/g, "");
                              Linking.openURL(`https://wa.me/591${numero}`);
                            }}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 6,
                              backgroundColor: "#E7F9EF",
                              borderRadius: 20,
                              paddingHorizontal: 8,
                              paddingVertical: 5,
                              alignSelf: "flex-start",
                            }}
                          >
                            <FontAwesome name="whatsapp" size={14} color="#25D366" />
                            <Text style={{
                              fontSize: 11,
                              color: "#25D366",
                              fontWeight: "700",
                            }} numberOfLines={1}>
                              {s.celular}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={{ fontSize: 11, color: "#CBD5E1", fontStyle: "italic" }}>—</Text>
                        )}
                      </View>
                    ) : (
                      <View style={{ width: 90 }}>
                        <View style={{
                          backgroundColor: INTERES_COLORS[s.nivelInteres] + "20",
                          borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start",
                        }}>
                          <Text style={{ fontSize: 10, fontWeight: "700", color: INTERES_COLORS[s.nivelInteres] }}>
                            {s.nivelInteres}
                          </Text>
                        </View>
                      </View>
                    )}
                    {/* Sistema */}
                    <View style={{ width: 120 }}>
                      <View style={{ backgroundColor: "#F0EEFF", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start", maxWidth: 115 }}>
                        <Text style={{ fontSize: 10, color: "#7C3AED", fontWeight: "600" }} numberOfLines={1}>{s.sistemaRequerido}</Text>
                      </View>
                    </View>

                    {/* Adelanto */}
                    <Text style={{ width: 90, fontSize: 12, fontWeight: "600", color: s.adelanto > 0 ? "#10B981" : "#9CA3AF" }}>
                      {s.adelanto > 0 ? `Bs. ${s.adelanto.toLocaleString("es-BO")}` : "—"}
                    </Text>

                    {/* Azafata / entregadoPor */}
                    <View style={{ width: 130, flexDirection: "row", alignItems: "center", gap: 6 }}>
                      {s.entregadoPor && s.entregadoPor !== "Sin asignar" ? (
                        <>
                          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#FDF2F8", borderWidth: 1.5, borderColor: "#E1007E", alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontSize: 9, color: "#E1007E", fontWeight: "700" }}>{getInitials(s.entregadoPor)}</Text>
                          </View>
                          <Text style={{ fontSize: 11, color: "#1E0A3C", fontWeight: "600", flex: 1 }} numberOfLines={1}>{s.entregadoPor}</Text>
                        </>
                      ) : (
                        <Text style={{ fontSize: 11, color: "#CBD5E1", fontStyle: "italic" }}>Sin asignar</Text>
                      )}
                    </View>

                    {/* Estado */}
                    <View style={{ width: 130 }}>
                      <View style={{
                        backgroundColor: s.estadoSeguimiento === "Pendiente" ? "#E0F2FE" : s.estadoSeguimiento === "Cerrado" ? "#F3F4F6" : "#FDF2F8",
                        borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start", maxWidth: 125,
                      }}>
                        <Text style={{
                          fontSize: 10, fontWeight: "600",
                          color: s.estadoSeguimiento === "Pendiente" ? "#0EA5E9" : s.estadoSeguimiento === "Cerrado" ? "#6B7280" : "#E1007E",
                        }} numberOfLines={2}>
                          {s.estadoSeguimiento}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* VER MÁS / MENOS */}
            {(seguimientosFiltrados?.length ?? 0) > 5 && (
              <TouchableOpacity
                onPress={() => setMostrarTodosSeguimientos(!mostrarTodosSeguimientos)}
                style={{ marginTop: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#F3F4F6", alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#7C3AED" }}>
                  {mostrarTodosSeguimientos ? "Ver menos" : `Ver más (${(seguimientosFiltrados?.length ?? 0) - 5} más)`}
                </Text>
                <Text style={{ fontSize: 13, color: "#7C3AED" }}>{mostrarTodosSeguimientos ? "▲" : "▼"}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* INTERÉS + SISTEMAS */}
          {esAdmin && (
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <View style={[styles.sectionCard, { flex: 1 }]}>
                <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Interés</Text>
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

              <View style={[styles.sectionCard, { flex: 1 }]}>
                <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Sistema Popular</Text>
                {sistemasMasSolicitados?.slice(0, 4).map((s: any) => (
                  <View key={s.nombre} style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ fontSize: 11, color: "#374151", fontWeight: "500", flex: 1, marginRight: 8 }} numberOfLines={1} ellipsizeMode="tail">{s.nombre}</Text>
                      <Text style={{ fontSize: 11, color: "#E1007E", fontWeight: "700" }}>{s.leads}</Text>
                    </View>
                    <View style={{ height: 5, backgroundColor: "#F3F4F6", borderRadius: 3 }}>
                      <View style={{ height: 5, borderRadius: 3, backgroundColor: "#E1007E", width: `${(s.leads / maxLeads) * 100}%` }} />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
          {/* RANKING */}
          <View style={styles.sectionCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.sectionTitle}>Ranking de Productividad</Text>
                <Text style={{ fontSize: 11, color: "#9CA3AF" }}>Desempeño del período seleccionado</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FDF2F8", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ fontSize: 11, color: "#E1007E" }}>🏅</Text>
                <Text style={{ fontSize: 11, color: "#E1007E", fontWeight: "600" }}>Top 5</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {rankingProductividad?.map((item: any, i: number) => (
                  <View key={item.idUsuario} style={[styles.rankingCard, i === 0 && { borderColor: "#E1007E", borderWidth: 2 }, { overflow: "hidden" }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], alignItems: "center", justifyContent: "center" }}>
                        {i === 0 ? <Text style={{ fontSize: 16 }}>⭐</Text> : <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>{getInitials(item.nombre)}</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: "#1E0A3C" }}>{item.nombre}</Text>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: i === 0 ? "#E1007E" : "#7C3AED" }}>
                          {i === 0 ? "🏆 Chambeador Top " : i === 1 ? "🔥 Chambeador Estelar" : "🚀 Chambeador Creciente"}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", gap: 16 }}>
                      <View>
                        <Text style={{ fontSize: 10, color: "#9CA3AF" }}>Prospectos</Text>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E0A3C" }}>{item.totalProspectos}</Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 10, color: "#9CA3AF" }}>Ventas</Text>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E0A3C" }}>Bs. {item.totalVentas.toLocaleString("es-BO")}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

        </ScrollView>
      )}
      <ProspectoDetalleModal
        idProspecto={idSeleccionado}
        esAdmin={esAdmin}
        onClose={() => setIdSeleccionado(null)}
      />
    </SafeAreaView>
  );
}

/* ── Donut chart simple ── */
function DonutChart({ data }: { data: any }) {
  const total = data?.total ?? 1;
  const alto  = data?.Alto  ?? 0;
  const medio = data?.Medio ?? 0;
  const pctAlto  = alto  / total;
  const SIZE = 100, STROKE = 14;
  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: STROKE, borderColor: "#CBD5E1", position: "absolute" }} />
      <View style={{ width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: STROKE, borderColor: "#7C3AED", borderRightColor: "transparent", borderBottomColor: "transparent", position: "absolute", transform: [{ rotate: `${pctAlto * 360 - 90}deg` }] }} />
      <View style={{ width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: STROKE, borderTopColor: "#E1007E", borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: "transparent", position: "absolute", transform: [{ rotate: "-90deg" }] }} />
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E0A3C" }}>{total >= 1000 ? (total / 1000).toFixed(1) + "K" : total}</Text>
        <Text style={{ fontSize: 9, color: "#9CA3AF", fontWeight: "600" }}>PROSPECTOS</Text>
      </View>
    </View>
  );
}

/* ── Estilos ── */
const styles = {
  metricCard: { flex: 1, backgroundColor: "#fff", borderRadius: 20, padding: 16, shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  metricLabel: { fontSize: 10, fontWeight: "700" as const, color: "#9CA3AF", letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" as const },
  metricValue: { fontSize: 26, fontWeight: "800" as const, color: "#1E0A3C", marginBottom: 4 },
  metricSub:   { fontSize: 11, color: "#10B981", fontWeight: "500" as const },
  sectionCard: { backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: "700" as const, color: "#1E0A3C" },
  estadoChip:  { backgroundColor: "#F8F7FF", borderRadius: 16, padding: 14, minWidth: 120, borderWidth: 1.5, borderColor: "transparent" },
  rankingCard: { backgroundColor: "#F8F7FF", borderRadius: 16, padding: 16, width: 200, borderWidth: 1.5, borderColor: "transparent" },
};