// screen/reporte/hooks/useReporte.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { httpClient } from "../../../http/httpClient";

interface InteresProspectos {
  Alto: number;
  Medio: number;
  Bajo: number;
  total: number;
  porcentajes: { Alto: number; Medio: number; Bajo: number };
}

export interface SistemaItem {
  nombre: string;
  leads: number;
}

interface Seguimiento {
  id: number;
  nombre: string;
  empresa: string;
  sistemaRequerido: string;
  adelanto: number;
  estadoSeguimiento: string;
  entregadoPor: string;
  celular: string;
  nivelInteres: "Alto" | "Medio" | "Bajo"; 
}

interface RankingItem {
  idUsuario: number;
  nombre: string;
  totalProspectos: number;
  totalVentas: number;
}

interface ReporteData {
  totalProspectos: number;
  gananciaPotencial: number;
  porEstadoSeguimiento: Record<string, number>;
  interesProspectos: InteresProspectos;
  sistemasMasSolicitados: SistemaItem[];
  seguimientos: Seguimiento[];
  rankingProductividad: RankingItem[];
}

// Devuelve "2026-04-01" dado un Date
function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

// Primer día del mes actual
function firstOfMonth() {
  const d = new Date();
  d.setDate(1);
  return toDateStr(d);
}

// Último día del mes actual
function lastOfMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return toDateStr(d);
}

const CACHE_KEY = "reportes_cache_v2";

export function useReportes() {
  const [data, setData]       = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── Fechas como estado ──────────────────────────────────────
  const [desde, setDesde] = useState(firstOfMonth());
  const [hasta, setHasta] = useState(lastOfMonth());

  const fetchData = useCallback(async (d: string, h: string) => {
    setLoading(true);
    setError(null);

    // Mostrar cache mientras carga
    const cacheKey = `${CACHE_KEY}_${d}_${h}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      setData(JSON.parse(cached));
      setLoading(false);
    }

    try {
      // ← POST con body JSON
      const json = await httpClient.postAuth<ReporteData>("/api/reportes", {
        desde: d,
        hasta: h,
      });
      setData(json);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(json));
    } catch (e: any) {
      if (!cached) setError(e.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(desde, hasta);
  }, [fetchData, desde, hasta]);

  // Función pública para cambiar fechas y refrescar
  const setFiltro = useCallback((d: string, h: string) => {
    setDesde(d);
    setHasta(h);
  }, []);

  const refetch = useCallback(() => fetchData(desde, hasta), [fetchData, desde, hasta]);

  return {
    metrics: data
      ? {
          totalProspectos:  data.totalProspectos,
          gananciaPotencial: data.gananciaPotencial,
          estadoCounts:     data.porEstadoSeguimiento,
          totalAdelantos:   data.seguimientos?.reduce((acc, s) => acc + (s.adelanto ?? 0), 0) ?? 0,
          totalVendedores:  data.rankingProductividad?.length ?? 0,
        }
      : null,
    interesProspectos:    data?.interesProspectos ?? null,
    sistemasMasSolicitados: data?.sistemasMasSolicitados ?? [],
    seguimientos:         data?.seguimientos ?? [],
    rankingProductividad: data?.rankingProductividad ?? [],
    loading,
    error,
    refetch,
    // Exponer fechas y setter
    desde,
    hasta,
    setFiltro,
  };
}