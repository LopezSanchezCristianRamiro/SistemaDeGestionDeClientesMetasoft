// screen/reporte/hooks/useReporte.ts
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

export function useReportes() {
  const [data, setData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await httpClient.getAuth<ReporteData>("/api/reportes");
      setData(json);
    } catch (e: any) {
      setError(e.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    metrics: data
      ? {
          totalProspectos: data.totalProspectos,
          gananciaPotencial: data.gananciaPotencial,
          estadoCounts: data.porEstadoSeguimiento,
          totalAdelantos: data.seguimientos?.reduce((acc, s) => acc + (s.adelanto ?? 0), 0) ?? 0,
          totalVendedores: data.rankingProductividad?.length ?? 0,
        }
      : null,
    interesProspectos: data?.interesProspectos ?? null,
    sistemasMasSolicitados: data?.sistemasMasSolicitados ?? [],
    seguimientos: data?.seguimientos ?? [],
    rankingProductividad: data?.rankingProductividad ?? [],
    loading,
    error,
    refetch: fetchData,
  };
}