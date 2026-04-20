import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { httpClient } from "../../../http/httpClient";
import RegistrarPasoModal from "./RegistrarPasoModal";
type Paso = {
  id?: number;
  titulo?: string;
  fecha?: string;
  resultado?: string;
  tipo?: "documento" | "llamada" | "visita" | "otro";
};

type ProspectoDetalle = {
  id: number;
  idProspecto?: number;
  idSeguimiento?: number;

  nombre?: string;
  apellidos?: string;
  empresa?: string;
  interes?: string;

  estado?: string;
  anticipo?: number | string;

  correo?: string;
  telefono?: string;

  fechaInicio?: string;
  fechaInicioSeguimiento?: string;

  proximoPaso?: string;

  historialPasos?: Paso[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
  prospecto: ProspectoDetalle | null;
  onGuardarPaso: (payload: {
    idProspecto: number;
    descripcionPaso: string;
    resultadoPaso: string;
    fechaPaso: string;
  }) => Promise<void>;
};

function getNombreCompleto(prospecto: ProspectoDetalle | null) {
  if (!prospecto) return "";
  return `${prospecto.nombre || ""} ${prospecto.apellidos || ""}`.trim();
}

function getPasoIcon(tipo?: string) {
  switch ((tipo || "").toLowerCase()) {
    case "documento":
      return { name: "document-text-outline", color: "#b02fc2" };
    case "llamada":
      return { name: "call-outline", color: "#5664d8" };
    case "visita":
      return { name: "calendar-outline", color: "#d10a78" };
    default:
      return { name: "ellipse-outline", color: "#9a8f99" };
  }
}

function formatFecha(fecha?: string) {
  if (!fecha) return "Sin fecha";
  return fecha;
}

export default function SeguimientoDetalleModal({
  visible,
  onClose,
  prospecto,
  onGuardarPaso,
}: Props) {
  const { width, height } = useWindowDimensions();

  const [showPasoModal, setShowPasoModal] = useState(false);

  // NUEVO
  const [estadoSeguimiento, setEstadoSeguimiento] = useState("Pendiente");
  const [savingEstado, setSavingEstado] = useState(false);

  useEffect(() => {
    if (prospecto?.estado) {
      setEstadoSeguimiento(prospecto.estado);
    }
  }, [prospecto]);

  const isMobile = width < 640;

  const nombreCompleto = getNombreCompleto(prospecto) || "Sin nombre";
  const empresa = prospecto?.empresa || "Sin empresa";
  const interes = prospecto?.interes || "Sin interés";

  // CAMBIO
  const estado =
    estadoSeguimiento || prospecto?.estado || "Pendiente";

  const anticipo = prospecto?.anticipo ?? 0;

  const correo =
    prospecto?.correo ??
    (prospecto as any)?.correoElectronico ??
    "";

  const telefono =
    prospecto?.telefono ??
    (prospecto as any)?.celular ??
    "";

  // CAMBIO
  const fechaInicio =
    prospecto?.fechaInicioSeguimiento ||
    prospecto?.fechaInicio ||
    "Sin fecha";

  const proximoPaso =
    prospecto?.proximoPaso || "Sin próximo paso";

  const historialPasos =
    prospecto?.historialPasos || [];

  const handleOpenMail = async () => {
    if (!correo) return;

    const url = `mailto:${correo}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    }
  };

  const handleOpenPhone = async () => {
    if (!telefono) return;

    const url = `tel:${telefono}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    }
  };
const getSiguienteEstado = () => {
  const actual = (estadoSeguimiento || "").toUpperCase();

  if (actual === "EN PROCESO") return "Cerrado";
  if (actual === "CERRADO") return "Cancelado";
  if (actual === "CANCELADO") return "En proceso";

  return "En proceso";
};
  // NUEVO
 const handleActualizarEstado = async () => {
  try {
    if (!prospecto?.idSeguimiento) {
      Alert.alert("Error", "No existe seguimiento.");
      return;
    }

    const nuevoEstado = getSiguienteEstado();

    setSavingEstado(true);

   const data: any = await httpClient.putAuth(
  `/api/seguimiento/${prospecto.idSeguimiento}/estado`,
  {
    estadoSeguimiento: nuevoEstado,
  },
  "No se pudo actualizar"
);

    setEstadoSeguimiento(nuevoEstado);

    Alert.alert("Correcto", data?.message || `Estado actualizado a ${nuevoEstado}`);
  } catch (error: any) {
    Alert.alert(
      "Error",
      error?.message || "No se pudo actualizar"
    );
  } finally {
    setSavingEstado(false);
  }
};

  const handleCerrarSeguimiento = () => {
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        className="flex-1"
        style={{
          backgroundColor: "rgba(22, 17, 24, 0.35)",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? 10 : 24,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 1180,
            maxHeight: height * 0.94,
            borderRadius: 28,
            overflow: "hidden",
            backgroundColor: "#f7f4f8",
          }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: isMobile ? 16 : 22,
              paddingTop: isMobile ? 16 : 20,
              paddingBottom: 28,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: "#b44bd1" }}
                >
                  <ThemedText className="text-[10px] font-extrabold uppercase text-white">
                    Detalle de seguimiento
                  </ThemedText>
                </View>

                <ThemedText className="text-[12px] font-bold text-[#d10a78]">
                  Adelanto: {anticipo} bs.
                </ThemedText>
              </View>

              <Pressable
                onPress={onClose}
                className="rounded-2xl px-4 py-2"
                style={{
                  backgroundColor: "#ece6eb",
                  alignSelf: isMobile ? "flex-end" : "auto",
                }}
              >
                <ThemedText className="text-[12px] font-bold text-[#4f4854]">
                  Cerrar
                </ThemedText>
              </Pressable>
            </View>

            <View
              style={{
                marginTop: 10,
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <ThemedText
                  className="font-extrabold text-[#201b24]"
                  style={{
                    fontSize: isMobile ? 28 : 36,
                    lineHeight: isMobile ? 32 : 40,
                  }}
                >
                  {nombreCompleto}
                </ThemedText>

                <View
                  style={{
                    marginTop: 8,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ThemedText className="text-[16px] text-[#6f6875]">
                    {empresa}
                  </ThemedText>
                  <ThemedText className="text-[16px] text-[#b9b0ba]">/</ThemedText>
                  <ThemedText className="text-[16px] font-bold text-[#4c57c7]">
                    Interes: {interes}
                  </ThemedText>
                </View>
              </View>

              <View
                style={{
                  flexDirection: isMobile ? "column" : "row",
                  gap: 10,
                  width: isMobile ? "100%" : "auto",
                }}
              >
                <Pressable
                  onPress={handleOpenMail}
                  disabled={!prospecto?.correo}
                  className="rounded-2xl px-5 py-4"
                  style={{
                    backgroundColor: "#ece9ee",
                    opacity: prospecto?.correo ? 1 : 0.6,
                    minWidth: isMobile ? undefined : 140,
                    flex: 1,
                  }}
                >
                  <ThemedText className="text-center text-[11px] font-bold uppercase text-[#8f8795]">
                    Correo
                  </ThemedText>
                  <ThemedText
                    className="mt-1 text-center text-[13px] font-bold text-[#4c57c7]"
                    numberOfLines={2}
                  >
                    {correo}
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={handleOpenPhone}
                  disabled={!prospecto?.telefono}
                  className="rounded-2xl px-5 py-4"
                  style={{
                    backgroundColor: "#ece9ee",
                    opacity: prospecto?.telefono ? 1 : 0.6,
                    minWidth: isMobile ? undefined : 140,
                    flex: 1,
                  }}
                >
                  <ThemedText className="text-center text-[11px] font-bold uppercase text-[#8f8795]">
                    Teléfono
                  </ThemedText>
                  <ThemedText
                    className="mt-1 text-center text-[13px] font-bold text-[#4c57c7]"
                    numberOfLines={2}
                  >
                    {telefono}
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            <View
              style={{
                marginTop: 24,
                flexDirection: isMobile ? "column" : "row",
                gap: 16,
              }}
            >
<View
  className="rounded-[26px] p-5"
  style={{ flex: 1, backgroundColor: "#efebef" }}
>
  <ThemedText className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#7a717c]">
    Estado actual
  </ThemedText>

  <View
    style={{
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}
  >
    <ThemedText className="text-[22px] font-extrabold text-[#2b2530]">
      {estado}
    </ThemedText>

    <Pressable
      onPress={handleActualizarEstado}
      disabled={savingEstado}
      className="rounded-xl px-3 py-2"
      style={{
        backgroundColor: savingEstado ? "#bdbdf3" : "#8d8ff3",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Ionicons name="sync-outline" size={18} color="#fff" />
        <ThemedText className="text-[12px] font-bold text-white">
          {savingEstado ? "Guardando..." : "Cambiar"}
        </ThemedText>
      </View>
    </Pressable>
  </View>

  <ThemedText className="mt-3 text-[12px] text-[#6f6875]">
    Siguiente estado: {getSiguienteEstado()}
  </ThemedText>
</View>

              <View
                className="rounded-[26px] p-5"
                style={{
                  flex: 1,
                  backgroundColor: "#ea0088",
                  shadowColor: "#000",
                  shadowOpacity: 0.16,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 6,
                }}
              >
                <ThemedText className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#ffc7eb]">
                  Próximo paso
                </ThemedText>

                <View
                  style={{
                    marginTop: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <ThemedText
                    className="flex-1 text-[18px] font-bold text-white"
                    numberOfLines={2}
                  >
                    {proximoPaso}
                  </ThemedText>

                  <Ionicons
                    name="chevron-forward-outline"
                    size={24}
                    color="#ffc7eb"
                  />
                </View>
              </View>

              <View
                className="rounded-[26px] p-5"
                style={{ flex: 1, backgroundColor: "#efebef" }}
              >
                <ThemedText className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#7a717c]">
                  Fecha de inicio
                </ThemedText>

                <View
                  style={{
                    marginTop: 18,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <ThemedText className="text-[22px] font-extrabold text-[#2b2530]">
                    {fechaInicio}
                  </ThemedText>

                  <Ionicons name="calendar-outline" size={24} color="#6b5a63" />
                </View>
              </View>
            </View>

            <View style={{ marginTop: 36 }}>
              <ThemedText className="text-[28px] font-extrabold text-[#231e27]">
                Historial de Pasos
              </ThemedText>

              <View style={{ marginTop: 20 }}>
                {historialPasos.length === 0 ? (
                  <View
                    className="rounded-[22px] px-5 py-6"
                    style={{
                      backgroundColor: "#ffffff",
                      borderWidth: 1,
                      borderColor: "#ece5eb",
                    }}
                  >
                    <ThemedText className="text-[15px] font-medium text-[#6f6875]">
                      No hay historial registrado.
                    </ThemedText>
                  </View>
                ) : (
                  historialPasos.map((paso, index) => {
                    const icon = getPasoIcon(paso.tipo);

                    return (
                      <View
                        key={paso.id ?? index}
                        style={{
                          flexDirection: "row",
                          alignItems: "stretch",
                          marginBottom: 18,
                        }}
                      >
                        <View
                          style={{
                            width: 42,
                            alignItems: "center",
                            paddingTop: 14,
                          }}
                        >
                          <View
                            className="rounded-xl"
                            style={{
                              width: 32,
                              height: 32,
                              backgroundColor: icon.color,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Ionicons name={icon.name as any} size={16} color="#fff" />
                          </View>

                          {index !== historialPasos.length - 1 && (
                            <View
                              style={{
                                width: 2,
                                flex: 1,
                                backgroundColor: "#eadfe7",
                                marginTop: 10,
                              }}
                            />
                          )}
                        </View>

                        <View
                          className="flex-1 rounded-[22px] px-5 py-5"
                          style={{
                            backgroundColor: "#ffffff",
                            borderLeftWidth: 4,
                            borderLeftColor: icon.color,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: isMobile ? "column" : "row",
                              justifyContent: "space-between",
                              gap: 10,
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <ThemedText className="text-[18px] font-extrabold text-[#2a2430]">
                                {paso.titulo || "Paso"}
                              </ThemedText>

                              <ThemedText className="mt-1 text-[13px] text-[#6f6875]">
                                {formatFecha(paso.fecha)}
                              </ThemedText>
                            </View>

                            <View
                              className="self-start rounded-full px-3 py-1"
                              style={{ backgroundColor: "#f0eaef" }}
                            >
                              <ThemedText className="text-[10px] font-bold uppercase text-[#7b727d]">
                                Paso {historialPasos.length - index}
                              </ThemedText>
                            </View>
                          </View>

                          <ThemedText className="mt-4 text-[14px] text-[#66606a]">
                            Resultado:{" "}
                            <ThemedText className="italic text-[14px] font-semibold text-[#2d2732]">
                              “{paso.resultado || "Sin resultado"}”
                            </ThemedText>
                          </ThemedText>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            <View
              style={{
                marginTop: 26,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={handleCerrarSeguimiento}
                className="rounded-2xl px-6 py-4"
                style={{
                  borderWidth: 1.5,
                  borderColor: "#ea2d2d",
                  backgroundColor: "#fff9f9",
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="close-outline" size={20} color="#ea2d2d" />
                  <ThemedText className="ml-2 text-[16px] font-bold text-[#ea2d2d]">
                    Cerrar Seguimiento
                  </ThemedText>
                </View>
              </Pressable>
            </View>
          </ScrollView>

          <View
            style={{
              position: "absolute",
              right: 18,
              bottom: 18,
              alignItems: "center",
            }}
          >
            <View
              className="rounded-full px-2 py-1"
              style={{
                backgroundColor: "#5a5ed6",
                position: "absolute",
                top: -8,
                right: -6,
                zIndex: 2,
              }}
            >
              <ThemedText className="text-[9px] font-extrabold text-white">
                ADD
              </ThemedText>
            </View>

            <Pressable
              onPress={() => setShowPasoModal(true)}
              className="rounded-2xl items-center justify-center"
              style={{
                width: 46,
                height: 46,
                backgroundColor: "#ea0088",
                opacity: 0.95,
              }}
            >
              <Ionicons name="add" size={26} color="#fff" />
            </Pressable>
          </View>

          <RegistrarPasoModal
            visible={showPasoModal}
            onClose={() => setShowPasoModal(false)}
            onSave={async ({ resultado, proximoPaso, fechaHora }) => {
              if (!prospecto?.id) return;

              await onGuardarPaso({
                idProspecto: prospecto.id,
                descripcionPaso: proximoPaso,
                resultadoPaso: resultado,
                fechaPaso: fechaHora || new Date().toISOString(),
              });

              setShowPasoModal(false);
            }}
          />
        </View>
      </View>               
    </Modal>
  );
}