import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: {
    tipoActividad: string;
    fechaHora: string;
    resultado: string;
    proximoPaso: string;
  }) => Promise<void>;
};

const TIPOS_ACTIVIDAD = ["Llamada", "Email", "Reunión", "Visita", "Otro"];

function formatFechaHora(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatFechaHoraApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = "00";

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export default function RegistrarPasoModal({
  visible,
  onClose,
  onSave,
}: Props) {
  const [tipoActividad, setTipoActividad] = useState("Llamada");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [resultado, setResultado] = useState("");
  const [proximoPaso, setProximoPaso] = useState("");
  const [saving, setSaving] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const fechaTexto = useMemo(
    () => formatFechaHora(fechaSeleccionada),
    [fechaSeleccionada],
  );

  const limpiarFormulario = () => {
    setTipoActividad("Llamada");
    setFechaSeleccionada(new Date());
    setResultado("");
    setProximoPaso("");
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const handleCancelar = () => {
    limpiarFormulario();
    onClose();
  };

  const handleGuardar = async () => {
    if (!resultado.trim()) return;

    try {
      setSaving(true);

      await onSave({
        tipoActividad,
        fechaHora: formatFechaHoraApi(fechaSeleccionada),
        resultado: resultado.trim(),
        proximoPaso: proximoPaso.trim(),
      });

      limpiarFormulario();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (!selectedDate) return;

    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );
    setFechaSeleccionada(nuevaFecha);

    if (Platform.OS !== "web") {
      setShowTimePicker(true);
    }
  };

  const onChangeTime = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(false);

    if (!selectedTime) return;

    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    setFechaSeleccionada(nuevaFecha);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancelar}>
      <View
        className="flex-1 items-center justify-center px-4"
        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      >
        <View
          className="w-full rounded-[28px] p-5"
          style={{ maxWidth: 560, backgroundColor: "#f7f4f8" }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <ThemedText className="text-[18px] font-extrabold text-[#2d2732]">
              Registrar Nuevo Paso
            </ThemedText>

            <Pressable onPress={handleCancelar}>
              <Ionicons name="close" size={22} color="#6f6875" />
            </Pressable>
          </View>

          <View className="flex-row gap-3">
            <View style={{ flex: 1 }}>
              <ThemedText className="mb-2 text-[11px] font-bold uppercase text-[#8d8590]">
                Tipo de actividad
              </ThemedText>

              <View
                className="overflow-hidden rounded-2xl"
                style={{
                  backgroundColor: "#efebef",
                  borderWidth: 1,
                  borderColor: "#e3dce3",
                  justifyContent: "center",
                  minHeight: 52,
                }}
              >
               <Picker
  selectedValue={tipoActividad}
  onValueChange={(value: string) => setTipoActividad(value)}
  style={{
    height: 52,
    color: "#2d2732",
  }}
  dropdownIconColor="#6f6875"
>
                  {TIPOS_ACTIVIDAD.map((tipo) => (
                    <Picker.Item key={tipo} label={tipo} value={tipo} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <ThemedText className="mb-2 text-[11px] font-bold uppercase text-[#8d8590]">
                Fecha y hora
              </ThemedText>

              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center justify-between rounded-2xl px-4"
                style={{
                  backgroundColor: "#efebef",
                  borderWidth: 1,
                  borderColor: "#e3dce3",
                  minHeight: 52,
                }}
              >
                <ThemedText className="text-[15px] text-[#2d2732]">
                  {fechaTexto}
                </ThemedText>

                <Ionicons name="calendar-outline" size={18} color="#6f6875" />
              </Pressable>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={fechaSeleccionada}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeDate}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={fechaSeleccionada}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeTime}
            />
          )}

          <View className="mt-4">
            <ThemedText className="mb-2 text-[11px] font-bold uppercase text-[#8d8590]">
              Resultado / Notas
            </ThemedText>

            <TextInput
              value={resultado}
              onChangeText={setResultado}
              placeholder="¿Qué ocurrió en esta interacción?"
              placeholderTextColor="#d4a7b8"
              multiline
              textAlignVertical="top"
              className="rounded-2xl px-4 py-4 text-[15px] text-[#2d2732]"
              style={{
                backgroundColor: "#efebef",
                borderWidth: 1,
                borderColor: "#e3dce3",
                minHeight: 110,
              }}
            />
          </View>

          <View className="mt-4">
            <ThemedText className="mb-2 text-[11px] font-bold uppercase text-[#8d8590]">
              Próximo paso definido
            </ThemedText>

            <TextInput
              value={proximoPaso}
              onChangeText={setProximoPaso}
              placeholder="Ej: Enviar cotización técnica"
              placeholderTextColor="#d4a7b8"
              className="rounded-2xl px-4 text-[15px] text-[#2d2732]"
              style={{
                backgroundColor: "#efebef",
                borderWidth: 1,
                borderColor: "#e3dce3",
                height: 52,
              }}
            />
          </View>

          <View className="mt-6 flex-row gap-3">
            <Pressable
              onPress={handleCancelar}
              className="flex-1 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#e7e1e7", height: 52 }}
            >
              <ThemedText className="font-bold text-[#4f57c8]">
                Cancelar
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handleGuardar}
              disabled={saving}
              className="flex-1 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: "#ea0088",
                height: 52,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText className="font-bold text-white">
                  Guardar Actividad
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}