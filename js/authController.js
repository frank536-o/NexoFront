import { NexoService } from './services/NexoService.js';

export function inicializarAutenticacionUI(onSessionChangeCallback = null) {
  const nexoService = new NexoService();

  // Inyectar modales globales si no existen en el HTML
  inyectarModalesGlobales();

  const navRightContainer = document.getElementById('navRightContainer');
  const modalAuth = document.getElementById('modalAuth');
  const formAuth = document.getElementById('formAuth');
  const registerFields = document.getElementById('registerFields');
  const confirmPassWrapper = document.getElementById('confirmPassWrapper');
  const modalTitle = document.getElementById('modalTitle');
  const btnAuthSubmit = document.getElementById('btnAuthSubmit');
  const regRoleSelect = document.getElementById('regRole');
  const adminPinGroup = document.getElementById('adminPinGroup');
  const loginLockMessage = document.getElementById('loginLockMessage');

  let esModoRegistro = false;
  let intentosFallidos = Number(sessionStorage.getItem('nexo_intentos')) || 0;
  let bloqueoHasta = Number(sessionStorage.getItem('nexo_bloqueo')) || 0;
  let intervaloBloqueo = null;

  // --- BLOQUEO TEMPORAL TRAS 3 INTENTOS FALLIDOS ---
  function verificarBloqueo() {
    const ahora = Date.now();
    if (bloqueoHasta > ahora) {
      btnAuthSubmit.disabled = true;
      loginLockMessage.classList.remove('hidden');

      clearInterval(intervaloBloqueo);
      intervaloBloqueo = setInterval(() => {
        const restante = Math.ceil((bloqueoHasta - Date.now()) / 1000);
        if (restante <= 0) {
          clearInterval(intervaloBloqueo);
          btnAuthSubmit.disabled = false;
          loginLockMessage.classList.add('hidden');
          intentosFallidos = 0;
          sessionStorage.removeItem('nexo_intentos');
          sessionStorage.removeItem('nexo_bloqueo');
        } else {
          loginLockMessage.textContent = `Demasiados intentos fallidos. Intenta nuevamente en ${restante}s.`;
        }
      }, 500);
    }
  }

  // --- RENDERIZAR NAVBAR SEGÚN SESIÓN (ESTILO PLATZI) ---
  function actualizarNavbar() {
    if (!navRightContainer) return;
    const usuario = nexoService.obtenerUsuarioSesion();

    if (!usuario) {
      navRightContainer.innerHTML = `
        <button class="btn-secondary" id="btnOpenLogin">Iniciar Sesión</button>
        <button class="btn-primary" id="btnOpenRegister">Únete ahora</button>
      `;

      document.getElementById('btnOpenLogin').addEventListener('click', () => abrirModalAuth(false));
      document.getElementById('btnOpenRegister').addEventListener('click', () => abrirModalAuth(true));
    } else {
      const esPrestador = usuario.role === 'PRESTADOR';
      const esAdmin = usuario.role === 'ADMIN';

      navRightContainer.innerHTML = `
        <div class="user-menu-wrapper">
          <div class="user-pill" id="userPillBtn">
            <img src="${usuario.avatar}" alt="Avatar">
            <span class="user-pill-balance">$${Number(usuario.saldoBilletera).toLocaleString()}</span>
            <span style="font-size:12px; color:var(--text-muted);">▼</span>
          </div>

          <div class="user-dropdown hidden" id="userDropdownMenu">
            <div class="dropdown-header">
              <h4>Hola ${usuario.name.toUpperCase()}</h4>
              <span>${usuario.role} • @${usuario.userName}</span>
            </div>

            <div class="dropdown-wallet-box">
              <div>
                <small style="color:var(--text-muted); display:block;">Billetera Nexo</small>
                <strong style="color:var(--accent-green);">$${Number(usuario.saldoBilletera).toLocaleString()}</strong>
              </div>
              <button class="btn-primary" style="padding:6px 12px; font-size:12px;" id="optRecargar">Recargar</button>
            </div>

            <ul class="dropdown-list">
              ${esAdmin ? `<li onclick="window.location.href='panel_control.html'">🛡️ Panel Administrador</li>` : ''}
              <li id="optEditarPerfil">👤 Editar perfil</li>
              <li id="optCambiarPass">🔒 Cambiar contraseña</li>
              ${esPrestador ? `<li id="optPublicarServicio">➕ Publicar servicio</li>` : ''}
              ${esPrestador ? `<li id="optMisServicios">🛠️ Mis servicios publicados</li>` : ''}
              <li id="optMisReservas">📅 ${esPrestador ? 'Servicios agendados' : 'Mis reservas y servicios'}</li>
              <li id="optCalificaciones">⭐ Calificaciones</li>
              <li class="logout-item" id="optCerrarSesion">🚪 Cerrar sesión</li>
            </ul>
          </div>
        </div>
      `;

      const userPillBtn = document.getElementById('userPillBtn');
      const userDropdownMenu = document.getElementById('userDropdownMenu');

      userPillBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdownMenu.classList.toggle('hidden');
      });

      document.addEventListener('click', () => {
        if (userDropdownMenu) userDropdownMenu.classList.add('hidden');
      });

      document.getElementById('optRecargar').addEventListener('click', () => abrirModalBilletera());
      document.getElementById('optEditarPerfil').addEventListener('click', () => abrirModalPerfil());
      document.getElementById('optCambiarPass').addEventListener('click', () => abrirModalPassword());
      document.getElementById('optMisReservas').addEventListener('click', () => abrirModalReservas());
      document.getElementById('optCalificaciones').addEventListener('click', () => abrirModalReservas());

      if (esPrestador) {
        document.getElementById('optPublicarServicio').addEventListener('click', () => {
          document.getElementById('formPublicarServModal').reset();
          const selectCat = document.getElementById('pubServCategoria');
          selectCat.innerHTML = nexoService.obtenerCategorias()
            .map(c => `<option value="${c}">${c}</option>`)
            .join('');
          document.getElementById('modalPublicarServicio').classList.remove('hidden');
        });

        document.getElementById('optMisServicios').addEventListener('click', () => abrirModalMisServicios());
      }

      document.getElementById('optCerrarSesion').addEventListener('click', () => {
        nexoService.cerrarSesion();
        actualizarNavbar();
        if (onSessionChangeCallback) onSessionChangeCallback();
      });
    }
  }

  function abrirModalAuth(registro) {
    esModoRegistro = registro;
    formAuth.reset();
    adminPinGroup.classList.add('hidden');

    const idsObligatoriosRegistro = [
      'regDocId', 'regUserName', 'regBirthDay',
      'regName', 'regLastName', 'regAddress',
      'regPhone', 'regConfirmPassword'
    ];

    if (registro) {
      modalTitle.textContent = 'Crear Cuenta en Nexo';
      registerFields.classList.remove('hidden');
      confirmPassWrapper.classList.remove('hidden');
      btnAuthSubmit.textContent = 'Registrarme';
      btnAuthSubmit.disabled = false;
      loginLockMessage.classList.add('hidden');
      idsObligatoriosRegistro.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.required = true;
      });
    } else {
      modalTitle.textContent = 'Ingresar a Nexo';
      registerFields.classList.add('hidden');
      confirmPassWrapper.classList.add('hidden');
      btnAuthSubmit.textContent = 'Ingresar';
      idsObligatoriosRegistro.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.required = false;
      });
      verificarBloqueo();
    }
    modalAuth.classList.remove('hidden');
  }

  // Mostrar campo PIN si elige ADMIN
  if (regRoleSelect) {
    regRoleSelect.addEventListener('change', (e) => {
      if (e.target.value === 'ADMIN') {
        adminPinGroup.classList.remove('hidden');
      } else {
        adminPinGroup.classList.add('hidden');
      }
    });
  }

  // Submit Login / Registro
  if (formAuth) {
    formAuth.addEventListener('submit', (e) => {
      e.preventDefault();

      if (esModoRegistro) {
        const docId = document.getElementById('regDocId').value.trim();
        const userName = document.getElementById('regUserName').value.trim();
        const birthDay = document.getElementById('regBirthDay').value;
        const name = document.getElementById('regName').value.trim();
        const lastName = document.getElementById('regLastName').value.trim();
        const address = document.getElementById('regAddress').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const email = document.getElementById('authEmail').value.trim();
        const pass = document.getElementById('authPassword').value;
        const confirmPass = document.getElementById('regConfirmPassword').value;
        const role = document.getElementById('regRole').value;
        const pin = document.getElementById('regAdminPin').value.trim();

        if (!docId || !userName || !birthDay || !name || !lastName || !address || !phone || !email || !pass) {
          alert('Todos los campos son obligatorios para registrarte.');
          return;
        }

        if (!email.includes('@') || !email.includes('.')) {
          alert('Ingresa un correo electrónico válido.');
          return;
        }

        if (role === 'ADMIN' && !pin) {
          alert('Debes ingresar el PIN de seguridad para registrarte como Administrador.');
          return;
        }

        if (pass !== confirmPass) {
          alert('Las contraseñas no coinciden.');
          return;
        }

        const datos = {
          id: docId,
          docType: document.getElementById('regDocType').value,
          userName,
          name,
          lastName,
          address,
          phone,
          birthDay,
          email,
          password: pass,
          role
        };

        const res = nexoService.registrarUsuario(datos, pin);

        if (!res.ok) {
          alert(res.mensaje);
          return;
        }

        alert(`¡Cuenta creada con éxito, ${res.usuario.name}!`);
        modalAuth.classList.add('hidden');

        if (res.usuario.role === 'ADMIN') {
          window.location.href = 'panel_control.html';
        } else {
          actualizarNavbar();
          if (onSessionChangeCallback) onSessionChangeCallback();
        }
      } else {
        if (bloqueoHasta > Date.now()) {
          verificarBloqueo();
          return;
        }

        const emailOUser = document.getElementById('authEmail').value.trim();
        const pass = document.getElementById('authPassword').value;

        const usuario = nexoService.login(emailOUser, pass);

        if (usuario) {
          intentosFallidos = 0;
          sessionStorage.removeItem('nexo_intentos');
          sessionStorage.removeItem('nexo_bloqueo');
          modalAuth.classList.add('hidden');

          if (usuario.role === 'ADMIN') {
            window.location.href = 'panel_control.html';
          } else {
            actualizarNavbar();
            if (onSessionChangeCallback) onSessionChangeCallback();
          }
        } else {
          intentosFallidos++;
          sessionStorage.setItem('nexo_intentos', intentosFallidos);

          if (intentosFallidos >= 3) {
            bloqueoHasta = Date.now() + 30000;
            sessionStorage.setItem('nexo_bloqueo', bloqueoHasta);
            verificarBloqueo();
          } else {
            alert(`Credenciales incorrectas. Intento ${intentosFallidos} de 3.`);
          }
        }
      }
    });
  }

  // --- FUNCIONES DE MODALES DE USUARIO ---
  function abrirModalBilletera() {
    const usuario = nexoService.obtenerUsuarioSesion();
    document.getElementById('walletCurrentBalance').textContent = `$${Number(usuario.saldoBilletera).toLocaleString()}`;
    document.getElementById('modalBilletera').classList.remove('hidden');
  }

  function abrirModalPerfil() {
    const u = nexoService.obtenerUsuarioSesion();
    document.getElementById('editDocId').value = u.id;
    document.getElementById('editDocType').value = u.docType;
    document.getElementById('editUserName').value = u.userName;
    document.getElementById('editBirthDay').value = u.birthDay;

    document.getElementById('editName').value = u.name;
    document.getElementById('editLastName').value = u.lastName;
    document.getElementById('editAddress').value = u.address;
    document.getElementById('editPhone').value = u.phone;
    document.getElementById('editEmail').value = u.email;

    document.getElementById('modalPerfil').classList.remove('hidden');
  }

  function abrirModalPassword() {
    document.getElementById('formCambiarPass').reset();
    document.getElementById('modalPassword').classList.remove('hidden');
  }

  function abrirModalReservas() {
    const u = nexoService.obtenerUsuarioSesion();
    const reservas = nexoService.obtenerReservas().filter(r => r.clienteId === u.id || r.prestadorId === u.id);
    const cont = document.getElementById('listaReservasUsuario');

    if (reservas.length === 0) {
      cont.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Aún no tienes reservas o servicios registrados.</p>';
    } else {
      cont.innerHTML = reservas.map(r => `
        <div style="background:#0f0919; border:1px solid var(--border-color); padding:14px; border-radius:10px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <strong>${r.nombreServicio}</strong>
            <span style="color:var(--accent-green); font-weight:bold;">$${Number(r.precio).toLocaleString()}</span>
          </div>
          <small style="color:var(--text-muted); display:block;">Fecha: ${r.fecha} • Estado: ${r.estado}</small>
          <small style="color:var(--text-muted); display:block;">Prestador: ${r.prestadorNombre} | Cliente: ${r.clienteNombre}</small>
          ${r.calificacion ? `<p style="margin-top:6px; color:#fbbf24;">⭐ ${r.calificacion}/5 - "${r.comentario}"</p>` : ''}
          ${(!r.calificacion && r.clienteId === u.id) ? `
            <button class="btn-secondary" style="margin-top:8px; padding:5px 12px; font-size:12px;" onclick="window.calificarServicioPrompt(${r.idReserva})">Calificar Servicio</button>
          ` : ''}
        </div>
      `).join('');
    }
    document.getElementById('modalReservas').classList.remove('hidden');
  }

  function abrirModalMisServicios() {
    const u = nexoService.obtenerUsuarioSesion();
    const misServicios = nexoService.obtenerServicios().filter(s => String(s.prestadorId) === String(u.id));
    const cont = document.getElementById('listaMisServiciosPrestador');

    if (misServicios.length === 0) {
      cont.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Aún no has publicado ningún servicio.</p>';
    } else {
      cont.innerHTML = misServicios.map(s => `
        <div style="background:#0f0919; border:1px solid var(--border-color); padding:14px; border-radius:10px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
          <div>
            <span style="font-size:11px; color:var(--purple-neon); font-weight:700;">${s.categoriaServicio}</span>
            <strong style="display:block; margin:2px 0;">${s.nombreServicio}</strong>
            <small style="color:var(--accent-green); font-weight:700;">$${Number(s.precioServicio).toLocaleString()}</small>
          </div>
          <button class="btn-danger" style="padding:6px 12px; font-size:12px;" onclick="window.prestadorBorrarServicio(${s.idServicio})">Eliminar</button>
        </div>
      `).join('');
    }
    document.getElementById('modalMisServicios').classList.remove('hidden');
  }

  window.prestadorBorrarServicio = (idServicio) => {
    if (!confirm('¿Seguro que deseas eliminar este servicio de tu catálogo?')) return;
    nexoService.eliminarServicio(idServicio);
    abrirModalMisServicios();
    if (onSessionChangeCallback) onSessionChangeCallback();
  };

  window.calificarServicioPrompt = (idReserva) => {
    const estrellas = prompt('Califica este servicio del 1 al 5:');
    if (!estrellas || isNaN(estrellas) || estrellas < 1 || estrellas > 5) return;
    const comentario = prompt('Escribe un breve comentario sobre la atención:') || 'Excelente servicio.';
    nexoService.calificarReserva(idReserva, estrellas, comentario);
    alert('¡Gracias por tu calificación!');
    abrirModalReservas();
  };

  document.getElementById('formRecarga').addEventListener('submit', (e) => {
    e.preventDefault();
    const monto = Number(document.getElementById('montoRecarga').value);
    if (monto <= 0) return;
    const u = nexoService.obtenerUsuarioSesion();
    nexoService.recargarBilletera(u.id, monto);
    alert(`¡Recarga exitosa de $${monto.toLocaleString()}!`);
    document.getElementById('modalBilletera').classList.add('hidden');
    actualizarNavbar();
  });

  document.getElementById('formEditarPerfil').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = nexoService.obtenerUsuarioSesion();
    const res = nexoService.actualizarUsuario(u.id, {
      name: document.getElementById('editName').value.trim(),
      lastName: document.getElementById('editLastName').value.trim(),
      address: document.getElementById('editAddress').value.trim(),
      phone: document.getElementById('editPhone').value.trim(),
      email: document.getElementById('editEmail').value.trim()
    });

    if (!res.ok) {
      alert(res.mensaje);
      return;
    }
    alert('Datos actualizados correctamente.');
    document.getElementById('modalPerfil').classList.add('hidden');
    actualizarNavbar();
  });

  document.getElementById('btnEliminarMiCuenta').addEventListener('click', () => {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción no se puede deshacer.');
    if (!confirmar) return;
    const u = nexoService.obtenerUsuarioSesion();
    nexoService.eliminarUsuario(u.id);
    alert('Tu cuenta ha sido eliminada.');
    document.getElementById('modalPerfil').classList.add('hidden');
    actualizarNavbar();
    if (onSessionChangeCallback) onSessionChangeCallback();
  });

  document.getElementById('formCambiarPass').addEventListener('submit', (e) => {
    e.preventDefault();
    const nueva = document.getElementById('newPass').value;
    const confirmar = document.getElementById('confirmNewPass').value;
    if (nueva !== confirmar) {
      alert('Las contraseñas nuevas no coinciden.');
      return;
    }
    const u = nexoService.obtenerUsuarioSesion();
    nexoService.actualizarUsuario(u.id, { password: nueva });
    alert('Contraseña actualizada con éxito.');
    document.getElementById('modalPassword').classList.add('hidden');
  });

  // Publicar servicio leyendo imagen desde el PC (FileReader -> Base64)
  document.getElementById('formPublicarServModal').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = nexoService.obtenerUsuarioSesion();
    const fileInput = document.getElementById('pubServImgFile');
    const archivo = fileInput.files[0];

    const guardarServicioConImagen = (urlImagen) => {
      nexoService.agregarServicio({
        idServicio: Date.now(),
        nombreServicio: document.getElementById('pubServNombre').value.trim(),
        descripcionServicio: document.getElementById('pubServDesc').value.trim(),
        precioServicio: Number(document.getElementById('pubServPrecio').value),
        categoriaServicio: document.getElementById('pubServCategoria').value,
        imagen: urlImagen || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        prestadorId: u.id,
        prestadorNombre: `${u.name} ${u.lastName}`,
        calificacion: 5.0
      });
      alert('¡Servicio publicado en el catálogo de Nexo!');
      document.getElementById('modalPublicarServicio').classList.add('hidden');
      if (onSessionChangeCallback) onSessionChangeCallback();
    };

    if (archivo) {
      const reader = new FileReader();
      reader.onload = (ev) => guardarServicioConImagen(ev.target.result);
      reader.readAsDataURL(archivo);
    } else {
      guardarServicioConImagen(null);
    }
  });

  actualizarNavbar();
}

function inyectarModalesGlobales() {
  if (document.getElementById('modalAuth')) return;

  const htmlModales = `
    <!-- Modal Login / Registro -->
    <div id="modalAuth" class="modal hidden">
      <div class="modal-content">
        <span class="close-modal" onclick="document.getElementById('modalAuth').classList.add('hidden')">&times;</span>
        <h2 id="modalTitle" style="margin-bottom: 18px;">Ingresar a Nexo</h2>
        <p id="loginLockMessage" class="hidden" style="color:var(--accent-red); background:rgba(239,68,68,0.1); padding:10px; border-radius:8px; margin-bottom:12px; font-size:13px;"></p>

        <form id="formAuth">
          <div id="registerFields" class="hidden">
            <div class="form-grid-2">
              <div class="form-group">
                <label>Tipo de Documento:</label>
                <select id="regDocType">
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="PAS">Pasaporte</option>
                </select>
              </div>
              <div class="form-group">
                <label>Documento ID:</label>
                <input type="text" id="regDocId" placeholder="Ej: 10203040">
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label>Nombre de Usuario:</label>
                <input type="text" id="regUserName" placeholder="Ej: frank_dev">
              </div>
              <div class="form-group">
                <label>Fecha de Nacimiento:</label>
                <input type="date" id="regBirthDay">
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label>Nombre:</label>
                <input type="text" id="regName" placeholder="Tu nombre">
              </div>
              <div class="form-group">
                <label>Apellidos:</label>
                <input type="text" id="regLastName" placeholder="Tus apellidos">
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label>Dirección Residencial:</label>
                <input type="text" id="regAddress" placeholder="Ej: Cra 45 # 12-30">
              </div>
              <div class="form-group">
                <label>Número de Celular:</label>
                <input type="tel" id="regPhone" placeholder="Ej: 3001234567">
              </div>
            </div>

            <div class="form-group">
              <label>Rol en Nexo:</label>
              <select id="regRole">
                <option value="CLIENTE">Cliente (Quiero contratar servicios)</option>
                <option value="PRESTADOR">Prestador (Quiero ofrecer servicios)</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div class="form-group hidden" id="adminPinGroup">
              <label style="color:var(--purple-neon);">PIN de Seguridad Administrador:</label>
              <input type="password" id="regAdminPin" placeholder="Ingresa el código maestro">
            </div>
          </div>

          <div class="form-group">
            <label>Correo Electrónico (o Usuario en Login):</label>
            <input type="text" id="authEmail" required placeholder="correo@ejemplo.com">
          </div>

          <div class="form-group">
            <label>Contraseña:</label>
            <input type="password" id="authPassword" required placeholder="••••••••">
          </div>

          <div class="form-group hidden" id="confirmPassWrapper">
            <label>Confirmar Contraseña:</label>
            <input type="password" id="regConfirmPassword" placeholder="Repite tu contraseña">
          </div>

          <button type="submit" class="btn-primary" id="btnAuthSubmit" style="width:100%; margin-top:8px;">Ingresar</button>
        </form>
      </div>
    </div>

    <!-- Modal Billetera -->
    <div id="modalBilletera" class="modal hidden">
      <div class="modal-content">
        <span class="close-modal" onclick="document.getElementById('modalBilletera').classList.add('hidden')">&times;</span>
        <h2 style="margin-bottom:10px;">Mi Billetera Nexo</h2>
        <p style="color:var(--text-muted); margin-bottom:20px;">Saldo disponible: <strong id="walletCurrentBalance" style="color:var(--accent-green); font-size:20px;">$0</strong></p>
        <form id="formRecarga">
          <div class="form-group">
            <label>Monto a recargar (COP):</label>
            <input type="number" id="montoRecarga" min="10000" step="5000" value="50000" required>
          </div>
          <button type="submit" class="btn-primary" style="width:100%;">Recargar Saldo</button>
        </form>
      </div>
    </div>

    <!-- Modal Editar Perfil (CRUD Update & Delete) -->
    <div id="modalPerfil" class="modal hidden">
      <div class="modal-content">
        <span class="close-modal" onclick="document.getElementById('modalPerfil').classList.add('hidden')">&times;</span>
        <h2 style="margin-bottom:15px;">Mi Perfil</h2>
        <form id="formEditarPerfil">
          <div class="form-grid-2">
            <div class="form-group">
              <label>Tipo Documento (No editable):</label>
              <input type="text" id="editDocType" disabled>
            </div>
            <div class="form-group">
              <label>Documento ID (No editable):</label>
              <input type="text" id="editDocId" disabled>
            </div>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label>Usuario (No editable):</label>
              <input type="text" id="editUserName" disabled>
            </div>
            <div class="form-group">
              <label>Nacimiento (No editable):</label>
              <input type="text" id="editBirthDay" disabled>
            </div>
          </div>

          <hr style="border-color:var(--border-color); margin:14px 0;">

          <div class="form-grid-2">
            <div class="form-group">
              <label>Nombre:</label>
              <input type="text" id="editName" required>
            </div>
            <div class="form-group">
              <label>Apellidos:</label>
              <input type="text" id="editLastName" required>
            </div>
          </div>
          <div class="form-group">
            <label>Dirección Residencial:</label>
            <input type="text" id="editAddress" required>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label>Número de Celular:</label>
              <input type="tel" id="editPhone" required>
            </div>
            <div class="form-group">
              <label>Correo Electrónico:</label>
              <input type="email" id="editEmail" required>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:18px; gap:10px;">
            <button type="button" class="btn-danger" id="btnEliminarMiCuenta">Eliminar Cuenta</button>
            <button type="submit" class="btn-primary">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Cambiar Contraseña -->
    <div id="modalPassword" class="modal hidden">
      <div class="modal-content">
        <span class="close-modal" onclick="document.getElementById('modalPassword').classList.add('hidden')">&times;</span>
        <h2 style="margin-bottom:15px;">Cambiar Contraseña</h2>
        <form id="formCambiarPass">
          <div class="form-group">
            <label>Nueva Contraseña:</label>
            <input type="password" id="newPass" required>
          </div>
          <div class="form-group">
            <label>Confirmar Nueva Contraseña:</label>
            <input type="password" id="confirmNewPass" required>
          </div>
          <button type="submit" class="btn-primary" style="width:100%;">Actualizar Contraseña</button>
        </form>
      </div>
    </div>

    <!-- Modal Mis Reservas / Calificaciones -->
    <div id="modalReservas" class="modal hidden">
      <div class="modal-content">
        <span class="close-modal" onclick="document.getElementById('modalReservas').classList.add('hidden')">&times;</span>
        <h2 style="margin-bottom:15px;">Historial de Reservas y Servicios</h2>
        <div id="listaReservasUsuario"></div>
      </div>
    </div>

    <!-- Modal Publicar Servicio (Prestador) -->
    <div id="modalPublicarServicio" class="modal hidden">
      <div class="modal-content">
        <span class="close-modal" onclick="document.getElementById('modalPublicarServicio').classList.add('hidden')">&times;</span>
        <h2 style="margin-bottom:15px;">Publicar Nuevo Servicio</h2>
        <form id="formPublicarServModal">
          <div class="form-group">
            <label>Título del Servicio:</label>
            <input type="text" id="pubServNombre" required placeholder="Ej: Corte Fade & Barba">
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label>Categoría:</label>
              <select id="pubServCategoria"></select>
            </div>
            <div class="form-group">
              <label>Precio (COP):</label>
              <input type="number" id="pubServPrecio" required min="10000" placeholder="35000">
            </div>
          </div>
          <div class="form-group">
            <label>Descripción Detallada:</label>
            <textarea id="pubServDesc" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label>Subir Imagen desde tu PC (Opcional):</label>
            <input type="file" id="pubServImgFile" accept="image/*" style="padding:8px;">
          </div>
          <button type="submit" class="btn-primary" style="width:100%;">Publicar Servicio</button>
        </form>
      </div>
    </div>

    <!-- Modal Mis Servicios Publicados (Prestador) -->
    <div id="modalMisServicios" class="modal hidden">
      <div class="modal-content">
        <span class="close-modal" onclick="document.getElementById('modalMisServicios').classList.add('hidden')">&times;</span>
        <h2 style="margin-bottom:15px;">Mis Servicios Publicados</h2>
        <div id="listaMisServiciosPrestador"></div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', htmlModales);
}