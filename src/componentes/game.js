export { renderGame};

//constantes del tablero
const x = 9; // Fila
const y = 9; // Columna
const tablero = [];
for (let fila = 0; fila < y; fila++) {
  tablero[fila] = [];
  for (let columna = 0; columna < x; columna++) {
    if (fila % 2 != 0 && columna % 2 != 0) {
      tablero[fila][columna] = 2;
    } else {
      tablero[fila][columna] = 0;
    }
  }
}

let posicionJugador = { fila: 0, columna: 0 }; // Posición inicial
tablero[posicionJugador.fila][posicionJugador.columna] = 1; // Ponerlo en el juego

//contantes de las celdas
const tiposCelda = {
  0: "aire",
  1: "jugador",
  2: "pilar",
  3: "piedra",
  4: "bomba",
  5: "explosion",
  6: "jugadorBomba",
}

// *** TABLERO TIENE QUE NO SER MODIFICADO DIRECTAMENTE, SOLO SU COPIA ***
function renderGame(tableroActual = tablero) {
  const tableroCopia = tableroActual.map(fila => [...fila]); // Copia del tablero original
  let tableroHTML = "";

  for (let fila = 0; fila < y; fila++) {
    for (let columna = 0; columna < x; columna++) {
      const clase = tiposCelda[tableroCopia[fila][columna]];

      tableroHTML += `
        <div class="celda ${clase}" data-fila="${fila}" data-col="${columna}">
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

//Mecanicas

//Bomba
function placeBomb(){
  // Colocar bomba en la posición del jugador
  tablero[posicionJugador.fila][posicionJugador.columna] = 6;
  let posicionBombaX = posicionJugador.fila;
  let posicionBombaY = posicionJugador.columna;
  setTimeout(() => {
    tablero[posicionBombaX][posicionBombaY] = 0;
    document.getElementById("app").innerHTML = renderGame();
  }, 1500);
}

//Movimiento y colisiones 
function movePlayer(direccion) {
  // Quitar jugador de la posición actual y actualizar si pone bomba
  if (tablero[posicionJugador.fila][posicionJugador.columna] == 6) {
    tablero[posicionJugador.fila][posicionJugador.columna] = 4;
  } else {
    tablero[posicionJugador.fila][posicionJugador.columna] = 0;
  }

  // Actualizar posición
  if (direccion == "arriba" && posicionJugador.fila > 0 && tablero[posicionJugador.fila -1][posicionJugador.columna] != 2 && tablero[posicionJugador.fila -1][posicionJugador.columna] != 4) posicionJugador.fila--;
  if (direccion == "abajo" && posicionJugador.fila < y - 1 && tablero[posicionJugador.fila +1][posicionJugador.columna] != 2 && tablero[posicionJugador.fila +1][posicionJugador.columna] != 4) posicionJugador.fila++;
  if (direccion == "izquierda" && posicionJugador.columna > 0 && tablero[posicionJugador.fila][posicionJugador.columna -1] != 2 && tablero[posicionJugador.fila][posicionJugador.columna -1] != 4) posicionJugador.columna--;
  if (direccion == "derecha" && posicionJugador.columna < x - 1 && tablero[posicionJugador.fila][posicionJugador.columna +1] != 2 && tablero[posicionJugador.fila][posicionJugador.columna +1] != 4) posicionJugador.columna++;

  // Ponerlo en la nueva posición
  tablero[posicionJugador.fila][posicionJugador.columna] = 1;
}

// Direcciones y controles
document.addEventListener("keydown", (event) => {
  event.preventDefault()
  let mover = false;
  let bomb = false;
  switch (event.key) {
    case "ArrowUp":
    case "w":
    case "W":
      movePlayer("arriba");
      mover = true;
      break;
    case "ArrowDown":
    case "s":
    case "S":
      movePlayer("abajo");
      mover = true;
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      movePlayer("izquierda");
      mover = true;
      break;
    case "ArrowRight":
    case "d":
    case "D":
      movePlayer("derecha");
      mover = true;
      break;
    case "x":
      placeBomb();
      bomb = true;
      break;
  }
  if (mover || bomb) { //Si se mueve o pone la bomba redibuja el tablero
    document.getElementById("app").innerHTML = renderGame();
  }
});
