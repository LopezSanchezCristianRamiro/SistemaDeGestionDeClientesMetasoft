import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
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

export interface ProspectoFormProps {
  sistema: Sistema;
  onSuccess?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
}

interface FormState {
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  empresa: string;
  celular: string;
  correo: string;
  interes: "Bajo" | "Medio" | "Alto";
  tieneAdelanto: boolean;
  montoAdelanto: string;
}

export const ProspectoForm = memo(
  ({ sistema, onSuccess, showCloseButton, onClose }: ProspectoFormProps) => {
    const { registrarProspecto, loading: isSubmitting } = useProspectoForm();
    const [userId, setUserId] = useState<number | null>(null);

    const [form, setForm] = useState<FormState>({
      nombres: "",
      primerApellido: "",
      segundoApellido: "",
      empresa: "",
      celular: "",
      correo: "",
      interes: "Medio",
      tieneAdelanto: false,
      montoAdelanto: "",
    });

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
          if (scrollViewRef.current && montoInputRef.current) {
            scrollViewRef.current.scrollToFocusedInput?.(
              montoInputRef.current,
              Platform.OS === "android" ? 200 : 120,
              0,
            );
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [form.tieneAdelanto]);

    const resetForm = useCallback(() => {
      setForm({
        nombres: "",
        primerApellido: "",
        segundoApellido: "",
        empresa: "",
        celular: "",
        correo: "",
        interes: "Medio",
        tieneAdelanto: false,
        montoAdelanto: "",
      });
    }, []);

    const handleRegister = useCallback(async () => {
      if (!form.nombres || !form.celular) {
        Toast.show({
          type: "error",
          text1: "Atención",
          text2: "Complete los campos obligatorios (*)",
        });
        return;
      }

      const usuarioId = userId || 1;
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
        idUsuario: usuarioId,
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

    const updateForm = useCallback((updates: Partial<FormState>) => {
      setForm((prev) => ({ ...prev, ...updates }));
    }, []);

    return (
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        bounces={false}
        showsVerticalScrollIndicator={true}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === "android" ? 200 : 120}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
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
            label="Nombres"
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

          <ThemedText className="text-[10px] font-black uppercase text-surface-dark/40 mb-3 tracking-widest ml-1">
            Grado de Interés
          </ThemedText>
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

          <View className="flex-row justify-between items-center bg-surface-variant/10 p-5 rounded-xl mb-6 border border-surface-variant/20">
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
              onValueChange={(value) => updateForm({ tieneAdelanto: value })}
              trackColor={{ false: "#D1D5DB", true: "#E1007E" }}
              accessibilityLabel="Indicar si el prospecto dejó un adelanto"
            />
          </View>

          {form.tieneAdelanto && (
            <InputField
              ref={montoInputRef}
              label="Monto Recibido (Bs.)"
              required
              value={form.montoAdelanto}
              onChangeText={(text) => updateForm({ montoAdelanto: text })}
              keyboardType="numeric"
            />
          )}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isSubmitting}
            className="py-5 rounded-xl items-center mt-4 mb-10"
            style={isSubmitting ? styles.btnDisabled : styles.btnPrimary}
            accessibilityRole="button"
            accessibilityLabel="Registrar prospecto"
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText className="text-white font-bold text-lg">
                REGISTRAR PROSPECTO
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    );
  },
);

ProspectoForm.displayName = "ProspectoForm";

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
  /** Tab activo del selector de interés */
  tabSelected: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#1C1B1F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  /** Tab inactivo — fondo transparente explícito, nunca string vacío */
  tabDefault: {
    backgroundColor: "transparent",
  },
  /** Botón de registro en estado activo */
  btnPrimary: {
    backgroundColor: "#E1007E",
  },
  /** Botón de registro en estado deshabilitado */
  btnDisabled: {
    backgroundColor: "rgba(225, 0, 126, 0.5)",
  },
});
