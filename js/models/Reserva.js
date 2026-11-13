export class Reserva {
  constructor(idReserva, fechaSolicitudReserva, fechaReserva, horaReserva, precioReserva, estadoReserva, cliente, servicios) {
    this.idReserva = idReserva;
    this.fechaSolicitudReserva = fechaSolicitudReserva;
    this.fechaReserva = fechaReserva;
    this.horaReserva = horaReserva;
    this.precioReserva = precioReserva;
    this.estadoReserva = estadoReserva; // Ej: "Pendiente", "Confirmada", "Finalizada"
    this.cliente = cliente;
    this.servicios = servicios;
  }
}