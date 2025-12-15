export { renderContent };

function renderContent() {
  const container = document.createElement("div");
  container.className = "container py-5";

  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-8 text-center">

        <h1 class="display-4 font-weight-bold mb-3">💣 BomberCoin</h1>
        <p class="lead mb-4">
          Coloca bombas, esquiva explosiones y recoge todas las monedas
        </p>

        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title mb-3">🎮 Cómo jugar</h5>
            <ul class="list-unstyled text-left mb-0">
              <li>🕹️ Muévete con <strong>WASD</strong> o <strong>flechas</strong></li>
              <li>💣 Pulsa <strong>X</strong> para colocar una bomba</li>
              <li>🪙 Recoge todas las monedas para ganar</li>
            </ul>
          </div>
        </div>

        <div class="row">
          <div class="col-md-4 mb-3">
            <button id="jugarBoton" class="btn btn-success btn-block btn-lg">Jugar</button>
          </div>
          <div class="col-md-4 mb-3">
            <button id="partidasBoton" class="btn btn-info btn-block btn-lg">Partidas</button>
          </div>
          <div class="col-md-4 mb-3">
            <button id="rankingBoton" class="btn btn-warning btn-block btn-lg">Ranking</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Eventos
  container.querySelector("#jugarBoton").addEventListener("click", () => {
    window.location.hash = "#game";
  });

  container.querySelector("#partidasBoton").addEventListener("click", () => {
    window.location.hash = "#partidas";
  });

  container.querySelector("#rankingBoton").addEventListener("click", () => {
    alert("Ranking próximamente");
  });

  return container;
}
