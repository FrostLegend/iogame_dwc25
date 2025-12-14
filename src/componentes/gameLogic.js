export { 
  initializeBoard, 
  movePlayer, 
  placeBomb, 
  updateExplosion,
  tiposCelda,
  calculateNewPosition,
  isValidMove,
  cleanPlayerPosition,
  placePlayer,
  isValidExpandBomb
};

//contantes de las celdas
const tiposCelda = {
  0: "aire",
  1: "jugador",
  2: "pilar",
  3: "muro",
  4: "bomba",
  5: "explosion",
  6: "jugadorBomba",
  7: "moneda"
};

// Función para inicializar el juego
function initializeBoard(x = 9, y = 9) {
  const tablero = [];
  for (let fila = 0; fila < y; fila++) {
    tablero[fila] = [];
    for (let columna = 0; columna < x; columna++) {
      const esEsquina = 
        // Esquina superior izquierda
        ((fila === 0 || fila === 1) && (columna === 0 || columna === 1) && 
         !(fila === 1 && columna === 1)) ||
        // Esquina superior derecha  
        ((fila === 0 || fila === 1) && (columna === x-1 || columna === x-2) && 
         !(fila === 1 && columna === x-2)) ||
        // Esquina inferior izquierda
        ((fila === y-1 || fila === y-2) && (columna === 0 || columna === 1) && 
         !(fila === y-2 && columna === 1)) ||
        // Esquina inferior derecha
        ((fila === y-1 || fila === y-2) && (columna === x-1 || columna === x-2) && 
         !(fila === y-2 && columna === x-2));

      if (fila % 2 !== 0 && columna % 2 !== 0) {
        tablero[fila][columna] = 2; // Pilar
      } else if (fila % 2 == 0 && columna % 2 == 0 && !(fila <= 1 || fila >= y - 1) && !(columna <= 1 || columna >= x - 1)){
        tablero[fila][columna] = 7; // Moneda
      } else if (esEsquina) {
        tablero[fila][columna] = 0; // muro
      } else {
        tablero[fila][columna] = 3; // Aire
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
           tablero[posicion.fila - 1][posicion.columna] !== 3 && 
           tablero[posicion.fila - 1][posicion.columna] !== 4;
  } else if (direccion === "abajo") {
    return posicion.fila < filas - 1 && 
           tablero[posicion.fila + 1][posicion.columna] !== 2 && 
           tablero[posicion.fila + 1][posicion.columna] !== 3 && 
           tablero[posicion.fila + 1][posicion.columna] !== 4;
  } else if (direccion === "izquierda") {
    return posicion.columna > 0 && 
           tablero[posicion.fila][posicion.columna - 1] !== 2 && 
           tablero[posicion.fila][posicion.columna - 1] !== 3 && 
           tablero[posicion.fila][posicion.columna - 1] !== 4;
  } else if (direccion === "derecha") {
    return posicion.columna < columnas - 1 && 
           tablero[posicion.fila][posicion.columna + 1] !== 2 && 
           tablero[posicion.fila][posicion.columna + 1] !== 3 && 
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

// Bomba

// Colocar bomba
function placeBomb(tableroActual, posicionJugadorActual) {
  const copia = tableroActual.map(fila => [...fila]);
  copia[posicionJugadorActual.fila][posicionJugadorActual.columna] = 6;
  return {
    tablero: copia,
    posicionBomba: { ...posicionJugadorActual }
  };
}

// Validar la expansión de la explosión de la bomba
function isValidExpandBomb(tablero, posicion, direccion) {
  const filas = tablero.length;
  const columnas = tablero[0].length;
  
  if (direccion === "arriba") {
    return posicion.fila > 0 && 
           tablero[posicion.fila - 1][posicion.columna] !== 2 && 
           tablero[posicion.fila - 1][posicion.columna] !== 4 && 
           tablero[posicion.fila - 1][posicion.columna] !== 7;
  } else if (direccion === "abajo") {
    return posicion.fila < filas - 1 && 
           tablero[posicion.fila + 1][posicion.columna] !== 2 && 
           tablero[posicion.fila + 1][posicion.columna] !== 4 && 
           tablero[posicion.fila + 1][posicion.columna] !== 7;
  } else if (direccion === "izquierda") {
    return posicion.columna > 0 && 
           tablero[posicion.fila][posicion.columna - 1] !== 2 && 
           tablero[posicion.fila][posicion.columna - 1] !== 4 && 
           tablero[posicion.fila][posicion.columna - 1] !== 7;
  } else if (direccion === "derecha") {
    return posicion.columna < columnas - 1 && 
           tablero[posicion.fila][posicion.columna + 1] !== 2 && 
           tablero[posicion.fila][posicion.columna + 1] !== 4 && 
           tablero[posicion.fila][posicion.columna + 1] !== 7;
  }
  return false;
}

// Actualizar explosión
function updateExplosion(tableroActual, posicionBomba, estado, radio = 1) {
  const copia = tableroActual.map(fila => [...fila]);
  
  if (estado === "explosion") {
    // Primero poner explosión en el centro
    copia[posicionBomba.fila][posicionBomba.columna] = 5;
    
    // 4 direcciones de expansión
    const direcciones = ["arriba", "abajo", "izquierda", "derecha"];
    
    // Expandir en cada dirección
    for (const direccion of direcciones) {
      let posicionActual = { ...posicionBomba };
      
      for (let distancia = 1; distancia <= radio; distancia++) {
        if (isValidExpandBomb(copia, posicionActual, direccion)) { // Si es válido
          // Calcular la nueva posición
          posicionActual = calculateNewPosition(posicionActual, direccion);
          // Colocar explosión en la nueva posición
          copia[posicionActual.fila][posicionActual.columna] = 5;
        } else { // Si no es válido, detener expansión en esta dirección y pasar a la siguiente
          break;
        }
      }
    }
    
  } else if (estado === "limpiar") {
    // Limpiar TODAS las explosiones
    for (let fila = 0; fila < copia.length; fila++) {
      for (let columna = 0; columna < copia[fila].length; columna++) {
        if (copia[fila][columna] === 5) {
          copia[fila][columna] = 0;
        }
      }
    }
  }
  
  return copia;
}