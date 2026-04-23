import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Sistema } from "../types/sistema";

interface SistemaCardProps {
  sistema: Sistema;
  onPress: (id: number) => void;
  /** Tamaño predefinido: 'default' (desktop) o 'small' (móvil) */
  size?: "default" | "small";
}

export const SistemaCard = memo(
  ({ sistema, onPress, size = "default" }: SistemaCardProps) => {
    const isSmall = size === "small";
    const CARD_WIDTH = isSmall ? 110 : 180;
    const CARD_HEIGHT = isSmall ? 136 : 220;
    const IMAGE_HEIGHT = isSmall ? 100 : 166;
    const FONT_SIZE = isSmall ? 11 : 16;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress(sistema.id)}
        style={[
          styles.cardBase,
          {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
          },
        ]}
        accessibilityRole="button"
      >
        <View style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }}>
          <LinearGradient
            colors={["#6b21a8", "#c026d3", "#f43f5e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
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
          style={[
            styles.labelContainer,
            {
              height: CARD_HEIGHT - IMAGE_HEIGHT,
            },
          ]}
        >
          <ThemedText
            className="text-brand-primary font-extrabold text-center uppercase tracking-tight"
            style={{ fontSize: FONT_SIZE }}
            numberOfLines={2}
          >
            {sistema.nombre}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  },
);

SistemaCard.displayName = "SistemaCard";

const styles = StyleSheet.create({
  cardBase: {
    marginHorizontal: 6,
    marginVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  labelContainer: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
});
