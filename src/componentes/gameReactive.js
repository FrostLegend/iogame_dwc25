import { BehaviorSubject, fromEvent, timer, interval } from "rxjs";
import { map, filter, tap, delay, takeWhile } from "rxjs/operators";
import { initializeBoard, movePlayer, placeBomb, updateExplosion,tiposCelda } from "./gameLogic.js";
import monedaImg from '../img/moneda.webp';
import { guardarPartidaSupabase, cargarPartidaSupabase } from '../supabase.js';
export { renderGameReactive };

// Obtener estado del juego para guardarlo
function obtenerEstadoJuego(tablero$, posicionJugador$, centesimas$, monedas$, juegoActivo$, bombaActiva$, monedasObjetivo) {
  return {
    tablero: tablero$.getValue(),
    posicionJugador: posicionJugador$.getValue(),
    tiempo: centesimas$.getValue(),
    monedas: monedas$.getValue(),
    monedasObjetivo: monedasObjetivo,
    juegoActivo: juegoActivo$.getValue(),
    bombaActiva: bombaActiva$.getValue(),
    fechaGuardado: new Date().toISOString()
  };
}

// Renderizar cronómetro y monedas
function renderContadores(centesimas, monedas, monedasObjetivo) {
  const segundos = Math.floor(centesimas / 100);
  const mins = Math.floor(segundos / 60);
  const segs = segundos % 60;
  const cents = centesimas % 100;
  
  const tiempo = `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}.${String(cents).padStart(2, '0')}`;
  
  return `
    <div style="display: flex; align-items: center; gap: 15px;">
      <div style="display: flex; align-items: center; gap: 5px;">
        <span>⏱️</span>
        <span style="font-weight: bold;">${tiempo}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 5px;">
        <img src="${monedaImg}" style="width: 30px; height: 30px;" alt="moneda">
        <span style="font-weight: bold;">${monedas}/${monedasObjetivo}</span>
      </div>
    </div>
  `;
}

// Crear HUD estático una sola vez
function crearHUDEstatico() {
  return `
    <div id="hud">
      <div id="contadoresDinamicos"></div>
      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
        <button id="guardarBtn" class="btn btn-sm btn-success">
          <i class="bi bi-save"></i> Guardar
        </button>
        <button id="cargarBtn" class="btn btn-sm btn-warning">
          <i class="bi bi-folder2-open"></i> Cargar
        </button>
        <button id="reiniciarBtn" class="btn btn-sm btn-danger">
          <i class="bi bi-arrow-clockwise"></i> Reiniciar
        </button>
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
function handleExplosion(tablero$, posicionBomba, posicionJugador$, juegoActivo$, centesimas$, bombaActiva$, resetCb) {
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
            if (typeof resetCb === "function") resetCb();
            else window.location.hash = "";
          } else {
            window.location.hash = "";
          }
        }, 100);
      }
    }),
    delay(500),
    tap(() => {
      const tableroActual = tablero$.getValue();
      const tableroSinExplosion = updateExplosion(tableroActual, posicionBomba, "limpiar");
      tablero$.next(tableroSinExplosion); // Actualizar tablero sin la explosión
      bombaActiva$.next(false); // Liberar bomba después de limpiar
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
  
  // Crear estructura inicial una sola vez
  contenedor.innerHTML = crearHUDEstatico() + '<div id="contenedorTableroWrapper"></div>';
  
  // Listener único para los tres botones
  const botonNombres = {
    guardarBtn: "guardar",
    cargarBtn: "cargar",
    reiniciarBtn: "reiniciar"
  };

  const accionesBotones = {
    guardar: async () => {      
      try {
        const estado = obtenerEstadoJuego(
          tablero$, 
          posicionJugador$, 
          centesimas$, 
          monedas$, 
          juegoActivo$, 
          bombaActiva$, 
          monedasObjetivo
        );
        
        await guardarPartidaSupabase(estado);
        alert('Partida guardada correctamente');
      } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error al guardar la partida: ' + error.message);
      }
    },
    
    cargar: async () => {
      try {
        const estadoCargado = await cargarPartidaSupabase();
        
        if (!estadoCargado) {
          alert('No hay partidas guardadas');
          return;
        }
        
        // Restaurar el estado del juego
        tablero$.next(estadoCargado.tablero);
        posicionJugador$.next(estadoCargado.posicionJugador);
        centesimas$.next(estadoCargado.tiempo);
        monedas$.next(estadoCargado.monedas);
        juegoActivo$.next(estadoCargado.juegoActivo);
        bombaActiva$.next(estadoCargado.bombaActiva);
        monedasObjetivo = estadoCargado.monedasObjetivo;
        
        // Reiniciar el timer si el juego está activo
        if (estadoCargado.juegoActivo) {
          startTimer();
        }
        
        alert('Partida cargada correctamente');
      } catch (error) {
        console.error('Error al cargar:', error);
        alert('Error al cargar la partida: ' + error.message);
      }
    },
    
    reiniciar: () => resetGame()
  };

  contenedor.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn || !contenedor.contains(btn)) return;
    const nombre = botonNombres[btn.id];
    
    if (nombre && accionesBotones[nombre]) {
      await accionesBotones[nombre]();
    }
  });
  
  // Estado inicial
  const tableroInicial = initializeBoard();
  let monedasObjetivo = contarMonedas(tableroInicial);
  
  // Guardar estado del tablero y jugador
  const tablero$ = new BehaviorSubject(tableroInicial);
  const posicionJugador$ = new BehaviorSubject({ fila: 0, columna: 0 });
  const centesimas$ = new BehaviorSubject(0);
  const monedas$ = new BehaviorSubject(0);
  const juegoActivo$ = new BehaviorSubject(true);
  const bombaActiva$ = new BehaviorSubject(false); // Control para bomba única
  
  // Cronómetro (cada centésima) — controlado para reiniciarlo en reset
  let timerSub = null;
  function startTimer() {
    if (timerSub) timerSub.unsubscribe();
    timerSub = interval(10).subscribe(() => {
      if (juegoActivo$.getValue()) centesimas$.next(centesimas$.getValue() + 1);
    });
  }
  // Detener timer cuando el juego deje de estar activo
  juegoActivo$.subscribe(val => {
    if (!val && timerSub) {
      timerSub.unsubscribe();
      timerSub = null;
    }
  });
  startTimer();
  
  // Observable para cualquier evento de presion de tecla en la ventana del juego
  const key$ = fromEvent(document, "keydown").pipe(
    filter(() => window.location.hash === "#game"), // #game pagina del juego
    filter(() => juegoActivo$.getValue()), // Solo si el juego está activo
    tap(e => e.preventDefault()), // Evita mover la pagina con las flechas
    map(e => teclasConFuncion[e.key]), // Guardamos la acción de la tecla
    filter(Boolean) // Por si la tecla no tiene función
  );
  
  // reiniciar el estado y el timer
  function resetGame() {
    const nuevoTablero = initializeBoard();
    tablero$.next(nuevoTablero);
    posicionJugador$.next({ fila: 0, columna: 0 });
    centesimas$.next(0);
    monedas$.next(0);
    juegoActivo$.next(true);
    bombaActiva$.next(false);
    monedasObjetivo = contarMonedas(nuevoTablero);
    startTimer();
  }

  // Suscripción para manejar movimientos y bombas
  key$.subscribe(accion => {
    const tablero = tablero$.getValue();
    const posicionPJ = posicionJugador$.getValue();
    
    if (accion === "bomba") {
      // Verificar si ya hay una bomba activa
      if (bombaActiva$.getValue()) {
        console.log("Solo puedes poner una bomba simultaneamente, espera a que explote");
        return;
      }
      
      // Colocar bomba
      const { tablero: nuevoTablero, posicionBomba } = placeBomb(tablero, posicionPJ); // Destructuring
      tablero$.next(nuevoTablero);
      bombaActiva$.next(true); // Marcar bomba como activa
      handleExplosion(tablero$, posicionBomba, posicionJugador$, juegoActivo$, centesimas$, bombaActiva$, resetGame);
      
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
  
  // Función para renderizar solo lo dinámico
  const renderizar = () => {
    // Actualizar solo los contadores (parte dinámica)
    const contadoresDiv = contenedor.querySelector('#contadoresDinamicos');
    if (contadoresDiv) {
      contadoresDiv.innerHTML = renderContadores(
        centesimas$.getValue(), 
        monedas$.getValue(), 
        monedasObjetivo
      );
    }
    
    // Actualizar tablero
    const tableroWrapper = contenedor.querySelector('#contenedorTableroWrapper');
    if (tableroWrapper) {
      tableroWrapper.innerHTML = renderTablero(tablero$.getValue());
    }
  };
  
  // Suscribirse a cambios
  tablero$.subscribe(renderizar);
  centesimas$.subscribe(renderizar);
  monedas$.subscribe(renderizar);

  // Renderizado inicial
  renderizar();
  
  return contenedor;
}