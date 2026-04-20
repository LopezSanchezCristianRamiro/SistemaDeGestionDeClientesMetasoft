
export interface RegisterPayload {
  nombres: string;
  correoElectronico: string;
  nombreUsuario: string;
  contrasenia: string;
  contrasenia_confirmation: string;
  idRol: number;
}

export interface RegisterResult {
  success: boolean;
  error?: string;
}