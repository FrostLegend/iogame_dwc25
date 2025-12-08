import { renderContent } from "./componentes/content";
import { renderLogin } from "./componentes/login";
import { renderRegister} from "./componentes/register";
import { renderGameReactive } from "./componentes/gameReactive";

export {router};

const routes = new Map([
    ['',renderContent],
    ['#game',renderGameReactive],
    ['#login',renderLogin],
    ['#register',renderRegister]
])


function router(route, container) {
    if (routes.has(route)) {
        container.replaceChildren(routes.get(route)());
    } else {
        container.innerHTML = `<h1>404 Not Found</h1>`;
    }
}