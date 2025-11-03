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

// Objetos
class Bomb {
  constructor(idJugador, x, y) {
    this.x = x; // Fila
    this.y = y; // Columna
    this.idJugador = idJugador;
    this.explotada = false; // estado de la bomba
  }

  // Método para detonar la bomba
  detonar(tablero) {
    this.explotada = true;
    tablero[this.y][this.x] = 5; // marca explosión en el tablero
  }

  // Método para limpiar la bomba del tablero
  limpiar(tablero) {
    tablero[this.y][this.x] = 0; // vuelve a aire
  }
}

//*** TIENE QUE DEVOLVER UN DIV Y NO UN STRING ***/
// *** TABLERO TIENE QUE NO SER MODIFICADO DIRECTAMENTE, SOLO SU COPIA ***
function renderGame(tableroActual = tablero) {
  const tableroCopia = tableroActual.map(fila => [...fila]); // Copia del tablero original
  let contenedorJuego = document.createElement("div");
  contenedorJuego.id = "contenedorJuego";
  let tableroHTML = "";

  for (let fila = 0; fila < y; fila++) {
    for (let columna = 0; columna < x; columna++) {
      const clase = tiposCelda[tableroCopia[fila][columna]];

      tableroHTML += `
        <div class="celda ${clase}" data-fila="${fila}" data-col="${columna}">
        </div>`;
      
    }
  }
  const html = `
      <div id="contenedorTablero">
        ${tableroHTML}
      </div>
  `;
  contenedorJuego.innerHTML = html;
  return contenedorJuego;
}

//Mecanicas

//Bomba
function placeBomb(aumento){
  // Colocar bomba en la posición del jugador
  tablero[posicionJugador.fila][posicionJugador.columna] = 6;
  let posicionBombaX = posicionJugador.fila;
  let posicionBombaY = posicionJugador.columna;

  // Explosión
  setTimeout(() => {
    tablero[posicionBombaX][posicionBombaY] = 5;
    document.getElementById("app").replaceChildren(renderGame());
  }, 1500);
  
  // Quitar explosión
  setTimeout(() => {
    tablero[posicionBombaX][posicionBombaY] = 0;
    document.getElementById("app").replaceChildren(renderGame());
  }, 2000);
}

//Movimiento y colisiones 
function movePlayer(direccion, tableroActual, posicionJugador) {
  const tableroCopia = tableroActual.map(fila => [...fila]); // Copia del tablero original
  const posicionJugadorCopia = posicionJugador.map(fila => [...fila]); // Copia del tablero original

  // Quitar jugador de la posición actual y actualizar si pone bomba
  if (tableroCopia[posicionJugadorCopia.fila][posicionJugadorCopia.columna] === 6) {
    tableroCopia[posicionJugadorCopia.fila][posicionJugadorCopia.columna] = 4;
  } else {
    tableroCopia[posicionJugadorCopia.fila][posicionJugadorCopia.columna] = 0;
  }

  // Actualizar posición
  if (direccion == "arriba" && posicionJugadorCopia.fila > 0 && tableroCopia[posicionJugadorCopia.fila -1][posicionJugadorCopia.columna] != 2 && tableroCopia[posicionJugadorCopia.fila -1][posicionJugadorCopia.columna] != 4) posicionJugadorCopia.fila--;
  if (direccion == "abajo" && posicionJugadorCopia.fila < y - 1 && tableroCopia[posicionJugadorCopia.fila +1][posicionJugadorCopia.columna] != 2 && tableroCopia[posicionJugadorCopia.fila +1][posicionJugadorCopia.columna] != 4) posicionJugadorCopia.fila++;
  if (direccion == "izquierda" && posicionJugadorCopia.columna > 0 && tableroCopia[posicionJugadorCopia.fila][posicionJugadorCopia.columna -1] != 2 && tableroCopia[posicionJugadorCopia.fila][posicionJugadorCopia.columna -1] != 4) posicionJugadorCopia.columna--;
  if (direccion == "derecha" && posicionJugadorCopia.columna < x - 1 && tableroCopia[posicionJugadorCopia.fila][posicionJugadorCopia.columna +1] != 2 && tableroCopia[posicionJugadorCopia.fila][posicionJugadorCopia.columna +1] != 4) posicionJugadorCopia.columna++;

  // Ponerlo en la nueva posición
  tablero[posicionJugadorCopia.fila][posicionJugadorCopia.columna] = 1;
}

// Direcciones y controles
document.addEventListener("keydown", (event) => {
    if (window.location.hash == "#game"){  
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
        document.getElementById("app").replaceChildren(renderGame());
      }
    }
});
