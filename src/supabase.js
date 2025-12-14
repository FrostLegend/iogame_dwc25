import { SUPABASE_KEY, USER_RUTE } from "./env.js";

// Funciones para localStorage
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