import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../../components/ThemedText";
import { httpClient } from "../../http/httpClient";

type Interes = "ALTO" | "MEDIO" | "BAJO";
type Estado = "Cita Agendada" | "Pendiente" | "Contactado";

type ProspectoItem = {
  id: number;
  iniciales: string;
  nombre: string;
  empresa: string;
  fecha: string;
  interes: Interes;
  rubro: string;
  estado: Estado | string;
  anticipo: string;
  proximoPaso: string;
};

type SeguimientoResponse = {
  totalProspectos: number;
  conversion: number;
  altamenteInteresados: number;
  prospectos: ProspectoItem[];
};

const tabs = ["Todos", "Pendientes", "Contactados"] as const;
type TabType = (typeof tabs)[number];

function getInterestStyles(interes: string) {
  switch (interes) {
    case "ALTO":
      return {
        text: "text-interest-high",
      };
    case "MEDIO":
      return {
        text: "text-interest-medium",
      };
    default:
      return {
        text: "text-interest-low",
      };
  }
}

function getEstadoStyles(estado: string) {
  switch (estado) {
    case "Cita Agendada":
      return {
        bg: "bg-green-100",
        text: "text-status-success",
      };
    case "Pendiente":
      return {
        bg: "bg-yellow-100",
        text: "text-status-pending",
      };
    case "Contactado":
      return {
        bg: "bg-blue-100",
        text: "text-status-info",
      };
    default:
      return {
        bg: "bg-surface-variant",
        text: "text-surface-dark",
      };
  }
}

function getAvatarStyles(interes: string) {
  switch (interes) {
    case "ALTO":
      return {
        bg: "bg-brand-light",
        text: "text-brand-primary",
      };
    case "MEDIO":
      return {
        bg: "bg-indigo-100",
        text: "text-indigo-600",
      };
    default:
      return {
        bg: "bg-zinc-200",
        text: "text-zinc-600",
      };
  }
}

function formatearMoneda(valor: unknown) {
  if (typeof valor === "number") return `$${valor}`;
  if (typeof valor === "string" && valor.trim() !== "") return valor;
  return "$0";
}

function obtenerIniciales(nombreCompleto: string) {
  const partes = nombreCompleto.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return "NA";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

/**
 * Adapta la respuesta real del backend al formato que usa la UI.
 * Si tu backend ya devuelve exactamente estos campos, puedes simplificar esto.
 */
function mapApiToUi(data: any): SeguimientoResponse {
  const prospectosApi = Array.isArray(data?.prospectos)
    ? data.prospectos
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const prospectos: ProspectoItem[] = prospectosApi.map((item: any, index: number) => ({
    id: Number(item.id ?? item.idProspecto ?? index + 1),
    iniciales: item.iniciales ?? obtenerIniciales(item.nombre ?? "Sin nombre"),
    nombre: item.nombre ?? "Sin nombre",
    empresa: item.empresa ?? "Sin empresa",
    fecha: item.fecha ?? item.fechaRegistro ?? "",
    interes: item.interes ?? "BAJO",
    rubro: item.rubro ?? item.modulo ?? item.servicio ?? "Sin rubro",
    estado: item.estado ?? "Pendiente",
    anticipo: formatearMoneda(item.anticipo ?? item.montoAnticipo ?? 0),
    proximoPaso: item.proximoPaso ?? "Sin próximo paso",
  }));

  const totalProspectos =
    Number(data?.totalProspectos) ||
    Number(data?.totales?.totalProspectos) ||
    prospectos.length;

  const conversion =
    Number(data?.conversion) ||
    Number(data?.totales?.conversion) ||
    0;

  const altamenteInteresados =
    Number(data?.altamenteInteresados) ||
    Number(data?.totales?.altamenteInteresados) ||
    prospectos.filter((p) => p.interes === "ALTO").length;

  return {
    totalProspectos,
    conversion,
    altamenteInteresados,
    prospectos,
  };
}

export default function SeguimientoScreenView() {
  const [activeTab, setActiveTab] = useState<TabType>("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seguimiento, setSeguimiento] = useState<SeguimientoResponse>({
    totalProspectos: 0,
    conversion: 0,
    altamenteInteresados: 0,
    prospectos: [],
  });

  const cargarSeguimiento = async () => {
    try {
      setLoading(true);
      setError("");

      // Cambia esta ruta si tu endpoint es otro
      const response = await httpClient.getAuth<any>(
        "/api/seguimiento",
        "No se pudo cargar el seguimiento",
      );

      const adaptado = mapApiToUi(response);
      setSeguimiento(adaptado);
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al cargar seguimiento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSeguimiento();
  }, []);

  const prospectosFiltrados = useMemo(() => {
    if (activeTab === "Todos") return seguimiento.prospectos;
    if (activeTab === "Pendientes") {
      return seguimiento.prospectos.filter((p) => p.estado === "Pendiente");
    }
    return seguimiento.prospectos.filter((p) => p.estado === "Contactado");
  }, [activeTab, seguimiento.prospectos]);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <View className="px-5 pt-4">
          <View className="mb-6">
            <ThemedText className="text-[20px] leading-[24px] text-surface-dark font-bold">
              Historial de{"\n"}Seguimiento
            </ThemedText>

            <ThemedText className="mt-2 text-[13px] leading-[20px] text-zinc-500">
              Gestiona los prospectos capturados durante FEXCO y supervisa el
              embudo de ventas editorial.
            </ThemedText>
          </View>

          <View className="mb-3 flex-row rounded-lg bg-[#F1EBF1] p-1">
            {tabs.map((tab) => {
              const active = activeTab === tab;

              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className={`flex-1 items-center rounded-lg px-3 py-2 ${
                    active ? "bg-white" : ""
                  }`}
                >
                  <ThemedText
                    className={`text-[12px] ${
                      active
                        ? "text-brand-primary font-semibold"
                        : "text-zinc-600"
                    }`}
                  >
                    {tab}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={cargarSeguimiento}
            className="mb-6 self-start rounded-lg bg-surface-variant px-4 py-3"
          >
            <ThemedText className="text-[12px] font-semibold text-surface-dark">
              Recargar datos
            </ThemedText>
          </Pressable>

          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" />
              <ThemedText className="mt-3 text-zinc-500">
                Cargando seguimiento...
              </ThemedText>
            </View>
          ) : error ? (
            <View className="rounded-xl bg-surface-container p-4">
              <ThemedText className="text-status-error font-semibold">
                {error}
              </ThemedText>

              <Pressable
                onPress={cargarSeguimiento}
                className="mt-4 self-start rounded-lg bg-brand-primary px-4 py-3"
              >
                <ThemedText className="text-white font-semibold">
                  Reintentar
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <>
              <View className="mb-6 flex-row justify-between">
                <View
                  className="h-[118px] w-[31.5%] rounded-xl bg-[#F1EDF2] px-6 py-5"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 10,
                    elevation: 2,
                  }}
                >
                  <ThemedText className="text-[12px] font-semibold tracking-[1.5px] text-brand-primary">
                    TOTAL PROSPECTOS
                  </ThemedText>

                  <View className="mt-5 flex-row items-end">
                    <ThemedText className="text-[52px] leading-[52px] text-surface-dark font-extrabold">
                      {seguimiento.totalProspectos}
                    </ThemedText>
                  </View>
                </View>

                <View
                  className="h-[118px] w-[31.5%] rounded-xl bg-[#ECEAFB] px-6 py-5"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 10,
                    elevation: 2,
                  }}
                >
                  <ThemedText className="text-[12px] font-semibold tracking-[1.5px] text-[#5360D9]">
                    CONVERSIÓN
                  </ThemedText>

                  <View className="mt-5 flex-row items-end">
                    <ThemedText className="text-[52px] leading-[52px] text-[#5360D9] font-extrabold">
                      {seguimiento.conversion}%
                    </ThemedText>
                  </View>
                </View>

                <View
                  className="h-[118px] w-[31.5%] rounded-xl bg-brand-primary px-6 py-5"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.12,
                    shadowRadius: 18,
                    elevation: 6,
                  }}
                >
                  <ThemedText className="text-[12px] font-semibold tracking-[1.5px] text-white">
                    ALTAMENTE INTERESADOS
                  </ThemedText>

                  <View className="mt-5 flex-row items-end">
                    <ThemedText className="text-[52px] leading-[52px] text-white font-extrabold">
                      {seguimiento.altamenteInteresados}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View className="mb-3 px-1">
                <ThemedText className="text-[10px] tracking-[1.2px] text-zinc-400 font-semibold">
                  PROSPECTO & EMPRESA
                </ThemedText>
              </View>

              <View className="gap-4">
                {prospectosFiltrados.length === 0 ? (
                  <View className="rounded-xl bg-surface-container p-4">
                    <ThemedText className="text-zinc-500">
                      No hay datos para mostrar.
                    </ThemedText>
                  </View>
                ) : (
                  prospectosFiltrados.map((item) => {
                    const interestStyles = getInterestStyles(item.interes);
                    const estadoStyles = getEstadoStyles(item.estado);
                    const avatarStyles = getAvatarStyles(item.interes);

                    return (
                      <View
                        key={item.id}
                        className="rounded-xl bg-surface-container p-4 shadow-card"
                      >
                        <View className="flex-row">
                          <View
                            className={`mr-3 h-12 w-12 items-center justify-center rounded-2xl ${avatarStyles.bg}`}
                          >
                            <ThemedText
                              className={`text-[14px] font-bold ${avatarStyles.text}`}
                            >
                              {item.iniciales}
                            </ThemedText>
                          </View>

                          <View className="flex-1">
                            <ThemedText className="text-[16px] text-surface-dark font-bold">
                              {item.nombre}
                            </ThemedText>

                            <ThemedText className="mt-0.5 text-[12px] text-zinc-500">
                              {item.empresa} • {item.fecha}
                            </ThemedText>

                            <View className="mt-3">
                              <ThemedText
                                className={`text-[11px] font-bold ${interestStyles.text}`}
                              >
                                {item.interes}
                              </ThemedText>

                              <ThemedText className="mt-1 text-[14px] leading-[20px] text-surface-dark">
                                {item.rubro}
                              </ThemedText>
                            </View>

                            <View className="mt-3 flex-row flex-wrap items-center gap-2">
                              <View
                                className={`self-start rounded-full px-3 py-1.5 ${estadoStyles.bg}`}
                              >
                                <ThemedText
                                  className={`text-[11px] font-semibold ${estadoStyles.text}`}
                                >
                                  • {item.estado}
                                </ThemedText>
                              </View>

                              <ThemedText className="text-[14px] text-surface-dark font-bold">
                                {item.anticipo}
                              </ThemedText>
                            </View>

                            <ThemedText className="mt-3 text-[13px] text-zinc-600">
                              {item.proximoPaso}
                            </ThemedText>

                            <Pressable className="mt-4 self-start rounded-lg border border-[#E7D9E4] bg-white px-4 py-3">
                              <ThemedText className="text-[13px] font-semibold text-surface-dark">
                                Ver Detalles
                              </ThemedText>
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}