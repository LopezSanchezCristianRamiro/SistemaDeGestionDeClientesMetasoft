import React, { memo } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Sistema } from "../types/sistema";

interface SistemaCardProps {
  sistema: Sistema;
  onPress: (id: number) => void;
}

export const SistemaCard = memo(({ sistema, onPress }: SistemaCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(sistema.id)}
      className="flex-1 min-w-[260px] max-w-[450px] rounded-xl overflow-hidden bg-surface-container shadow-card border border-surface-variant aspect-[4/5] mx-1 my-1.5"
      accessibilityRole="button"
    >
      <View className="flex-1 w-full relative ">
        <Image
          source={{ uri: sistema.foto_url }}
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-800 via-fuchsia-600 to-rose-500"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-brand-primary/5" />
      </View>

      <View className="h-14 bg-white px-2 justify-center items-center border-t border-surface-variant">
        <ThemedText
          className="text-brand-primary font-extrabold text-xl text-center uppercase tracking-tight"
          numberOfLines={2}
        >
          {sistema.nombre}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
});
