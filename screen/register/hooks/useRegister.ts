
import { useState } from "react";
import { httpClient } from "../../../http/httpClient";
import { RegisterPayload, RegisterResult } from "../types/auth";

export function useRegister() {
  const [loading, setLoading] = useState(false);

  async function submitRegister(payload: RegisterPayload): Promise<RegisterResult> {
    setLoading(true);
    try {
      await httpClient.post("/api/register", payload);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Ocurrió un error al registrarse.",
      };
    } finally {
      setLoading(false);
    }
  }

  return { submitRegister, loading };
}