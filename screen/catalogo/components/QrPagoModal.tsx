/**
 * @file QrPagoModal.tsx
 * @description Modal de pago por QR con verificación manual y automática cada 1s.
 *
 * Cambios:
 *  - Se elimina el polling automático del hook; se implementa aquí con setTimeout.
 *  - Se añade botón "Verificar ahora".
 *  - El botón "Cancelar" es siempre visible y detiene todo al cerrar.
 */
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { useQrPago } from "../hooks/useQrPago";

interface QrPagoModalProps {
  visible: boolean;
  monto: number;
  sistemaNombre: string;
  onClose: () => void;
  onPagoConfirmado: () => Promise<void>;
}

const TEXTO_ESTADO = {
  idle: { titulo: "Preparando...", subtitulo: "" },
  generando: {
    titulo: "Generando QR...",
    subtitulo: "Esto tomará un momento.",
  },
  esperando: {
    titulo: "Esperando pago",
    subtitulo: "Escanea el código con tu billetera digital.",
  },
  verificando: {
    titulo: "Verificando...",
    subtitulo: "Confirmando el pago con el servidor.",
  },
  confirmado: { titulo: "¡Pago confirmado!", subtitulo: "Redirigiendo..." },
  error: { titulo: "Error", subtitulo: "No se pudo completar la operación." },
};

export function QrPagoModal({
  visible,
  monto,
  sistemaNombre,
  onClose,
  onPagoConfirmado,
}: QrPagoModalProps) {
  const {
    estadoQr,
    qrData,
    errorMsg,
    isVerifying,
    generarQr,
    verificarPago,
    resetQr,
  } = useQrPago(onPagoConfirmado);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentosRef = useRef(0);
  const MAX_INTENTOS = 120;

  const clearPolling = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    intentosRef.current = 0;
  }, []);

  const scheduleNextVerification = useCallback(() => {
    if (!visible) return;
    if (estadoQr !== "esperando" && estadoQr !== "verificando") return;

    clearPolling();
    intentosRef.current += 1;

    if (intentosRef.current > MAX_INTENTOS) {
      resetQr();
      onClose();
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      await verificarPago();
      if (visible && (estadoQr === "esperando" || estadoQr === "verificando")) {
        scheduleNextVerification();
      }
    }, 1000);
  }, [visible, estadoQr, verificarPago, clearPolling, resetQr, onClose]);

  useEffect(() => {
    if (visible && monto > 0) {
      const descripcionSinTildes = sistemaNombre
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      generarQr(monto, `Adelanto ${descripcionSinTildes}`);
    }
    if (!visible) {
      clearPolling();
      resetQr();
    }
    return () => {
      clearPolling();
    };
  }, [visible]);

  useEffect(() => {
    if (estadoQr === "confirmado") {
      Toast.show({
        type: "success",
        text1: "Pago verificado",
        text2: "El QR ha sido pagado correctamente.",
        visibilityTime: 3000,
      });
    }
  }, [estadoQr]);

  useEffect(() => {
    if (!visible) {
      clearPolling();
      return;
    }

    if (estadoQr === "esperando") {
      scheduleNextVerification();
    } else if (estadoQr === "confirmado" || estadoQr === "error") {
      clearPolling();
    } else {
      clearPolling();
    }

    return () => {
      clearPolling();
    };
  }, [estadoQr, visible, scheduleNextVerification, clearPolling]);

  const handleClose = () => {
    clearPolling();
    resetQr();
    onClose();
  };

  const handleVerificarManual = () => {
    if (isVerifying) return;
    clearPolling();
    verificarPago().then(() => {
      if (visible && (estadoQr === "esperando" || estadoQr === "verificando")) {
        scheduleNextVerification();
      }
    });
  };

  const textoMostrado =
    estadoQr === "confirmado"
      ? TEXTO_ESTADO.confirmado
      : {
          titulo: "Esperando pago",
          subtitulo: "Escanea el código con tu billetera digital.",
        };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/80 justify-center items-center p-6">
        <View className="bg-white rounded-3xl overflow-hidden w-full max-w-sm">
          {/* Header */}
          <View className="bg-surface-dark px-5 py-4 flex-row justify-between items-center">
            <View className="flex-1 mr-3">
              <ThemedText className="text-white font-black text-lg">
                Pago por QR
              </ThemedText>
              <ThemedText className="text-white/50 text-xs" numberOfLines={1}>
                {sistemaNombre}
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar modal de QR"
            >
              <Ionicons name="close" size={22} color="#FF5252" />
            </TouchableOpacity>
          </View>

          <View className="p-6 items-center">
            {/* Monto */}
            <ThemedText className="text-surface-dark/50 text-xs font-bold uppercase tracking-widest mb-1">
              Monto a Cobrar
            </ThemedText>
            <ThemedText className="text-brand-primary font-black text-4xl mb-5">
              Bs. {monto.toLocaleString()}
            </ThemedText>

            <QrImageArea
              estadoQr={estadoQr}
              qrBase64={qrData?.qrImage ?? null}
              errorMsg={errorMsg}
              onReintentar={() => generarQr(monto, `Adelanto ${sistemaNombre}`)}
            />

            {/* Texto de estado */}
            <ThemedText className="text-surface-dark font-bold text-base mt-4 text-center">
              {textoMostrado.titulo}
            </ThemedText>
            {textoMostrado.subtitulo ? (
              <ThemedText className="text-surface-dark/40 text-sm text-center mt-1 px-4">
                {textoMostrado.subtitulo}
              </ThemedText>
            ) : null}

            {/* Indicador de polling automático activo */}
            {(estadoQr === "esperando" || estadoQr === "verificando") && (
              <View className="flex-row items-center mt-3 px-3 py-2 bg-brand-primary/5 rounded-full border border-brand-primary/10">
                <ActivityIndicator size="small" color="#E1007E" />
                <ThemedText className="text-brand-primary text-xs font-bold ml-2">
                  Verificando pago...
                </ThemedText>
              </View>
            )}

            {/* Botón de verificación manual (si no está confirmado/error) */}
            {qrData &&
              estadoQr !== "generando" &&
              estadoQr !== "idle" &&
              estadoQr !== "error" && (
                <TouchableOpacity
                  onPress={handleVerificarManual}
                  disabled={isVerifying}
                  className="mt-4 py-3 px-6 bg-surface-variant/20 rounded-xl border border-surface-variant"
                  accessibilityRole="button"
                  accessibilityLabel="Verificar pago manualmente"
                >
                  <ThemedText className="text-surface-dark font-bold text-sm">
                    Verificar ahora
                  </ThemedText>
                </TouchableOpacity>
              )}

            {/* Botón Cancelar siempre visible */}
            <TouchableOpacity
              onPress={handleClose}
              className="mt-4 py-2"
              accessibilityRole="button"
            >
              <ThemedText className="text-surface-dark/40 text-sm text-center">
                Cancelar
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface QrImageAreaProps {
  estadoQr: string;
  qrBase64: string | null;
  errorMsg: string | null;
  onReintentar: () => void;
}

function QrImageArea({
  estadoQr,
  qrBase64,
  errorMsg,
  onReintentar,
}: QrImageAreaProps) {
  if (estadoQr === "idle" || estadoQr === "generando") {
    return (
      <View style={styles.qrContainer}>
        <ActivityIndicator size="large" color="#E1007E" />
        <ThemedText className="text-surface-dark/30 text-xs mt-3 text-center">
          Generando código QR...
        </ThemedText>
      </View>
    );
  }

  if (estadoQr === "error") {
    return (
      <View style={styles.qrContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF5252" />
        <ThemedText className="text-status-error text-xs mt-2 text-center px-2">
          {errorMsg || "Error al generar el QR."}
        </ThemedText>
        <TouchableOpacity
          onPress={onReintentar}
          className="mt-3 px-5 py-2 bg-brand-primary rounded-xl"
          accessibilityRole="button"
          accessibilityLabel="Reintentar generación del QR"
        >
          <ThemedText className="text-white font-bold text-xs">
            REINTENTAR
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (estadoQr === "confirmado") {
    return (
      <View style={styles.qrContainer}>
        <Ionicons name="checkmark-circle" size={72} color="#14C270" />
      </View>
    );
  }

  if (qrBase64) {
    return (
      <View style={styles.qrContainer}>
        <Image
          source={{ uri: `data:image/png;base64,${qrBase64}` }}
          style={styles.qrImage}
          resizeMode="contain"
          accessibilityLabel="Código QR de pago"
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  qrContainer: {
    width: 220,
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EBE7EC",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
    overflow: "hidden",
  },
  qrImage: {
    width: 210,
    height: 210,
  },
});
