import { SUPABASE_KEY, USER_RUTE } from "../env.js";
import { authUsuario } from "../supabase.js";
export { renderRegister };

function renderRegister() {

  const form = document.createElement("form");
  form.id = "signupForm";
  form.innerHTML = `
    <div class="mb-3">
      <label for="signupemail" class="form-label">Email address</label>
      <input type="email" class="form-control" id="signupemail" required>
      <div id="emailHelp" class="form-text">We'll never share your email.</div>
    </div>
    <div class="mb-3">
      <label for="signuppassword" class="form-label">Password</label>
      <input type="password" class="form-control" id="signuppassword" required>
    </div>
    <button id="boton" type="submit" class="btn btn-primary">Registrarse</button>`;
  
  form.addEventListener("submit", async ()=> {

    const body = {
      email: document.getElementById('signupemail').value,
      password: document.getElementById('signuppassword').value
    }
    await authUsuario(SUPABASE_KEY, body, USER_RUTE), 0;

    form.reset();
  })

  return form;
}
