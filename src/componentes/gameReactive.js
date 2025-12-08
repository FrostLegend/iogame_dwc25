import { BehaviorSubject, fromEvent, timer, interval } from "rxjs";
import { map, filter, tap, delay, takeWhile } from "rxjs/operators";
import { 
  initializeBoard, 
  movePlayer, 
  placeBomb, 
  updateExplosion,
  tiposCelda 
} from "./gameLogic.js";

export { renderGameReactive };

// Renderizar cronómetro
function renderCronometro(centesimas) {
  const segundos = Math.floor(centesimas / 100);
  const mins = Math.floor(segundos / 60);
  const segs = segundos % 60;
  const cents = centesimas % 100;
  
  const tiempo = `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}.${String(cents).padStart(2, '0')}`;
  
  return `
    <div style="display: flex; justify-content: center; align-items: center; 
                padding: 15px; background: #2c3e50; color: white; 
                border-radius: 10px; margin-bottom: 20px; font-size: 32px; 
                font-weight: bold; font-family: 'Courier New', monospace;">
      <span style="margin-right: 15px;">⏱️</span>
      <span>${tiempo}</span>
    </div>
  `;
}

// Renderizar tablero
function renderTablero(tablero) {
  const tableroHTML = tablero.flatMap((fila, f) =>
    fila.map((celda, c) => 
      `<div class="celda ${tiposCelda[celda]}" data-fila="${f}" data-col="${c}"></div>`
    )
  ).join("");
  
  return `<div id="contenedorTablero">${tableroHTML}</div>`;
}

// Acción teclas
const teclasConFuncion = {
  ArrowUp: "arriba", w: "arriba", W: "arriba",
  ArrowDown: "abajo", s: "abajo", S: "abajo",
  ArrowLeft: "izquierda", a: "izquierda", A: "izquierda",
  ArrowRight: "derecha", d: "derecha", D: "derecha",
  x: "bomba"
};

// Manejar explosión de bomba
function handleExplosion(tablero$, posicionBomba) {
  timer(1500).pipe(
    tap(() => {
      // Explosión
      tablero$.next(updateExplosion(tablero$.getValue(), posicionBomba, "explosion"));
    }),
    delay(500),
    tap(() => {
      // Limpiar
      tablero$.next(updateExplosion(tablero$.getValue(), posicionBomba, "limpiar"));
    })
  ).subscribe();
}

function renderGameReactive() {
  const contenedor = document.createElement("div");
  contenedor.id = "contenedorJuego";
  
  // Guardar estado del tablero y jugador
  const tablero$ = new BehaviorSubject(initializeBoard());
  const posicionJugador$ = new BehaviorSubject({ fila: 0, columna: 0 });
  const centesimas$ = new BehaviorSubject(0);
  const juegoActivo$ = new BehaviorSubject(true);
  
  // Cronómetro (cada centésima)
  interval(10).pipe(
    takeWhile(() => juegoActivo$.getValue()),
    tap(() => centesimas$.next(centesimas$.getValue() + 1))
  ).subscribe();
  
  // Observable para cualquier evento de presion de tecla en la ventana del juego
  const key$ = fromEvent(document, "keydown").pipe(
    filter(() => window.location.hash === "#game"), // #game pagina del juego
    filter(() => juegoActivo$.getValue()), // Solo si el juego está activo
    tap(e => e.preventDefault()), // Evita mover la pagina con las flechas
    map(e => teclasConFuncion[e.key]), // Guardamos la acción de la tecla
    filter(Boolean) // Por si la tecla no tiene función
  );
  
  // Suscripción para manejar movimientos y bombas
  key$.subscribe(accion => {
    const tablero = tablero$.getValue();
    const posicionPJ = posicionJugador$.getValue();
    
    if (accion === "bomba") { // Colocar bomba
      const { tablero: nuevoTablero, posicionBomba } = placeBomb(tablero, posicionPJ);
      tablero$.next(nuevoTablero);
      handleExplosion(tablero$, posicionBomba);
    } else { // Mover jugador
      const resultado = movePlayer(tablero, posicionPJ, accion);
      tablero$.next(resultado.tablero);
      posicionJugador$.next(resultado.posicionJugador);
    }
  });
  
  // Función para renderizar todo
  const renderizar = () => {
    const cronometro = renderCronometro(centesimas$.getValue());
    const tableroHTML = renderTablero(tablero$.getValue());
    
    contenedor.innerHTML = cronometro + tableroHTML;
  };
  
  // Suscribirse a cambios
  tablero$.subscribe(renderizar);
  centesimas$.subscribe(renderizar);
  
  return contenedor;
}