/**
 * @file ProspectoForm.tsx
 * @description Formulario de captación de prospectos con soporte para
 *              selección de método de pago (QR / Efectivo) cuando el
 *              usuario activa el adelanto.
 *
 * Flujo de adelanto:
 *  1. Usuario activa el switch "¿Dejó Adelanto?".
 *  2. Aparece el campo "Monto Recibido (Bs.)" y el selector de método.
 *  3. Si elige "Por QR": aparece el botón "Generar QR".
 *     Al pulsarlo se abre <QrPagoModal>. Tras verificar el pago,
 *     el modal se cierra y se navega al flujo de impresión de recibo.
 *  4. Si elige "Efectivo": no se despliega ningún modal adicional;
 *     el registro procede directamente.
 *
 * Compatible tanto con la vista mobile (standalone) como con
 * la vista desktop (dentro de ProspectoModal, columna derecha).
 */

import { Ionicons } from "@expo/vector-icons";
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { getUsuarioId } from "../../../storage/storage";
import { useProspectoForm } from "../hooks/useProspectoForm";
import { ProspectoDTO } from "../types/prospecto";
import { Sistema } from "../types/sistema";
import { QrPagoModal } from "./QrPagoModal";

export interface ProspectoFormProps {
  sistema: Sistema;
  onSuccess?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
}

type MetodoPago = "efectivo" | "qr";
type NivelInteres = "Bajo" | "Medio" | "Alto";

interface FormState {
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  empresa: string;
  celular: string;
  correo: string;
  interes: NivelInteres;
  tieneAdelanto: boolean;
  montoAdelanto: string;
  metodoPago: MetodoPago;
}

const FORM_INICIAL: FormState = {
  nombres: "",
  primerApellido: "",
  segundoApellido: "",
  empresa: "",
  celular: "",
  correo: "",
  interes: "Medio",
  tieneAdelanto: false,
  montoAdelanto: "",
  metodoPago: "efectivo",
};

export const ProspectoForm = memo(
  ({ sistema, onSuccess, showCloseButton, onClose }: ProspectoFormProps) => {
    const { registrarProspecto, loading: isSubmitting } = useProspectoForm();

    const [userId, setUserId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(FORM_INICIAL);
    const [qrModalVisible, setQrModalVisible] = useState(false);

    const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
    const montoInputRef = useRef<TextInput>(null);

    useEffect(() => {
      getUsuarioId().then((id) => id && setUserId(parseInt(id, 10)));
    }, []);

    useEffect(() => {
      if (
        form.tieneAdelanto &&
        montoInputRef.current &&
        scrollViewRef.current
      ) {
        const timer = setTimeout(() => {
          scrollViewRef.current?.scrollToFocusedInput?.(
            montoInputRef.current as TextInput,
            Platform.OS === "android" ? 200 : 120,
            0,
          );
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [form.tieneAdelanto]);

    const isFormValid = useMemo(() => {
      if (!form.nombres.trim() || !form.celular.trim()) {
        return false;
      }

      if (form.tieneAdelanto && form.metodoPago === "qr") {
        const monto = parseFloat(form.montoAdelanto);
        if (isNaN(monto) || monto <= 0) {
          return false;
        }
      }

      return true;
    }, [form]);

    /**
     * Valida que los campos obligatorios estén completos.
     * @returns true si la validación pasa, false en caso contrario.
     */
    const validarCamposRequeridos = useCallback((): boolean => {
      if (!form.nombres.trim() || !form.celular.trim()) {
        Toast.show({
          type: "error",
          text1: "Atención",
          text2: "Ingrese el nombre y teléfono del prospecto",
        });
        return false;
      }
      return true;
    }, [form.nombres, form.celular]);
    /** Actualiza campos del formulario de forma inmutable. */
    const updateForm = useCallback((updates: Partial<FormState>) => {
      setForm((prev) => ({ ...prev, ...updates }));
    }, []);

    /** Resetea el formulario al estado inicial. */
    const resetForm = useCallback(() => setForm(FORM_INICIAL), []);

    /**
     * Valida y envía el prospecto al backend.
     * Si el método de pago es QR, delega la confirmación al QrPagoModal;
     * si es efectivo, registra directamente.
     */
    const handleRegister = useCallback(async () => {
      if (!validarCamposRequeridos()) {
        Toast.show({
          type: "error",
          text1: "Atención",
          text2: "Ingrese el nombre y teléfono del prospecto",
        });
        return;
      }

      if (form.tieneAdelanto && form.metodoPago === "qr") {
        const monto = parseFloat(form.montoAdelanto);
        if (isNaN(monto) || monto <= 0) {
          Toast.show({
            type: "error",
            text1: "Monto inválido",
            text2: "Ingrese un monto de adelanto mayor a cero",
          });
          return;
        }
        setQrModalVisible(true);
        return;
      }

      await enviarRegistro();
    }, [form, userId, sistema.id]);

    /**
     * Construye el DTO y llama al hook de registro.
     * Es invocado directamente (efectivo) o tras confirmar el QR.
     */
    const enviarRegistro = useCallback(async () => {
      const data: ProspectoDTO = {
        nombres: form.nombres,
        primerApellido: form.primerApellido,
        segundoApellido: form.segundoApellido,
        correoElectronico: form.correo,
        celular: form.celular,
        estadoInteres: form.interes,
        nombreEmpresa: form.empresa,
        adelanto: form.tieneAdelanto ? parseFloat(form.montoAdelanto) || 0 : 0,
        idSistemaRequerido: sistema.id,
        idUsuario: userId!,
      };

      const result = await registrarProspecto(data);

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Éxito",
          text2: "Prospecto registrado correctamente.",
        });
        const timer = setTimeout(() => {
          resetForm();
          onSuccess?.();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [form, userId, sistema.id, registrarProspecto, resetForm, onSuccess]);

    /**
     * Callback invocado por QrPagoModal cuando el pago es confirmado.
     * Cierra el modal de QR y procede con el registro + flujo de impresión.
     *
     * TODO: Aquí se añadirá la navegación al flujo de impresión del recibo
     *       en la siguiente iteración.
     */
    const handlePagoQrConfirmado = useCallback(async () => {
      setQrModalVisible(false);
      await enviarRegistro();
    }, [enviarRegistro]);

    return (
      <>
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          bounces={false}
          showsVerticalScrollIndicator={true}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={Platform.OS === "android" ? 20 : 120}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          resetScrollToCoords={{ x: 0, y: 0 }}
        >
          <View className="flex-1 bg-surface-container p-6">
            {/* Botón cerrar — solo visible si se indica */}
            {showCloseButton && onClose && (
              <TouchableOpacity
                onPress={onClose}
                className="mb-6 self-start"
                accessibilityRole="button"
                accessibilityLabel="Cerrar formulario"
              >
                <ThemedText className="text-status-error font-bold text-xs uppercase">
                  Cerrar
                </ThemedText>
              </TouchableOpacity>
            )}

            <ThemedText className="text-surface-dark font-black text-3xl mb-1">
              Registro
            </ThemedText>
            <ThemedText className="text-surface-dark/50 text-base mb-8">
              Captación de Prospecto Elite
            </ThemedText>

            {/* ── Campos básicos ─────────────────────────────────────────── */}

            <InputField
              label="Nombre Completo"
              required
              value={form.nombres}
              onChangeText={(text) => updateForm({ nombres: text })}
              placeholder="Ej: Carlos Alberto"
            />

            <InputField
              label="Empresa"
              value={form.empresa}
              onChangeText={(text) => updateForm({ empresa: text })}
              placeholder="Nombre de la institución"
            />

            <View className="flex-row gap-x-3">
              <View className="flex-1">
                <InputField
                  label="Celular"
                  required
                  value={form.celular}
                  onChangeText={(text) => updateForm({ celular: text })}
                  keyboardType="phone-pad"
                />
              </View>
              <View className="flex-1">
                <InputField
                  label="E-mail"
                  value={form.correo}
                  onChangeText={(text) => updateForm({ correo: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* ── Selector de interés ────────────────────────────────────── */}

            <SectionLabel>Grado de Interés</SectionLabel>
            <View className="flex-row bg-surface-variant/30 p-1.5 rounded-2xl mb-6">
              {(["Bajo", "Medio", "Alto"] as const).map((lvl) => {
                const isSelected = form.interes === lvl;
                return (
                  <TouchableOpacity
                    key={lvl}
                    onPress={() => updateForm({ interes: lvl })}
                    className="flex-1 py-3 rounded-xl items-center"
                    style={isSelected ? styles.tabSelected : styles.tabDefault}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <ThemedText
                      className="font-bold"
                      style={{ color: isSelected ? "#E1007E" : "#9CA3AF" }}
                    >
                      {lvl}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Switch de adelanto ─────────────────────────────────────── */}

            <View className="flex-row justify-between items-center bg-surface-variant/10 p-5 rounded-xl mb-4 border border-surface-variant/20">
              <View>
                <ThemedText className="font-bold text-surface-dark text-lg">
                  ¿Dejó Adelanto?
                </ThemedText>
                <ThemedText className="text-surface-dark/40 text-xs">
                  Marcar si hubo reserva monetaria
                </ThemedText>
              </View>
              <Switch
                value={form.tieneAdelanto}
                onValueChange={(value) =>
                  updateForm({ tieneAdelanto: value, metodoPago: "efectivo" })
                }
                trackColor={{ false: "#D1D5DB", true: "#E1007E" }}
                accessibilityLabel="Indicar si el prospecto dejó un adelanto"
              />
            </View>

            {/* ── Sección condicional de adelanto ───────────────────────── */}

            {form.tieneAdelanto && (
              <View className="bg-surface-variant/10 rounded-xl border border-surface-variant/20 p-4 mb-6">
                {/* Campo de monto */}
                <InputField
                  ref={montoInputRef}
                  label="Monto Recibido (Bs.)"
                  required
                  value={form.montoAdelanto}
                  onChangeText={(text) => updateForm({ montoAdelanto: text })}
                  keyboardType="numeric"
                />

                {/* Selector de método de pago */}
                <SectionLabel>Método de Pago</SectionLabel>
                <MetodoPagoSelector
                  metodoActual={form.metodoPago}
                  onChange={(metodo) => updateForm({ metodoPago: metodo })}
                />

                {/* Botón "Generar QR" — solo visible cuando se elige QR */}
                {form.metodoPago === "qr" && (
                  <TouchableOpacity
                    onPress={() => {
                      if (!validarCamposRequeridos()) return;

                      const monto = parseFloat(form.montoAdelanto);
                      if (isNaN(monto) || monto <= 0) {
                        Toast.show({
                          type: "error",
                          text1: "Monto inválido",
                          text2: "Ingrese un monto de adelanto mayor a cero",
                        });
                        return;
                      }

                      setQrModalVisible(true);
                    }}
                    className={`mt-4 py-4 rounded-xl flex-row items-center justify-center border-2 ${
                      isFormValid ? "border-brand-primary" : "border-gray-400"
                    }`}
                    accessibilityRole="button"
                    accessibilityLabel="Generar código QR de pago"
                  >
                    <Ionicons
                      name="qr-code-outline"
                      size={20}
                      color={isFormValid ? "#E1007E" : "#9CA3AF"}
                    />
                    <ThemedText
                      className={`font-bold text-base ml-2 ${
                        isFormValid ? "text-brand-primary" : "text-gray-400"
                      }`}
                    >
                      GENERAR QR
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ── Botón de registro ──────────────────────────────────────── */}

            <TouchableOpacity
              onPress={handleRegister}
              disabled={isSubmitting}
              className="py-5 rounded-xl items-center mt-4 mb-10"
              style={
                !isFormValid || isSubmitting
                  ? styles.btnDisabled
                  : styles.btnPrimary
              }
              accessibilityRole="button"
              accessibilityLabel="Registrar prospecto"
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText className="text-white font-bold text-lg">
                  {form.tieneAdelanto && form.metodoPago === "qr"
                    ? "GENERAR QR Y REGISTRAR"
                    : "REGISTRAR PROSPECTO"}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>

        {/* Modal de QR — renderizado fuera del scroll para evitar clipping */}
        <QrPagoModal
          visible={qrModalVisible}
          monto={parseFloat(form.montoAdelanto) || 0}
          sistemaNombre={sistema.nombre}
          onClose={() => setQrModalVisible(false)}
          onPagoConfirmado={handlePagoQrConfirmado}
        />
      </>
    );
  },
);

ProspectoForm.displayName = "ProspectoForm";

/**
 * Etiqueta de sección reutilizable con el estilo uppercase de la app.
 */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <ThemedText className="text-[10px] font-black uppercase text-surface-dark/40 mb-3 tracking-widest ml-1">
      {children}
    </ThemedText>
  );
}

/**
 * Selector visual de dos opciones: Efectivo / Por QR.
 * Sigue el mismo patrón de tab que el selector de interés.
 */
interface MetodoPagoSelectorProps {
  metodoActual: MetodoPago;
  onChange: (metodo: MetodoPago) => void;
}

function MetodoPagoSelector({
  metodoActual,
  onChange,
}: MetodoPagoSelectorProps) {
  const opciones: {
    value: MetodoPago;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { value: "efectivo", label: "Efectivo", icon: "cash-outline" },
    { value: "qr", label: "Por QR", icon: "qr-code-outline" },
  ];

  return (
    <View className="flex-row bg-surface-variant/20 p-1.5 rounded-2xl mb-2">
      {opciones.map(({ value, label, icon }) => {
        const isSelected = metodoActual === value;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => onChange(value)}
            className="flex-1 py-3 rounded-xl flex-row items-center justify-center gap-x-2"
            style={isSelected ? styles.tabSelected : styles.tabDefault}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={`Método de pago: ${label}`}
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
  );
}

/**
 * Campo de texto genérico con etiqueta y soporte para ref externo.
 * Usado tanto en este formulario como dentro del ProspectoModal.
 */
interface InputFieldProps extends React.ComponentProps<typeof TextInput> {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
}

const InputField = forwardRef<TextInput, InputFieldProps>(
  ({ label, required, value, onChangeText, ...props }, ref) => (
    <View className="mb-5">
      <View className="flex-row mb-2 ml-1">
        <ThemedText className="text-[10px] font-black uppercase text-surface-dark/40 tracking-widest">
          {label}
        </ThemedText>
        {required && (
          <ThemedText className="text-brand-primary ml-1">*</ThemedText>
        )}
      </View>
      <TextInput
        ref={ref}
        className="bg-surface-variant/10 p-4 rounded-xl border border-surface-variant/20 text-surface-dark text-base font-medium"
        placeholderTextColor="#A1A1AA"
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    </View>
  ),
);

InputField.displayName = "InputField";

const styles = StyleSheet.create({
  /** Tab activo — sombra no soportada por NativeWind */
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
  btnDisabled: {
    backgroundColor: "rgba(225, 0, 126, 0.5)",
  },
});
