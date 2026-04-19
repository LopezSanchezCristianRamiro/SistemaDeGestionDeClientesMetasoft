import { useState } from "react";
import { httpClient } from "../../../http/httpClient";
import { saveToken, saveUsuarioId } from "../../../storage/storage";
import { LoginCredentials, LoginResponse } from "../types/login";

type LoginResult = {
  token: string;
  usuarioId?: string;
  nombreUsuario?: string;
};

const LOGIN_PATH = "/api/auth/login";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);

  const submitLogin = async (credentials: LoginCredentials) => {
    setLoading(true);

    try {
      const response = await httpClient.post<LoginResponse>(
        LOGIN_PATH,
        credentials,
        "No se pudo iniciar sesión",
      );

      const token = response.token ?? response.accessToken;
      const usuarioId =
        response.usuarioId ?? response.idUsuario ?? response.usuario?.id;
      const nombreUsuario =
        response.nombreUsuario ??
        response.usuario?.nombreUsuario ??
        credentials.nombreUsuario;

      if (!token) {
        throw new Error("La respuesta no incluyó un token de acceso");
      }

      await saveToken(token);

      if (usuarioId !== undefined && usuarioId !== null) {
        await saveUsuarioId(String(usuarioId));
      }

      const result: LoginResult = {
        token,
        usuarioId:
          usuarioId !== undefined && usuarioId !== null
            ? String(usuarioId)
            : undefined,
        nombreUsuario,
      };

      return { success: true as const, result };
    } catch (error) {
      return {
        success: false as const,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo iniciar sesión",
      };
    } finally {
      setLoading(false);
    }
  };

  return { submitLogin, loading };
};