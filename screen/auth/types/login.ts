export type LoginCredentials = {
  nombreUsuario: string;
  contrasenia: string;
};

export type LoginResponse = {
  token?: string;
  accessToken?: string;
  usuarioId?: string | number;
  idUsuario?: string | number;
  nombreUsuario?: string;
  usuario?: {
    id?: string | number;
    nombreUsuario?: string;
  };
};