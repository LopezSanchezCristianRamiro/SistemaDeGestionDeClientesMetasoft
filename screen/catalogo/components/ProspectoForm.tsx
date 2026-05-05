/**
 * @file ProspectoForm.tsx
 * @description Formulario de captación de prospectos con soporte para
 *              selección de método de pago (QR / Efectivo) cuando el
 *              usuario activa el adelanto.
 *

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
import { CountryPicker } from "react-native-country-codes-picker";
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
  countryCode: string;
  numeroCelular: string;
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
  countryCode: "591",
  numeroCelular: "",
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
    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerKey, setPickerKey] = useState(0);
    const montoInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const isValidEmail = (email: string): boolean => {
      if (!email.trim()) return true; // vacío es válido porque no es obligatorio
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    useEffect(() => {
      getUsuarioId().then((id) => id && setUserId(parseInt(id, 10)));
    }, []);
    useEffect(() => {
      if (form.correo.trim() && !isValidEmail(form.correo)) {
        setEmailError("Formato de correo inválido");
      } else {
        setEmailError(null);
      }
    }, [form.correo]);

    const isFormValid = useMemo(() => {
      if (!form.nombres.trim() || !form.numeroCelular.trim()) return false;
      if (form.correo.trim() && !isValidEmail(form.correo)) {
        return false;
      }

      const onlyDigits = /^\d+$/;
      if (
        !onlyDigits.test(form.numeroCelular.trim()) ||
        form.numeroCelular.trim().length < 7
      ) {
        return false;
      }
      if (form.tieneAdelanto) {
        const monto = parseFloat(form.montoAdelanto);
        if (isNaN(monto) || monto <= 0) return false;
      }
      return true;
    }, [form]);

    /** Valida campos obligatorios y muestra toast si faltan. */
    const validarCamposRequeridos = useCallback((): boolean => {
      if (!form.nombres.trim() || !form.numeroCelular.trim()) {
        Toast.show({
          type: "error",
          text1: "Atención",
          text2: "Ingrese el nombre y teléfono del prospecto",
        });
        return false;
      }
      return true;
    }, [form.nombres, form.numeroCelular]);

    const updateForm = useCallback((updates: Partial<FormState>) => {
      setForm((prev) => ({ ...prev, ...updates }));
    }, []);

    const resetForm = useCallback(() => setForm(FORM_INICIAL), []);

    const handleRegister = useCallback(async () => {
      if (!validarCamposRequeridos()) return;
      if (form.correo.trim() && !isValidEmail(form.correo)) {
        Toast.show({
          type: "error",
          text1: "Correo inválido",
          text2: "Ingrese un correo electrónico válido",
        });
        return;
      }

      if (form.tieneAdelanto) {
        const monto = parseFloat(form.montoAdelanto);
        if (isNaN(monto) || monto <= 0) {
          Toast.show({
            type: "error",
            text1: "Monto inválido",
            text2: "Ingrese un monto de adelanto mayor a cero",
          });
          return;
        }
        if (form.metodoPago === "qr") {
          setQrModalVisible(true);
          return;
        }
      }
      await enviarRegistro();
    }, [form, userId, sistema.id]);

    const enviarRegistro = useCallback(async () => {
      const data: ProspectoDTO = {
        nombres: form.nombres,
        primerApellido: form.primerApellido,
        segundoApellido: form.segundoApellido,
        correoElectronico: form.correo,
        celular: `${form.countryCode}${form.numeroCelular.trim()}`,
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

    const handlePagoQrConfirmado = useCallback(async () => {
      setQrModalVisible(false);
      await enviarRegistro();
    }, [enviarRegistro]);

    return (
      <>
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === "android" ? 80 : 30}
          extraHeight={120}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          enableAutomaticScroll={true}
          resetScrollToCoords={{ x: 0, y: 0 }}
        >
          <View className="flex-1 bg-surface-container p-6">
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

            {/* ───── Sección Teléfono ───── */}
            <ThemedText className="text-[10px] font-black uppercase text-surface-dark/40 mb-3 tracking-widest ml-1">
              Teléfono
            </ThemedText>
            <View className="flex-row items-start mb-5">
              {/* Botón selector (ya sin el CountryPicker dentro) */}
              <TouchableOpacity
                onPress={() => {
                  setPickerKey((prev) => prev + 1);
                  setPickerVisible(true);
                }}
                className="flex-row items-center bg-surface-variant/10 border border-surface-variant/20 rounded-xl px-4 py-3 mr-2"
                accessibilityRole="button"
                accessibilityLabel={`Prefijo +${form.countryCode}`}
              >
                <ThemedText className="text-surface-dark font-semibold text-base">
                  +{form.countryCode}
                </ThemedText>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color="#9CA3AF"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>

              {/* Número local */}
              <View className="flex-1">
                <TextInput
                  className="bg-surface-variant/10 p-4 rounded-xl border border-surface-variant/20 text-surface-dark text-base font-medium"
                  placeholder="Número de celular"
                  placeholderTextColor="#A1A1AA"
                  value={form.numeroCelular}
                  onChangeText={(text) => updateForm({ numeroCelular: text })}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
            </View>

            {/* CountryPicker fuera del botón */}
            <CountryPicker
              key={pickerKey}
              show={pickerVisible}
              pickerButtonOnPress={(item) => {
                const cleanCode = item.dial_code.replace("+", "");
                updateForm({ countryCode: cleanCode });
                setPickerVisible(false);
              }}
              onBackdropPress={() => setPickerVisible(false)}
              lang="es"
              initialState={""}
              style={{
                modal: {
                  height: 450,
                  width: "100%",
                  maxWidth: 500,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 24,
                  alignSelf: "center",
                },
                textInput: {
                  height: 50,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  backgroundColor: "#F7F2F8",
                  fontFamily: "Manrope_500Medium",
                },
                countryName: { fontFamily: "Manrope_500Medium" },
                dialCode: { fontFamily: "Manrope_700Bold" },
                // ✅ La clave: forzar la fuente del sistema para que el emoji de la bandera se renderice
                flag: {
                  fontFamily: Platform.OS === "web" ? "system-ui" : undefined,
                  fontSize: 20,
                },
                countryButtonStyles: {
                  height: 56,
                  paddingHorizontal: 16,
                },
              }}
            />

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

            {form.tieneAdelanto && (
              <View className="bg-white rounded-xl border border-white  p-4 mb-6">
                <InputField
                  ref={montoInputRef}
                  label="Monto Recibido (Bs.)"
                  required
                  value={form.montoAdelanto}
                  onChangeText={(text) => updateForm({ montoAdelanto: text })}
                  keyboardType="numeric"
                />
                <SectionLabel>Método de Pago</SectionLabel>
                <MetodoPagoSelector
                  metodoActual={form.metodoPago}
                  onChange={(metodo) => updateForm({ metodoPago: metodo })}
                />
                {/*
                {form.metodoPago === "qr" && (
                  <TouchableOpacity
                    onPress={handleRegister}
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
                )}*/}
              </View>
            )}

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <ThemedText className="text-[10px] font-black uppercase text-surface-dark/40 mb-3 tracking-widest ml-1">
      {children}
    </ThemedText>
  );
}

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

interface InputFieldProps extends React.ComponentProps<typeof TextInput> {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
}

const InputField = forwardRef<TextInput, InputFieldProps>(
  ({ label, required, value, onChangeText, error, ...props }, ref) => (
    <View className="mb-5">
      <View className="flex-row mb-2 ml-1 min-h-5">
        <ThemedText className="text-[10px] font-black uppercase text-surface-dark/40 tracking-widest">
          {label}
        </ThemedText>
        {required && (
          <ThemedText className="text-brand-primary ml-1">*</ThemedText>
        )}
      </View>
      <TextInput
        ref={ref}
        className={`bg-surface-variant/10 p-4 rounded-xl border text-surface-dark text-base font-medium ${
          error ? "border-status-error" : "border-surface-variant/20"
        }`}
        placeholderTextColor="#A1A1AA"
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
      {error && (
        <ThemedText className="text-status-error text-xs mt-1 ml-1">
          {error}
        </ThemedText>
      )}
    </View>
  ),
);
InputField.displayName = "InputField";

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
  btnDisabled: {
    backgroundColor: "rgba(225, 0, 126, 0.5)",
  },
});
