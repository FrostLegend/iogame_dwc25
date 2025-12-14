import { authUsuario } from "../supabase.js";
export { renderRegister };

function renderRegister() {
  const form = document.createElement("form");
  form.id = "signupForm";
  form.className = "container mt-5";

  form.innerHTML = `
    <div class="card mx-auto" style="max-width: 400px;">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">Register</h2>
        
        <div class="form-group">
          <label for="signupemail">Email</label>
          <input type="email" class="form-control" id="signupemail" required>
        </div>
        
        <div class="form-group">
          <label for="signuppassword">Contraseña</label>
          <input type="password" class="form-control" id="signuppassword" required>
          <small class="form-text text-muted">No compartas tu contraseña</small>
        </div>
        
        <button type="submit" class="btn btn-primary btn-block">Registrarse</button>
      </div>
    </div>
  `;
  
  form.addEventListener("submit", async ()=> {
    e.preventDefault(); // evitar recarga
    
    const body = {
      email: document.querySelector('#signupemail').value,
      password: document.querySelector('#signuppassword').value
    };

    try {
      await authUsuario(body, 0);
      form.reset();
      // Redirigir al login
      window.location.hash = "#login";
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  })

  return form;
}
