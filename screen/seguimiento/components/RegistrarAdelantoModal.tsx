/**
 * @file RegistrarAdelantoModal.tsx
 * @description Modal para registrar un adelanto (efectivo/QR) sobre un prospecto existente.
 *              Reutiliza la lógica de QR del catálogo y permite pago en efectivo.
 */

import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { QrPagoModal } from "../../catalogo/components/QrPagoModal";
import { useQrPago } from "../../catalogo/hooks/useQrPago";

type MetodoPago = "efectivo" | "qr";

interface RegistrarAdelantoModalProps {
  visible: boolean;
  onClose: () => void;
  /** ID del prospecto al que se le agregará el adelanto */
  prospectoId: number;
  /** Nombre del sistema asociado (para mostrar en el modal QR) */
  nombreCliente: string;
  /** Callback cuando se registra exitosamente el adelanto (efectivo o QR confirmado) */
  onAdelantoRegistrado: (monto: number) => void;
  /** Función para registrar adelanto en efectivo (debe ser provista por el padre) */
  onRegistrarEfectivo: (monto: number) => Promise<void>;
}

export const RegistrarAdelantoModal = memo(
  ({
    visible,
    onClose,
    prospectoId,
    nombreCliente,
    onAdelantoRegistrado,
    onRegistrarEfectivo,
  }: RegistrarAdelantoModalProps) => {
    const [monto, setMonto] = useState("");
    const [metodoPago, setMetodoPago] = useState<MetodoPago>("efectivo");
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Resetear estado al abrir/cerrar
    useEffect(() => {
      if (!visible) {
        setMonto("");
        setMetodoPago("efectivo");
        setIsSubmitting(false);
        setQrModalVisible(false);
      }
    }, [visible]);

    // Validación del monto
    const montoValido = useCallback(() => {
      const m = parseFloat(monto);
      return !isNaN(m) && m > 0;
    }, [monto]);

    // Manejar registro en efectivo
    const handleRegistrarEfectivo = useCallback(async () => {
      if (!montoValido()) {
        Toast.show({
          type: "error",
          text1: "Monto inválido",
          text2: "Ingrese un monto mayor a cero",
        });
        return;
      }

      setIsSubmitting(true);
      try {
        await onRegistrarEfectivo(parseFloat(monto));

        onAdelantoRegistrado(parseFloat(monto));
        onClose();
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error?.message || "No se pudo registrar el adelanto",
        });
      } finally {
        setIsSubmitting(false);
      }
    }, [
      monto,
      montoValido,
      onRegistrarEfectivo,
      onAdelantoRegistrado,
      onClose,
    ]);

    // Callback cuando el pago QR es confirmado (el modal QR ya ejecutó onPagoConfirmado)
    const handlePagoQrConfirmado = useCallback(async () => {
      // El registro del adelanto vía QR ya fue realizado por el callback interno del hook,
      // pero aquí podemos notificar al padre para refrescar datos.
      onAdelantoRegistrado(parseFloat(monto));
      onClose();
    }, [monto, onAdelantoRegistrado, onClose]);

    // Función que se pasa a useQrPago para que ejecute el registro vía API cuando el QR es pagado
    const registrarAdelantoQR = useCallback(async () => {
      // TODO: Llamar al endpoint de registro de adelanto por QR (backend pendiente)
      // Por ahora, simulamos éxito.
      console.log(
        `[TODO] Registrar adelanto QR: prospecto ${prospectoId}, monto ${monto}`,
      );
      // Aquí iría la petición httpClient.postAuth(...)
      // await httpClient.postAuth('/api/seguimiento/adelanto/qr', { prospectoId, monto: parseFloat(monto) });
    }, [prospectoId, monto]);

    // Hook de QR (usa la misma lógica que en catálogo)
    const qrHook = useQrPago(registrarAdelantoQR);

    const handleGenerarQR = useCallback(() => {
      if (!montoValido()) {
        Toast.show({
          type: "error",
          text1: "Monto inválido",
          text2: "Ingrese un monto mayor a cero",
        });
        return;
      }
      setQrModalVisible(true);
    }, [montoValido]);
    const motivoDePago = `Adelanto para ${nombreCliente}`;

    return (
      <>
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={onClose}
        >
          <View className="flex-1 bg-black/70 justify-center items-center p-6">
            <View className="w-full max-w-md bg-white rounded-3xl overflow-hidden">
              {/* Header */}
              <View className="bg-surface-dark px-5 py-4 flex-row justify-between items-center">
                <View className="flex-1 mr-3">
                  <ThemedText className="text-white font-black text-lg">
                    Registrar Adelanto
                  </ThemedText>
                  <ThemedText
                    className="text-white/50 text-xs"
                    numberOfLines={1}
                  >
                    {motivoDePago}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                >
                  <Ionicons name="close" size={22} color="#FF5252" />
                </TouchableOpacity>
              </View>

              <View className="p-5">
                {/* Campo de monto */}
                <View className="mb-5">
                  <View className="flex-row mb-2 ml-1 min-h-5">
                    <ThemedText className="text-[10px] font-black uppercase text-surface-dark/40 tracking-widest">
                      Monto del Adelanto (Bs.)
                    </ThemedText>
                    <ThemedText className="text-brand-primary ml-1">
                      *
                    </ThemedText>
                  </View>
                  <TextInput
                    className="bg-surface-variant/10 p-4 rounded-xl border border-surface-variant/20 text-surface-dark text-base font-medium"
                    placeholderTextColor="#A1A1AA"
                    placeholder="Ej: 500"
                    keyboardType="numeric"
                    value={monto}
                    onChangeText={setMonto}
                    editable={!isSubmitting}
                  />
                </View>

                {/* Selector de método de pago */}
                <ThemedText className="text-[10px] font-black uppercase text-surface-dark/40 mb-3 tracking-widest ml-1">
                  Método de Pago
                </ThemedText>
                <View className="flex-row bg-surface-variant/20 p-1.5 rounded-2xl mb-6">
                  {(
                    [
                      {
                        value: "efectivo",
                        label: "Efectivo",
                        icon: "cash-outline",
                      },
                      { value: "qr", label: "Por QR", icon: "qr-code-outline" },
                    ] as const
                  ).map(({ value, label, icon }) => {
                    const isSelected = metodoPago === value;
                    return (
                      <TouchableOpacity
                        key={value}
                        onPress={() => !isSubmitting && setMetodoPago(value)}
                        className="flex-1 py-3 rounded-xl flex-row items-center justify-center gap-x-2"
                        style={
                          isSelected ? styles.tabSelected : styles.tabDefault
                        }
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected }}
                        disabled={isSubmitting}
                      >
                        <Ionicons
                          name={icon}
                          size={16}
                          color={isSelected ? "#E1007E" : "#9CA3AF"}
                        />
                        <ThemedText
                          className="font-bold"
                          style={{ color: isSelected ? "#E1007E" : "#9CA3AF" }}
                        >
                          {label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Botones de acción */}
                {metodoPago === "efectivo" ? (
                  <TouchableOpacity
                    onPress={handleRegistrarEfectivo}
                    disabled={isSubmitting || !montoValido()}
                    className="py-4 rounded-xl items-center"
                    style={
                      !montoValido() || isSubmitting
                        ? styles.btnDisabled
                        : styles.btnPrimary
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Registrar adelanto en efectivo"
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <ThemedText className="text-white font-bold text-base">
                        {montoValido()
                          ? "REGISTRAR ADELANTO"
                          : "INGRESE UN MONTO VÁLIDO"}
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleGenerarQR}
                    disabled={isSubmitting || !montoValido()}
                    className="py-4 rounded-xl flex-row items-center justify-center "
                    style={
                      !montoValido() || isSubmitting
                        ? styles.btnDisabled
                        : styles.btnOutline
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Generar código QR"
                  >
                    <Ionicons
                      name="qr-code-outline"
                      size={20}
                      color={
                        !montoValido() || isSubmitting ? "#fff" : "#E1007E"
                      }
                    />
                    <ThemedText
                      className="text-white font-bold text-base"
                      style={{
                        color:
                          !montoValido() || isSubmitting ? "#fff" : "#E1007E",
                      }}
                    >
                      {montoValido()
                        ? " GENERAR QR"
                        : " INGRESE UN MONTO VÁLIDO"}
                    </ThemedText>
                  </TouchableOpacity>
                )}

                {/* Botón cancelar */}
                <TouchableOpacity
                  onPress={onClose}
                  className="mt-4 py-2"
                  disabled={isSubmitting}
                >
                  <ThemedText className="text-surface-dark/40 text-sm text-center">
                    Cancelar
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal QR anidado */}
        <QrPagoModal
          visible={qrModalVisible}
          monto={parseFloat(monto) || 0}
          sistemaNombre={motivoDePago}
          onClose={() => setQrModalVisible(false)}
          onPagoConfirmado={handlePagoQrConfirmado}
        />
      </>
    );
  },
);

RegistrarAdelantoModal.displayName = "RegistrarAdelantoModal";

const styles = StyleSheet.create({
  tabSelected: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#1C1B1F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  tabDefault: {
    backgroundColor: "transparent",
  },
  btnPrimary: {
    backgroundColor: "#E1007E",
  },
  btnOutline: {
    borderColor: "#E1007E",
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  btnDisabled: {
    backgroundColor: "rgba(225, 0, 126, 0.5)",
    borderColor: "rgba(225, 0, 126, 0.5)",
  },
});
