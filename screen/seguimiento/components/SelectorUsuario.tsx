import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
type Usuario = {
  idUsuario: number;
  nombre: string;
  rol: string;
};

type Props = {
  usuarios: Usuario[];
  selectedUserId: number | null;
  setSelectedUserId: (id: number | null) => void;
  isMobile: boolean;
  isTablet: boolean;
};

export default function SelectorUsuario({
  usuarios,
  selectedUserId,
  setSelectedUserId,
  isMobile,
  isTablet,
}: Props) {
  const [visible, setVisible] = useState(false);

  const usuarioSeleccionado = usuarios.find(
    (u) => u.idUsuario === selectedUserId
  );

  const textoSeleccionado = usuarioSeleccionado
    ? `${usuarioSeleccionado.nombre}`
    : "Mis Prospectos";

  const seleccionarUsuario = (id: number | null) => {
    setSelectedUserId(id);
    setVisible(false);
  };

  return (
    <>
      <View
        style={{
          width: isMobile ? "100%" : isTablet ? 300 : 340,
          alignSelf: "stretch",
          marginTop: 16,
        }}
      >
        <ThemedText className="mb-3 text-center text-[11px] font-bold uppercase tracking-[1.3px] text-[#9f97a2]">
          Filtrar por usuario
        </ThemedText>

        <Pressable
          onPress={() => setVisible(true)}
          style={{
            backgroundColor: "#f0eaef",
            borderRadius: 24,
            paddingHorizontal: 20,
            minHeight: 62,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="person-outline" size={20} color="#6f6875" />

          <ThemedText
            numberOfLines={1}
            style={{
              flex: 1,
              marginLeft: 14,
              fontSize: 15,
              color: "#4f4755",
              fontWeight: "500",
            }}
          >
            {textoSeleccionado}
          </ThemedText>

          <Ionicons name="chevron-down" size={18} color="#6f6875" />
        </Pressable>
      </View>

<Modal transparent visible={visible} animationType="fade">
  <Pressable
    onPress={() => setVisible(false)}
    style={{
      flex: 1,
      backgroundColor: "rgba(20,18,24,0.38)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 22,
      paddingVertical: 30,
    }}
  >
    <Pressable
      onPress={(e) => e.stopPropagation()}
      style={{
        width: isMobile ? "100%" : 430,
        maxHeight: "82%",
        backgroundColor: "#ffffff",
        borderRadius: 26,
        padding: 16,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        <Pressable
          onPress={() => seleccionarUsuario(null)}
          style={{
            minHeight: 68,
            borderRadius: 20,
            backgroundColor:
              selectedUserId === null ? "#f8dcea" : "#f8f5f8",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <ThemedText
            style={{
              fontSize: 16,
              fontWeight: "800",
              color:
                selectedUserId === null ? "#d10a78" : "#4f4755",
            }}
          >
            Mis Prospectos
          </ThemedText>
        </Pressable>

        {usuarios.map((u) => {
          const activo = selectedUserId === u.idUsuario;

          return (
            <Pressable
              key={u.idUsuario}
              onPress={() => seleccionarUsuario(u.idUsuario)}
              style={{
                minHeight: 68,
                borderRadius: 20,
                backgroundColor: activo ? "#f8dcea" : "#f8f5f8",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
                paddingHorizontal: 14,
              }}
            >
              <ThemedText
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  fontWeight: activo ? "800" : "600",
                  color: activo ? "#d10a78" : "#4f4755",
                  textAlign: "center",
                }}
              >
                {u.nombre} · {u.rol}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </Pressable>
  </Pressable>
</Modal>
    </>
  );
}