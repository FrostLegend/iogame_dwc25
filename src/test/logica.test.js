import { describe, it, expect } from 'vitest';
import { 
  initializeBoard, 
  movePlayer, 
  placeBomb, 
  updateExplosion,
  isValidMove,
  calculateNewPosition,
  cleanPlayerPosition,
  placePlayer,
  isValidExpandBomb
} from '../componentes/gameLogic.js';

describe('Funciones PURAS del juego', () => {
  
  // calculateNewPosition
  describe('calculateNewPosition', () => {
    it('debe mover hacia arriba correctamente', () => {
      const posicion = { fila: 5, columna: 5 };
      const resultado = calculateNewPosition(posicion, 'arriba');
      expect(resultado).toEqual({ fila: 4, columna: 5 });
    });
    
    it('debe mover hacia abajo correctamente', () => {
      const posicion = { fila: 5, columna: 5 };
      const resultado = calculateNewPosition(posicion, 'abajo');
      expect(resultado).toEqual({ fila: 6, columna: 5 });
    });
    
    it('debe mover hacia izquierda correctamente', () => {
      const posicion = { fila: 5, columna: 5 };
      const resultado = calculateNewPosition(posicion, 'izquierda');
      expect(resultado).toEqual({ fila: 5, columna: 4 });
    });
    
    it('debe mover hacia derecha correctamente', () => {
      const posicion = { fila: 5, columna: 5 };
      const resultado = calculateNewPosition(posicion, 'derecha');
      expect(resultado).toEqual({ fila: 5, columna: 6 });
    });
  });
  
  // isValidMove
  describe('isValidMove', () => {
    const tablero = [
      [0, 0, 0],
      [3, 1, 4],
      [0, 2, 0]
    ];
    
    it('debe permitir movimiento a celda vacía (aire)', () => {
      const posicion = { fila: 1, columna: 1 };
      const resultado = isValidMove(tablero, posicion, 'arriba');
      expect(resultado).toBe(true); // Celda [0][1] es 0 (aire)
    });
    
    it('debe prohibir movimiento a pilar', () => {
      const posicion = { fila: 1, columna: 1 };
      const resultado = isValidMove(tablero, posicion, 'izquierda');
      expect(resultado).toBe(false); // Celda [1][0] es 3 (muro)
    });
    
    it('debe prohibir movimiento fuera del tablero', () => {
      const posicion = { fila: 0, columna: 0 };
      const resultado = isValidMove(tablero, posicion, 'arriba');
      expect(resultado).toBe(false); // Fuera del tablero
    });
  });
  
  // cleanPlayerPosition y placePlayer
  describe('cleanPlayerPosition y placePlayer', () => {
    it('cleanPlayerPosition debe limpiar posición del jugador', () => {
      const tablero = [[1, 0], [0, 0]];
      const posicion = { fila: 0, columna: 0 };
      const resultado = cleanPlayerPosition(tablero, posicion);
      expect(resultado[0][0]).toBe(0); // Jugador eliminado
    });
    
    it('placePlayer debe colocar jugador en posición', () => {
      const tablero = [[0, 0], [0, 0]];
      const posicion = { fila: 1, columna: 1 };
      const resultado = placePlayer(tablero, posicion);
      expect(resultado[1][1]).toBe(1); // Jugador colocado
    });
  });
  
  // movePlayer
  describe('movePlayer', () => {
    it('debe mover jugador cuando el movimiento es válido', () => {
      const tablero = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ];
      const posicion = { fila: 1, columna: 1 };
      
      const resultado = movePlayer(tablero, posicion, 'arriba');
      
      // Verificar que se movió
      expect(resultado.posicionJugador).toEqual({ fila: 0, columna: 1 });
      // Verificar que la posición antigua está vacía
      expect(resultado.tablero[1][1]).toBe(0);
      // Verificar que la nueva posición tiene jugador
      expect(resultado.tablero[0][1]).toBe(1);
    });
    
    it('debe mantener posición cuando movimiento no es válido', () => {
      const tablero = [
        [2, 0, 0],  // Pilar en [0][0]
        [1, 0, 0],
        [0, 0, 0]
      ];
      const posicion = { fila: 1, columna: 0 };
      
      const resultado = movePlayer(tablero, posicion, 'arriba');
      
      // No debe moverse
      expect(resultado.posicionJugador).toEqual({ fila: 1, columna: 0 });
      expect(resultado.tablero[1][0]).toBe(1); // Jugador en misma posición
    });
  });
  
  // placeBomb
  describe('placeBomb', () => {
    it('debe colocar bomba en posición del jugador', () => {
      const tablero = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ];
      const posicion = { fila: 1, columna: 1 };
      
      const resultado = placeBomb(tablero, posicion);
      
      // Verificar bomba colocada
      expect(resultado.tablero[1][1]).toBe(6); // = jugadorBomba
      // Verificar posición de bomba devuelta
      expect(resultado.posicionBomba).toEqual({ fila: 1, columna: 1 });
    });
  });
  
  // initializeBoard
  describe('initializeBoard', () => {
    it('debe crear tablero 9x9 por defecto', () => {
      const tablero = initializeBoard();
      
      expect(tablero).toHaveLength(9); // 9 filas
      expect(tablero[0]).toHaveLength(9); // 9 columnas
    });
    
    it('debe colocar jugador en [0][0]', () => {
      const tablero = initializeBoard();
      expect(tablero[0][0]).toBe(1); // 1 = jugador
    });
    
    it('debe crear pilares en posiciones impares', () => {
      const tablero = initializeBoard(5, 5); // Tablero 5x5
      // Pilares en [1][1], [1][3], [3][1], [3][3]
      expect(tablero[1][1]).toBe(2); // 2 = pilar
      expect(tablero[1][3]).toBe(2);
    });
  });
  
  // updateExplosion
  describe('updateExplosion', () => {
    it('debe limpiar todas las explosiones', () => {
      const tablero = [
        [5, 0, 5],
        [0, 5, 0],
        [5, 0, 5]
      ];
      const posicionBomba = { fila: 1, columna: 1 };
      
      const resultado = updateExplosion(tablero, posicionBomba, 'limpiar');
      
      // Todas las explosiones (5) deben ser 0
      expect(resultado.flat().every(celda => celda !== 5)).toBe(true);
    });
  });

  describe('isValidExpandBomb', () => {
    it('permite expansión a celda vacía (aire)', () => {
        const tablero = [
        [0, 0, 0],
        [0, 4, 0], // Bomba en el centro
        [0, 0, 0]
        ];
        const posicion = { fila: 1, columna: 1 };
        
        // Debería permitir expandir a todas las direcciones (son aire)
        expect(isValidExpandBomb(tablero, posicion, 'arriba')).toBe(true);
        expect(isValidExpandBomb(tablero, posicion, 'abajo')).toBe(true);
        expect(isValidExpandBomb(tablero, posicion, 'izquierda')).toBe(true);
        expect(isValidExpandBomb(tablero, posicion, 'derecha')).toBe(true);
    });
    
    it('prohíbe expansión a pilar (2)', () => {
        const tablero = [
        [0, 2, 0], // Pilar arriba
        [0, 4, 0],
        [0, 0, 0]
        ];
        const posicion = { fila: 1, columna: 1 };
        
        expect(isValidExpandBomb(tablero, posicion, 'arriba')).toBe(false);
    });
    
    it('prohíbe expansión a otra bomba (4)', () => {
        const tablero = [
        [0, 4, 0], // Otra bomba arriba
        [0, 4, 0], // Bomba actual
        [0, 0, 0]
        ];
        const posicion = { fila: 1, columna: 1 };
        
        expect(isValidExpandBomb(tablero, posicion, 'arriba')).toBe(false);
    });
    
    it('prohíbe expansión a moneda (7)', () => {
        const tablero = [
        [0, 7, 0], // Moneda arriba
        [0, 4, 0],
        [0, 0, 0]
        ];
        const posicion = { fila: 1, columna: 1 };
        
        expect(isValidExpandBomb(tablero, posicion, 'arriba')).toBe(false);
    });
    
    it('prohíbe expansión fuera del tablero', () => {
        const tablero = [
        [4, 0], // Bomba en esquina
        [0, 0]
        ];
        const posicion = { fila: 0, columna: 0 };
        
        expect(isValidExpandBomb(tablero, posicion, 'arriba')).toBe(false);
        expect(isValidExpandBomb(tablero, posicion, 'izquierda')).toBe(false);
    });
    
    it('permite expansión a jugador (1) y explosión (5)', () => {
        const tablero = [
        [0, 1, 0], // Jugador arriba
        [0, 4, 0],
        [0, 5, 0]  // Explosión abajo
        ];
        const posicion = { fila: 1, columna: 1 };
        
        // isValiedExpandBomb NO prohíbe jugador (1) ni explosión (5)
        expect(isValidExpandBomb(tablero, posicion, 'arriba')).toBe(true);
        expect(isValidExpandBomb(tablero, posicion, 'abajo')).toBe(true);
    });
    });
});