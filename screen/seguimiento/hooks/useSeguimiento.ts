import { useCallback, useEffect, useState } from "react";
import { httpClient } from "../../../http/httpClient";
import { getUsuarioId } from "../../../storage/storage";
import { SeguimientoResponse } from "../types/seguimiento";

export function useSeguimiento(idUsuarioFiltro?: number | null) {
  const [data, setData] = useState<SeguimientoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSeguimiento = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const usuarioIdLogueado = await getUsuarioId();

      const idUsuario = idUsuarioFiltro ?? usuarioIdLogueado;

      const response = await httpClient.getAuth<SeguimientoResponse>(
        `/api/seguimiento?idUsuario=${idUsuario}`,
        "No se pudo cargar el seguimiento",
      );

      setData(response);
    } catch (err: any) {
      setError(err?.message || "No se pudo cargar el seguimiento");
    } finally {
      setLoading(false);
    }
  }, [idUsuarioFiltro]);

  useEffect(() => {
    fetchSeguimiento();
  }, [fetchSeguimiento]);

  return {
    data,
    loading,
    error,
    refetch: fetchSeguimiento,
    refresh: fetchSeguimiento,
  };
}