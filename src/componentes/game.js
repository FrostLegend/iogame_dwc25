export { renderGame};

//constantes del tablero
const x = 9; // Columna
const y = 9; // Fila

let tablero = [];
let posicionJugador = { fila: 0, columna: 0 }; // Posición inicial

// Función para inicializar el juego
function initializeGame() {
  // Inicializar tablero
  tablero = [];
  for (let fila = 0; fila < y; fila++) {
    tablero[fila] = [];
    for (let columna = 0; columna < x; columna++) {
      if (fila % 2 !== 0 && columna % 2 !== 0) {
        tablero[fila][columna] = 2; // Pilar
      } else {
        tablero[fila][columna] = 0; // Aire
      }
    }
  }

  // Inicializar posición del jugador
  posicionJugador = { fila: 0, columna: 0 }; // Posición inicial
  tablero[posicionJugador.fila][posicionJugador.columna] = 1;  // Ponerlo en el juego
}

//contantes de las celdas
const tiposCelda = {
  0: "aire",
  1: "jugador",
  2: "pilar",
  3: "piedra",
  4: "bomba",
  5: "explosion",
  6: "jugadorBomba"
};

// Objetos
class Bomb {
  constructor(idJugador, x, y) {
    this.x = x; // Columna
    this.y = y; // Fila
    this.idJugador = idJugador;
    this.explotada = false; // Estado de la bomba
  }
}

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
function placeBomb(){
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

// Limpiar posición anterior
function claenPlayerPosition(tablero, posicion) {
  const copia = tablero.map(fila => [...fila]);
  copia[posicion.fila][posicion.columna] = 
    copia[posicion.fila][posicion.columna] === 6 ? 4 : 0;
  return copia;
}

// Validar movimiento
function isValidMove(tablero, posicion, direccion) {
  const filas = tablero.length;
  const columnas = tablero[0].length;
  
  if (direccion === "arriba") {
    return posicion.fila > 0 && 
           tablero[posicion.fila -1][posicion.columna] !== 2 && 
           tablero[posicion.fila -1][posicion.columna] !== 4;
  } else if (direccion === "abajo") {
    return posicion.fila < filas -1 && 
           tablero[posicion.fila +1][posicion.columna] !== 2 && 
           tablero[posicion.fila +1][posicion.columna] !== 4;
  } else if (direccion === "izquierda") {
    return posicion.columna > 0 && 
           tablero[posicion.fila][posicion.columna -1] !== 2 && 
           tablero[posicion.fila][posicion.columna -1] !== 4;
  } else if (direccion === "derecha") {
    return posicion.columna < columnas -1 && 
           tablero[posicion.fila][posicion.columna +1] !== 2 && 
           tablero[posicion.fila][posicion.columna +1] !== 4;
  }

  return false;
}

// Calcular nueva posición
function calculateNewPosition(posicion, direccion) {
  const nueva = { ...posicion };
  if (direccion === "arriba") nueva.fila--;
  if (direccion === "abajo") nueva.fila++;
  if (direccion === "izquierda") nueva.columna--;
  if (direccion === "derecha") nueva.columna++;
  return nueva;
}

// Colocar jugador
function placePlayer(tablero, posicion) {
  const copia = tablero.map(fila => [...fila]);
  copia[posicion.fila][posicion.columna] = 1;
  return copia;
}

function movePlayer(direccion, tableroActual, posicionJugadorActual) {
  if (!isValidMove(tableroActual, posicionJugadorActual, direccion)) {
    return { tablero: tableroActual, posicionJugador: posicionJugadorActual };
  }
  
  const tableroLimpio = claenPlayerPosition(tableroActual, posicionJugadorActual);
  const nuevaPosicion = calculateNewPosition(posicionJugadorActual, direccion);
  const tableroFinal = placePlayer(tableroLimpio, nuevaPosicion);
  
  return { tablero: tableroFinal, posicionJugador: nuevaPosicion };
}

// Direcciones y controles
document.addEventListener("keydown", (event) => {
    if (window.location.hash == "#game"){
    let accion;
    event.preventDefault()
      let mover = false;
      let bomb = false;
      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          accion = movePlayer("arriba", tablero, posicionJugador);
          mover = true;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          accion = movePlayer("abajo", tablero, posicionJugador);
          mover = true;
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          accion = movePlayer("izquierda", tablero, posicionJugador);
          mover = true;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          accion = movePlayer("derecha", tablero, posicionJugador);
          mover = true;
          break;
        case "x":
          placeBomb();
          bomb = true;
          break;
      }
      if (mover || bomb) { //Si se mueve o pone la bomba redibuja el tablero
        tablero.splice(0, tablero.length, ...accion.tablero);
        posicionJugador = accion.posicionJugador;
        document.getElementById("app").replaceChildren(renderGame());
      }
    }
});

// Inicializar el juego al cargar
initializeGame();