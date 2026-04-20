export type LoginCredentials = {
  nombreUsuario: string;
  contrasenia: string;
};

export interface LoginResponse {
  message?: string;
  token?: string;
  accessToken?: string;
  usuarioId?: number;
  idUsuario?: number;
  nombreUsuario?: string;
  usuario?: {
    idUsuario: number;
    nombreUsuario: string;
    estado: string;
    rol: string;
    persona: {
      nombres: string;
      primerApellido: string;
      segundoApellido?: string;
      correoElectronico: string;
    };
  };
}