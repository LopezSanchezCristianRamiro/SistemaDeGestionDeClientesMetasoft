import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { ThemedText } from "../../components/ThemedText";
import MetricCard from "./components/MetricCard";
import ProspectoRow from "./components/ProspectoRow";
import SeguimientoDetalleModal from "./components/SeguimientoDetalleModal";
import { useSeguimiento } from "./hooks/useSeguimiento";

type FilterType = "Todos" | "Pendientes" | "Contactados";

export default function SeguimientoScreen() {
  const { data, loading, error } = useSeguimiento();
  const [filter, setFilter] = useState<FilterType>("Todos");
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [prospectoSeleccionado, setProspectoSeleccionado] = useState<any>(null);

  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  const prospectos = data?.prospectos ?? [];

  const filteredProspectos =
    filter === "Pendientes"
      ? prospectos.filter((x: any) =>
          (x.estado || "").toUpperCase().includes("PENDIENTE"),
        )
      : filter === "Contactados"
        ? prospectos.filter((x: any) => {
            const estado = (x.estado || "").toUpperCase();
            return estado.includes("CONTACT") || estado.includes("CITA");
          })
        : prospectos;
const handleGuardarPaso = async (payload: {
  idProspecto: number;
  descripcionPaso: string;
  resultadoPaso: string;
  fechaPaso: string;
  tipoActividad?: string;
}) => {
  const response = await fetch("http://localhost:8000/api/pasos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      idProspecto: payload.idProspecto,
      descripcionPaso: payload.descripcionPaso,
      resultadoPaso: payload.resultadoPaso,
      fechaPaso: payload.fechaPaso,
    }),
  });

  const raw = await response.text();
  console.log("STATUS:", response.status);
  console.log("RESPUESTA PASOS:", raw);

  if (!response.ok) {
    throw new Error(`No se pudo guardar el paso. ${raw}`);
  }

  const data = JSON.parse(raw);

  setProspectoSeleccionado((prev: any) => {
    if (!prev) return prev;

    const nuevoPaso = {
      id: data?.paso?.idPaso ?? Date.now(),
      titulo: payload.descripcionPaso || payload.tipoActividad || "Paso",
      fecha: payload.fechaPaso,
      resultado: payload.resultadoPaso,
      tipo:
        payload.tipoActividad?.toLowerCase() === "llamada"
          ? "llamada"
          : payload.tipoActividad?.toLowerCase() === "visita"
            ? "visita"
            : payload.tipoActividad?.toLowerCase() === "email"
              ? "documento"
              : "otro",
    };

    return {
      ...prev,
      proximoPaso: payload.descripcionPaso || prev.proximoPaso,
      historialPasos: [nuevoPaso, ...(prev.historialPasos || [])],
    };
  });
};
   const handleOpenDetalle = (item: any) => {
    const detalle = {
      ...item,
      correo:
        item.correo ||
        item.email ||
        item.correoElectronico ||
        "cliente@correo.com",
      telefono: item.telefono || item.celular || item.numeroTelefono || "",
      fechaInicio:
        item.fechaInicio ||
        item.fechaRegistro ||
        item.fechaCreacion ||
        "12 May",
      proximoPaso:
        item.siguientePaso ||
        item.proximoPaso ||
        "Enviar contrato al correo",
      historialPasos: item.historialPasos || item.pasos || [],
    };


    setProspectoSeleccionado(detalle);
    setDetalleVisible(true);
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "#f7f4f8" }}
      >
        <ActivityIndicator size="large" color="#d10a78" />
        <ThemedText className="mt-3 text-sm text-[#746d78]">
          Cargando seguimiento...
        </ThemedText>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: "#f7f4f8" }}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 14 : 20,
          paddingTop: isMobile ? 14 : 20,
          paddingBottom: 36,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 1400,
            alignSelf: "center",
          }}
        >
          <View
            className={isMobile ? "gap-4" : "gap-6"}
            style={{
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "flex-start",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flex: 1,
                maxWidth: isMobile ? "100%" : 520,
              }}
            >
              <ThemedText
                className="font-extrabold text-[#201b24]"
                style={{
                  fontSize: isMobile ? 34 : isTablet ? 46 : 58,
                  lineHeight: isMobile ? 38 : isTablet ? 48 : 58,
                }}
              >
                Historial de{"\n"}Seguimiento
              </ThemedText>

              <ThemedText
                className="text-[#726b77]"
                style={{
                  marginTop: 16,
                  fontSize: isMobile ? 14 : 15,
                  lineHeight: isMobile ? 22 : 28,
                }}
              >
                Gestiona los prospectos capturados y supervisa el embudo
                comercial desde una sola vista.
              </ThemedText>
            </View>

            <View
              style={{
                width: isMobile ? "100%" : isTablet ? 280 : 300,
                alignSelf: isMobile ? "stretch" : "auto",
              }}
            >
              <View
                className="rounded-2xl p-1"
                style={{
                  backgroundColor: "#f0eaef",
                  flexDirection: "row",
                }}
              >
                {(["Todos", "Pendientes", "Contactados"] as FilterType[]).map(
                  (item) => {
                    const active = filter === item;

                    return (
                      <Pressable
                        key={item}
                        onPress={() => setFilter(item)}
                        style={{
                          flex: 1,
                          borderRadius: 14,
                          paddingHorizontal: isMobile ? 8 : 12,
                          paddingVertical: 12,
                          backgroundColor: active ? "#f8ddeb" : "transparent",
                        }}
                      >
                        <ThemedText
                          className="text-center font-bold"
                          style={{
                            fontSize: isMobile ? 11 : 12,
                            color: active ? "#d10a78" : "#6f6875",
                          }}
                          numberOfLines={1}
                        >
                          {item}
                        </ThemedText>
                      </Pressable>
                    );
                  },
                )}
              </View>

              <Pressable
                className="mt-4 rounded-2xl"
                style={{
                  backgroundColor: "#ece6eb",
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  alignSelf: isMobile ? "stretch" : "flex-end",
                }}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="options-outline" size={14} color="#5f5863" />
                  <ThemedText className="ml-2 text-[12px] font-bold text-[#5f5863]">
                    Filtros Avanzados
                  </ThemedText>
                </View>
              </Pressable>
            </View>
          </View>

          {!!error && (
            <View
              className="mt-5 rounded-2xl px-4 py-3"
              style={{ backgroundColor: "#ffe3e3" }}
            >
              <ThemedText className="text-sm font-medium text-red-700">
                {error}
              </ThemedText>
            </View>
          )}

          <View
            className="mt-8"
            style={{
              flexDirection: isMobile ? "column" : "row",
              gap: 16,
            }}
          >
            <View style={{ flex: 1 }}>
              <MetricCard
                title="Total Prospectos"
                value={data?.totalProspectos ?? 0}
                suffix="+12%"
                variant="light"
              />
            </View>

            <View style={{ flex: 1 }}>
              <MetricCard
                title="Conversión"
                value={`${data?.conversion ?? 0}%`}
                suffix="↗↗"
                variant="lavender"
              />
            </View>

            <View style={{ flex: 1 }}>
              <MetricCard
                title="Altamente Interesados"
                value={data?.altamenteInteresados ?? 0}
                suffix="☆"
                variant="magenta"
              />
            </View>
          </View>

          <View className="mt-10">
            {!isMobile && (
              <View className="mb-4 flex-row items-center px-4">
                <View style={{ width: "33%" }}>
                  <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
                    Prospecto & Empresa
                  </ThemedText>
                </View>

                <View style={{ width: "11%" }}>
                  <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
                    Interés
                  </ThemedText>
                </View>

                <View style={{ width: "16%" }}>
                  <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
                    Estado
                  </ThemedText>
                </View>

                <View style={{ width: "12%" }}>
                  <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
                    Anticipo
                  </ThemedText>
                </View>

                <View style={{ width: "18%" }}>
                  <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
                    Próximo Paso
                  </ThemedText>
                </View>

                <View style={{ width: "10%" }}>
                  <ThemedText className="text-right text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
                    Acciones
                  </ThemedText>
                </View>
              </View>
            )}

            {filteredProspectos.length === 0 ? (
              <View
                className="items-center rounded-[18px] px-6 py-12"
                style={{
                  backgroundColor: "#ffffff",
                  borderWidth: 1,
                  borderColor: "#eee6ee",
                }}
              >
                <ThemedText className="text-base font-bold text-[#322d36] text-center">
                  No hay prospectos para mostrar
                </ThemedText>
              </View>
            ) : (
              filteredProspectos.map((item: any) => (
                <ProspectoRow
                  key={item.id}
                  item={item}
                  onPressDetalle={handleOpenDetalle}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <SeguimientoDetalleModal
  visible={detalleVisible}
  onClose={() => setDetalleVisible(false)}
  prospecto={prospectoSeleccionado}
  onGuardarPaso={handleGuardarPaso}
/>
    </>
  );
}