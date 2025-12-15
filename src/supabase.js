import { SUPABASE_KEY, USER_RUTE, SUPABASE_URL } from "./env.js";

// Funciones para localStorage del usuario logueado
const getToken = () => localStorage.getItem('supabase_token');
const setToken = (token) => localStorage.setItem('supabase_token', token);
const removeToken = () => localStorage.removeItem('supabase_token');
const getUserData = () => JSON.parse(localStorage.getItem('user_data'));
const setUserData = (data) => localStorage.setItem('user_data', JSON.stringify(data));
const removeUserData = () => localStorage.removeItem('user_data');

export async function authUsuario(body, accion) {
    const tipo = {
        0: "signup",
        1: "token?grant_type=password"
    };

    try {
        let response = await fetch(USER_RUTE + tipo[accion], {
            method: 'POST',
            headers: {
                "apiKey": SUPABASE_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error_description || data.msg || 'Error de autenticación');
        }
        
        // Guardar token y datos del usuario en login (accion = 1)
        if (accion === 1 && data.access_token) {
            setToken(data.access_token);
            setUserData({
                email: body.email,
                id: data.user?.id,
            });
            console.log('Login exitoso, usuario guardado');
        }
        
        return data;
        
    } catch (error) {
        console.error('Error en authUsuario:', error);
        throw error;
    }
}

// Verificar si hay usuario logueado
export function isLoggedIn() {
    return !!getToken(); // Devuelve true si hay token
}

// Obtener usuario actual
export function getCurrentUser() {
    return getUserData();
}

// Cerrar sesión
export function logout() {
    removeToken();
    removeUserData();
    console.log('✅ Sesión cerrada');
}

// Guardar partida del usuario en Supabase
export async function guardarPartidaSupabase(estadoJuego) {
    const token = localStorage.getItem('supabase_token');
    const user = JSON.parse(localStorage.getItem('user_data'));
    
    try {
        if (!token || !user) {
            throw new Error('Debes iniciar sesión para guardar partidas');
        }
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/partidas`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                usuario_id: user.id,
                estado_juego: estadoJuego,
                fecha_guardado: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al guardar partida');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en guardarPartidaSupabase:', error);
        throw error;
    }
}

// Cargar última partida jugada por el usuario logueado
export async function cargarPartidaSupabase() {
    const token = localStorage.getItem('supabase_token');
    const user = JSON.parse(localStorage.getItem('user_data'));
    try {
        if (!token || !user) {
            throw new Error('Debes iniciar sesión para cargar partidas');
        }
        
        const response = await fetch( // Buscar la última partida guardada por fecha descendente por el usuario
            `${SUPABASE_URL}/rest/v1/partidas?usuario_id=eq.${user.id}&select=*&order=fecha_guardado.desc&limit=1`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al cargar partida');
        }
        
        const partidas = await response.json();
        if (partidas.length === 0) {
            return null; // No hay partidas guardadas
        }
    
        return partidas[0].estado_juego;
    } catch (error) {
        console.error('Error en cargarPartidaSupabase:', error);
        throw error;
    }
}

// Obtener TODAS las partidas del usuario logueado
export async function obtenerTodasLasPartidas() {
    const token = localStorage.getItem('supabase_token');
    const user = JSON.parse(localStorage.getItem('user_data'));
    try {
        if (!token || !user) {
            throw new Error('Debes iniciar sesión para ver partidas');
        }
        
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/partidas?usuario_id=eq.${user.id}&select=*&order=fecha_guardado.desc`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener partidas');
        }
        
        const partidas = await response.json();
        return partidas;
    } catch (error) {
        console.error('Error en obtenerTodasLasPartidas:', error);
        throw error;
    }
}

// Obtener partida por ID
export async function obtenerPartidaPorId(partidaId) {
    const token = localStorage.getItem('supabase_token');
    const user = JSON.parse(localStorage.getItem('user_data'));
    try {
        if (!token || !user) {
            throw new Error('Debes iniciar sesión para ver partidas');
        }
        
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/partidas?id=eq.${partidaId}&usuario_id=eq.${user.id}&select=*`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener partida');
        }
        
        const partidas = await response.json();
        if (partidas.length === 0) {
            return null;
        }
        
        return partidas[0];
    } catch (error) {
        console.error('Error en obtenerPartidaPorId:', error);
        throw error;
    }
}

// Eliminar partida por ID
export async function eliminarPartidaPorId(partidaId) {
    const token = localStorage.getItem('supabase_token');
    const user = JSON.parse(localStorage.getItem('user_data'));
    try {
        if (!token || !user) {
            throw new Error('Debes iniciar sesión para eliminar partidas');
        }
        
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/partidas?id=eq.${partidaId}&usuario_id=eq.${user.id}`,
            {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar partida');
        }
        
        return { success: true, message: 'Partida eliminada' };
    } catch (error) {
        console.error('Error en eliminarPartidaPorId:', error);
        throw error;
    }
}