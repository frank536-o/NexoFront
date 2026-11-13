export class Pago {
  constructor(idPago, montoPago, fechaPago, metodoPago, estadoPago = false, calificacion = null, reserva = null, billetera = null) {
    this.idPago = idPago;
    this.montoPago = Number(montoPago);
    this.fechaPago = fechaPago;
    this.metodoPago = metodoPago; // Ej: "Billetera Nexo"
    this.estadoPago = estadoPago; // true: Aprobado, false: Pendiente
    this.calificacion = calificacion;
    this.reserva = reserva;
    this.billetera = billetera;
  }
}