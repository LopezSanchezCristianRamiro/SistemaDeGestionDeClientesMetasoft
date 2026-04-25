import { Ionicons } from "@expo/vector-icons";
import { Platform, TextInput, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

interface BuscadorProps {
  search: string;
  setSearch: (value: string) => void;
  isMobile: boolean;
  isTablet: boolean;
}

export default function Buscador({
  search,
  setSearch,
  isMobile,
  isTablet,
}: BuscadorProps) {
  return (
    <View
      style={{
        width: isMobile ? "100%" : isTablet ? "100%" : 340,
        alignSelf: "stretch",
        marginTop: 16,
      }}
    >
      <ThemedText className="mb-3 text-center text-[11px] font-bold uppercase tracking-[1.3px] text-[#9f97a2]">
        Buscar Prospecto
      </ThemedText>

      <View
        style={{
          backgroundColor: "#f0eaef",
          borderRadius: 22,
          paddingHorizontal: 18,
          minHeight: 62,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Ionicons name="search" size={18} color="#6f6875" />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Nombre del Prospecto o Empresa"
          placeholderTextColor="#9b93a0"
          underlineColorAndroid="transparent"
          selectionColor="#d10a78"
          style={[
            {
              flex: 1,
              marginLeft: 10,
              fontSize: 15,
              color: "#4f4755",
              backgroundColor: "transparent",
              borderWidth: 0,
              borderColor: "transparent",
              paddingVertical: 8,
            },
            Platform.OS === "web"
              ? ({
                  outlineStyle: "none",
                  outlineWidth: 0,
                  boxShadow: "none",
                } as any)
              : null,
          ]}
        />
      </View>
    </View>
  );
}