const API_URL = 'https://petnet-tuyr.onrender.com'; // Definimos la URL base aquí

export async function loginUser(email, password) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        // Lanzamos un error para que el 'catch' en main.js lo maneje
        throw new Error(data.message || 'Error al iniciar sesión');
    }

    return data; // Devuelve los datos (incluyendo el token)
}

// Aquí añadiremos registerUser, getPosts, createPost, etc.

export async function registerUser(username, email, password){
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Si hay errores de validación (ej. email duplicado)
      throw new Error(data.message || (data.errors ? data.errors[0].msg : 'Error al registrar'));
    }
    return data;
}