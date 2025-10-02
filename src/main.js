import "./style.scss";
// eslint-disable-next-line
import * as bootstrap from 'bootstrap';

import { renderHeader } from "./componentes/header";
import { renderFooter } from "./componentes/footer";
import { renderContent } from "./componentes/content";
import { router } from "./router";

document.addEventListener("DOMContentLoaded", () => {
  const appDiv = document.querySelector("#app");
  const headerDiv = document.querySelector("#header");
  const footerDiv = document.querySelector("#footer");
  
  headerDiv.innerHTML = renderHeader();
  appDiv.innerHTML += renderContent();
  footerDiv.innerHTML += renderFooter();
  
  router(window.location.hash, appDiv);
  window.addEventListener("hashchange", () => {
    router(window.location.hash, appDiv);
  });
});

