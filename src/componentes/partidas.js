import { obtenerTodasLasPartidas, obtenerPartidaPorId, eliminarPartidaPorId } from '../supabase.js';
import { formatearTiempo } from './gameReactive.js';

export { renderPartidas };


function renderPartidas() {
    const container = document.createElement("div");
    container.className = "container py-5";
    
    container.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-8 text-center">
                <h1 class="display-4 font-weight-bold mb-3">📜 Partidas Guardadas</h1>
                <div id="lista-container">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando partidas...</p>
                </div>
            </div>
        </div>
    `;
    
    cargarPartidasAsync(container);
    
    return container;
}

// Cargar las partidas
async function cargarPartidasAsync(container) {
    const listaContainer = container.querySelector('#lista-container');
    
    try {
        const partidas = await obtenerTodasLasPartidas();
        
        if (partidas.length === 0) {
            listaContainer.innerHTML = '<p class="text-muted">No tienes partidas guardadas</p>';
            return;
        }
        
        listaContainer.innerHTML = `
            <div class="lista-partidas">
                ${partidas.map(partida => `
                    <div class="partida-item card mb-3 p-3" data-id="${partida.id}">
                        <p>📅 ${new Date(partida.fecha_guardado).toLocaleString('es-ES')}</p>
                        <p>🪙 Monedas: ${partida.estado_juego.monedas}/${partida.estado_juego.monedasObjetivo}</p>
                        <p>⏱️ Tiempo: ${formatearTiempo(partida.estado_juego.tiempo)}</p>
                        <div class="d-flex gap-2 justify-content-center">
                            <button class="btn btn-primary cargar-partida" data-id="${partida.id}">Cargar</button>
                            <button class="btn btn-danger eliminar-partida" data-id="${partida.id}">Eliminar</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error al cargar lista:', error);
        listaContainer.innerHTML = '<p class="text-danger">Error al cargar las partidas</p>';
    }
}

// Event listener para cargar partidas
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('cargar-partida')) {
        const id = e.target.dataset.id; // pillar data-id asignado al botón
        try {
            const partida = await obtenerPartidaPorId(id);
            if (partida) {
                sessionStorage.setItem('partidaCargada', JSON.stringify(partida.estado_juego));
                window.location.hash = '#game';
            }
        } catch (error) {
            alert('Error al cargar la partida');
            console.error('Error al cargar partida:', error);
        }
    }

    if (e.target.classList.contains('eliminar-partida')) {
        const id = e.target.dataset.id;
        if (confirm('¿Estás seguro de que quieres eliminar esta partida?')) {
            try {
                await eliminarPartidaPorId(id);
                alert('Partida eliminada');
                // Recargar la lista de partidas
                const container = document.querySelector('.container.py-5');
                cargarPartidasAsync(container);
            } catch (error) {
                alert('Error al eliminar la partida');
                console.error('Error al eliminar partida:', error);
            }
        }
    }
});