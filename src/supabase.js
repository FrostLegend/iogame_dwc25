export async function authUsuario(SUPABASE_KEY, body, USER_RUTE, accion) {
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