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
      {/* CABECERA */}
      <View className="flex-row items-start justify-between gap-6">
        <View className="max-w-[520px] flex-1">
          <ThemedText className="text-[58px] leading-[58px] font-extrabold text-[#201b24]">
            Historial de{"\n"}Seguimiento
          </ThemedText>

          <ThemedText className="mt-4 text-[15px] leading-7 text-[#726b77]">
            Gestiona los prospectos capturados y supervisa el embudo
            comercial desde una sola vista.
          </ThemedText>
        </View>

        <View className="w-[300px] items-end">
          <View
            className="w-full flex-row rounded-2xl p-1"
            style={{ backgroundColor: "#f0eaef" }}
          >
            {(["Todos", "Pendientes", "Contactados"] as FilterType[]).map(
              (item) => {
                const active = filter === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setFilter(item)}
                    className="flex-1 rounded-[14px] px-3 py-3"
                    style={{
                      backgroundColor: active ? "#f8ddeb" : "transparent",
                    }}
                  >
                    <ThemedText
                      className="text-center text-[12px] font-bold"
                      style={{ color: active ? "#d10a78" : "#6f6875" }}
                    >
                      {item}
                    </ThemedText>
                  </Pressable>
                );
              },
            )}
          </View>

          <Pressable
            className="mt-4 rounded-2xl px-5 py-3"
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

      {/* TARJETAS */}
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

      {/* TABLA */}
      <View className="mt-10">
        {/* HEADER */}
        <View className="mb-4 flex-row items-center px-4">
          <View style={{ width: "33%" }}>
            <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
              Prospecto & Empresa
            </ThemedText>
          </View>

          <View style={{ width: "11%" }}>
            <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
              Interés
            </ThemedText>
          </View>

          <View style={{ width: "16%" }}>
            <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
              Estado
            </ThemedText>
          </View>

          <View style={{ width: "12%" }}>
            <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
              Anticipo
            </ThemedText>
          </View>

          <View style={{ width: "18%" }}>
            <ThemedText className="text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
              Próximo Paso
            </ThemedText>
          </View>

          <View style={{ width: "10%" }}>
            <ThemedText className="text-right text-[10px] font-bold uppercase tracking-[1.1px] text-[#aaa2ac]">
              Acciones
            </ThemedText>
          </View>
        </View>

        {/* FILAS */}
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