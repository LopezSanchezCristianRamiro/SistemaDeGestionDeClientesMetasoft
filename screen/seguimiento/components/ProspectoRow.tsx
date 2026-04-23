import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

type Props = {
  item: any;
  onPressDetalle: (item: any) => void;
  isMobile?: boolean;
  isTablet?: boolean;
};

function getInitials(nombreCompleto: string) {
  return nombreCompleto
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");
}

function getEstadoColors(estado?: string) {
  const value = (estado || "").toUpperCase().trim();

  if (value === "EN PROCESO") {
    return {
      bg: "#e8e4ff",
      dot: "#6d5efc",
      text: "#4b3fd1",
      label: "En proceso",
    };
  }

  if (value === "CERRADO") {
    return {
      bg: "#dff5e6",
      dot: "#2e9b57",
      text: "#226f40",
      label: "Cerrado",
    };
  }

  if (value === "CANCELADO") {
    return {
      bg: "#f1e8ee",
      dot: "#8f8790",
      text: "#5f5863",
      label: "Cancelado",
    };
  }

  return {
    bg: "#ece7eb",
    dot: "#8f8790",
    text: "#5f5863",
    label: estado || "Sin estado",
  };
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <View style={{ marginTop: 10 }}>
      <ThemedText className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#a19aa5]">
        {label}
      </ThemedText>
      <ThemedText
        className="mt-1 text-[14px] leading-5 font-medium text-[#2d2732]"
        numberOfLines={2}
      >
        {value || "—"}
      </ThemedText>
    </View>
  );
}

export default function ProspectoRow({
  item,
  onPressDetalle,
  isMobile = false,
  isTablet = false,
}: Props) {
  const nombreCompleto = `${item.nombre || ""} ${item.apellidos || ""}`.trim();
  const nombreMostrar = nombreCompleto || "Sin nombre";
  const empresaMostrar = item.empresa || "Sin empresa";
  const interesMostrar = item.interes || "Sin interés";
  const pasoMostrar = item.proximoPaso || item.siguientePaso || "Sin próximo paso";
  const sistemaMostrar =
    item.sistemaRequerido ||
    item.softwareRequerido ||
    item.rubro ||
    "Sin sistema";

  const anticipoMostrar =
    item.anticipo !== undefined &&
    item.anticipo !== null &&
    item.anticipo !== ""
      ? `Bs ${item.anticipo}`
      : "Bs 0";

  const initials = getInitials(nombreMostrar || empresaMostrar) || "PR";
  const estadoUI = getEstadoColors(item.estado);

  if (isMobile) {
    return (
      <View
        className="mb-4 rounded-[22px] p-4"
        style={{
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#ece5eb",
        }}
      >
        <View className="flex-row items-start">
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 44,
              height: 44,
              backgroundColor: "#f1ebf0",
            }}
          >
            <ThemedText className="text-[15px] font-extrabold text-[#cf1781]">
              {initials}
            </ThemedText>
          </View>

          <View className="ml-3 flex-1 pr-2">
            <ThemedText
              className="text-[22px] font-extrabold leading-6 text-[#201b24]"
              numberOfLines={2}
            >
              {nombreMostrar}
            </ThemedText>

            <ThemedText
              className="mt-2 text-[14px] leading-5 text-[#7b7480]"
              numberOfLines={1}
            >
              {empresaMostrar}
            </ThemedText>

            <ThemedText
              className="mt-1 text-[13px] font-semibold text-[#4c57c7]"
              numberOfLines={1}
            >
              Sistema: {sistemaMostrar}
            </ThemedText>
          </View>
        </View>

        <View className="mt-4">
          <View
            className="self-start flex-row items-center rounded-full px-3 py-2"
            style={{ backgroundColor: estadoUI.bg }}
          >
            <View
              className="mr-2 rounded-full"
              style={{
                width: 7,
                height: 7,
                backgroundColor: estadoUI.dot,
              }}
            />
            <ThemedText
              className="text-[12px] font-bold"
              style={{ color: estadoUI.text }}
            >
              {estadoUI.label}
            </ThemedText>
          </View>
        </View>

        <InfoBlock label="Interés" value={interesMostrar} />
        <InfoBlock label="Anticipo" value={anticipoMostrar} />
        <InfoBlock label="Próximo paso" value={pasoMostrar} />

        <Pressable
          onPress={() => onPressDetalle?.(item)}
          className="mt-4 flex-row items-center justify-center rounded-2xl px-4 py-3"
          style={{
            borderWidth: 1,
            borderColor: "#d9cfd8",
            backgroundColor: "#faf7fa",
          }}
        >
          <Ionicons name="eye-outline" size={16} color="#2d2732" />
          <ThemedText className="ml-2 text-[14px] font-bold text-[#2d2732]">
            Ver detalles
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  if (isTablet) {
    return (
      <View
        className="mb-4 rounded-[22px] px-5 py-4"
        style={{
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#ece5eb",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <View style={{ flexDirection: "row", flex: 1 }}>
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: 48,
                height: 48,
                backgroundColor: "#f1ebf0",
              }}
            >
              <ThemedText className="text-[16px] font-extrabold text-[#cf1781]">
                {initials}
              </ThemedText>
            </View>

            <View className="ml-3 flex-1 pr-2">
              <ThemedText
                className="text-[24px] font-extrabold text-[#201b24]"
                numberOfLines={2}
              >
                {nombreMostrar}
              </ThemedText>

              <ThemedText
                className="mt-1 text-[15px] text-[#7b7480]"
                numberOfLines={1}
              >
                {empresaMostrar}
              </ThemedText>

              <ThemedText
                className="mt-1 text-[14px] font-semibold text-[#4c57c7]"
                numberOfLines={1}
              >
                Sistema: {sistemaMostrar}
              </ThemedText>
            </View>
          </View>

          <Pressable
            onPress={() => onPressDetalle?.(item)}
            className="rounded-2xl px-4 py-3"
            style={{
              borderWidth: 1,
              borderColor: "#d9cfd8",
              backgroundColor: "#faf7fa",
              minWidth: 120,
            }}
          >
            <ThemedText className="text-center text-[13px] font-bold text-[#2d2732]">
              Ver detalles
            </ThemedText>
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 16,
          }}
        >
          <View
            className="rounded-full px-4 py-2"
            style={{ backgroundColor: "#f6eff7" }}
          >
            <ThemedText className="font-bold text-[#c5177a]">
              {interesMostrar}
            </ThemedText>
          </View>

          <View
            className="rounded-full px-4 py-2 flex-row items-center"
            style={{ backgroundColor: estadoUI.bg }}
          >
            <View
              className="mr-2 rounded-full"
              style={{
                width: 7,
                height: 7,
                backgroundColor: estadoUI.dot,
              }}
            />
            <ThemedText
              className="font-bold"
              style={{ color: estadoUI.text }}
            >
              {estadoUI.label}
            </ThemedText>
          </View>

          <View
            className="rounded-full px-4 py-2"
            style={{ backgroundColor: "#fff6e7" }}
          >
            <ThemedText className="font-bold text-[#7b4e00]">
              {anticipoMostrar}
            </ThemedText>
          </View>
        </View>

        <View
          className="rounded-2xl px-4 py-3 mt-4"
          style={{ backgroundColor: "#faf7fa" }}
        >
          <ThemedText className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#a19aa5]">
            Próximo paso
          </ThemedText>
          <ThemedText
            className="mt-1 text-[15px] font-medium text-[#2d2732]"
            numberOfLines={2}
          >
            {pasoMostrar}
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View
      className="mb-4 flex-row items-center rounded-[22px] px-4 py-5"
      style={{
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#ece5eb",
      }}
    >
      <View style={{ width: "33%" }} className="flex-row items-center pr-4">
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            backgroundColor: "#f1ebf0",
          }}
        >
          <ThemedText className="text-[15px] font-extrabold text-[#cf1781]">
            {initials}
          </ThemedText>
        </View>

        <View className="ml-3 flex-1">
          <ThemedText
            className="text-[16px] font-extrabold text-[#201b24]"
            numberOfLines={1}
          >
            {nombreMostrar}
          </ThemedText>

          <ThemedText
            className="mt-1 text-[13px] text-[#7b7480]"
            numberOfLines={1}
          >
            {empresaMostrar}
          </ThemedText>

          <ThemedText
            className="mt-1 text-[12px] font-semibold text-[#4c57c7]"
            numberOfLines={1}
          >
            Sistema: {sistemaMostrar}
          </ThemedText>
        </View>
      </View>

      <View style={{ width: "11%" }} className="pr-3">
        <ThemedText
          className="text-[13px] font-bold text-[#c5177a]"
          numberOfLines={2}
        >
          {interesMostrar}
        </ThemedText>
      </View>

      <View style={{ width: "16%" }} className="pr-3">
        <View
          className="self-start flex-row items-center rounded-full px-3 py-2"
          style={{ backgroundColor: estadoUI.bg }}
        >
          <View
            className="mr-2 rounded-full"
            style={{
              width: 7,
              height: 7,
              backgroundColor: estadoUI.dot,
            }}
          />
          <ThemedText
            className="text-[12px] font-bold"
            style={{ color: estadoUI.text }}
            numberOfLines={1}
          >
            {estadoUI.label}
          </ThemedText>
        </View>
      </View>

      <View style={{ width: "12%" }} className="pr-3">
        <ThemedText className="text-[14px] font-bold text-[#7b4e00]">
          {anticipoMostrar}
        </ThemedText>
      </View>

      <View style={{ width: "18%" }} className="pr-3">
        <ThemedText className="text-[13px] text-[#4b4550]" numberOfLines={2}>
          {pasoMostrar}
        </ThemedText>
      </View>

      <View style={{ width: "10%" }} className="items-end">
        <Pressable
          onPress={() => onPressDetalle?.(item)}
          className="rounded-2xl px-4 py-3"
          style={{
            borderWidth: 1,
            borderColor: "#d9cfd8",
            backgroundColor: "#faf7fa",
          }}
        >
          <ThemedText className="text-[13px] font-bold text-[#2d2732]">
            Ver detalles
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}