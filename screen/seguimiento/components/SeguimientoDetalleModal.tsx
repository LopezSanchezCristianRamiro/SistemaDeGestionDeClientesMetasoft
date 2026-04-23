import { Toaster } from "@/components/Toaster";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { httpClient } from "../../../http/httpClient";
import { RegistrarAdelantoModal } from "./RegistrarAdelantoModal";
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
  onRefresh?: () => Promise<any>; // Nueva prop
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
  const [anticipoLocal, setAnticipoLocal] = useState<number>(0);

  const [showPasoModal, setShowPasoModal] = useState(false);
  const [estadoSeguimiento, setEstadoSeguimiento] = useState("Pendiente");
  const [savingEstado, setSavingEstado] = useState(false);
  const [interesActual, setInteresActual] = useState("Bajo");
  const [savingInteres, setSavingInteres] = useState(false);
  const [showAdelantoModal, setShowAdelantoModal] = useState(false);
  const handleRegistrarAdelantoEfectivo = useCallback(
    async (monto: number) => {
      if (!prospecto?.id) throw new Error("Prospecto no definido");

      await httpClient.postAuth(
        `/api/seguimiento/${prospecto.id}/adelanto`,
        { monto, metodo: "efectivo" },
        "Error al registrar adelanto en efectivo",
      );
    },
    [prospecto],
  );
  useEffect(() => {
    if (prospecto) {
      setAnticipoLocal(Number(prospecto.anticipo) || 0);
    }
  }, [prospecto]);
  // Callback cuando se registra exitosamente (refrescar datos)
  const handleAdelantoRegistrado = useCallback((monto: number) => {
    Toast.show({
      type: "success",
      text1: "Adelanto registrado",
      text2: "El adelanto en efectivo ha sido guardado.",
    });
    setAnticipoLocal(monto);
  }, []);

  const handleActualizarInteres = async (nuevoInteres: string) => {
    try {
      const idProspecto = prospecto?.idProspecto || prospecto?.id;

      if (!idProspecto) {
        Alert.alert("Error", "No existe prospecto.");
        return;
      }

      if (nuevoInteres === interesActual) {
        setOpenInteres(false);
        return;
      }

      setOpenInteres(false);
      setSavingInteres(true);

      const data: any = await httpClient.putAuth(
        `/api/seguimiento/${idProspecto}/interes`,
        {
          estadoInteres: nuevoInteres,
        },
        "No se pudo actualizar el interés",
      );

      setInteresActual(nuevoInteres);

      Alert.alert(
        "Correcto",
        data?.message || `Interés actualizado a ${nuevoInteres}`,
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "No se pudo actualizar el interés",
      );
    } finally {
      setSavingInteres(false);
    }
  };
  useEffect(() => {
    if (prospecto?.estado) {
      setEstadoSeguimiento(prospecto.estado);
    }
  }, [prospecto]);
  useEffect(() => {
    if (prospecto?.interes) {
      setInteresActual(String(prospecto.interes));
    } else {
      setInteresActual("Bajo");
    }
  }, [prospecto]);
  const isPhone = width < 640;
const isTablet = width >= 640 && width < 1024;
const isDesktop = width >= 1024;
  const [openInteres, setOpenInteres] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const opcionesInteres = ["Bajo", "Medio", "Alto"];
  const opcionesEstado = ["En proceso", "Cerrado", "Cancelado"];
  const nombreCompleto = getNombreCompleto(prospecto) || "Sin nombre";
  const empresa = prospecto?.empresa || "Sin empresa";
  const interes = interesActual || prospecto?.interes || "Bajo";

  // CAMBIO
  const estado = estadoSeguimiento || prospecto?.estado || "Pendiente";

  const anticipo = prospecto?.anticipo ?? 0;

  const correo =
    prospecto?.correo ?? (prospecto as any)?.correoElectronico ?? "";

  const telefono = prospecto?.telefono ?? (prospecto as any)?.celular ?? "";

  // CAMBIO
  const fechaInicio =
    prospecto?.fechaInicioSeguimiento || prospecto?.fechaInicio || "Sin fecha";

  const proximoPaso = prospecto?.proximoPaso || "Sin próximo paso";

  const historialPasos = prospecto?.historialPasos || [];

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
  const getSiguienteInteres = () => {
    const actual = (interesActual || "").toUpperCase();

    if (actual === "BAJO") return "Medio";
    if (actual === "MEDIO") return "Alto";
    if (actual === "ALTO") return "Bajo";

    return "Bajo";
  };
  const handleActualizarEstado = async (nuevoEstado: string) => {
    try {
      if (!prospecto?.idSeguimiento) {
        Alert.alert("Error", "No existe seguimiento.");
        return;
      }

      if (nuevoEstado === estadoSeguimiento) {
        setOpenEstado(false);
        return;
      }

      setOpenEstado(false);
      setSavingEstado(true);

      const data: any = await httpClient.putAuth(
        `/api/seguimiento/${prospecto.idSeguimiento}/estado`,
        {
          estadoSeguimiento: nuevoEstado,
        },
        "No se pudo actualizar",
      );

      setEstadoSeguimiento(nuevoEstado);

      Alert.alert(
        "Correcto",
        data?.message || `Estado actualizado a ${nuevoEstado}`,
      );
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo actualizar");
    } finally {
      setSavingEstado(false);
    }
  };

  const handleCerrarSeguimiento = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        className="flex-1"
        style={{
          backgroundColor: "rgba(22, 17, 24, 0.35)",
          justifyContent: "center",
          alignItems: "center",
          padding: isPhone ? 10 : isTablet ? 16 : 24,
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
              paddingHorizontal: isPhone ? 16 : isTablet ? 18 : 22,
paddingTop: isPhone ? 16 : 20,
              paddingBottom: 28,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                flexDirection: isPhone ? "column" : "row",
alignItems: isPhone ? "flex-start" : "center",
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

                <Pressable
                  onPress={() => setShowAdelantoModal(true)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <ThemedText className="text-[12px] font-bold text-[#d10a78] underline">
                    Adelanto: {anticipoLocal} bs.
                  </ThemedText>
                </Pressable>
              </View>

              <Pressable
                onPress={onClose}
                className="rounded-2xl px-4 py-2"
                style={{
                  backgroundColor: "#ece6eb",
                  alignSelf: isPhone ? "flex-end" : "auto",
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
                flexDirection: isPhone ? "column" : "row",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <ThemedText
                  className="font-extrabold text-[#201b24]"
                  style={{
                    fontSize: isPhone ? 28 : isTablet ? 32 : 36,
lineHeight: isPhone ? 32 : isTablet ? 36 : 40,
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
                  <ThemedText className="text-[16px] text-[#b9b0ba]">
                    /
                  </ThemedText>
                  <ThemedText className="text-[16px] font-bold text-[#4c57c7]">
                    Interes: {interes}
                  </ThemedText>
                </View>
              </View>

              <View
                style={{
                  flexDirection: isPhone ? "column" : "row",
                  gap: 10,
                  width: isPhone ? "100%" : isTablet ? 260 : "auto",
                }}
              >
                <Pressable
                  onPress={handleOpenMail}
                  disabled={!prospecto?.correo}
                  className="rounded-2xl px-5 py-4"
                  style={{
                    backgroundColor: "#ece9ee",
                    opacity: prospecto?.correo ? 1 : 0.6,
                    minWidth: isPhone ? undefined : 140,
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
                    minWidth: isPhone ? undefined : 140,
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  }}
>
              <View
                className="rounded-[26px] p-5"
              style={{
  width: isPhone ? "100%" : isTablet ? "48%" : "24%",
  backgroundColor: "#efebef",
}}
              >
                <ThemedText className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#7a717c]">
                  Interés actual
                </ThemedText>

                <Pressable
                  onPress={() => !savingInteres && setOpenInteres(true)}
                  style={{
                    marginTop: 18,
                    backgroundColor: "#f7f4f8",
                    borderRadius: 22,
                    paddingVertical: 18,
                    paddingHorizontal: 18,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <ThemedText
                    className="font-bold text-center"
                    style={{
                      fontSize: 16,
                      color: "#4f4755",
                    }}
                  >
                    {savingInteres ? "Guardando..." : interes}
                  </ThemedText>

                  <View
                    style={{
                      position: "absolute",
                      right: 18,
                      top: 0,
                      bottom: 0,
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="chevron-down" size={24} color="#6f6875" />
                  </View>
                </Pressable>

                <ThemedText className="mt-3 text-[12px] text-[#6f6875]">
                  Siguiente interés: {getSiguienteInteres()}
                </ThemedText>
              </View>
              <View
                className="rounded-[26px] p-5"
               style={{
  width: isPhone ? "100%" : isTablet ? "48%" : "24%",
  backgroundColor: "#efebef",
}}
              >
                <ThemedText className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#7a717c]">
                  Estado actual
                </ThemedText>

                <Pressable
                  onPress={() => !savingEstado && setOpenEstado(true)}
                  style={{
                    marginTop: 18,
                    backgroundColor: "#f7f4f8",
                    borderRadius: 22,
                    paddingVertical: 18,
                    paddingHorizontal: 18,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <ThemedText
                    className="font-bold text-center"
                    style={{
                      fontSize: 16,
                      color: "#4f4755",
                    }}
                  >
                    {savingEstado ? "Guardando..." : estado}
                  </ThemedText>

                  <View
                    style={{
                      position: "absolute",
                      right: 18,
                      top: 0,
                      bottom: 0,
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="chevron-down" size={24} color="#6f6875" />
                  </View>
                </Pressable>

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
               style={{
  width: isPhone ? "100%" : isTablet ? "48%" : "24%",
  backgroundColor: "#efebef",
}}
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
                            <Ionicons
                              name={icon.name as any}
                              size={16}
                              color="#fff"
                            />
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
                              flexDirection: isPhone ? "column" : "row",
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
          {(savingEstado || savingInteres) && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(22, 17, 24, 0.18)",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 50,
              }}
            >
              <View
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 24,
                  paddingHorizontal: 28,
                  paddingVertical: 24,
                  alignItems: "center",
                  minWidth: 180,
                }}
              >
                <ActivityIndicator size="large" color="#8d8ff3" />
                <ThemedText className="mt-4 text-[14px] font-bold text-[#4f4755]">
                  Guardando cambios...
                </ThemedText>
              </View>
            </View>
          )}
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
          <RegistrarAdelantoModal
            visible={showAdelantoModal}
            onClose={() => setShowAdelantoModal(false)}
            prospectoId={prospecto?.id ?? 0}
            nombreCliente={prospecto?.nombre ?? "Sistema"}
            onAdelantoRegistrado={handleAdelantoRegistrado}
            onRegistrarEfectivo={handleRegistrarAdelantoEfectivo}
          />
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
          <Modal
            visible={openInteres}
            transparent
            animationType="fade"
            onRequestClose={() => setOpenInteres(false)}
          >
            <Pressable
              onPress={() => setOpenInteres(false)}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.25)",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <View
                style={{
                  width: "100%",
                  maxWidth: 340,
                  backgroundColor: "#ffffff",
                  borderRadius: 24,
                  padding: 14,
                }}
              >
                {opcionesInteres.map((item) => {
                  const active = item === interesActual;

                  return (
                    <Pressable
                      key={item}
                      onPress={() => handleActualizarInteres(item)}
                      style={{
                        paddingVertical: 16,
                        borderRadius: 18,
                        marginBottom: 8,
                        backgroundColor: active ? "#f8ddeb" : "#f7f4f8",
                      }}
                    >
                      <ThemedText
                        className="text-center font-bold"
                        style={{
                          fontSize: 15,
                          color: active ? "#d10a78" : "#5f5863",
                        }}
                      >
                        {item}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </Modal>

          <Modal
            visible={openEstado}
            transparent
            animationType="fade"
            onRequestClose={() => setOpenEstado(false)}
          >
            <Pressable
              onPress={() => setOpenEstado(false)}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.25)",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <View
                style={{
                  width: "100%",
                  maxWidth: 340,
                  backgroundColor: "#ffffff",
                  borderRadius: 24,
                  padding: 14,
                }}
              >
                {opcionesEstado.map((item) => {
                  const active = item === estadoSeguimiento;

                  return (
                    <Pressable
                      key={item}
                      onPress={() => handleActualizarEstado(item)}
                      style={{
                        paddingVertical: 16,
                        borderRadius: 18,
                        marginBottom: 8,
                        backgroundColor: active ? "#f8ddeb" : "#f7f4f8",
                      }}
                    >
                      <ThemedText
                        className="text-center font-bold"
                        style={{
                          fontSize: 15,
                          color: active ? "#d10a78" : "#5f5863",
                        }}
                      >
                        {item}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </Modal>
        </View>

        <Toaster />
      </View>
    </Modal>
  );
}
