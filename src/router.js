import { renderContent } from "./componentes/content";
import { renderLogin } from "./componentes/login";
import { renderRegister} from "./componentes/register";
import { renderGameReactive } from "./componentes/gameReactive";
import { isLoggedIn } from "./supabase.js";

export {router};

const routes = new Map([
    ['',renderContent],
    ['#game',renderGameReactive],
    ['#login',renderLogin],
    ['#register',renderRegister]
])


function router(route, container) {
    const rutasSoloLogin = ['#game', '#partidas'];

    if (rutasSoloLogin.includes(route) && !isLoggedIn()) {
        // Redirigir a login si no está logueado
        container.replaceChildren(renderLogin());
        window.location.hash = '#login';
        // Opcional: mostrar mensaje
        setTimeout(() => alert('Debes iniciar sesión para acceder al juego'), 100);
        return;
    }

    if (routes.has(route)) {
        container.replaceChildren(routes.get(route)());
    } else {
        container.innerHTML = `<h1>404 Not Found</h1>`;
    }
}