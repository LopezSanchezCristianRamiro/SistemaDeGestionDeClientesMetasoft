import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

export type FilterType =
  | "Todos"
  | "En proceso"
  | "Cerrado"
  | "Cancelado";

interface FiltrosProps {
  filter: FilterType;
  setFilter: (value: FilterType) => void;
  isMobile: boolean;
  isTablet: boolean;
}

export default function Filtros({
  filter,
  setFilter,
  isMobile,
  isTablet,
}: FiltrosProps) {
  const [open, setOpen] = useState(false);

  const filtros: FilterType[] = [
    "Todos",
    "En proceso",
    "Cerrado",
    "Cancelado",
  ];

  const handleSelect = (value: FilterType) => {
    setFilter(value);
    setOpen(false);
  };
const getEstadoLabel = (estado: FilterType) => {
  if (estado === "Cancelado") return "Dado de Baja";
  return estado;
};
  return (
    <View
      style={{
        width: isMobile ? "100%" : isTablet ? 300 : 320,
        alignSelf: "stretch",
      }}
    >
      <ThemedText className="mb-3 text-center text-[11px] font-bold uppercase tracking-[1.3px] text-[#9f97a2]">
        Filtrar por Estado
      </ThemedText>

      {/* SELECT BONITO */}
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          backgroundColor: "#f0eaef",
          borderRadius: 22,
          paddingVertical: 18,
          paddingHorizontal: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <ThemedText
          className="font-bold text-center"
          style={{
            fontSize: 16,
            color: "#4f4755",
          }}
        >
         {getEstadoLabel(filter)}
        </ThemedText>

       <View
  style={{
    position: "absolute",
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  }}
>
 <Ionicons name="options-outline" size={24} color="#6f6875" />
</View>
      </Pressable>

      {/* MODAL OPCIONES */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.25)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 340,
              backgroundColor: "#ffffff",
              borderRadius: 24,
              padding: 14,
            }}
          >
            {filtros.map((item) => {
              const active = item === filter;

              return (
                <Pressable
                  key={item}
                  onPress={() => handleSelect(item)}
                  style={{
                    paddingVertical: 16,
                    borderRadius: 18,
                    marginBottom: 8,
                    backgroundColor: active ? "#f8ddeb" : "#f7f4f8",
                  }}
                >
                  <ThemedText
                    className="text-center font-bold"
                    style={{
                      fontSize: 15,
                      color: active ? "#d10a78" : "#5f5863",
                    }}
                  >
                   {getEstadoLabel(item)}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>


    </View>
  );
}