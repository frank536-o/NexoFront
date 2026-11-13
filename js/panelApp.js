import { NexoService } from './services/NexoService.js';
import { renderizarServicios } from './ui/renderUI.js';
import { Servicio } from './models/Servicio.js';

document.addEventListener('DOMContentLoaded', () => {
  const nexoService = new NexoService();
  const contenedorServicios = document.getElementById('gridDashboardServicios');
  const usuarioSesion = nexoService.obtenerUsuarioSesion();

  // 1. Validar si hay usuario en sesión
  if (usuarioSesion) {
    const userNameElem = document.getElementById('userName');
    const userBalanceElem = document.getElementById('userBalance');
    const menuCrearServicio = document.getElementById('menuCrearServicio');
    const secPublicar = document.getElementById('secPublicar');

    if (userNameElem) userNameElem.textContent = `${usuarioSesion.name} ${usuarioSesion.lastName}`;
    if (userBalanceElem && usuarioSesion.billetera) {
      userBalanceElem.textContent = `$${Number(usuarioSesion.billetera.saldoBilletera).toLocaleString()}`;
    }

    // Si NO es Prestador, ocultar opción de crear servicio
    if (usuarioSesion.descripPerfil === undefined && menuCrearServicio) {
      menuCrearServicio.classList.add('hidden');
      if (secPublicar) secPublicar.classList.add('hidden');
    }
  }

  // 2. Renderizar servicios disponibles
  if (contenedorServicios) {
    const servicios = nexoService.obtenerServicios();
    renderizarServicios(servicios, contenedorServicios);
  }

  // 3. Publicar nuevo servicio (Formulario Prestador)
  const formNuevoServicio = document.getElementById('formNuevoServicio');
  if (formNuevoServicio) {
    formNuevoServicio.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('servNombre').value;
      const precio = parseFloat(document.getElementById('servPrecio').value);
      const categoria = document.getElementById('servCategoria').value;
      const descripcion = document.getElementById('servDesc').value;
      const fotoInput = document.getElementById('servFoto');

      let fotoURL = 'https://via.placeholder.com/300';
      if (fotoInput.files && fotoInput.files[0]) {
        fotoURL = URL.createObjectURL(fotoInput.files[0]);
      }

      const nuevoServicio = new Servicio(
        Date.now(),
        nombre,
        descripcion,
        precio,
        categoria,
        new Date().toISOString().split('T')[0],
        true,
        usuarioSesion
      );

      nuevoServicio.imagen = fotoURL;

      nexoService.agregarServicio(nuevoServicio);
      renderizarServicios(nexoService.obtenerServicios(), contenedorServicios);

      formNuevoServicio.reset();
      alert('¡Servicio publicado con éxito!');
    });
  }

  // 4. Editar Perfil
  const formPerfil = document.getElementById('formPerfil');
  if (formPerfil) {
    formPerfil.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Perfil actualizado correctamente.');
    });
  }

  // 5. Cerrar Sesión
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      nexoService.cerrarSesion();
      window.location.href = 'index.html';
    });
  }
});