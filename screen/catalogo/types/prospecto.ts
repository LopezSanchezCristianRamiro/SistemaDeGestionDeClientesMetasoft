export interface ProspectoDTO {
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  correoElectronico: string;
  celular: string;
  estadoInteres: "Bajo" | "Medio" | "Alto";
  nombreEmpresa: string;
  adelanto: number;
  idSistemaRequerido: number;
  idUsuario: number;
}
