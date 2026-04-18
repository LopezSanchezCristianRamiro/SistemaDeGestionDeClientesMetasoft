import { Toaster } from "@/components/Toaster";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, Modal, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Sistema } from "../types/sistema";
import { ProspectoForm } from "./ProspectoForm";

interface Props {
  visible: boolean;
  onClose: () => void;
  sistema: Sistema | null;
}

/**
 * Modal para el registro de prospectos.
 * En escritorio muestra un layout de dos columnas (info del sistema + formulario).
 * En móvil, el formulario ocupa la pantalla completa con scroll optimizado para teclado.
 */
export function ProspectoModal({ visible, onClose, sistema }: Props) {
  if (!sistema) return null;

  const lineasDescripcion = sistema.descripcion.split(";");
  const isDesktop = Dimensions.get("window").width >= 768;

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
            <View className="flex-row h-full">
              <View className="w-2/5 bg-surface-dark p-6">
                <TouchableOpacity onPress={onClose} className="mb-6 self-start">
                  <ThemedText className="text-status-error font-bold text-xs">
                    <Ionicons name="close" size={24} color="#FF5252" />
                  </ThemedText>
                </TouchableOpacity>
                <ThemedText className="text-brand-primary text-3xl font-black mb-6 uppercase">
                  {sistema.nombre}
                </ThemedText>
                <View className="w-full aspect-square rounded-xl overflow-hidden mb-6">
                  <Image
                    source={{ uri: sistema.foto_url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
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
                <View className="bg-surface-dark/80 p-5 rounded-xl border border-white/10">
                  <ThemedText className="text-white/50 text-[10px] font-bold uppercase mb-1">
                    Inversión del Sistema
                  </ThemedText>
                  <ThemedText className="text-brand-primary font-black text-3xl">
                    Bs. {sistema.precio.toLocaleString()}
                  </ThemedText>
                </View>
              </View>

              <View className="w-3/5">
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
        <View className="bg-surface-dark px-5 pt-14 pb-4 ios:pt-16">
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-12 right-5 z-10 ios:top-14"
            accessibilityLabel="Cerrar"
          >
            <ThemedText className="text-status-error font-bold text-sm">
              <Ionicons name="close" size={24} color="red" />
            </ThemedText>
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
