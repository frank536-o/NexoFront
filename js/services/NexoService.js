import { Servicio } from '../models/Servicio.js';
import { Prestador } from '../models/Prestador.js';
import { Cliente } from '../models/Cliente.js';
import { Billetera } from '../models/Billetera.js';

export class NexoService {
  constructor() {
    this.servicios = [];
    this.usuarios = [];
    this.initDatos();
  }

  initDatos() {
    // Billetera y usuario de prueba (Prestador)
    const billeteraPrestador = new Billetera(1, 150000);
    const prestadorDemo = new Prestador(
      {
        id: 1,
        docType: 'CC',
        name: 'Carlos',
        lastName: 'Pérez',
        phone: '3001234567',
        email: 'carlos@mail.com',
        address: 'Itagüí, Antioquia',
        password: '123',
        birthDay: '1995-05-10',
        billetera: billeteraPrestador
      },
      'Técnico en mantenimiento de motos y mecánica rápida.',
      4.8,
      12
    );

    // Billetera y usuario de prueba (Cliente)
    const billeteraCliente = new Billetera(2, 50000);
    const clienteDemo = new Cliente(
      {
        id: 2,
        docType: 'CC',
        name: 'Frankin',
        lastName: 'Ochoa',
        phone: '3109876543',
        email: 'cliente@mail.com',
        address: 'Itagüí, Antioquia',
        password: '123',
        birthDay: '2000-01-01',
        billetera: billeteraCliente
      },
      3
    );

    // Servicio demo asociado al prestador
    const servicioDemo = new Servicio(
      101,
      'Mantenimiento de Moto',
      'Cambio de aceite, revisión de frenos y kit de arrastre.',
      90000,
      'Mecánica',
      '2026-11-15',
      true,
      prestadorDemo
    );

    this.usuarios.push(prestadorDemo, clienteDemo);
    this.servicios.push(servicioDemo);
  }

  obtenerServicios() {
    return this.servicios;
  }

  agregarServicio(nuevoServicio) {
    this.servicios.push(nuevoServicio);
  }

  login(email, password) {
    const usuario = this.usuarios.find(u => u.email === email && u.password === password);
    if (usuario) {
      sessionStorage.setItem('usuarioActivo', JSON.stringify(usuario));
      return usuario;
    }
    return null;
  }

  obtenerUsuarioSesion() {
    const data = sessionStorage.getItem('usuarioActivo');
    return data ? JSON.parse(data) : null;
  }

  cerrarSesion() {
    sessionStorage.removeItem('usuarioActivo');
  }
}