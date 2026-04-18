import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Sistema } from "../types/sistema";

interface Props {
  visible: boolean;
  onClose: () => void;
  sistema: Sistema | null;
}

export function SistemaDetalleModal({ visible, onClose, sistema }: Props) {
  if (!sistema) return null;

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
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="red" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View>
              <LinearGradient
                colors={["#6b21a8", "#c026d3", "#f43f5e"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <Image
                source={{ uri: sistema.foto_url }}
                className="w-full h-56"
                resizeMode="cover"
              />
            </View>
            <View className="p-5">
              <ThemedText className="text-lg font-semibold mb-2">
                Descripción
              </ThemedText>
              {lineasDescripcion.map((linea, idx) => (
                <View key={idx} className="flex-row mb-2">
                  <ThemedText className="text-brand-primary mr-2">•</ThemedText>
                  <ThemedText className="text-surface-dark/70 flex-1">
                    {linea.trim()}
                  </ThemedText>
                </View>
              ))}

              <View className="mt-4 p-4 bg-surface rounded-xl">
                <ThemedText className="text-xs uppercase text-surface-dark/50">
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
