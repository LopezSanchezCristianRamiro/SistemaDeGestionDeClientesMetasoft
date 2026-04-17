import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import MetricCard from "./components/MetricCard";
import ProspectoRow from "./components/ProspectoRow";
import { useSeguimiento } from "./hooks/useSeguimiento";

type FilterType = "Todos" | "Pendientes" | "Contactados";

export default function SeguimientoScreen() {
  const { data, loading, error } = useSeguimiento();
  const [filter, setFilter] = useState<FilterType>("Todos");

  const prospectos = data?.prospectos ?? [];

  const filteredProspectos =
    filter === "Pendientes"
      ? prospectos.filter((x) =>
          (x.estado || "").toUpperCase().includes("PENDIENTE"),
        )
      : filter === "Contactados"
        ? prospectos.filter((x) => {
            const estado = (x.estado || "").toUpperCase();
            return estado.includes("CONTACT") || estado.includes("CITA");
          })
        : prospectos;

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "#f7f4f8" }}
      >
        <ActivityIndicator size="large" color="#d10a78" />
        <ThemedText className="mt-3 text-sm text-[#746d78]">
          Cargando seguimiento...
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: "#f7f4f8" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
    >
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <ThemedText className="text-[42px] leading-[42px] font-extrabold text-[#201b24]">
            Historial de{"\n"}Seguimiento
          </ThemedText>

          <ThemedText className="mt-3 max-w-[420px] text-[15px] leading-6 text-[#726b77]">
            Gestiona los prospectos capturados y supervisa el embudo comercial
            desde una sola vista.
          </ThemedText>
        </View>

        <View className="w-[260px]">
          <View
            className="flex-row rounded-2xl p-1"
            style={{ backgroundColor: "#f0eaef" }}
          >
            {["Todos", "Pendientes", "Contactados"].map((item) => (
              <Pressable
                key={item}
                className="flex-1 rounded-[14px] px-3 py-2"
                style={{
                  backgroundColor:
                    item === "Todos" ? "#f8ddeb" : "transparent",
                }}
              >
                <ThemedText
                  className="text-center text-[12px] font-bold"
                  style={{
                    color: item === "Todos" ? "#d10a78" : "#6f6875",
                  }}
                >
                  {item}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <Pressable
            className="mt-3 self-start rounded-2xl px-4 py-3"
            style={{ backgroundColor: "#ece6eb" }}
          >
            <View className="flex-row items-center">
              <Ionicons name="options-outline" size={14} color="#5f5863" />
              <ThemedText className="ml-2 text-[12px] font-bold text-[#5f5863]">
                Filtros Avanzados
              </ThemedText>
            </View>
          </Pressable>
        </View>
      </View>

      {!!error && (
        <View
          className="mt-5 rounded-2xl px-4 py-3"
          style={{ backgroundColor: "#ffe3e3" }}
        >
          <ThemedText className="text-sm font-medium text-red-700">
            {error}
          </ThemedText>
        </View>
      )}

      <View className="mt-8 flex-row gap-4">
        <MetricCard
          title="Total Prospectos"
          value={data?.totalProspectos ?? 0}
          suffix="+12%"
          variant="light"
        />
        <MetricCard
          title="Conversión"
          value={`${data?.conversion ?? 0}%`}
          suffix="↗↗"
          variant="lavender"
        />
        <MetricCard
          title="Altamente Interesados"
          value={data?.altamenteInteresados ?? 0}
          suffix="☆"
          variant="magenta"
        />
      </View>

      <View className="mt-8 rounded-[22px] px-4 py-4">
        <View className="mb-3 flex-row px-2">
          <View className="flex-1">
            <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
              Prospecto & Empresa
            </ThemedText>
          </View>
          <View className="w-1/4">
            <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
              Interés
            </ThemedText>
          </View>
          <View className="w-1/4">
            <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
              Estado
            </ThemedText>
          </View>
          <View className="w-1/4">
            <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
              Anticipo
            </ThemedText>
          </View>
          <View className="w-1/4">
            <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
              Próximo Paso
            </ThemedText>
          </View>
        </View>

        {filteredProspectos.length === 0 ? (
          <View
            className="items-center rounded-[18px] px-6 py-12"
            style={{
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#eee6ee",
            }}
          >
            <ThemedText className="text-base font-bold text-[#322d36]">
              No hay prospectos para mostrar
            </ThemedText>
          </View>
        ) : (
          filteredProspectos.map((item) => (
            <ProspectoRow key={item.id} item={item} />
          ))
        )}
      </View>
    </ScrollView>
  );
}