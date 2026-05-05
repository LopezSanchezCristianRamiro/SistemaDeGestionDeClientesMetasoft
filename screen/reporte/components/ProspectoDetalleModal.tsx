import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { httpClient } from "../../../http/httpClient";

const ESTADO_COLORS: Record<string, string> = {
  "En proceso": "#E1007E",
  Cerrado: "#7C3AED",
  Pendiente: "#0EA5E9",
  Ganado: "#10B981",
  Perdido: "#EF4444",
  Cancelado: "#F59E0B",
};

function getInitials(name: string) {
  return (name ?? "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

interface Props {
  idProspecto: number | null;
  esAdmin: boolean;
  onClose: () => void;
}

export function ProspectoDetalleModal({
  idProspecto,
  esAdmin,
  onClose,
}: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (idProspecto === null) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    httpClient
      .getAuth<any>(`/api/prospectos/${idProspecto}`)
      .then(setData)
      .catch((e) => setError(e.message ?? "Error al cargar"))
      .finally(() => setLoading(false));
  }, [idProspecto]);

  const interesColor =
    data?.interes === "ALTO"
      ? "#E1007E"
      : data?.interes === "MEDIO"
        ? "#7C3AED"
        : "#9CA3AF";

  const estadoColor = ESTADO_COLORS[data?.estado] ?? "#9CA3AF";

  return (
    <Modal
      visible={idProspecto !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: 40,
            maxHeight: "90%",
          }}
          onPress={() => {}}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: "#E5E7EB",
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />

          {/* Loading */}
          {loading && (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <ActivityIndicator size="large" color="#E1007E" />
              <Text style={{ color: "#9CA3AF", marginTop: 12, fontSize: 14 }}>
                Cargando detalle...
              </Text>
            </View>
          )}

          {/* Error */}
          {!loading && error && (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <Feather name="alert-circle" size={32} color="#EF4444" />
              <Text
                style={{
                  color: "#EF4444",
                  marginTop: 12,
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Contenido */}
          {!loading && !error && data && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* ── Cabecera ── */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    backgroundColor: "#E1007E",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}
                  >
                    {getInitials(data.nombreCompleto)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "800",
                      color: "#1E0A3C",
                    }}
                  >
                    {data.nombreCompleto?.trim()}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#9CA3AF" }}>
                    {data.empresa}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#F3F4F6",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="x" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* ── Chips ── */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    backgroundColor: interesColor + "20",
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: interesColor,
                      fontWeight: "700",
                    }}
                  >
                    Interés {data.interes}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: estadoColor + "20",
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: estadoColor,
                      fontWeight: "700",
                    }}
                  >
                    {data.estado}
                  </Text>
                </View>
                {parseFloat(data.anticipo ?? "0") > 0 && (
                  <View
                    style={{
                      backgroundColor: "#D1FAE5",
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#065F46",
                        fontWeight: "700",
                      }}
                    >
                      Bs. {parseFloat(data.anticipo).toLocaleString("es-BO")}{" "}
                      anticipo
                    </Text>
                  </View>
                )}
              </View>

              {/* ── Info básica ── */}
              <View
                style={{
                  backgroundColor: "#F8F7FF",
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 20,
                  gap: 12,
                }}
              >
                {[
                  {
                    icon: "mail" as const,
                    label: "Correo",
                    value: data.correoElectronico || "—",
                  },
                  {
                    icon: "flag" as const,
                    label: "Próximo paso",
                    value: data.proximoPaso || "—",
                  },
                  {
                    icon: "calendar" as const,
                    label: "Fecha inicio",
                    value: data.fechaInicio?.split(" ")[0] ?? "—",
                  },
                ].map(({ icon, label, value }) => (
                  <View
                    key={label}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "#F0EEFF",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 1,
                      }}
                    >
                      <Feather name={icon} size={13} color="#7C3AED" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "700",
                          color: "#9CA3AF",
                          textTransform: "uppercase",
                          letterSpacing: 0.4,
                        }}
                      >
                        {label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#1E0A3C",
                          fontWeight: "500",
                          marginTop: 2,
                        }}
                      >
                        {value}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Celular — solo admin */}
                {esAdmin && data.celular && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "#E7F9EF",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 1,
                      }}
                    >
                      <FontAwesome name="whatsapp" size={14} color="#25D366" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "700",
                          color: "#9CA3AF",
                          textTransform: "uppercase",
                          letterSpacing: 0.4,
                        }}
                      >
                        Celular
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL(
                            `https://wa.me/${data.celular.replace(/\D/g, "")}`,
                          )
                        }
                        style={{ marginTop: 2 }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#25D366",
                            fontWeight: "700",
                            textDecorationLine: "underline",
                          }}
                        >
                          {data.celular}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* ── Historial de pasos ── */}
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 14,
                }}
              >
                Historial · {data.historial?.length ?? 0} pasos
              </Text>

              {!data.historial || data.historial.length === 0 ? (
                <View
                  style={{
                    backgroundColor: "#F8F7FF",
                    borderRadius: 12,
                    padding: 20,
                    alignItems: "center",
                  }}
                >
                  <Feather name="inbox" size={24} color="#CBD5E1" />
                  <Text
                    style={{ color: "#CBD5E1", fontSize: 13, marginTop: 8 }}
                  >
                    Sin historial aún
                  </Text>
                </View>
              ) : (
                data.historial.map((paso: any, idx: number) => (
                  <View
                    key={paso.idPaso}
                    style={{ flexDirection: "row", gap: 12, marginBottom: 4 }}
                  >
                    {/* Línea de tiempo */}
                    <View style={{ alignItems: "center", width: 28 }}>
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: "#E1007E",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: "700",
                          }}
                        >
                          {idx + 1}
                        </Text>
                      </View>
                      {idx < data.historial.length - 1 && (
                        <View
                          style={{
                            width: 2,
                            flex: 1,
                            minHeight: 20,
                            backgroundColor: "#F0EEFF",
                            marginTop: 4,
                          }}
                        />
                      )}
                    </View>

                    {/* Contenido paso */}
                    <View style={{ flex: 1, paddingBottom: 20 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#9CA3AF",
                          marginBottom: 4,
                        }}
                      >
                        {paso.fechaPaso?.split(" ")[0] ?? ""}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: "#1E0A3C",
                          marginBottom: 8,
                        }}
                      >
                        {paso.descripcionPaso}
                      </Text>
                      {paso.resultadoPaso ? (
                        <View
                          style={{
                            backgroundColor: "#F8F7FF",
                            borderRadius: 10,
                            padding: 12,
                            borderLeftWidth: 3,
                            borderLeftColor: "#E1007E",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#374151",
                              lineHeight: 19,
                            }}
                          >
                            {paso.resultadoPaso}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
