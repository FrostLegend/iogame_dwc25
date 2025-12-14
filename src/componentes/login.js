import { authUsuario } from "../supabase.js";
import { updateHeader } from "./header.js";
export { renderLogin };

function renderLogin() {
  const form = document.createElement("form");
  form.id = "signinForm";
  form.className = "container mt-5";
  
  form.innerHTML = `
    <div class="card mx-auto" style="max-width: 400px;">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">Login</h2>
        
        <div class="form-group">
          <label for="signinemail">Email</label>
          <input type="email" class="form-control" id="signinemail" required>
        </div>
        
        <div class="form-group">
          <label for="signinpassword">Contraseña</label>
          <input type="password" class="form-control" id="signinpassword" required>
          <small class="form-text text-muted">No compartas tu contraseña</small>
        </div>
        
        <button type="submit" class="btn btn-primary btn-block">Login</button>
        
        <div class="text-center mt-3">
          <p class="mb-1">Tienes cuenta?</p>
          <a href="#register" class="text-decoration-none">Registrate aquí</a>
        </div>
      </div>
    </div>
  `;
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // evitar recarga
    
    const email = document.querySelector('#signinemail').value;
    const password = document.querySelector('#signinpassword').value;
    
    const body = {
      email: email,
      password: password
    };
    
    try {
      // Mostrar loading
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Iniciando sesión...';
      submitBtn.disabled = true;
      
      await authUsuario(body, 1);
      form.reset();
      
      // Redirigir al juego
      window.location.hash = "#game";
      
      // Forzar actualización del header
      updateHeader();
      
    } catch (error) {
      alert("Error en login: " + error.message);
      // Restaurar botón
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Login';
      submitBtn.disabled = false;
    }
  });
  
  return form;
}