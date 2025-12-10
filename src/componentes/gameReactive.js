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
    <div id="hud">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>⏱️</span>
        <span>${tiempo}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <img src="./src/img/moneda.webp" style="width: 50px;" alt="moneda">
        <span>${monedas}/${monedasObjetivo}</span>
      </div>
    </div>
  `;
}

// Renderizar tablero
function renderTablero(tablero) {
  const tableroHTML = tablero.flatMap((fila, f) => // Convertir a una sola dimensión
    fila.map((celda, c) => 
      `<div class="celda ${tiposCelda[celda]}" data-fila="${f}" data-col="${c}"></div>`
    )
  ).join("");
  
  return `<div id="contenedorTablero">${tableroHTML}</div>`;
}

// Funciónes para teclas
const teclasConFuncion = {
  ArrowUp: "arriba", w: "arriba", W: "arriba",
  ArrowDown: "abajo", s: "abajo", S: "abajo",
  ArrowLeft: "izquierda", a: "izquierda", A: "izquierda",
  ArrowRight: "derecha", d: "derecha", D: "derecha",
  x: "bomba"
};

// Comprobar si el jugador está en la explosión
function jugadorEnExplosion(tablero, posicionJugador) {
  return tablero[posicionJugador.fila][posicionJugador.columna] === 5;
}

// Dar formato al tiempo pa mostrarlo
function formatearTiempo(centesimas) {
  const segundos = Math.floor(centesimas / 100);
  const mins = Math.floor(segundos / 60);
  const segs = segundos % 60;
  const cents = centesimas % 100;
  return `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}.${String(cents).padStart(2, '0')}`;
}

// Controlar explosión de bomba
function handleExplosion(tablero$, posicionBomba, posicionJugador$, juegoActivo$, centesimas$, bombaActiva$) {
  timer(1500).pipe( // Explota al 1.5 segundos
    tap(() => {
      const tableroActual = tablero$.getValue();
      
      // Crear copia y reemplazar bomba con explosión central
      const copia = tableroActual.map(fila => [...fila]);
      copia[posicionBomba.fila][posicionBomba.columna] = 5;
      
      // Usar updateExplosion con "explosion" para expandir
      const tableroExplosion = updateExplosion(copia, posicionBomba, "explosion");
      tablero$.next(tableroExplosion); // Actualizar valor del observable tablero 
      
      // Comprobar si el jugador le alcanza la explosión
      if (jugadorEnExplosion(tableroExplosion, posicionJugador$.getValue())) { // Si lo alcanza
        juegoActivo$.next(false); // El juego termina
        bombaActiva$.next(false); // Y liberar bomba
        
        const tiempoFinal = formatearTiempo(centesimas$.getValue());
        
        setTimeout(() => {
          const reintentar = confirm( // Mensaje de muerte y pregunta para reintentar
            `💀 ¡Has muerto! 💀\n\nTiempo sobrevivido: ${tiempoFinal}\n\n¿Quieres reintentar?`
          );
          
          if (reintentar) {
            window.location.reload();
          } else {
            window.location.hash = "";
          }
        }, 100);
      }
    }),
    delay(500),
    tap(() => {
      // Solo limpiar si el juego sigue activo
      if (juegoActivo$.getValue()) {
        const tableroActual = tablero$.getValue();
        const tableroSinExplosion = updateExplosion(tableroActual, posicionBomba, "limpiar");
        tablero$.next(tableroSinExplosion); // Actualizar tablero sin la explosión
        bombaActiva$.next(false); // Liberar bomba después de limpiar
      }
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
  const bombaActiva$ = new BehaviorSubject(false); // Control para bomba única
  
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
    
    if (accion === "bomba") {
      // Verificar si ya hay una bomba activa
      if (bombaActiva$.getValue()) {
        console.log("⚠️ Ya hay una bomba activa, espera a que explote");
        return;
      }
      
      // Colocar bomba
      const { tablero: nuevoTablero, posicionBomba } = placeBomb(tablero, posicionPJ);
      tablero$.next(nuevoTablero);
      bombaActiva$.next(true); // Marcar bomba como activa
      handleExplosion(tablero$, posicionBomba, posicionJugador$, juegoActivo$, centesimas$, bombaActiva$);
      
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
      
      const tiempoFinal = formatearTiempo(centesimas$.getValue());
      
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