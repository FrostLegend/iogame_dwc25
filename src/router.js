import { renderContent } from "./componentes/content";
import { renderGame } from "./componentes/game";
import { renderLogin } from "./componentes/login";
import { renderRegister} from "./componentes/register";

export {router};

const routes = new Map([
    ['',renderContent],
    ['#game',renderGame],
    ['#login',renderLogin],
    ['#register',renderRegister]
])


// EL ROUTER TIENE QUE SER REMPLACE CHILDREN EN VEZ DE INNERHTML
function router(route, container) {
    if (routes.has(route)) {
        container.replaceChildren(routes.get(route)());
    } else {
        container.innerHTML = `<h1>404 Not Found</h1>`;
    }
}