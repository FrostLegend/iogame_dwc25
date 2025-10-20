export { renderLogin };

function renderLogin() {
  return `
  <form id="signupForm">
    <div class="mb-3">
      <label for="signupemail" class="form-label">Email address</label>
      <input type="email" class="form-control" id="signupemail" required>
      <div id="emailHelp" class="form-text">We'll never share your email.</div>
    </div>
    <div class="mb-3">
      <label for="signuppassword" class="form-label">Password</label>
      <input type="password" class="form-control" id="signuppassword" required>
    </div>
    <button id="boton" type="submit" class="btn btn-primary">Registrarse</button>
  </form>

  <div id="userInfo" class="mt-3"></div>
  `
}

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdW5meGVkd2Rtb2libmZiem9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzIwNjUsImV4cCI6MjA3NjEwODA2NX0.1l8AI_vIcoGZVJzQ7SL15QihGav_VQCnxqFZp854ZV8';

async function registrarUsuario(SUPABASE_KEY) {
  
  const body = {
    email: document.getElementById('signupemail').value,
    password: document.getElementById('signuppassword').value
  }

  let response = await fetch(`https://vjunfxedwdmoibnfbzoi.supabase.co/auth/v1/signup`,{
        method: `POST`,
        headers: {
            "apiKey": SUPABASE_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    console.log(response);
}

window.onload = function() { 
  let boton = document.getElementById("boton");

  boton.addEventListener("click",()=> {
    registrarUsuario(SUPABASE_KEY);
  });
}
