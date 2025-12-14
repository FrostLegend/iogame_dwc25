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
      email: document.querySelector('#signupemail').value,
      password: document.querySelector('#signuppassword').value
    }
    await authUsuario(body, 0);

    form.reset();
  })

  return form;
}
