import { useCallback, useEffect, useState } from "react";
import { httpClient } from "../../../http/httpClient";
import { Sistema } from "../types/sistema";

/**
 * Hook personalizado para la gestión de datos del catálogo de sistemas.
 * Implementa la recuperación de datos desde el endpoint /api/sistemas.
 */
export function useSistemas() {
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSistemas = useCallback(async () => {
    try {
      setLoading(true);
      // Nota: El httpClient ya gestiona la base URL y errores
      console.log("Sistemas cargando:");
      const data = await httpClient.getAuth<Sistema[]>("/api/sistemas");
      console.log("Sistemas cargados:", data);
      setSistemas(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar el catálogo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSistemas();
  }, [fetchSistemas]);

  return { sistemas, loading, error, refresh: fetchSistemas };
}
