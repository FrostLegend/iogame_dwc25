import { isLoggedIn, getCurrentUser, logout } from "../supabase.js";
export { renderHeader };

function renderHeader() {
  const loggedIn = isLoggedIn();
  const user = getCurrentUser();

  return `
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">💣BomberCoin</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" 
        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" 
        aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <a class="nav-link ${window.location.hash === '' ? 'active' : ''}"href="#">
              <i class="bi bi-house-door"></i> Inicio
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${window.location.hash === '#game' ? 'active' : ''}"href="#game">
              <i class="bi bi-joystick"></i> Juego
            </a>
          </li>
          ${!loggedIn ? `
          <li class="nav-item">
            <a class="nav-link ${window.location.hash === '#register' ? 'active' : ''}" 
               href="#register">
              <i class="bi bi-person-plus"></i> Registro
            </a>
          </li>
          ` : ''}
        </ul>
        
        <div class="navbar-nav">
          ${loggedIn ? `
          <!-- Usuario logueado -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" 
               role="button" data-bs-toggle="dropdown">
              <i class="bi bi-person-circle me-2"></i>
              <span>${user?.email || 'Usuario'}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#partidas"><i class="bi bi-person"></i> Partidas</a></li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item text-danger" id="logoutBtn">
                  <i class="bi bi-box-arrow-right"></i> Cerrar sesión
                </button>
              </li>
            </ul>
          </li>
          ` : `
          <!-- No logueado -->
          <li class="nav-item">
            <a class="nav-link ${window.location.hash === '#login' ? 'active' : ''}" 
               href="#login">
              <i class="bi bi-box-arrow-in-right"></i> Login
            </a>
          </li>
          `}
        </div>
      </div>
    </div>
  </nav>`;
}

// Actualizar el header dinámicamente
export function updateHeader() {
  const headerDiv = document.querySelector("#header");
  if (headerDiv) {
    headerDiv.innerHTML = renderHeader();
    // Añadir event listener para logout si existe
    setTimeout(() => {
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
      }
    }, 100);
  }
}

// Manejar logout
function handleLogout(e) {
  e.preventDefault();
  logout();
  updateHeader();
  window.location.hash = "#";
}