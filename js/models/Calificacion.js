        export class Calificacion {
  constructor(idCalificacion, puntuacionCalificacion, comentarioCalificacion, fechaCalificacion, reserva = null) {
    this.idCalificacion = idCalificacion;
    this.puntuacionCalificacion = Number(puntuacionCalificacion);
    this.comentarioCalificacion = comentarioCalificacion;
    this.fechaCalificacion = fechaCalificacion;
    this.reserva = reserva;
  }
}