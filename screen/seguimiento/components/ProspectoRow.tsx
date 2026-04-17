import { Pressable, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { ProspectoSeguimiento } from "../types/seguimiento";

interface Props {
  item: ProspectoSeguimiento;
}

function formatMoney(value: number) {
  return `$${Number(value || 0).toLocaleString("en-US")}`;
}

function getInteresColor(interes: string) {
  const x = (interes || "").toUpperCase();

  if (x === "ALTO") return "#d10a78";
  if (x === "MEDIO") return "#4b56b9";
  return "#6f6875";
}

function getEstadoStyle(estado: string) {
  const x = (estado || "").toUpperCase();

  if (x.includes("CITA")) {
    return {
      bg: "#dff7e8",
      text: "#1f9d57",
      dot: "#1f9d57",
    };
  }

  if (x.includes("PENDIENTE")) {
    return {
      bg: "#ffe9b8",
      text: "#b7791f",
      dot: "#b7791f",
    };
  }

  if (x.includes("CONTACT")) {
    return {
      bg: "#dce9ff",
      text: "#4a6fdc",
      dot: "#4a6fdc",
    };
  }

  return {
    bg: "#ebe7ef",
    text: "#7a7280",
    dot: "#7a7280",
  };
}

export default function ProspectoRow({ item }: Props) {
  const interesColor = getInteresColor(item.interes);
  const estado = getEstadoStyle(item.estado);

  return (
    <View
      className="mb-3 rounded-[18px] px-4 py-4"
      style={{
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#eee6ee",
      }}
    >
      <View className="flex-row items-center">
        <View
          className="mr-3 h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "#f1edf3" }}
        >
          <ThemedText
            className="text-sm font-extrabold"
            style={{ color: interesColor }}
          >
            {item.iniciales || "NA"}
          </ThemedText>
        </View>

        <View className="flex-1">
          <ThemedText className="text-[15px] font-extrabold text-[#1f1a24]">
            {item.nombre}
          </ThemedText>

          <ThemedText className="mt-1 text-[12px] text-[#7b7480]">
            {item.empresa} • {item.fecha}
          </ThemedText>
        </View>

        <Pressable
          className="rounded-2xl px-4 py-2"
          style={{
            borderWidth: 1,
            borderColor: "#dfcfd9",
            backgroundColor: "#fffafb",
          }}
        >
          <ThemedText className="text-[12px] font-bold text-[#362b35]">
            Ver Detalles
          </ThemedText>
        </Pressable>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-y-3">
        <View className="w-1/4 pr-2">
          <ThemedText className="text-[10px] uppercase tracking-[1px] text-[#a099a6]">
            Interés
          </ThemedText>
          <ThemedText
            className="mt-1 text-[12px] font-extrabold"
            style={{ color: interesColor }}
          >
            {item.interes}
          </ThemedText>
          <ThemedText className="mt-1 text-[12px] text-[#403744]">
            {item.rubro}
          </ThemedText>
        </View>

        <View className="w-1/4 pr-2">
          <ThemedText className="text-[10px] uppercase tracking-[1px] text-[#a099a6]">
            Estado
          </ThemedText>

          <View
            className="mt-1 self-start rounded-full px-3 py-1.5"
            style={{ backgroundColor: estado.bg }}
          >
            <View className="flex-row items-center">
              <View
                className="mr-1.5 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: estado.dot }}
              />
              <ThemedText
                className="text-[11px] font-bold"
                style={{ color: estado.text }}
              >
                {item.estado}
              </ThemedText>
            </View>
          </View>
        </View>

        <View className="w-1/4 pr-2">
          <ThemedText className="text-[10px] uppercase tracking-[1px] text-[#a099a6]">
            Anticipo
          </ThemedText>
          <ThemedText className="mt-1 text-[13px] font-extrabold text-[#2d2631]">
            {formatMoney(item.anticipo)}
          </ThemedText>
        </View>

        <View className="w-1/4">
          <ThemedText className="text-[10px] uppercase tracking-[1px] text-[#a099a6]">
            Próximo Paso
          </ThemedText>
          <ThemedText className="mt-1 text-[12px] text-[#403744]">
            {item.proximoPaso}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}