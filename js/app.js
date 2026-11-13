import { NexoService } from './services/NexoService.js';
import { renderizarServicios } from './ui/renderUI.js';
import { Cliente } from './models/Cliente.js';
import { Prestador } from './models/Prestador.js';
import { Billetera } from './models/Billetera.js';

document.addEventListener('DOMContentLoaded', () => {
  const nexoService = new NexoService();
  const contenedorPublico = document.getElementById('contenedor-servicios-publico') || document.getElementById('contenedor-servicios');

  // 1. Cargar catálogo público
  if (contenedorPublico) {
    const listaServicios = nexoService.obtenerServicios();
    renderizarServicios(listaServicios, contenedorPublico);
  }

  // 2. Controladores del Modal de Login / Registro
  const modalAuth = document.getElementById('modalAuth');
  const btnOpenLogin = document.getElementById('btnOpenLogin');
  const btnOpenRegister = document.getElementById('btnOpenRegister');
  const closeAuth = document.getElementById('closeAuth');
  
  const modalTitle = document.getElementById('modalTitle');
  const registerFields = document.getElementById('registerFields');
  const btnAuthSubmit = document.getElementById('btnAuthSubmit');
  const formAuth = document.getElementById('formAuth');

  let esModoRegistro = false;

  // Abrir en Modo Login
  if (btnOpenLogin) {
    btnOpenLogin.addEventListener('click', () => {
      esModoRegistro = false;
      modalTitle.textContent = 'Ingresar a Nexo';
      registerFields.classList.add('hidden');
      btnAuthSubmit.textContent = 'Ingresar';
      modalAuth.classList.remove('hidden');
    });
  }

  // Abrir en Modo Registro
  if (btnOpenRegister) {
    btnOpenRegister.addEventListener('click', () => {
      esModoRegistro = true;
      modalTitle.textContent = 'Crear Cuenta en Nexo';
      registerFields.classList.remove('hidden');
      btnAuthSubmit.textContent = 'Registrarse';
      modalAuth.classList.remove('hidden');
    });
  }

  // Cerrar Modal
  if (closeAuth) {
    closeAuth.addEventListener('click', () => {
      modalAuth.classList.add('hidden');
    });
  }

  // 3. Procesar Formulario (Login o Registro)
  if (formAuth) {
    formAuth.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('authEmail').value;
      const password = document.getElementById('authPassword').value;

      if (esModoRegistro) {
        // --- PROCESO DE REGISTRO ---
        const name = document.getElementById('regName').value;
        const lastName = document.getElementById('regLastName').value;
        const rol = document.getElementById('regRole').value;

        const nuevaBilletera = new Billetera(Date.now(), 0);
        let nuevoUsuario;

        const datosBase = {
          id: Date.now(),
          docType: 'CC',
          name: name || 'Usuario',
          lastName: lastName || 'Nexo',
          phone: '',
          email: email,
          address: '',
          password: password,
          birthDay: '',
          billetera: nuevaBilletera
        };

        if (rol === 'PRESTADOR') {
          nuevoUsuario = new Prestador(datosBase, 'Prestador de servicios independiente', 5.0, 0);
        } else {
          nuevoUsuario = new Cliente(datosBase, 0);
        }

        nexoService.usuarios.push(nuevoUsuario);
        sessionStorage.setItem('usuarioActivo', JSON.stringify(nuevoUsuario));

        alert(`¡Registro exitoso como ${rol}! Redirigiendo a tu panel...`);
        modalAuth.classList.add('hidden');
        window.location.href = 'panel_control.html';

      } else {
        // --- PROCESO DE LOGIN ---
        const usuarioLogueado = nexoService.login(email, password);

        if (usuarioLogueado) {
          alert(`¡Bienvenido de nuevo, ${usuarioLogueado.name}!`);
          modalAuth.classList.add('hidden');
          window.location.href = 'panel_control.html';
        } else {
          alert('Correo o contraseña incorrectos.\n\nPrueba con los datos de demo:\n- carlos@mail.com / 123 (Prestador)\n- cliente@mail.com / 123 (Cliente)');
        }
      }
    });
  }
});