import { useState } from "react";
import Toast from "react-native-toast-message";
import { httpClient } from "../../../http/httpClient";
import { ProspectoDTO } from "../types/prospecto";

export const useProspectoForm = () => {
  const [loading, setLoading] = useState(false);

  const registrarProspecto = async (data: ProspectoDTO) => {
    setLoading(true);
    try {
      const response = await httpClient.postAuth<void>(
        "/api/catalogo/prospecto",
        data,
        "Error al registrar el prospecto en el sistema",
      );
      return { success: true, response };
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error al registrar",
        text2: "No se pudo registrar el prospecto. Verifique su conexión.",
        visibilityTime: 4000,
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { registrarProspecto, loading };
};
