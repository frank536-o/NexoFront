export class Servicio {
  constructor(idServicio, nombreServicio, descripcionServicio, precioServicio, categoriaServicio, disponibilidadServicio, estadoServicio = true, prestador = null) {
    this.idServicio = idServicio;
    this.nombreServicio = nombreServicio;
    this.descripcionServicio = descripcionServicio;
    this.precioServicio = precioServicio;
    this.categoriaServicio = categoriaServicio;
    this.disponibilidadServicio = disponibilidadServicio;
    this.estadoServicio = estadoServicio;
    this.prestador = prestador;
  }
}