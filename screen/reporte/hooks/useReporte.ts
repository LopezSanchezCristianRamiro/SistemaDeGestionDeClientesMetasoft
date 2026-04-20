import { useCallback, useEffect, useState } from "react";
import { httpClient } from "../../../http/httpClient";

// ─── Tipos actualizados al nuevo contrato de API ──────────────────────────────

export interface Seguimiento {
  id: number;
  nombre: string;
  empresa: string;
  sistemaRequerido: string;
  adelanto: number;
  estadoSeguimiento: string;
}

export interface RankingItem {
  idUsuario: number;
  nombre: string;
  totalProspectos: number;
  totalVentas: number;
}

export interface SistemaItem {
  nombre: string;
  leads: number;
}

export interface InteresProspectos {
  Alto: number;
  Medio: number;
  Bajo: number;
  total: number;
  porcentajes: { Alto: number; Medio: number; Bajo: number };
}

export interface ReportesData {
  totalProspectos: number;
  gananciaPotencial: number;
  porEstadoSeguimiento: Record<string, number>;
  interesProspectos: InteresProspectos;
  sistemasMasSolicitados: SistemaItem[];
  seguimientos: Seguimiento[];
  rankingProductividad: RankingItem[];
}

export interface ReportesMetrics {
  totalProspectos: number;
  gananciaPotencial: number;
  totalAdelantos: number;
  totalVendedores: number;
  estadoCounts: Record<string, number>;
}

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReportes() {
  const [data, setData] = useState<ReportesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await httpClient.getAuth<ReportesData>("/api/reportes");
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const seguimientos: Seguimiento[] = (data?.seguimientos ?? []).map((s) => ({
    ...s,
    adelanto: toNumber(s.adelanto),
    estadoSeguimiento: s.estadoSeguimiento || "Sin estado",
  }));

  const ranking: RankingItem[] = (data?.rankingProductividad ?? []).map((r) => ({
    ...r,
    totalProspectos: toNumber(r.totalProspectos),
    totalVentas: toNumber(r.totalVentas),
  }));

  const metrics: ReportesMetrics = {
    totalProspectos: toNumber(data?.totalProspectos),
    gananciaPotencial: toNumber(data?.gananciaPotencial),
    totalAdelantos: seguimientos.reduce((a, s) => a + s.adelanto, 0),
    totalVendedores: ranking.length,
    estadoCounts: data?.porEstadoSeguimiento ?? {},
  };

  return {
    seguimientos,
    ranking,
    metrics,
    interesProspectos: data?.interesProspectos ?? null,
    sistemasMasSolicitados: data?.sistemasMasSolicitados ?? [],
    loading,
    error,
    refetch: fetchData,
  };
}