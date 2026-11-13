import { Usuario } from './Usuario.js';

export class Prestador extends Usuario {
  constructor(data, descripPerfil = '', calificacion = 0.0, serviciosRealizados = 0) {
    super(data);
    this.descripPerfil = descripPerfil;
    this.calificacion = calificacion;
    this.serviciosRealizados = serviciosRealizados;
  }
}