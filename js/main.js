// js/main.js
// import duplicado eliminado
import { registerUser, loginUser, getPosts, createPost, likePost, deletePost, getMe, getPets, registerPet, uploadPetPicture, deletePet, searchUsers, getNotifications, markNotificationsRead as apiMarkNotificationsRead, acceptFriendship, rejectFriendship, sendFriendRequest, getUserPublicProfile, uploadProfilePicture } from './api.js';
import { showView } from './utils.js';
import { initSearch } from './search.js';
import { initPublicProfile, loadPublicProfilePage } from './publicProfile.js';
import { initNotifications, loadNotifications as moduleLoadNotifications } from './notifications.js';

// --- 1. CONFIGURACIÓN ---
// ¡¡¡CAMBIA ESTA URL POR LA TUYA DE RENDER!!!
const API_URL = 'https://petnet-tuyr.onrender.com';
let userPets = []; // Guardará la lista de mascotas del usuario
let selectedPetTags = []; // Guardará las mascotas seleccionadas para un post
let selectedPostFiles = []; // Guardará los archivos de media seleccionados
let currentNotifications = []; // Guardará las notificaciones cargadas
// --- 2. ELEMENTOS DEL DOM ---
// Vistas (pantallas)
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const appView = document.getElementById('app-view');

// Formularios
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Botones y enlaces
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const logoutButton = document.getElementById('logout-button');

// Mensajes de error
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

const feedContainer = document.getElementById('feed-container');
const createPostForm = document.getElementById('create-post-form');
const postError = document.getElementById('post-error');
const profileView = document.getElementById('profile-view');
const showProfileLink = document.getElementById('show-profile-link');
const userInfoContainer = document.getElementById('user-info-container');
const petListContainer = document.getElementById('pet-list-container');
const registerPetForm = document.getElementById('register-pet-form');
const petRegisterError = document.getElementById('pet-register-error');
const tagPetButton = document.getElementById('tag-pet-button');
const petTagsContainer = document.getElementById('pet-tags-container');
const petSelectionModal = document.getElementById('pet-selection-modal');
const petSelectionList = document.getElementById('pet-selection-list');
const closeModalButton = document.getElementById('close-modal-button');
const addMediaButton = document.getElementById('add-media-button');
const postMediaInput = document.getElementById('post-media-input');
const postMediaPreviewContainer = document.getElementById('post-media-preview-container');
const searchView = document.getElementById('search-view');
const searchResultsContainer = document.getElementById('search-results-container');
const profilePictureImg = document.getElementById('profile-picture-img');
const changePictureBtn = document.getElementById('change-picture-btn');
const profilePictureInput = document.getElementById('profile-picture-input');
const profilePictureError = document.getElementById('profile-picture-error');
const profileUsername = document.getElementById('profile-username');
const profileEmail = document.getElementById('profile-email');
const profileJoined = document.getElementById('profile-joined');
const notificationBell = document.getElementById('notification-bell');
const notificationCountBadge = document.getElementById('notification-count');
const notificationDropdown = document.getElementById('notification-dropdown');
const notificationList = document.getElementById('notification-list');

const publicProfileView = document.getElementById('public-profile-view');
const publicUserInfoContainer = document.getElementById('public-user-info-container');
const publicPetListContainer = document.getElementById('public-pet-list-container');
const publicProfileUsernameTitle = document.getElementById('public-profile-username-title');
const publicProfilePictureImg = document.getElementById('public-profile-picture-img');
const publicProfileUsername = document.getElementById('public-profile-username');
const publicProfileJoined = document.getElementById('public-profile-joined');
const publicFriendshipStatus = document.getElementById('public-friendship-status');
const publicAddFriendBtn = document.getElementById('public-add-friend-btn');
const publicProfileUsernamePets = document.getElementById('public-profile-username-pets');
// --- 3. NAVEGACIÓN ENTRE VISTAS ---

// Función showView migrada a utils.js

// Event Listeners para los enlaces de navegación
showRegisterLink.addEventListener('click', (e) => {
  e.preventDefault(); // Evita que el enlace recargue la página
  showView('register-view');
});

showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  showView('login-view');
});

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('token'); // Borra el token
  localStorage.removeItem('userId');
  showView('login-view'); // Muestra la pantalla de login
});
showProfileLink.addEventListener('click', (e) => {
  e.preventDefault();
  showView('profile-view');
  loadProfilePage(); // Carga los datos del perfil
});

// --- 4. LÓGICA DE AUTENTICACIÓN ---
// --- FUNCIÓN PARA CARGAR EL FEED ---
// --- FUNCIÓN PARA CARGAR EL FEED ---
async function loadFeed() {
  feedContainer.innerHTML = '<p>Cargando publicaciones...</p>';

  try {
    // Preparar headers. Si hay token, lo enviamos.
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Llamamos a nuestra API
    const response = await fetch(`${API_URL}/api/posts`, { headers });
    const posts = await response.json();

    // --- MANEJO DE ERROR ---
    // (Pequeña corrección aquí: usa 'posts' o response.status para checar error, no 'data')
    if (!response.ok) {
        // Intenta obtener el mensaje de error de la respuesta si falla
        let errorMessage = 'Error al cargar el feed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) { /* Ignora error al parsear JSON de error */ }
        throw new Error(errorMessage);
    }
    // --- FIN CORRECCIÓN ---


    feedContainer.innerHTML = ''; // Limpia el contenedor

    if (posts.length === 0) {
      feedContainer.innerHTML = '<p>No hay publicaciones todavía. ¡Sé el primero!</p>';
      return;
    }

    // Iteramos sobre cada post y creamos su HTML
    posts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.className = 'post-card';

      const postDate = new Date(post.created_at).toLocaleString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit'
      });
      
      const likedClass = post.user_has_liked ? 'liked' : 'not-liked';

      let mediaHtml = '';
      if (post.media && post.media.length > 0) {
        // ... (Tu código para mediaHtml se queda igual) ...
        mediaHtml = `<div class="post-media-container count-${post.media.length}">`;
        post.media.forEach(m => {
          mediaHtml += `<div class="post-media-item">`;
          if (m.type === 'image') {
            mediaHtml += `<img src="${m.url}" alt="Media del post">`;
          } else if (m.type === 'video') {
            mediaHtml += `<video src="${m.url}" controls></video>`;
          }
          mediaHtml += `</div>`;
        });
        mediaHtml += `</div>`;
      }

      // <-- AÑADIDO: Lógica para el botón de eliminar -->
      const currentUserId = localStorage.getItem('userId'); // Obtener nuestro ID
      let deleteButtonHtml = '';
      // Mostrar botón solo si el post es nuestro
      if (currentUserId && post.author_id === currentUserId) {
      // Cambia "Eliminar" por el símbolo &times;
          deleteButtonHtml = `<button class="delete-post-btn" data-post-id="${post.post_id}" title="Eliminar post">&times;</button>`; 
      }
      // <-- FIN AÑADIDO -->

      // HTML para la tarjeta del post (MODIFICADO para incluir el botón)
      postElement.innerHTML = `
        <div class="post-header"> <div class="post-author">${post.author_username}</div>
            ${deleteButtonHtml} </div>

        ${post.tagged_pets && post.tagged_pets.length > 0 ? 
          `<div class="post-pet">Etiquetando a: ${post.tagged_pets.map(pet => pet.name).join(', ')}</div>` : 
          ''}

        <p class="post-content">${post.content}</p>

        ${mediaHtml} 
        
        <div class="post-timestamp">${postDate}</div>

        <div class="post-actions">
          <button class="like-button ${likedClass}" data-post-id="${post.post_id}">
            ❤️
          </button>
          <span class="like-count">${post.like_count}</span>
        </div>
      `;

      feedContainer.appendChild(postElement);
    });

  } catch (error) {
    feedContainer.innerHTML = `<p class="error-message">Error al cargar el feed: ${error.message}</p>`;
  }
}

// --- FUNCIÓN PARA CARGAR LA PÁGINA DE PERFIL ---
async function loadProfilePage() {
  const token = localStorage.getItem('token');
  if (!token) {
    showView('login-view'); // Si no hay token, fuera
    return;
  }

  // Preparamos los headers con el token
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  try {
    // Hacemos las dos peticiones a la API en paralelo
    const [userResponse, petsResponse] = await Promise.all([
      fetch(`${API_URL}/api/users/me`, { headers }),
      fetch(`${API_URL}/api/pets`, { headers })
    ]);

    if (!userResponse.ok || !petsResponse.ok) {
      throw new Error('Error al cargar los datos del perfil');
    }

    const userData = await userResponse.json();
    const petsData = await petsResponse.json(); // Mover aquí para tener ambos

    profileUsername.textContent = userData.username;
    profileEmail.textContent = userData.email;
    profileJoined.textContent = new Date(userData.created_at).toLocaleDateString();
    profilePictureImg.src = userData.profile_picture_url || 'https://res.cloudinary.com/dk4am2opk/image/upload/v1761374308/images_ofhhpx.jpg';
    profilePictureError.textContent = ''; // Limpiar errores

    // 2. Renderizar la lista de mascotas
    petListContainer.innerHTML = ''; // Limpia el contenedor
    if (petsData.length === 0) {
      petListContainer.innerHTML = '<p>No tienes mascotas registradas.</p>';
    } else {
      petsData.forEach(pet => {
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';

        const birthDate = pet.birth_date ? new Date(pet.birth_date).toLocaleDateString() : 'Desconocida';

        // Si la mascota no tiene foto, usamos un placeholder
        const petImage = pet.profile_picture_url || 'https://res.cloudinary.com/dk4am2opk/image/upload/v1761374308/images_ofhhpx.jpg';

        petCard.innerHTML = `
          <img src="${petImage}" alt="Foto de ${pet.name}">
          <div class="pet-card-info">
            <h3>${pet.name}</h3>
            <p><strong>Especie:</strong> ${pet.species || 'No especificada'}</p>
            <p><strong>Raza:</strong> ${pet.breed || 'No especificada'}</p>
            <p><strong>Nacimiento:</strong> ${birthDate}</p>

            <form class="upload-pet-photo-form" data-pet-id="${pet.pet_id}">
              <input type="file" name="image" required>
              <button type="submit">Subir Foto</button>
            </form>

            <button class="delete-pet-btn" data-pet-id="${pet.pet_id}">Eliminar</button>
            </div>
        `;
        petListContainer.appendChild(petCard);
      });
    }
  } catch (error) {
    userInfoContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
    petListContainer.innerHTML = '';
  }
}

// --- FUNCIÓN PARA CARGAR LAS MASCOTAS DEL USUARIO ---
// (La usaremos para el menú de etiquetado)
async function loadUserPets() {
  const token = localStorage.getItem('token');
  if (!token) return; // No hacer nada si no hay token

  try {
    const response = await fetch(`${API_URL}/api/pets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('No se pudieron cargar las mascotas');

    userPets = await response.json(); // Guarda las mascotas en la variable global
  } catch (error) {
    console.error(error.message);
  }
}
// --- FUNCIÓN PARA CARGAR PERFIL PÚBLICO ---
// app.js -> REEMPLAZA ESTA FUNCIÓN COMPLETA
// app.js -> REEMPLAZA ESTA FUNCIÓN COMPLETA
// Perfil público: migrado a publicProfile.js (initPublicProfile).

// --- FUNCIÓN PARA CARGAR NOTIFICACIONES NO LEÍDAS (CORREGIDA) ---
// Función loadNotifications migrada a notifications.js (moduleLoadNotifications).

// Event Listener para el formulario de REGISTRO
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que el formulario recargue la página
  registerError.textContent = ''; // Limpia errores previos

  // Obtener datos del formulario
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    
    await registerUser(username, email, password)
    // ¡Éxito!
    alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
    showView('login-view'); // Muestra la pantalla de login

  } catch (error) {
    registerError.textContent = error.message;
  }
});

// Event Listener para el formulario de LOGIN
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = ''; // Limpia errores previos

  // Obtener datos del formulario
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const data = await loginUser(email, password);
    // ¡¡ÉXITO!! Guardamos el token
    localStorage.setItem('token', data.token);
    try {
        const payloadBase64 = data.token.split('.')[1];
        const decodedJson = atob(payloadBase64);
        const decodedPayload = JSON.parse(decodedJson);
        localStorage.setItem('userId', decodedPayload.user.id); // Guarda nuestro ID
    } catch (e) {
        console.error("Error decoding token:", e);
        localStorage.removeItem('userId'); // Limpia si falla
    } 
    // Mostramos la app principal
    showView('app-view');
    loadFeed();
    loadUserPets();
    moduleLoadNotifications();
  } catch (error) {
    loginError.textContent = error.message;
  }
});

// Event Listener para el formulario de CREAR POST (¡ACTUALIZADO con FormData!)
createPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  postError.textContent = '';

  // --- AÑADIDO: Encontrar y deshabilitar botón ---
  const submitButton = createPostForm.querySelector('button[type="submit"]');
  if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Publicando...'; // Feedback visual
  }

  const content = document.getElementById('post-content').value;
  const token = localStorage.getItem('token');


  if (!token) {
    postError.textContent = 'Error: Debes iniciar sesión para publicar.';
    showView('login-view');
    return;
  }

  // ¡Usamos FormData para enviar archivos y texto!
  const formData = new FormData();

  // 1. Añadir los datos de texto
  formData.append('content', content);

  // 2. Añadir los petIds (como un string JSON)
  const petIds = selectedPetTags.map(pet => pet.pet_id);
  formData.append('petIds', JSON.stringify(petIds));

  // 3. Añadir los archivos (con la key 'media')
  selectedPostFiles.forEach(file => {
    formData.append('media', file);
  });

  try {
    const response = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: {
        // ¡NO pongas 'Content-Type'! El navegador lo hace solo.
        'Authorization': `Bearer ${token}` 
      },
      body: formData // Enviamos el objeto FormData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al crear el post');
    }

    // ¡Éxito! Limpiar todo
    document.getElementById('post-content').value = '';
    selectedPetTags = [];
    selectedPostFiles = [];
    renderSelectedPetTags();
    renderPostMediaPreviews();
    loadFeed(); // Recarga el feed

  } catch (error) {
    postError.textContent = error.message;
  } finally {
    // --- AÑADIDO: Rehabilitar botón (SIEMPRE) ---
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Publicar'; // Restaurar texto
    }
  }  
});

// Event Listener para el formulario de REGISTRAR MASCOTA
registerPetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  petRegisterError.textContent = '';

  const submitButton = registerPetForm.querySelector('button[type="submit"]');
  if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Registrando...';
  }

  const token = localStorage.getItem('token');
  if (!token) {
    showView('login-view');
    return;
  }

  // Recolectar datos del formulario
  const petData = {
    name: document.getElementById('pet-name').value,
    species: document.getElementById('pet-species').value,
    breed: document.getElementById('pet-breed').value,
    birthDate: document.getElementById('pet-birthdate').value || null
  };

  try {
    const response = await fetch(`${API_URL}/api/pets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(petData)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Error al registrar mascota');
    }

    // Éxito: Limpiar formulario y recargar la lista
    registerPetForm.reset();
    loadProfilePage(); // Recarga toda la info del perfil

  } catch (error) {
    petRegisterError.textContent = error.message;
  } finally {
    // --- AÑADIDO: Rehabilitar botón ---
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Registrar Mascota';
    }
    // --- FIN AÑADIDO ---
  }
});

// Event Listener (delegado) para TODOS los formularios de SUBIR FOTO
petListContainer.addEventListener('submit', async (e) => {
  // Solo nos interesan los formularios con esta clase
  if (!e.target.classList.contains('upload-pet-photo-form')) {
    return;
  }

  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    showView('login-view');
    return;
  }

  const form = e.target;
  const petId = form.dataset.petId; // Obtenemos el ID de la mascota
  const fileInput = form.querySelector('input[type="file"]');

  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Por favor, selecciona un archivo.');
    return;
  }

  // Usamos FormData para enviar archivos
  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  try {
    const response = await fetch(`${API_URL}/api/pets/${petId}/upload-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // NO se pone 'Content-Type', el navegador lo hace solo con FormData
      },
      body: formData
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Error al subir la foto');
    }

    // Éxito: Recargar la info del perfil para mostrar la nueva foto
    loadProfilePage();

  } catch (error) {
    alert(error.message);
  }
});

// ... (al final de app.js)

// Event Listener (delegado) para TODOS los botones de "Me Gusta"
feedContainer.addEventListener('click', async (e) => {
  // Solo nos interesan los botones con esta clase
  if (!e.target.classList.contains('like-button')) {
    return;
  }
  
  const button = e.target;
  const postId = button.dataset.postId;
  
  const token = localStorage.getItem('token');
  if (!token) {
    // Si no está logeado, lo manda al login
    alert('Debes iniciar sesión para dar "me gusta".');
    showView('login-view');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al procesar el like');
    }

    // ¡Éxito! Actualizamos la UI al instante
    const likeCountSpan = button.nextElementSibling; // El <span> del conteo
    likeCountSpan.textContent = data.newLikeCount;
    
    // Alternamos la clase del botón
    button.classList.toggle('liked', data.userHasLiked);
    button.classList.toggle('not-liked', !data.userHasLiked);

  } catch (error) {
    alert(error.message);
  }
});

// --- LÓGICA DE SUBIDA DE MEDIA ---

// 1. Abrir el input de archivo al hacer clic en '+'
addMediaButton.addEventListener('click', () => {
  postMediaInput.click();
});

// 2. Manejar la selección de archivos
postMediaInput.addEventListener('change', (e) => {
  if (!e.target.files) return;

  const files = Array.from(e.target.files);

  // Limitar a 4 archivos
  const totalFiles = selectedPostFiles.length + files.length;
  if (totalFiles > 4) {
    alert('Puedes subir un máximo de 4 archivos por post.');
    // Resetea el input
    postMediaInput.value = '';
    return;
  }

  // Añadir los nuevos archivos al estado
  selectedPostFiles.push(...files);

  // Mostrar las vistas previas
  renderPostMediaPreviews();

  // Resetea el input para poder añadir el mismo archivo si se borra
  postMediaInput.value = '';
});

// 3. Función para renderizar las vistas previas
function renderPostMediaPreviews() {
  postMediaPreviewContainer.innerHTML = '';

  selectedPostFiles.forEach((file, index) => {
    const previewItem = document.createElement('div');
    previewItem.className = 'media-preview-item';

    const fileType = file.type.startsWith('video') ? 'video' : 'image';
    const fileUrl = URL.createObjectURL(file); // Crea una URL local temporal

    if (fileType === 'image') {
      previewItem.innerHTML = `<img src="${fileUrl}" alt="Vista previa">`;
    } else {
      previewItem.innerHTML = `<video src="${fileUrl}" muted></video>`; // 'muted' para evitar errores
    }

    // Añadir botón de borrar
    const removeBtn = document.createElement('button');
    removeBtn.className = 'media-preview-remove-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.dataset.index = index; // Guardamos el índice del archivo
    previewItem.appendChild(removeBtn);

    postMediaPreviewContainer.appendChild(previewItem);
  });
}

// 4. Listener para borrar una vista previa
postMediaPreviewContainer.addEventListener('click', (e) => {
  const removeButton = e.target.closest('.media-preview-remove-btn');
  if (!removeButton) return;

  const indexToRemove = parseInt(removeButton.dataset.index, 10);

  // Quitar del array de estado
  selectedPostFiles.splice(indexToRemove, 1);

  // Volver a renderizar
  renderPostMediaPreviews();
});

// --- LÓGICA DE ETIQUETADO DE MASCOTAS ---

// 1. Mostrar el modal al hacer clic en @
tagPetButton.addEventListener('click', () => {
  renderPetSelectionModal();
  petSelectionModal.style.display = 'flex';
});

// 2. Cerrar el modal
closeModalButton.addEventListener('click', () => {
  petSelectionModal.style.display = 'none';
});
// (Opcional) Cerrar si se hace clic fuera del contenido
petSelectionModal.addEventListener('click', (e) => {
  if (e.target === petSelectionModal) {
    petSelectionModal.style.display = 'none';
  }
});

// 3. Función para renderizar la lista de mascotas en el modal
function renderPetSelectionModal() {
  petSelectionList.innerHTML = ''; // Limpiar lista
  if (userPets.length === 0) {
    petSelectionList.innerHTML = '<p>No tienes mascotas registradas.</p>';
    return;
  }

  // Filtrar las mascotas que NO han sido etiquetadas aún
  const availablePets = userPets.filter(pet => {
    // Devuelve true si la mascota NO está en selectedPetTags
    return !selectedPetTags.find(tag => tag.pet_id === pet.pet_id);
  });

  if (availablePets.length === 0) {
    petSelectionList.innerHTML = '<p>Todas tus mascotas ya están etiquetadas.</p>';
    return;
  }

  availablePets.forEach(pet => {
    const petItem = document.createElement('div');
    petItem.className = 'pet-selection-item';
    petItem.dataset.petId = pet.pet_id; // Guardamos el ID

    const petImage = pet.profile_picture_url || 'https://res.cloudinary.com/dk4am2opk/image/upload/v1761374308/images_ofhhpx.jpg';
    petItem.innerHTML = `
      <img src="${petImage}" alt="${pet.name}">
      <span>${pet.name}</span>
    `;
    petSelectionList.appendChild(petItem);
  });
}

// 4. Listener para seleccionar una mascota del modal
petSelectionList.addEventListener('click', (e) => {
  const petItem = e.target.closest('.pet-selection-item');
  if (!petItem) return;

  const petId = petItem.dataset.petId;
  // Encontrar el objeto completo de la mascota
  const pet = userPets.find(p => p.pet_id === petId);

  if (pet) {
    selectedPetTags.push(pet); // Añadir al array de estado
    renderSelectedPetTags(); // Actualizar las "píldoras"
    petSelectionModal.style.display = 'none'; // Cerrar modal
  }
});

// 5. Función para renderizar las "píldoras" de etiquetas seleccionadas
function renderSelectedPetTags() {
  petTagsContainer.innerHTML = ''; // Limpiar
  selectedPetTags.forEach(pet => {
    const tagPill = document.createElement('span');
    tagPill.className = 'pet-tag-pill';
    tagPill.innerHTML = `
      ${pet.name}
      <button type="button" class="pet-tag-remove-btn" data-pet-id="${pet.pet_id}">×</button>
    `;
    petTagsContainer.appendChild(tagPill);
  });
}

// 6. Listener para quitar una etiqueta (clic en la "X")
petTagsContainer.addEventListener('click', (e) => {
  const removeButton = e.target.closest('.pet-tag-remove-btn');
  if (!removeButton) return;

  const petId = removeButton.dataset.petId;

  // Quitar la mascota del array de estado
  selectedPetTags = selectedPetTags.filter(pet => pet.pet_id !== petId);

  // Volver a renderizar las "píldoras"
  renderSelectedPetTags();
});

// --- LÓGICA DE NAVEGACIÓN Y BÚSQUEDA (VERSIÓN CORREGIDA) ---

// Usamos 'document.addEventListener' para escuchar clics en CUALQUIER PARTE
document.addEventListener('click', (e) => {

  // Botón de Cerrar Sesión (busca el id en el elemento o en su padre)
  if (e.target.closest('#logout-button')) {
    localStorage.removeItem('token'); // Borra el token
    showView('login-view'); // Muestra la pantalla de login
  }

  // Enlace de "Mi Perfil"
  if (e.target.closest('#show-profile-link')) {
    e.preventDefault();
    showView('profile-view');
    loadProfilePage(); // Carga los datos del perfil
    moduleLoadNotifications();
  }

  // Logo "PetNet" para volver al Feed
  if (e.target.closest('#back-to-feed-from-logo')) {
    e.preventDefault();
    showView('app-view');
    loadFeed();
  }
});

// Búsqueda: manejadores migrados a search.js (initSearch).

// Función para renderizar los resultados de la búsqueda (DEBE ESTAR FUERA de los listeners)
// Función para renderizar los resultados de la búsqueda (CORREGIDA)
// app.js -> Reemplaza renderSearchResults
// Render y manejadores de búsqueda migrados a search.js.

// --- LÓGICA DE SOLICITUDES DE AMISTAD Y VER PERFIL --- (ACTUALIZADO)
// Envío de solicitud de amistad migrado a publicProfile.js.

// --- LÓGICA DEL MENÚ DE NOTIFICACIONES ---

// Toggle de notificaciones migrado a notifications.js (initNotifications).

// 2. Función para renderizar el contenido del menú
// app.js - Reemplaza renderNotificationDropdown
// Render del dropdown de notificaciones migrado a notifications.js.
// 3. Función auxiliar para formatear "hace X tiempo" (opcional)
// Utilidad de formato de tiempo migrada a notifications.js.

// --- LISTENER PARA ACCIONES DENTRO DEL MENÚ DE NOTIFICACIONES ---
// Acciones dentro del menú de notificaciones migradas a notifications.js (initNotifications).
// 4. (En el siguiente paso añadiremos un listener para los clics DENTRO del menú)
// --- FUNCIÓN PARA MARCAR NOTIFICACIONES COMO LEÍDAS ---
// Función markNotificationsAsRead migrada a notifications.js.

// --- LÓGICA DE CAMBIO DE FOTO DE PERFIL ---

// 1. Abrir input de archivo al hacer clic en "Cambiar Foto"
changePictureBtn.addEventListener('click', () => {
  profilePictureInput.click();
});

// 2. Manejar la selección y subida del archivo
profilePictureInput.addEventListener('change', async (e) => {
  if (!e.target.files || e.target.files.length === 0) return;

  const file = e.target.files[0];
  const token = localStorage.getItem('token');
  profilePictureError.textContent = ''; // Limpiar error

  if (!token) {
    showView('login-view');
    return;
  }

  // Mostrar carga (opcional)
  changePictureBtn.textContent = 'Subiendo...';
  changePictureBtn.disabled = true;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_URL}/api/users/me/picture`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al subir la foto');
    }

    // Éxito: Actualizar la imagen mostrada
    profilePictureImg.src = data.user.profile_picture_url;

  } catch (error) {
    profilePictureError.textContent = error.message;
  } finally {
    // Restaurar botón
    changePictureBtn.textContent = 'Cambiar Foto';
    changePictureBtn.disabled = false;
    profilePictureInput.value = ''; // Limpiar input
  }
});
// app.js -> Cerca del listener de petListContainer 'submit'
// Event Listener (delegado) para TODOS los botones de ELIMINAR MASCOTA
petListContainer.addEventListener('click', async (e) => {
  if (!e.target.classList.contains('delete-pet-btn')) {
    return; // Solo actuar si se hizo clic en el botón de eliminar
  }

  const button = e.target;
  const petId = button.dataset.petId;
  const petCard = button.closest('.pet-card'); // Encuentra la tarjeta padre
  const petName = petCard.querySelector('h3').textContent; // Obtiene el nombre para confirmar

  // Confirmación
  if (!confirm(`¿Estás seguro de que quieres eliminar a ${petName}? Esta acción no se puede deshacer.`)) {
    return; 
  }

  const token = localStorage.getItem('token');
  if (!token) { showView('login-view'); return; }

  button.disabled = true;
  button.textContent = 'Eliminando...';

  try {
    const response = await fetch(`${API_URL}/api/pets/${petId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Error al eliminar la mascota');
    }

    // Éxito: Quitar la tarjeta de la UI
    petCard.remove(); 
    // Opcional: Recargar toda la página de perfil si prefieres
    // loadProfilePage();

  } catch (error) {
    alert(error.message);
    button.disabled = false; // Rehabilitar si falla
    button.textContent = 'Eliminar';
  }
});

// Event Listener (delegado) para TODOS los botones de ELIMINAR POST
feedContainer.addEventListener('click', async (e) => {
  // Si ya manejamos el like, salir
  if (e.target.classList.contains('like-button')) return; 

  // Solo actuar si se hizo clic en el botón de eliminar
  if (!e.target.classList.contains('delete-post-btn')) {
    return; 
  }

  const button = e.target;
  const postId = button.dataset.postId;
  const postCard = button.closest('.post-card'); 

  // Confirmación
  if (!confirm('¿Estás seguro de que quieres eliminar este post?')) {
    return; 
  }

  const token = localStorage.getItem('token');
  if (!token) { showView('login-view'); return; }

  button.disabled = true;
  // button.textContent = 'Eliminando...'; // Opcional

  try {
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Error al eliminar el post');
    }

    // Éxito: Quitar la tarjeta de la UI
    postCard.remove(); 

  } catch (error) {
    alert(error.message);
    button.disabled = false; // Rehabilitar si falla
  }
});
// --- 5. INICIALIZACIÓN ---
// Comprobar si ya existe un token al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar módulos (listeners y lógica propia)
  initSearch({ showView, loadPublicProfilePage });
  initPublicProfile({ showView });
  initNotifications({ showView });

  const token = localStorage.getItem('token');
  if (token) {
    showView('app-view');
    loadFeed();
    loadUserPets();
    moduleLoadNotifications();
  } else {
    showView('login-view');
  }
});

