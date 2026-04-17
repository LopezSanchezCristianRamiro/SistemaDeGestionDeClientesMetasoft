import { Toaster } from "@/components/Toaster";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { getUsuarioId } from "../../../storage/storage";
import { useProspectoForm } from "../hooks/useProspectoForm";
import { ProspectoDTO } from "../types/prospecto";
import { Sistema } from "../types/sistema";

interface Props {
  visible: boolean;
  onClose: () => void;
  sistema: Sistema | null;
}

export function ProspectoModal({ visible, onClose, sistema }: Props) {
  const { registrarProspecto, loading: isSubmitting } = useProspectoForm();
  const [userId, setUserId] = useState<number | null>(null);

  const [form, setForm] = useState({
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    empresa: "",
    celular: "",
    correo: "",
    interes: "Medio" as "Bajo" | "Medio" | "Alto",
    tieneAdelanto: false,
    montoAdelanto: "",
  });

  useEffect(() => {
    if (visible) {
      getUsuarioId().then((id) => id && setUserId(parseInt(id, 10)));
    }
  }, [visible]);

  const handleRegister = async () => {
    if (!sistema) return;
    if (!form.nombres || !form.primerApellido || !form.celular) {
      Toast.show({
        type: "error",
        text1: "Atención",
        text2: "Por favor completa los campos obligatorios (*)",
        position: "top",
        topOffset: 60,
        visibilityTime: 9000,
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
    console.log("Datos a registrar:", data);
    const result = await registrarProspecto(data);
    if (result.success) {
      Alert.alert("Éxito", "Prospecto registrado correctamente.");
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
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
  };

  if (!sistema) return null;

  const lineasDescripcion = sistema.descripcion.split(";");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/80 justify-center items-center">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="w-[95%] md:w-[90%] max-w-[1050px] bg-white rounded-[32px] overflow-hidden shadow-2xl"
          style={{ maxHeight: Dimensions.get("window").height * 0.95 }}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="flex-1 flex-col md:flex-row">
              <View className="w-full md:w-5/12 bg-zinc-900 p-6 md:p-10">
                <TouchableOpacity onPress={onClose} className="mb-6 self-start">
                  <ThemedText className="text-red-700 font-bold text-xs">
                    CERRAR
                  </ThemedText>
                </TouchableOpacity>

                <ThemedText className="text-brand-primary text-3xl font-black mb-6 uppercase">
                  {sistema.nombre}
                </ThemedText>

                <View className="w-full aspect-square rounded-2xl overflow-hidden mb-6 border border-white/5 relative">
                  <View className="absolute inset-0 bg-gradient-to-br from-fuchsia-600 to-rose-500 opacity-50" />
                  <Image
                    source={{ uri: sistema.foto_url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute top-0 right-0 p-3">
                    <View className="bg-brand-primary/20 px-3 py-1 rounded-full border border-brand-primary/30">
                      <ThemedText className="text-brand-primary text-[10px] font-bold">
                        DISPONIBLE
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View className="mb-8">
                  {lineasDescripcion.map((linea, index) => (
                    <View key={index} className="flex-row mb-2">
                      <ThemedText className="text-brand-primary mr-2">
                        •
                      </ThemedText>
                      <ThemedText className="text-zinc-400 text-sm flex-1 leading-5 font-medium">
                        {linea.trim()}
                      </ThemedText>
                    </View>
                  ))}
                </View>

                <View className="bg-zinc-800 border border-white/5 p-5 rounded-2xl">
                  <ThemedText className="text-white/50 text-[10px] font-bold uppercase mb-1">
                    Inversión del Sistema
                  </ThemedText>
                  <ThemedText className="text-brand-primary font-black text-3xl">
                    Bs. {sistema.precio.toLocaleString()}
                  </ThemedText>
                </View>
              </View>

              <View className="flex-1 p-6 md:p-12 bg-white">
                <ThemedText className="text-zinc-900 font-black text-3xl mb-1">
                  Registro
                </ThemedText>
                <ThemedText className="text-zinc-400 text-base mb-8">
                  Captación de Prospecto Elite
                </ThemedText>

                <InputField
                  label="Nombres"
                  required
                  value={form.nombres}
                  onChangeText={(t: string) => setForm({ ...form, nombres: t })}
                  placeholder="Ej: Carlos Alberto"
                />

                <View className="flex-row gap-x-3">
                  <View className="flex-1">
                    <InputField
                      label="1er Apellido"
                      required
                      value={form.primerApellido}
                      onChangeText={(t: string) =>
                        setForm({ ...form, primerApellido: t })
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <InputField
                      label="2do Apellido"
                      value={form.segundoApellido}
                      onChangeText={(t: string) =>
                        setForm({ ...form, segundoApellido: t })
                      }
                    />
                  </View>
                </View>

                <InputField
                  label="Empresa"
                  value={form.empresa}
                  onChangeText={(t: string) => setForm({ ...form, empresa: t })}
                  placeholder="Nombre de la institución"
                />

                <View className="flex-row gap-x-3">
                  <View className="flex-1">
                    <InputField
                      label="Celular"
                      required
                      value={form.celular}
                      onChangeText={(t: string) =>
                        setForm({ ...form, celular: t })
                      }
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View className="flex-1">
                    <InputField
                      label="E-mail"
                      required
                      value={form.correo}
                      onChangeText={(t: string) =>
                        setForm({ ...form, correo: t })
                      }
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <ThemedText className="text-[10px] font-black uppercase text-zinc-400 mb-3 tracking-widest ml-1">
                  Grado de Interés
                </ThemedText>
                <View className="flex-row bg-zinc-100 p-1.5 rounded-2xl mb-8">
                  {(["Bajo", "Medio", "Alto"] as const).map((lvl) => (
                    <TouchableOpacity
                      key={lvl}
                      onPress={() => setForm({ ...form, interes: lvl })}
                      className={`flex-1 py-4 rounded-xl items-center ${form.interes === lvl ? "bg-white shadow-sm" : ""}`}
                    >
                      <ThemedText
                        className={`font-bold ${form.interes === lvl ? "text-brand-primary" : "text-zinc-400"}`}
                      >
                        {lvl}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="flex-row justify-between items-center bg-zinc-50 p-5 rounded-[24px] mb-6 border border-zinc-100">
                  <View>
                    <ThemedText className="font-bold text-zinc-800 text-lg">
                      ¿Dejó Adelanto?
                    </ThemedText>
                    <ThemedText className="text-zinc-400 text-xs">
                      Marcar si hubo reserva monetaria
                    </ThemedText>
                  </View>
                  <Switch
                    value={form.tieneAdelanto}
                    onValueChange={(v: boolean) =>
                      setForm({ ...form, tieneAdelanto: v })
                    }
                    trackColor={{ false: "#D1D5DB", true: "#E1007E" }}
                  />
                </View>

                {form.tieneAdelanto && (
                  <View className="animate-in fade-in duration-300">
                    <InputField
                      label="Monto Recibido (Bs.)"
                      required
                      value={form.montoAdelanto}
                      onChangeText={(t: string) =>
                        setForm({ ...form, montoAdelanto: t })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={isSubmitting}
                  className="bg-brand-primary py-5 rounded-2xl items-center shadow-lg shadow-brand-primary/40 mt-2 mb-10"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <ThemedText className="text-white font-black text-lg">
                      REGISTRAR PROSPECTO
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <Toaster />
    </Modal>
  );
}

function InputField({ label, required, value, onChangeText, ...props }: any) {
  return (
    <View className="mb-5">
      <View className="flex-row mb-2 ml-1">
        <ThemedText className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
          {label}
        </ThemedText>
        {required && (
          <ThemedText className="text-brand-primary ml-1">*</ThemedText>
        )}
      </View>
      <TextInput
        className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-zinc-900 text-base font-medium"
        placeholderTextColor="#A1A1AA"
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    </View>
  );
}
