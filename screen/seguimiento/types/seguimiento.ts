export interface ProspectoSeguimiento {
  id: number;
  iniciales: string;
  nombre: string;
  empresa: string;
  fecha: string;
  interes: string;
  rubro: string;
  estado: string;
  anticipo: number;
  proximoPaso: string;
}

export interface SeguimientoResumen {
  totalProspectos: number;
  conversion: number;
  altamenteInteresados: number;
}

export interface SeguimientoResponse extends SeguimientoResumen {
  prospectos: ProspectoSeguimiento[];
}