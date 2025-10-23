import { SUPABASE_KEY, USER_RUTE } from "./env.js";
export async function authUsuario(body, accion) {
    const tipo = {
        0: "signup",
        1: "token?grant_type=password"
    }

    let response = await fetch(USER_RUTE + tipo[accion],{
        method: `POST`,
        headers: {
            "apiKey": SUPABASE_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    console.log(response);
}