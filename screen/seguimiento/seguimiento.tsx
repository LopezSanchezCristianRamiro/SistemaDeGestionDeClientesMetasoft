import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { httpClient } from "../../http/httpClient";
import { getUsuarioData } from "../../storage/storage";
import Buscador from "./components/Buscador";
import Filtros, { FilterType } from "./components/Filtros";
import MetricCard from "./components/MetricCard";
import ProspectoRow from "./components/ProspectoRow";
import SeguimientoDetalleModal from "./components/SeguimientoDetalleModal";
import SelectorUsuario from "./components/SelectorUsuario";
import { useSeguimiento } from "./hooks/useSeguimiento";
export default function SeguimientoScreen() {
 
  const [filter, setFilter] = useState<FilterType>("Todos");
  const [search, setSearch] = useState("");
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [prospectoSeleccionado, setProspectoSeleccionado] = useState<any>(null);
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
const isSearching = search.trim().length > 0;
const [esAdmin, setEsAdmin] = useState(false);
const [idUsuarioSeleccionado, setIdUsuarioSeleccionado] = useState<number | null>(null);
const [usuariosFiltro, setUsuariosFiltro] = useState<any[]>([]);

const { data, loading, error, refetch } = useSeguimiento(idUsuarioSeleccionado);

useEffect(() => {
  const cargarUsuarioLogueado = async () => {
const usuario = await getUsuarioData();
setEsAdmin(
  usuario?.rol?.toUpperCase() === "ADMINISTRADOR"
);
  };

  cargarUsuarioLogueado();
}, []);

useEffect(() => {
  if (!esAdmin) return;

  const cargarUsuarios = async () => {
    try {
      const response: any = await httpClient.getAuth(
        "/api/usuarios?roles=2,3",
        "No se pudo cargar usuarios",
      );

      setUsuariosFiltro(response?.usuarios ?? []);
    } catch (error) {
      console.log(error);
    }
  };

  cargarUsuarios();
}, [esAdmin]);
const prospectos = data?.prospectos ?? [];

const normalizar = (value?: string) =>
  String(value || "").trim().toLowerCase();

const filteredProspectos = prospectos.filter((x: any) => {
  const texto = normalizar(search);
  const filtroActual = normalizar(filter);

  const estado = normalizar(x.estado);

  const nombreCompleto = `${x.nombre || ""} ${x.apellidos || ""}`;

  const coincideEstado =
    filtroActual === "todos" || estado === filtroActual;

  const coincideBusqueda =
    !texto ||
    normalizar(nombreCompleto).includes(texto) ||
    normalizar(x.nombre).includes(texto) ||
    normalizar(x.apellidos).includes(texto) ||
    normalizar(x.empresa).includes(texto) ||
    normalizar(x.sistemaRequerido).includes(texto) ||
    normalizar(x.softwareRequerido).includes(texto) ||
    normalizar(x.rubro).includes(texto);

  return coincideEstado && coincideBusqueda;
});
 
  const handleGuardarPaso = async (payload: {
    idProspecto: number;
    descripcionPaso: string;
    resultadoPaso: string;
    fechaPaso: string;
    tipoActividad?: string;
  }) => {
    try {
      const data: any = await httpClient.post("/api/pasos", {
        idProspecto: payload.idProspecto,
        descripcionPaso: payload.descripcionPaso,
        resultadoPaso: payload.resultadoPaso,
        fechaPaso: payload.fechaPaso,
      });

      setProspectoSeleccionado((prev: any) => {
        if (!prev) return prev;

        const nuevoPaso = {
          id: data?.paso?.idPaso ?? Date.now(),
          titulo: payload.descripcionPaso || payload.tipoActividad || "Paso",
          fecha: payload.fechaPaso,
          resultado: payload.resultadoPaso,
          tipo:
            payload.tipoActividad?.toLowerCase() === "llamada"
              ? "llamada"
              : payload.tipoActividad?.toLowerCase() === "visita"
                ? "visita"
                : payload.tipoActividad?.toLowerCase() === "email"
                  ? "documento"
                  : "otro",
        };

        return {
          ...prev,
          proximoPaso: payload.descripcionPaso || prev.proximoPaso,
          historialPasos: [nuevoPaso, ...(prev.historialPasos || [])],
        };
      });
    } catch (error: any) {
      console.log("STATUS:", error?.response?.status);
      console.log("RESPUESTA PASOS:", error?.response?.data);

      throw new Error(
        error?.response?.data?.message || "No se pudo guardar el paso.",
      );
    }
  };
  const handleOpenDetalle = (item: any) => {
    console.log("ITEM ORIGINAL:", item);

    const detalle = {
      ...item,
      correo: item.correo ?? item.email ?? item.correoElectronico ?? "",
      telefono: item.telefono ?? item.celular ?? item.numeroTelefono ?? "",
      fechaInicio:
        item.fechaInicio ??
        item.fechaRegistro ??
        item.fechaCreacion ??
        item.fecha ??
        "",
      proximoPaso: item.proximoPaso ?? item.siguientePaso ?? "",
      historialPasos: item.historialPasos ?? item.pasos ?? [],
    };

    console.log("DETALLE ENVIADO AL MODAL:", detalle);

    setProspectoSeleccionado(detalle);
    setDetalleVisible(true);
  };

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
    <>
      <View className="flex-1 bg-surface">
        {isMobile ? (
          <>
            <View className="pt-14 pb-3 px-4 border-b border-surface-variant/20">
              <ThemedText className="text-brand-primary font-bold text-2xl">
                Metasoft Bolivia
              </ThemedText>
              <ThemedText className="text-surface-dark/50 text-sm">
                FEXCO 2026 • Event Mode
              </ThemedText>
            </View>

          <View className="px-4 pt-3">
  <Buscador
    search={search}
    setSearch={setSearch}
    isMobile={isMobile}
    isTablet={isTablet}
  />

  {esAdmin && (
    <SelectorUsuario
      usuarios={usuariosFiltro}
      selectedUserId={idUsuarioSeleccionado}
      setSelectedUserId={setIdUsuarioSeleccionado}
      isMobile={isMobile}
      isTablet={isTablet}
    />
  )}
</View>
          </>
        ) : (
          <>
            <View className="pt-10 pb-5 px-6 border-b border-surface-variant/20">
              <View className="flex-row justify-between items-start">
                <View>
                  <ThemedText className="text-brand-primary font-bold text-3xl tracking-tight">
                    Metasoft Bolivia
                  </ThemedText>
                  <ThemedText className="text-surface-dark/50 font-medium text-base">
                    FEXCO 2026 • Event Mode
                  </ThemedText>
                </View>

             <View style={{ flexDirection: "row", gap: 14, alignItems: "flex-start" }}>
  {esAdmin && (
    <SelectorUsuario
      usuarios={usuariosFiltro}
      selectedUserId={idUsuarioSeleccionado}
      setSelectedUserId={setIdUsuarioSeleccionado}
      isMobile={false}
      isTablet={isTablet}
    />
  )}

  <Buscador
    search={search}
    setSearch={setSearch}
    isMobile={false}
    isTablet={isTablet}
  />
</View>
              </View>
            </View>
          </>
        )}

        <ScrollView
          className="flex-1"
          style={{ backgroundColor: "#f7f4f8" }}
          contentContainerStyle={{
            paddingHorizontal: isMobile ? 14 : 20,
            paddingTop: isMobile ? 14 : 20,
            paddingBottom: 36,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 1400,
              alignSelf: "center",
            }}
          >
          <View
  className={isMobile ? "gap-4" : "gap-6"}
  style={{
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "stretch" : "flex-start",
    justifyContent: "space-between",
    marginBottom: isSearching ? 6 : 0,
  }}
>
              <View
                style={{
                  flex: 1,
                  maxWidth: isMobile ? "100%" : 520,
                }}
              >
              <ThemedText
  className="font-extrabold text-[#201b24]"
  style={{
    fontSize: isSearching
      ? isMobile
        ? 28
        : isTablet
          ? 34
          : 42
      : isMobile
        ? 34
        : isTablet
          ? 40
          : 58,
    lineHeight: isSearching
      ? isMobile
        ? 32
        : isTablet
          ? 38
          : 44
      : isMobile
        ? 38
        : isTablet
          ? 42
          : 58,
  }}
>
  Historial de{"\n"}Seguimiento
</ThemedText>

               {!isSearching && (
  <ThemedText
    className="text-[#726b77]"
    style={{
      marginTop: 16,
      fontSize: isMobile ? 14 : 15,
      lineHeight: isMobile ? 22 : 28,
    }}
  >
    Gestiona los prospectos capturados y supervisa el embudo
    comercial desde una sola vista.
  </ThemedText>
)}
              </View>

              <View
                style={{
                  width: isMobile ? "100%" : isTablet ? 300 : 340,
                  alignSelf: isMobile ? "stretch" : "auto",
                }}
              >
                <Filtros
                  filter={filter}
                  setFilter={setFilter}
                  isMobile={isMobile}
                  isTablet={isTablet}
                />
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

           {!isSearching && (
  <View
    className="mt-8"
    style={{
      flexDirection: isMobile ? "column" : "row",
      gap: 16,
    }}
  >
    <View style={{ flex: 1 }}>
      <MetricCard
        title="Total Prospectos"
        value={data?.totalProspectos ?? 0}
        suffix={`${(data?.crecimientoDiario ?? 0) > 0 ? "+" : ""}${data?.crecimientoDiario ?? 0}%`}
        variant="light"
      />
    </View>

    <View style={{ flex: 1 }}>
      <MetricCard
        title="Conversión"
        value={`${data?.conversion ?? 0}%`}
        variant="lavender"
      />
    </View>

    <View style={{ flex: 1 }}>
      <MetricCard
        title="Altamente Interesados"
        value={data?.altamenteInteresados ?? 0}
        variant="magenta"
      />
    </View>
  </View>
)}

            <View className={isSearching ? "mt-5" : "mt-10"}>
              {!isMobile && !isTablet && (
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
              )}

              {filteredProspectos.length === 0 ? (
                <View
                  className="items-center rounded-[18px] px-6 py-12"
                  style={{
                    backgroundColor: "#ffffff",
                    borderWidth: 1,
                    borderColor: "#eee6ee",
                  }}
                >
                  <ThemedText className="text-base font-bold text-[#322d36] text-center">
                    No hay prospectos para mostrar
                  </ThemedText>
                </View>
              ) : (
               filteredProspectos.map((item: any) => (
  <ProspectoRow
    key={item.idProspecto ?? item.id}
    item={item}
    onPressDetalle={handleOpenDetalle}
    isMobile={isMobile}
    isTablet={isTablet}
  />
))
              )}
            </View>
          </View>
        </ScrollView>
      </View>

     <SeguimientoDetalleModal
  visible={detalleVisible}
  onClose={async () => {
    setDetalleVisible(false);
    await refetch();
  }}
  prospecto={prospectoSeleccionado}
  onGuardarPaso={handleGuardarPaso}
  onRefresh={refetch}
/>
    </>
  );
}
