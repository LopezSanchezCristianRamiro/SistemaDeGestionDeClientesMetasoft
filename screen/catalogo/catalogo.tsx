import { Toaster } from "@/components/Toaster";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { useResponsive } from "../../hooks/useResponsive";
import { getUsuarioId } from "../../storage/storage";
import { ProspectoModal } from "./components/ProspectoModal";
import { SistemaCard } from "./components/SistemaCard";
import { SistemaDetalleModal } from "./components/SistemaDetalleModal";
import { useProspectoForm } from "./hooks/useProspectoForm";
import { useSistemas } from "./hooks/useSistemas";
import { ProspectoDTO } from "./types/prospecto";
import { Sistema } from "./types/sistema";

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

export function CatalogoScreen() {
  const { sistemas, loading, refresh } = useSistemas();
  const { isDesktop } = useResponsive();
  const { registrarProspecto, loading: isSubmitting } = useProspectoForm();

  const [selectedSistema, setSelectedSistema] = React.useState<Sistema | null>(
    null,
  );
  const [modalVisible, setModalVisible] = React.useState(false);
  const [detailModalVisible, setDetailModalVisible] = React.useState(false);
  const [userId, setUserId] = React.useState<number | null>(null);

  const [form, setForm] = React.useState<FormState>({
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

  React.useEffect(() => {
    getUsuarioId().then((id) => id && setUserId(parseInt(id, 10)));
  }, []);

  const handleSelectSistema = (id: number) => {
    const sistema = sistemas.find((s) => s.id === id);
    if (sistema) {
      setSelectedSistema(sistema);
      if (isDesktop) setModalVisible(true);
    }
  };

  const handleOpenDetailModal = () => {
    if (selectedSistema) setDetailModalVisible(true);
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

  const handleRegister = async () => {
    if (!selectedSistema) {
      Toast.show({
        type: "error",
        text1: "Atención",
        text2: "Seleccione un sistema primero",
      });
      return;
    }
    if (!form.nombres || !form.celular) {
      Toast.show({
        type: "error",
        text1: "Atención",
        text2: "Complete los campos obligatorios (*)",
      });
      return;
    }

    const data: ProspectoDTO = {
      nombres: form.nombres,
      primerApellido: form.primerApellido,
      segundoApellido: form.segundoApellido,
      correoElectronico: form.correo,
      celular: form.celular,
      estadoInteres: form.interes,
      nombreEmpresa: form.empresa,
      adelanto: form.tieneAdelanto ? parseFloat(form.montoAdelanto) || 0 : 0,
      idSistemaRequerido: selectedSistema.id,
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
        setSelectedSistema(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  };

  React.useEffect(() => {
    if (form.tieneAdelanto && montoInputRef.current && scrollViewRef.current) {
      const timer = setTimeout(() => {}, 150);
      return () => clearTimeout(timer);
    }
  }, [form.tieneAdelanto]);

  // ─── Layout Desktop ───────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <View className="flex-1 bg-surface">
        <View className="pt-10 pb-5 px-6 border-b border-surface-variant/20">
          <ThemedText className="text-brand-primary font-bold text-3xl tracking-tight">
            Metasoft Bolivia
          </ThemedText>
          <ThemedText className="text-surface-dark/50 font-medium text-base">
            FEXCO 2026 • Event Mode
          </ThemedText>
        </View>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 10, paddingBottom: 50 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor="#E1007E"
            />
          }
        >
          {loading && sistemas.length === 0 ? (
            <View className="items-center">
              <ActivityIndicator
                size="large"
                color="#E1007E"
                className="mt-20"
              />
            </View>
          ) : (
            <View className="w-full flex-row flex-wrap justify-center gap-1">
              {sistemas.map((item) => (
                <SistemaCard
                  key={item.id}
                  sistema={item}
                  onPress={handleSelectSistema}
                />
              ))}
              {Array.from({ length: 4 }).map((_, i) => (
                <View
                  key={i}
                  className="flex-1 min-w-[260px] max-w-[450px] mx-1"
                  style={{ height: 0 }}
                />
              ))}
            </View>
          )}
          {!loading && sistemas.length === 0 && (
            <View className="mt-20 items-center px-10">
              <ThemedText className="text-surface-dark/40 italic">
                No hay sistemas registrados.
              </ThemedText>
            </View>
          )}
        </ScrollView>
        <ProspectoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          sistema={selectedSistema}
        />
        <Toaster />
      </View>
    );
  }

  // ─── Layout Mobile ────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-surface">
      <View className="pt-14 pb-3 px-4 border-b border-surface-variant/20">
        <ThemedText className="text-brand-primary font-bold text-2xl">
          Metasoft Bolivia
        </ThemedText>
        <ThemedText className="text-surface-dark/50 text-sm">
          FEXCO 2026 • Event Mode
        </ThemedText>
      </View>

      <View className="py-3">
        <ThemedText className="px-4 text-sm font-semibold text-surface-dark mb-2">
          Selecciona un sistema
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          style={{ height: 240 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor="#E1007E"
            />
          }
        >
          {loading && sistemas.length === 0 ? (
            <View className="w-40 h-40 items-center justify-center">
              <ActivityIndicator color="#E1007E" />
            </View>
          ) : (
            sistemas.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedSistema(item)}
                className="mr-3 rounded-xl overflow-hidden border-2"
                style={
                  selectedSistema?.id === item.id
                    ? styles.cardSelected
                    : styles.cardDefault
                }
              >
                <SistemaCard
                  sistema={item}
                  onPress={() => setSelectedSistema(item)}
                />
              </TouchableOpacity>
            ))
          )}
          {!loading && sistemas.length === 0 && (
            <View className="py-4 px-4">
              <ThemedText className="text-surface-dark/40">
                No hay sistemas
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 100 : 80,
        }}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === "android" ? 20 : 60}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <TouchableOpacity
          onPress={handleOpenDetailModal}
          className="bg-surface-container p-4 rounded-xl border border-surface-variant mb-4 flex-row justify-between items-center"
          disabled={!selectedSistema}
        >
          <ThemedText className="text-surface-dark">
            {selectedSistema
              ? `Sistema: ${selectedSistema.nombre}`
              : "Seleccione un sistema de la lista"}
          </ThemedText>
          <ThemedText className="text-brand-primary text-xs font-bold">
            VER DETALLES
          </ThemedText>
        </TouchableOpacity>

        <InputField
          label="Nombres"
          required
          value={form.nombres}
          onChangeText={(text) => setForm({ ...form, nombres: text })}
          placeholder="Ej: Carlos Alberto"
        />

        <InputField
          label="Empresa"
          value={form.empresa}
          onChangeText={(text) => setForm({ ...form, empresa: text })}
          placeholder="Nombre de la institución"
        />
        <View className="flex-row gap-x-3">
          <View className="flex-1">
            <InputField
              label="Celular"
              required
              value={form.celular}
              onChangeText={(text) => setForm({ ...form, celular: text })}
              keyboardType="phone-pad"
            />
          </View>
          <View className="flex-1">
            <InputField
              label="E-mail"
              value={form.correo}
              onChangeText={(text) => setForm({ ...form, correo: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <ThemedText className="text-[10px] font-black uppercase text-zinc-400 mb-3 tracking-widest ml-1">
          Grado de Interés
        </ThemedText>
        <View className="flex-row bg-zinc-100 p-1.5 rounded-2xl mb-4">
          {(["Bajo", "Medio", "Alto"] as const).map((lvl) => {
            const isSelected = form.interes === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                onPress={() => setForm({ ...form, interes: lvl })}
                className="flex-1 py-3 rounded-xl items-center"
                style={isSelected ? styles.tabSelected : styles.tabDefault}
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

        <View className="flex-row justify-between items-center bg-zinc-50 p-4 rounded-xl mb-4 border border-zinc-100">
          <View>
            <ThemedText className="font-bold text-zinc-800 text-base">
              ¿Dejó Adelanto?
            </ThemedText>
            <ThemedText className="text-zinc-400 text-xs">
              Marcar si hubo reserva
            </ThemedText>
          </View>
          <Switch
            value={form.tieneAdelanto}
            onValueChange={(v) => setForm({ ...form, tieneAdelanto: v })}
            trackColor={{ false: "#D1D5DB", true: "#E1007E" }}
          />
        </View>

        {form.tieneAdelanto && (
          <View className="mb-4">
            <InputField
              ref={montoInputRef}
              label="Monto Recibido (Bs.)"
              required
              value={form.montoAdelanto}
              onChangeText={(text) => setForm({ ...form, montoAdelanto: text })}
              keyboardType="numeric"
            />
          </View>
        )}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={isSubmitting || !selectedSistema}
          className="py-4 rounded-xl items-center mb-6"
          style={selectedSistema ? styles.btnPrimary : styles.btnDisabled}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText className="text-white font-bold text-lg">
              REGISTRAR PROSPECTO
            </ThemedText>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      <SistemaDetalleModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        sistema={selectedSistema}
      />
    </View>
  );
}

// ─── InputField ───────────────────────────────────────────────────────────────
interface InputFieldProps extends React.ComponentProps<typeof TextInput> {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
}

const InputField = React.forwardRef<TextInput, InputFieldProps>(
  ({ label, required, value, onChangeText, ...props }, ref) => (
    <View className="mb-4">
      <View className="flex-row mb-1 ml-1">
        <ThemedText className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
          {label}
        </ThemedText>
        <ThemedText
          className={`ml-1 ${required ? "text-brand-primary" : "opacity-0"}`}
        >
          *
        </ThemedText>
      </View>
      <TextInput
        ref={ref}
        className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-zinc-900 text-base"
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
  cardSelected: {
    borderColor: "#E1007E",
  },
  cardDefault: {
    borderColor: "transparent",
  },
  btnPrimary: {
    backgroundColor: "#E1007E",
  },
  btnDisabled: {
    backgroundColor: "#D1D5DB",
  },
});
