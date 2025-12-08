export { 
  initializeBoard, 
  movePlayer, 
  placeBomb, 
  updateExplosion,
  tiposCelda 
};

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

// Función para inicializar el juego
function initializeBoard(x = 9, y = 9) {
  const tablero = [];
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
  tablero[0][0] = 1; // Inicializar posición del jugador
  return tablero;
}

// Mecanicas

// Movimiento y colisiones

// Limpiar posición anterior
function cleanPlayerPosition(tablero, posicion) {
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
           tablero[posicion.fila - 1][posicion.columna] !== 2 && 
           tablero[posicion.fila - 1][posicion.columna] !== 4;
  } else if (direccion === "abajo") {
    return posicion.fila < filas - 1 && 
           tablero[posicion.fila + 1][posicion.columna] !== 2 && 
           tablero[posicion.fila + 1][posicion.columna] !== 4;
  } else if (direccion === "izquierda") {
    return posicion.columna > 0 && 
           tablero[posicion.fila][posicion.columna - 1] !== 2 && 
           tablero[posicion.fila][posicion.columna - 1] !== 4;
  } else if (direccion === "derecha") {
    return posicion.columna < columnas - 1 && 
           tablero[posicion.fila][posicion.columna + 1] !== 2 && 
           tablero[posicion.fila][posicion.columna + 1] !== 4;
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

// Mover jugador
function movePlayer(tableroActual, posicionJugadorActual, direccion) {
  if (!isValidMove(tableroActual, posicionJugadorActual, direccion)) {
    return { tablero: tableroActual, posicionJugador: posicionJugadorActual };
  }
  
  const tableroLimpio = cleanPlayerPosition(tableroActual, posicionJugadorActual);
  const nuevaPosicion = calculateNewPosition(posicionJugadorActual, direccion);
  const tableroFinal = placePlayer(tableroLimpio, nuevaPosicion);
  
  return { tablero: tableroFinal, posicionJugador: nuevaPosicion };
}

// Colocar bomba
function placeBomb(tableroActual, posicionJugadorActual) {
  const copia = tableroActual.map(fila => [...fila]);
  copia[posicionJugadorActual.fila][posicionJugadorActual.columna] = 6;
  return {
    tablero: copia,
    posicionBomba: { ...posicionJugadorActual }
  };
}

// Actualizar explosión
function updateExplosion(tableroActual, posicionBomba, estado) {
  const copia = tableroActual.map(fila => [...fila]);
  if (estado === "explosion") {
    copia[posicionBomba.fila][posicionBomba.columna] = 5;
  } else if (estado === "limpiar") {
    copia[posicionBomba.fila][posicionBomba.columna] = 0;
  }
  return copia;
}