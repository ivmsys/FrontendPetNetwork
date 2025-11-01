const API_URL = 'http://api.mypetalk.com'; // Definimos la URL base aquí

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

export async function getPosts(token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_URL}/api/posts`, { headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al cargar el feed');
  return data;
}

export async function createPost(formData, token) {
  const response = await fetch(`${API_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al crear el post');
  return data;
}

export async function likePost(postId, token) {
  const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al dar like');
  return data;
}

export async function deletePost(postId, token) {
  const response = await fetch(`${API_URL}/api/posts/${postId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Error al eliminar el post');
  }
  return { success: true };
}

export async function getMe(token) {
  const response = await fetch(`${API_URL}/api/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al cargar el perfil');
  return data;
}

export async function getPets(token) {
  const response = await fetch(`${API_URL}/api/pets`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'No se pudieron cargar las mascotas');
  return data;
}

export async function registerPet(petData, token) {
  const response = await fetch(`${API_URL}/api/pets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(petData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al registrar la mascota');
  return data;
}

export async function uploadPetPicture(petId, formData, token) {
  const response = await fetch(`${API_URL}/api/pets/${petId}/upload-picture`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al subir la foto de la mascota');
  return data;
}

export async function deletePet(petId, token) {
  const response = await fetch(`${API_URL}/api/pets/${petId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Error al eliminar la mascota');
  }
  return { success: true };
}

export async function searchUsers(query, token) {
  const response = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error en la búsqueda');
  return data;
}

export async function getNotifications(token) {
  const response = await fetch(`${API_URL}/api/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al cargar notificaciones');
  return data;
}

export async function markNotificationsRead(notificationIds, token) {
  const response = await fetch(`${API_URL}/api/notifications/read`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notificationIds }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al marcar notificaciones');
  return data;
}

export async function acceptFriendship(friendshipId, token) {
  const response = await fetch(`${API_URL}/api/friendships/${friendshipId}/accept`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al aceptar solicitud');
  return data;
}

export async function rejectFriendship(friendshipId, token) {
  const response = await fetch(`${API_URL}/api/friendships/${friendshipId}/reject`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al rechazar solicitud');
  return data;
}

export async function sendFriendRequest(userId, token) {
  const response = await fetch(`${API_URL}/api/friendships/request/${userId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al enviar la solicitud');
  return data;
}

export async function getUserPublicProfile(userId, token) {
  const response = await fetch(`${API_URL}/api/users/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al cargar el perfil');
  return data;
}

export async function uploadProfilePicture(formData, token) {
  const response = await fetch(`${API_URL}/api/users/me/picture`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al subir la foto de perfil');
  return data;
}

export async function getCommentsForPost(postId) {
  // No necesita token porque es público
  const response = await fetch(`${API_URL}/api/posts/${postId}/comments`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al cargar comentarios');
  }
  return data; // Devuelve array de comentarios
}

export async function addCommentToPost(postId, content, token) {
  const response = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al añadir comentario');
  }
  return data; // Devuelve { message, comment }
}