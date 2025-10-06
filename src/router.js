import { renderContent } from "./componentes/content";
import { renderGame } from "./componentes/game";

export {router};

const routes = new Map([
    ['',renderContent],
    ['#game',renderGame]
])

function router(route, container) {
    if (routes.has(route)) {
        container.innerHTML = routes.get(route)();
    } else {
        container.innerHTML = `<h1>404 Not Found</h1>`;
    }
}