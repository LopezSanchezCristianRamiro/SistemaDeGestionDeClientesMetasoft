import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Sistema } from "../types/sistema";

interface Props {
  visible: boolean;
  onClose: () => void;
  sistema: Sistema | null;
}

export function SistemaDetalleModal({ visible, onClose, sistema }: Props) {
  if (!sistema) return null;

  const IMAGE_HEIGHT = 224;
  const lineasDescripcion = sistema.descripcion.split(";");

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/70 justify-center items-center p-4">
        <View className="w-full max-w-md bg-white rounded-2xl overflow-hidden">
          <View className="flex-row justify-between items-center p-4 border-b border-surface-variant/20">
            <ThemedText className="text-xl font-bold text-surface-dark">
              {sistema.nombre}
            </ThemedText>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                height: IMAGE_HEIGHT,
                width: "100%",
                position: "relative",
              }}
            >
              <LinearGradient
                colors={["#6b21a8", "#c026d3", "#f43f5e"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Image
                source={{ uri: sistema.foto_url }}
                style={{ width: "100%", height: IMAGE_HEIGHT }}
                contentFit="cover"
                cachePolicy="disk"
                transition={300}
              />
            </View>

            <View className="p-5">
              <ThemedText className="text-lg font-semibold mb-3 text-surface-dark">
                Descripción
              </ThemedText>

              {lineasDescripcion.map((linea, idx) => (
                <View key={idx} className="flex-row mb-2 items-start">
                  <ThemedText className="text-brand-primary mr-2 font-bold">
                    •
                  </ThemedText>
                  <ThemedText className="text-surface-dark/70 flex-1 leading-5">
                    {linea.trim()}
                  </ThemedText>
                </View>
              ))}

              <View className="mt-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <ThemedText className="text-[10px] font-black uppercase text-zinc-400 mb-1 tracking-widest">
                  Inversión del Sistema
                </ThemedText>
                <ThemedText className="text-2xl font-black text-brand-primary">
                  Bs. {sistema.precio.toLocaleString()}
                </ThemedText>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
