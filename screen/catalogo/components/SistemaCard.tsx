import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Sistema } from "../types/sistema";

interface SistemaCardProps {
  sistema: Sistema;
  onPress: (id: number) => void;
}

export const SistemaCard = memo(({ sistema, onPress }: SistemaCardProps) => {
  const IMAGE_HEIGHT = 166;
  const CARD_WIDTH = 180;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(sistema.id)}
      style={{
        width: CARD_WIDTH,
        height: 220,
        marginHorizontal: 6,
        marginVertical: 6,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      }}
      accessibilityRole="button"
    >
      <View style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }}>
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
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CARD_WIDTH,
            height: IMAGE_HEIGHT,
          }}
          contentFit="cover"
          cachePolicy="disk"
        />
      </View>

      <View
        style={{
          height: 54,
          backgroundColor: "white",
          paddingHorizontal: 8,
          justifyContent: "center",
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
        }}
      >
        <ThemedText
          className="text-brand-primary font-extrabold text-base text-center uppercase tracking-tight"
          numberOfLines={2}
        >
          {sistema.nombre}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
});
