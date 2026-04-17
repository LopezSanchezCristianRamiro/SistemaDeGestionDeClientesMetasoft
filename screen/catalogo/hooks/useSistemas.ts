import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { httpClient } from "../../../http/httpClient";
import { Sistema } from "../types/sistema";

export function useSistemas() {
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSistemas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await httpClient.getAuth<Sistema[]>(
        "/api/catalogo/sistemas",
      );
      setSistemas(data);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Error al cargar el catálogo",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSistemas();
  }, [fetchSistemas]);

  return { sistemas, loading, error, refresh: fetchSistemas };
}
