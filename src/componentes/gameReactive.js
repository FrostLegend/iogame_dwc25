// game.js - RENDERIZADO REACTIVO
import { BehaviorSubject, fromEvent, merge, timer } from "rxjs";
import { map, filter, withLatestFrom, tap } from "rxjs/operators";
import { 
  initializeBoard, 
  movePlayer, 
  placeBomb, 
  updateExplosion,
  tiposCelda 
} from "./gameLogic.js";

export { renderGameReactive };

// PURA - Renderizar tablero
function renderTablero(tablero) {
  const y = tablero.length;
  const x = tablero[0].length;
  let tableroHTML = "";

  for (let fila = 0; fila < y; fila++) {
    for (let columna = 0; columna < x; columna++) {
      const clase = tiposCelda[tablero[fila][columna]];
      tableroHTML += `
        <div class="celda ${clase}" data-fila="${fila}" data-col="${columna}">
        </div>`;
    }
  }
  
  const contenedorJuego = document.createElement("div");
  contenedorJuego.id = "contenedorJuego";
  contenedorJuego.innerHTML = `
    <div id="contenedorTablero">
      ${tableroHTML}
    </div>
  `;
  return contenedorJuego;
}

// Mapear teclas a direcciones
function mapKeyToDirection(key) {
  const keyMap = {
    "ArrowUp": "arriba", "w": "arriba", "W": "arriba",
    "ArrowDown": "abajo", "s": "abajo", "S": "abajo",
    "ArrowLeft": "izquierda", "a": "izquierda", "A": "izquierda",
    "ArrowRight": "derecha", "d": "derecha", "D": "derecha",
    "x": "bomba"
  };
  return keyMap[key] || null;
}

function renderGameReactive() {
  const contenedor = document.createElement("div");
  
  // Estado reactivo con BehaviorSubjects
  const tablero$ = new BehaviorSubject(initializeBoard());
  const posicionJugador$ = new BehaviorSubject({ fila: 0, columna: 0 });

    tablero$.subscribe(tablero => {
        console.log("📊 Tablero actualizado:", tablero);
    });

    posicionJugador$.subscribe(posicion => {
        console.log("🎮 Posición jugador:", posicion);
    });
  
  // Observable de teclas presionadas
  const keydown$ = fromEvent(document, "keydown").pipe(
    filter(() => window.location.hash === ""),
    tap(e => e.preventDefault()),
    map(e => mapKeyToDirection(e.key)),
    filter(direccion => direccion !== null)
  );
  
  // Manejar movimientos
  const move$ = keydown$.pipe(
    filter(direccion => direccion !== "bomba"),
    withLatestFrom(tablero$, posicionJugador$),
    map(([direccion, tablero, posicion]) => 
      movePlayer(tablero, posicion, direccion)
    )
  );
  
  // Manejar bombas
  const bomb$ = keydown$.pipe(
    filter(direccion => direccion === "bomba"),
    withLatestFrom(tablero$, posicionJugador$),
    tap(([_, tablero, posicion]) => {
      // Colocar bomba
      const { tablero: tableroConBomba, posicionBomba } = 
        placeBomb(tablero, posicion);
      tablero$.next(tableroConBomba);
      
      // Explosión después de 1.5s
      setTimeout(() => {
        const tableroExplosion = updateExplosion(
          tablero$.getValue(), 
          posicionBomba, 
          "explosion"
        );
        tablero$.next(tableroExplosion);
        
        // Limpiar después de 0.5s
        setTimeout(() => {
          const tableroLimpio = updateExplosion(
            tablero$.getValue(), 
            posicionBomba, 
            "limpiar"
          );
          tablero$.next(tableroLimpio);
        }, 500);
      }, 1500);
    })
  );
  
  // Suscribirse a movimientos
  move$.subscribe(({ tablero, posicionJugador }) => {
    tablero$.next(tablero);
    posicionJugador$.next(posicionJugador);
  });
  
  // Suscribirse a bombas (solo para activar el efecto)
  bomb$.subscribe();
  
  // Renderizar cuando cambia el tablero
  tablero$.subscribe(tablero => {
    contenedor.replaceChildren(renderTablero(tablero));
  });
  
  return contenedor;
}