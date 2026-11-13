export class NexoService {
  constructor() {
    this.ADMIN_PIN = 'NEXO2026';
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem('nexo_usuarios')) {
      const usuariosIniciales = [
        {
          id: '1001',
          docType: 'CC',
          userName: 'admin_nexo',
          name: 'Admin',
          lastName: 'Principal',
          address: 'Sede Central Nexo, Itagüí',
          phone: '3000000000',
          birthDay: '1990-01-01',
          email: 'admin@nexo.com',
          password: '123',
          role: 'ADMIN',
          avatar: 'https://ui-avatars.com/api/?name=Admin+Nexo&background=a855f7&color=fff',
          saldoBilletera: 0
        },
        {
          id: '102030',
          docType: 'CC',
          userName: 'carlos_motos',
          name: 'Carlos',
          lastName: 'Pérez',
          address: 'Cra 50 # 45-12, Itagüí',
          phone: '3001234567',
          birthDay: '1995-05-10',
          email: 'carlos@mail.com',
          password: '123',
          role: 'PRESTADOR',
          descripPerfil: 'Técnico especialista en mantenimiento preventivo y reparación de motocicletas.',
          calificacion: 4.9,
          avatar: 'https://ui-avatars.com/api/?name=Carlos+Perez&background=7e22ce&color=fff',
          saldoBilletera: 150000
        },
        {
          id: '104050',
          docType: 'CC',
          userName: 'frankin_dev',
          name: 'Frankin',
          lastName: 'Ochoa',
          address: 'Envigado, Antioquia',
          phone: '3109876543',
          birthDay: '2000-03-15',
          email: 'cliente@mail.com',
          password: '123',
          role: 'CLIENTE',
          avatar: 'https://ui-avatars.com/api/?name=Frankin+Ochoa&background=06b6d4&color=fff',
          saldoBilletera: 300000
        }
      ];
      localStorage.setItem('nexo_usuarios', JSON.stringify(usuariosIniciales));
    }

    if (!localStorage.getItem('nexo_servicios')) {
      const serviciosIniciales = [
        {
          idServicio: 101,
          nombreServicio: 'Mantenimiento Preventivo Moto',
          descripcionServicio: 'Cambio de aceite, sincronización, revisión de frenos y tensión de kit de arrastre.',
          precioServicio: 90000,
          categoriaServicio: 'Mecánica & Motos',
          imagen: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
          prestadorId: '102030',
          prestadorNombre: 'Bryant Myers',
          calificacion: 4.9
        },
        {
          idServicio: 102,
          nombreServicio: 'Desarrollo Landing Page Moderna',
          descripcionServicio: 'Diseño y maquetación web responsiva en HTML5, CSS3 y JavaScript con enfoque en conversión.',
          precioServicio: 250000,
          categoriaServicio: 'Desarrollo Web',
          imagen: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
          prestadorId: '102030',
          prestadorNombre: 'Albeiro Gómez',
          calificacion: 4.8
        },
        {
          idServicio: 103,
          nombreServicio: 'Identidad Visual y UI Kit',
          descripcionServicio: 'Creación de paleta de colores, tipografía y componentes visuales en Figma.',
          precioServicio: 180000,
          categoriaServicio: 'Diseño & UI',
          imagen: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80',
          prestadorId: '102030',
          prestadorNombre: 'Jennifer López',
          calificacion: 5.0
        },
        {
          idServicio: 104,
          nombreServicio: 'Instalación Eléctrica y Redes Hogar',
          descripcionServicio: 'Cableado estructurado, montaje de puntos de red y revisión de tableros eléctricos.',
          precioServicio: 110000,
          categoriaServicio: 'Servicios del Hogar',
          imagen: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
          prestadorId: '102030',
          prestadorNombre: 'Ricardo Arjona',
          calificacion: 4.7
        }
      ];
      localStorage.setItem('nexo_servicios', JSON.stringify(serviciosIniciales));
    }

    if (!localStorage.getItem('nexo_reservas')) {
      localStorage.setItem('nexo_reservas', JSON.stringify([]));
    }

    const catsGuardadas = JSON.parse(localStorage.getItem('nexo_categorias') || '[]');
    if (catsGuardadas.length === 0) {
      const categoriasIniciales = [
        'Mecánica & Motos',
        'Desarrollo Web',
        'Diseño & UI',
        'Servicios del Hogar'
      ];
      localStorage.setItem('nexo_categorias', JSON.stringify(categoriasIniciales));
    }
  }

  // --- CRUD USUARIOS ---
  obtenerUsuarios() {
    return JSON.parse(localStorage.getItem('nexo_usuarios')) || [];
  }

  registrarUsuario(datos, pinIngresado = '') {
    const usuarios = this.obtenerUsuarios();

    if (datos.role === 'ADMIN' && pinIngresado !== this.ADMIN_PIN) {
      return { ok: false, mensaje: 'PIN de seguridad de Administrador incorrecto.' };
    }

    if (usuarios.some(u => u.id === datos.id)) {
      return { ok: false, mensaje: 'Ya existe un usuario registrado con ese Documento ID.' };
    }
    if (usuarios.some(u => u.userName.toLowerCase() === datos.userName.toLowerCase())) {
      return { ok: false, mensaje: 'Ese Nombre de Usuario ya está en uso.' };
    }
    if (usuarios.some(u => u.email.toLowerCase() === datos.email.toLowerCase())) {
      return { ok: false, mensaje: 'Ese Correo Electrónico ya está registrado.' };
    }

    const nuevoUsuario = {
      ...datos,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(datos.name + ' ' + datos.lastName)}&background=a855f7&color=fff`,
      saldoBilletera: 0,
      calificacion: 5.0
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem('nexo_usuarios', JSON.stringify(usuarios));
    this.guardarSesion(nuevoUsuario);

    return { ok: true, usuario: nuevoUsuario };
  }

  login(identificador, password) {
    const usuarios = this.obtenerUsuarios();
    const user = usuarios.find(
      u => (u.email.toLowerCase() === identificador.toLowerCase() || u.userName.toLowerCase() === identificador.toLowerCase()) &&
           u.password === password
    );

    if (user) {
      this.guardarSesion(user);
      return user;
    }
    return null;
  }

  guardarSesion(usuario) {
    sessionStorage.setItem('usuarioActivo', JSON.stringify(usuario));
  }

  obtenerUsuarioSesion() {
    const sesion = sessionStorage.getItem('usuarioActivo');
    if (!sesion) return null;
    const parsed = JSON.parse(sesion);
    const actualizado = this.obtenerUsuarios().find(u => u.id === parsed.id);
    return actualizado || parsed;
  }

  cerrarSesion() {
    sessionStorage.removeItem('usuarioActivo');
  }

  actualizarUsuario(id, camposEditados) {
    const usuarios = this.obtenerUsuarios();
    const index = usuarios.findIndex(u => u.id === id);
    if (index === -1) return { ok: false, mensaje: 'Usuario no encontrado.' };

    if (camposEditados.email && usuarios.some(u => u.email.toLowerCase() === camposEditados.email.toLowerCase() && u.id !== id)) {
      return { ok: false, mensaje: 'El correo ya está siendo usado por otra cuenta.' };
    }

    usuarios[index] = { ...usuarios[index], ...camposEditados };
    localStorage.setItem('nexo_usuarios', JSON.stringify(usuarios));

    const activo = this.obtenerUsuarioSesion();
    if (activo && activo.id === id) {
      this.guardarSesion(usuarios[index]);
    }
    return { ok: true, usuario: usuarios[index] };
  }

  eliminarUsuario(id) {
    let usuarios = this.obtenerUsuarios();
    usuarios = usuarios.filter(u => u.id !== id);
    localStorage.setItem('nexo_usuarios', JSON.stringify(usuarios));

    const activo = this.obtenerUsuarioSesion();
    if (activo && activo.id === id) {
      this.cerrarSesion();
    }
  }

  // --- BILLETERA ---
  recargarBilletera(idUsuario, monto) {
    const usuarios = this.obtenerUsuarios();
    const index = usuarios.findIndex(u => u.id === idUsuario);
    if (index === -1) return null;

    usuarios[index].saldoBilletera = Number(usuarios[index].saldoBilletera) + Number(monto);
    localStorage.setItem('nexo_usuarios', JSON.stringify(usuarios));
    this.guardarSesion(usuarios[index]);
    return usuarios[index];
  }

  // --- SERVICIOS ---
  obtenerServicios() {
    return JSON.parse(localStorage.getItem('nexo_servicios')) || [];
  }

  agregarServicio(servicio) {
    const servicios = this.obtenerServicios();
    servicios.push(servicio);
    localStorage.setItem('nexo_servicios', JSON.stringify(servicios));
  }

  eliminarServicio(idServicio) {
    const servicios = this.obtenerServicios().filter(s => s.idServicio !== idServicio);
    localStorage.setItem('nexo_servicios', JSON.stringify(servicios));
  }

  // --- CATEGORÍAS ---
  obtenerCategorias() {
    return JSON.parse(localStorage.getItem('nexo_categorias')) || [];
  }

  agregarCategoria(nombreCategoria) {
    const categorias = this.obtenerCategorias();
    const limpia = nombreCategoria.trim();
    if (!limpia) return { ok: false, mensaje: 'Escribe un nombre válido.' };
    if (categorias.some(c => c.toLowerCase() === limpia.toLowerCase())) {
      return { ok: false, mensaje: 'Esa categoría ya existe.' };
    }
    categorias.push(limpia);
    localStorage.setItem('nexo_categorias', JSON.stringify(categorias));
    return { ok: true, mensaje: `Categoría "${limpia}" creada con éxito.` };
  }

  eliminarCategoria(nombreCategoria) {
    const categorias = this.obtenerCategorias().filter(c => c !== nombreCategoria);
    localStorage.setItem('nexo_categorias', JSON.stringify(categorias));
  }

  // --- RESERVAS Y CALIFICACIONES ---
  obtenerReservas() {
    return JSON.parse(localStorage.getItem('nexo_reservas')) || [];
  }

  crearReserva(clienteId, servicio, fechaReserva) {
    const usuarios = this.obtenerUsuarios();
    const idxCliente = usuarios.findIndex(u => u.id === clienteId);
    if (idxCliente === -1) return { ok: false, mensaje: 'Debes iniciar sesión.' };

    if (String(clienteId) === String(servicio.prestadorId)) {
      return { ok: false, mensaje: 'No puedes reservar un servicio publicado por ti mismo.' };
    }

    const cliente = usuarios[idxCliente];
    if (cliente.saldoBilletera < servicio.precioServicio) {
      return { ok: false, mensaje: 'Saldo insuficiente en tu Billetera Nexo. Recarga e intenta de nuevo.' };
    }

    usuarios[idxCliente].saldoBilletera -= Number(servicio.precioServicio);
    const idxPrestador = usuarios.findIndex(u => u.id === servicio.prestadorId);
    if (idxPrestador !== -1) {
      usuarios[idxPrestador].saldoBilletera += Number(servicio.precioServicio);
    }

    localStorage.setItem('nexo_usuarios', JSON.stringify(usuarios));
    this.guardarSesion(usuarios[idxCliente]);

    const reservas = this.obtenerReservas();
    reservas.push({
      idReserva: Date.now(),
      clienteId: cliente.id,
      clienteNombre: `${cliente.name} ${cliente.lastName}`,
      prestadorId: servicio.prestadorId,
      prestadorNombre: servicio.prestadorNombre,
      idServicio: servicio.idServicio,
      nombreServicio: servicio.nombreServicio,
      precio: servicio.precioServicio,
      fecha: fechaReserva,
      estado: 'Confirmada',
      calificacion: null,
      comentario: ''
    });

    localStorage.setItem('nexo_reservas', JSON.stringify(reservas));
    return { ok: true, mensaje: '¡Servicio reservado y pagado con éxito desde tu Billetera!' };
  }

  calificarReserva(idReserva, estrellas, comentario) {
    const reservas = this.obtenerReservas();
    const index = reservas.findIndex(r => r.idReserva === idReserva);
    if (index === -1) return;

    reservas[index].calificacion = Number(estrellas);
    reservas[index].comentario = comentario;
    reservas[index].estado = 'Completada y Calificada';
    localStorage.setItem('nexo_reservas', JSON.stringify(reservas));
  }
}