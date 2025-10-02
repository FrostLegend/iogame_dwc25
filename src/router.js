import { renderContent } from "./componentes/content";

export {router};

const routes = new Map([
    ['',renderContent],
    ['#game',renderContent]
])

function router(route, container) {
    if (routes.has(route)) {
        container.innerHTML = routes.get(route)();
    } else {
        container.innerHTML = `<h1>404 Not Found</h1>`;
    }
}