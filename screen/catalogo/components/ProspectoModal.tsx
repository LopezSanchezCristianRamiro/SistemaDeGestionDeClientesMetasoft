/**
 * @file ProspectoModal.tsx
 * @description Modal principal para el registro de prospectos.
 *
 * Desktop: Layout de dos columnas — columna izquierda con ScrollView
 *          (info del sistema + precio, ahora completamente visible)
 *          y columna derecha con ProspectoForm.
 *
 * Mobile:  Modal fullscreen con header de sistema y ProspectoForm.
 */

import { Toaster } from "@/components/Toaster";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Sistema } from "../types/sistema";
import { ProspectoForm } from "./ProspectoForm";

interface Props {
  visible: boolean;
  onClose: () => void;
  sistema: Sistema | null;
}

export function ProspectoModal({ visible, onClose, sistema }: Props) {
  if (!sistema) return null;

  const lineasDescripcion = sistema.descripcion.split(";");
  const isDesktop = Dimensions.get("window").width >= 1024;

  if (isDesktop) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/80 justify-center items-center p-4">
          <View
            className="bg-surface-container rounded-3xl overflow-hidden"
            style={{
              width: "95%",
              maxWidth: 1050,
              maxHeight: Dimensions.get("window").height * 0.9,
            }}
          >
            <View className="flex-row" style={{ height: "100%" }}>
              <ScrollView
                style={{ width: "40%" }}
                className="bg-surface-dark"
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* Botón cerrar */}
                <TouchableOpacity
                  onPress={onClose}
                  className="mb-6 self-start"
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar modal"
                >
                  <Ionicons name="close" size={24} color="#FF5252" />
                </TouchableOpacity>

                {/* Nombre del sistema */}
                <ThemedText className="text-brand-primary text-3xl font-black mb-6 uppercase">
                  {sistema.nombre}
                </ThemedText>

                {/* Imagen */}
                <View className="w-full aspect-square rounded-xl overflow-hidden mb-6">
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
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                {/* Descripción por líneas */}
                <View className="mb-6">
                  {lineasDescripcion.map((linea, idx) => (
                    <View key={idx} className="flex-row mb-2">
                      <ThemedText className="text-brand-primary mr-2">
                        •
                      </ThemedText>
                      <ThemedText className="text-surface-variant/70 text-sm flex-1">
                        {linea.trim()}
                      </ThemedText>
                    </View>
                  ))}
                </View>

                {/* Precio — siempre visible gracias al ScrollView */}
                <View className="bg-surface-dark/80 p-5 rounded-xl border border-white/10">
                  <ThemedText className="text-white/50 text-[10px] font-bold uppercase mb-1">
                    Inversión del Sistema
                  </ThemedText>
                  <ThemedText className="text-brand-primary font-black text-3xl">
                    Bs. {sistema.precio.toLocaleString()}
                  </ThemedText>
                </View>
              </ScrollView>

              {/* Columna derecha: formulario */}
              <View style={{ width: "60%" }}>
                <ProspectoForm
                  sistema={sistema}
                  onSuccess={onClose}
                  showCloseButton={false}
                />
              </View>
            </View>
          </View>
        </View>
        <Toaster />
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <View className="flex-1 bg-surface-container">
        {/* Header con info resumida del sistema */}
        <View className="bg-surface-dark px-5 pt-14 pb-4 ios:pt-16">
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-12 right-5 z-10 ios:top-14"
            accessibilityLabel="Cerrar"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color="red" />
          </TouchableOpacity>

          <View className="flex-row items-center">
            <Image
              source={{ uri: sistema.foto_url }}
              className="w-14 h-14 rounded-lg mr-4"
              resizeMode="cover"
            />
            <View className="flex-1">
              <ThemedText className="text-brand-primary font-black text-xl uppercase">
                {sistema.nombre}
              </ThemedText>
              <ThemedText className="text-surface-variant/70 text-sm">
                Bs. {sistema.precio.toLocaleString()}
              </ThemedText>
            </View>
          </View>

          <View className="mt-3 flex-row flex-wrap">
            {lineasDescripcion.slice(0, 2).map((linea, idx) => (
              <View key={idx} className="flex-row items-center mr-4">
                <ThemedText className="text-brand-primary mr-1">•</ThemedText>
                <ThemedText className="text-surface-variant/70 text-xs">
                  {linea.trim()}
                </ThemedText>
              </View>
            ))}
            {lineasDescripcion.length > 2 && (
              <ThemedText className="text-surface-variant/50 text-xs">
                +{lineasDescripcion.length - 2} más
              </ThemedText>
            )}
          </View>
        </View>

        <ProspectoForm
          sistema={sistema}
          onSuccess={onClose}
          showCloseButton={false}
        />
      </View>
    </Modal>
  );
}
