// game.js - RENDERIZADO REACTIVO CON CRONÓMETRO
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

// Renderizar cronómetro y monedas
function renderContadores(centesimas, monedas, monedasObjetivo) {
  const segundos = Math.floor(centesimas / 100);
  const mins = Math.floor(segundos / 60);
  const segs = segundos % 60;
  const cents = centesimas % 100;
  
  const tiempo = `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}.${String(cents).padStart(2, '0')}`;
  
  return `
    <div style="display: flex; gap: 30px; justify-content: center; align-items: center; 
                padding: 15px; background: #2c3e50; color: white; 
                border-radius: 10px; margin-bottom: 20px; font-size: 28px; 
                font-weight: bold; font-family: 'Courier New', monospace;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>⏱️</span>
        <span>${tiempo}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>💰</span>
        <span>${monedas}/${monedasObjetivo}</span>
      </div>
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
      const tableroActual = tablero$.getValue();
      
      // Crear copia y reemplazar bomba con explosión central
      const copia = tableroActual.map(fila => [...fila]);
      copia[posicionBomba.fila][posicionBomba.columna] = 5;
      
      // Usar updateExplosion con "explosion" para expandir
      const tableroExplosion = updateExplosion(copia, posicionBomba, "explosion");
      tablero$.next(tableroExplosion);
    }),
    delay(500),
    tap(() => {
      // Limpiar
      const tableroActual = tablero$.getValue();
      const tableroLimpio = updateExplosion(tableroActual, posicionBomba, "limpiar");
      tablero$.next(tableroLimpio);
    })
  ).subscribe();
}

// Contar monedas en el tablero
function contarMonedas(tablero) {
  return tablero.flat().filter(celda => celda === 7).length;
}

function renderGameReactive() {
  const contenedor = document.createElement("div");
  contenedor.id = "contenedorJuego";
  
  // Estado inicial
  const tableroInicial = initializeBoard();
  const monedasObjetivo = contarMonedas(tableroInicial);
  
  // Guardar estado del tablero y jugador
  const tablero$ = new BehaviorSubject(tableroInicial);
  const posicionJugador$ = new BehaviorSubject({ fila: 0, columna: 0 });
  const centesimas$ = new BehaviorSubject(0);
  const monedas$ = new BehaviorSubject(0);
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
      
      // Actualizar monedas recogidas
      const monedasActuales = contarMonedas(resultado.tablero);
      monedas$.next(monedasObjetivo - monedasActuales);
    }
  });
  
  // Verificar victoria
  monedas$.subscribe(monedas => {
    if (monedas >= monedasObjetivo && juegoActivo$.getValue()) {
      juegoActivo$.next(false);
      
      const centesimas = centesimas$.getValue();
      const segundos = Math.floor(centesimas / 100);
      const mins = Math.floor(segundos / 60);
      const segs = segundos % 60;
      const cents = centesimas % 100;
      const tiempoFinal = `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}.${String(cents).padStart(2, '0')}`;
      
      setTimeout(() => {
        alert(`¡Victoria! 🎉\n\nTiempo: ${tiempoFinal}\nMonedas: ${monedas}/${monedasObjetivo}`);
      }, 100);
    }
  });
  
  // Función para renderizar todo
  const renderizar = () => {
    const contadores = renderContadores(
      centesimas$.getValue(), 
      monedas$.getValue(), 
      monedasObjetivo
    );
    const tableroHTML = renderTablero(tablero$.getValue());
    
    contenedor.innerHTML = contadores + tableroHTML;
  };
  
  // Suscribirse a cambios
  tablero$.subscribe(renderizar);
  centesimas$.subscribe(renderizar);
  monedas$.subscribe(renderizar);
  
  return contenedor;
}