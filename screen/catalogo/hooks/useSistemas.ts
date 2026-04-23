import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { httpClient } from "../../../http/httpClient";
import { getSistemasCache, saveSistemasCache } from "../../../storage/storage";
import { Sistema } from "../types/sistema";

export function useSistemas() {
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSistemas = useCallback(async () => {
    try {
      setLoading(true);

      const cachedData = await getSistemasCache();
      if (cachedData) {
        setSistemas(cachedData);
      }

      const data = await httpClient.getAuth<Sistema[]>(
        "/api/catalogo/sistemas",
      );

      setSistemas(data);
      await saveSistemasCache(data);
      setError(null);
    } catch (err: any) {
      if (sistemas.length === 0) {
        setError(err.message || "Error al cargar el catálogo");
       Toast.show({
        type: "info",
        text1: "Sin Conexión",
        text2: "Se ha perdido la conexión con el servidor.",
      });
      }
    } finally {
      setLoading(false);
    }
  }, [sistemas.length]);

  useEffect(() => {
    fetchSistemas();
  }, []);

  return { sistemas, loading, error, refresh: fetchSistemas };
}
