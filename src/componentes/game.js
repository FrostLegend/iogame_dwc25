export { renderGame};

//constantes del tablero
const x = 9; // Fila
const y = 9; // Columna
const tablero = [];
for (let fila = 0; fila < y; fila++) {
  tablero[fila] = [];
  for (let columna = 0; columna < x; columna++) {
    if (fila % 2 != 0 && columna % 2 != 0) {
      tablero[fila][columna] = 2; // Obstáculo
    } else {
      tablero[fila][columna] = 0; // Espacio vacío
    }
  }
}

let posicionJugador = { fila: 0, columna: 0 }; // Posición inicial
tablero[posicionJugador.fila][posicionJugador.columna] = 1; // Ponerlo en el juego

function renderGame() {
  let tableroHTML = "";
  for (let fila = 0; fila < y; fila++) {
    for (let columna = 0; columna < x; columna++) {
      tableroHTML += `<div class="celda" data-fila="${fila}" data-col="${columna}">
        ${tablero[fila][columna]}
      </div>`;
    }
  }

  return `
    <div id="contenedorJuego">
      <div id="contenedorTablero">
        ${tableroHTML}
      </div>
    </div>
  `;
}

function movePlayer(direccion) {
  // Quitar jugador de la posición actual
  tablero[posicionJugador.fila][posicionJugador.columna] = 0;

  // Actualizar posición
  if (direccion == "arriba" && posicionJugador.fila > 0 && tablero[posicionJugador.fila -1][posicionJugador.columna] != 2) posicionJugador.fila--;
  if (direccion == "abajo" && posicionJugador.fila < y - 1 && tablero[posicionJugador.fila +1][posicionJugador.columna] != 2) posicionJugador.fila++;
  if (direccion == "izquierda" && posicionJugador.columna > 0 && tablero[posicionJugador.fila][posicionJugador.columna -1] != 2) posicionJugador.columna--;
  if (direccion == "derecha" && posicionJugador.columna < x - 1 && tablero[posicionJugador.fila][posicionJugador.columna +1] != 2) posicionJugador.columna++;

  // Ponerlo en la nueva posición
  tablero[posicionJugador.fila][posicionJugador.columna] = 1;
}


document.addEventListener("keydown", (event) => {
  event.preventDefault()
  let moved = false;
  switch (event.key) {
    case "ArrowUp":
    case "w":
    case "W":
      movePlayer("arriba");
      moved = true;
      break;
    case "ArrowDown":
    case "s":
    case "S":
      movePlayer("abajo");
      moved = true;
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      movePlayer("izquierda");
      moved = true;
      break;
    case "ArrowRight":
    case "d":
    case "D":
      movePlayer("derecha");
      moved = true;
      break;
  }
  if (moved) { //Si se mueve redibuja el tablero
    document.getElementById("app").innerHTML = renderGame();
  }
});
