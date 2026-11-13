export function renderizarServicios(servicios, contenedor) {
  contenedor.innerHTML = '';

  if (!servicios || servicios.length === 0) {
    contenedor.innerHTML = '<p>No hay servicios disponibles en este momento.</p>';
    return;
  }

  servicios.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card-servicio';
    
    const foto = s.imagen || 'https://via.placeholder.com/300x180?text=Nexo+Servicios';
    const nombrePrestador = s.prestador ? `${s.prestador.name} ${s.prestador.lastName}` : 'Prestador Nexo';
    const calificacion = s.prestador?.calificacion ? `⭐ ${s.prestador.calificacion}` : 'Nuevo';

    card.innerHTML = `
      <img src="${foto}" alt="${s.nombreServicio}" class="card-img" style="width:100%; height:180px; object-fit:cover; border-radius:8px 8px 0 0;">
      <div style="padding: 15px;">
        <span class="badge" style="background:#007bff; color:#fff; padding:3px 8px; border-radius:4px; font-size:12px;">${s.categoriaServicio}</span>
        <h3 style="margin: 10px 0 5px 0;">${s.nombreServicio}</h3>
        <p style="color:#666; font-size:14px; margin-bottom:10px;">${s.descripcionServicio}</p>
        <p style="font-size:18px; font-weight:bold; color:#28a745; margin-bottom:10px;">$${Number(s.precioServicio).toLocaleString()}</p>
        <div style="border-top:1px solid #eee; padding-top:10px; display:flex; justify-between; align-items:center;">
          <small>Por: <strong>${nombrePrestador}</strong> (${calificacion})</small>
        </div>
        <button class="btn-primary" style="width:100%; margin-top:10px; cursor:pointer;" onclick="alert('Inicia sesión o selecciona fecha para reservar ${s.nombreServicio}')">Reservar Servicio</button>
      </div>
    `;
    contenedor.appendChild(card);
  });
}