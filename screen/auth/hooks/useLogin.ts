import { useState } from "react";
import { httpClient } from "../../../http/httpClient";
import { saveToken, saveUsuarioData, saveUsuarioId } from "../../../storage/storage";
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
        response.usuarioId ?? response.idUsuario ?? response.usuario?.idUsuario;
      const nombreUsuario =
        response.nombreUsuario ??
        response.usuario?.nombreUsuario ??
        credentials.nombreUsuario;

      if (!token) {
        throw new Error("La respuesta no incluyó un token de acceso");
      }

      await saveToken(token);

      if (response.usuario) {
        const p = response.usuario.persona;
        const usuarioData = {
          nombreUsuario: response.usuario.nombreUsuario ?? nombreUsuario ?? "",
          nombres: p?.nombres ?? "",
          apellido: `${p?.primerApellido ?? ""} ${p?.segundoApellido ?? ""}`.trim(),
          correo: p?.correoElectronico ?? "",
          rol: response.usuario.rol ?? "",
        };
        await saveUsuarioData(usuarioData);
        console.log("guardando usuarioData:", JSON.stringify(usuarioData));
      }

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
      const errorMessage = (() => {
        if (error instanceof Error) return error.message;
        if (typeof error === "object" && error !== null) {
          const anyErr = error as { message?: unknown; status?: unknown };
          if (typeof anyErr.message === "string" && anyErr.message.trim()) {
            return anyErr.message;
          }
          if (typeof anyErr.status === "number") {
            return `Error HTTP ${anyErr.status}`;
          }
        }
        if (typeof error === "string" && error.trim()) return error;
        return "No se pudo iniciar sesión";
      })();

      return {
        success: false as const,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return { submitLogin, loading };
};