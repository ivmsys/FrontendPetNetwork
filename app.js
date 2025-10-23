// app.js
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

// Función para cambiar de vista
function showView(viewId) {
  // Oculta todas las vistas
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  // Muestra la vista deseada
  document.getElementById(viewId).classList.add('active');
}

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
  showView('login-view'); // Muestra la pantalla de login
});
showProfileLink.addEventListener('click', (e) => {
  e.preventDefault();
  showView('profile-view');
  loadProfilePage(); // Carga los datos del perfil
});

// --- 4. LÓGICA DE AUTENTICACIÓN ---
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

    if (!response.ok) {
      throw new Error(data.message || 'Error al cargar el feed');
    }

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
      
      // Añadimos la clase 'liked' o 'not-liked'
      const likedClass = post.user_has_liked ? 'liked' : 'not-liked';

      // ¡NUEVO! Crear el HTML para el grid de media
      let mediaHtml = '';
      if (post.media && post.media.length > 0) {
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

      // HTML para la tarjeta del post
      postElement.innerHTML = `
        <div class="post-author">${post.author_username}</div>

        ${post.tagged_pets && post.tagged_pets.length > 0 ? 
          `<div class="post-pet">Etiquetando a: ${post.tagged_pets.map(pet => pet.name).join(', ')}</div>` : 
          ''}

        <p class="post-content">${post.content}</p>

        ${mediaHtml} <div class="post-timestamp">${postDate}</div>

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
    profilePictureImg.src = userData.profile_picture_url || 'https://via.placeholder.com/100'; // Mostrar foto o placeholder
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
        const petImage = pet.profile_picture_url || 'https://via.placeholder.com/100';

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
async function loadPublicProfilePage(userId) {
  const token = localStorage.getItem('token');
  if (!token) { showView('login-view'); return; }

  // Mostrar carga y limpiar contenedores
  showView('public-profile-view');
  const userInfoContainer = document.getElementById('public-user-info-container');
  const petListContainer = document.getElementById('public-pet-list-container');
  const addFriendBtn = document.getElementById('public-add-friend-btn');

  // Seleccionar los elementos específicos para actualizar
  const usernameTitle = document.getElementById('public-profile-username-title');
  const petsTitle = document.getElementById('public-profile-username-pets');
  const profilePic = document.getElementById('public-profile-picture-img');
  const usernameSpan = document.getElementById('public-profile-username'); // El span para el nombre
  const joinedSpan = document.getElementById('public-profile-joined');   // El span para la fecha
  const friendshipStatusElement = document.getElementById('public-friendship-status');

  // Mostrar carga inicial
  if (usernameTitle) usernameTitle.textContent = 'Usuario';
  if (petsTitle) petsTitle.textContent = 'Usuario';
  if (profilePic) profilePic.src = 'https://via.placeholder.com/100';
  if (usernameSpan) usernameSpan.textContent = 'Cargando...';
  if (joinedSpan) joinedSpan.textContent = 'Cargando...';
  if (friendshipStatusElement) friendshipStatusElement.textContent = '';
  if (addFriendBtn) addFriendBtn.style.display = 'none';
  petListContainer.innerHTML = '<p>Cargando mascotas...</p>';

  try {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const apiErrorData = await response.json();
      throw new Error(apiErrorData.message || 'Error al cargar el perfil');
    }

    const profileData = await response.json();
    const { user: userData, pets: petsData } = profileData;

    // --- Renderizar Info del Usuario ---
    if (usernameTitle) usernameTitle.textContent = userData.username;
    if (petsTitle) petsTitle.textContent = userData.username;
    if (profilePic) profilePic.src = userData.profile_picture_url || 'https://via.placeholder.com/100';
    if (usernameSpan) usernameSpan.textContent = userData.username; // Actualiza el span
    if (joinedSpan) joinedSpan.textContent = new Date(userData.created_at).toLocaleDateString(); // Actualiza el span

    // --- Lógica de Amistad (Usando datos de la API) ---
    const friendshipStatus = profileData.friendshipStatus; // <-- Obtenemos el estado real

    // Asegurarse de que los elementos existan antes de usarlos
    const friendshipStatusElement = document.getElementById('public-friendship-status');
    const addFriendBtn = document.getElementById('public-add-friend-btn'); 

    if (friendshipStatusElement) friendshipStatusElement.textContent = ''; // Limpiar estado previo
    if (addFriendBtn) addFriendBtn.style.display = 'none'; // Ocultar botón por defecto

    if (friendshipStatus === 'accepted') {
        if (friendshipStatusElement) friendshipStatusElement.textContent = 'AMIGOS';
    } else if (friendshipStatus === 'pending') {
        if (friendshipStatusElement) friendshipStatusElement.textContent = 'Hay una solicitud pendiente.'; 
        // TODO: Sería ideal saber quién la envió para mostrar "Solicitud enviada" o "Solicitud recibida"
    } else if (friendshipStatus === 'rejected') {
        if (friendshipStatusElement) friendshipStatusElement.textContent = 'Solicitud rechazada.';
        // Podríamos mostrar el botón "Añadir Amigo" de nuevo si quisiéramos
        if (addFriendBtn) { /* ... mostrar botón ... */ }
    } else { // Si es null (no hay relación) o cualquier otro estado
        if (addFriendBtn) {
            addFriendBtn.style.display = 'inline-block';
            addFriendBtn.dataset.userId = userData.user_id;
            addFriendBtn.textContent = 'Añadir Amigo';
            addFriendBtn.disabled = false;
            addFriendBtn.classList.remove('pending');
        }
    }
    // --- Fin Lógica de Amistad ---

    // --- Renderizar Mascotas del Usuario ---
    petListContainer.innerHTML = '';
    if (!petsData || petsData.length === 0) {
      petListContainer.innerHTML = `<p>${userData.username} no tiene mascotas registradas.</p>`;
    } else {
      petsData.forEach(pet => {
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';
        const birthDate = pet.birth_date ? new Date(pet.birth_date).toLocaleDateString() : 'Desconocida';
        const petImage = pet.profile_picture_url || 'https://via.placeholder.com/100';

        petCard.innerHTML = `
          <img src="${petImage}" alt="Foto de ${pet.name}">
          <div class="pet-card-info">
            <h3>${pet.name}</h3>
            <p><strong>Especie:</strong> ${pet.species || 'No especificada'}</p>
            <p><strong>Raza:</strong> ${pet.breed || 'No especificada'}</p>
            <p><strong>Nacimiento:</strong> ${birthDate}</p>
          </div>
        `;
        petListContainer.appendChild(petCard);
      });
    }

  } catch (error) {
    console.error("Error en loadPublicProfilePage:", error);
    // Muestra error solo en la sección principal de info
    if(userInfoContainer) userInfoContainer.innerHTML = `<h2>Error</h2><p class="error-message">${error.message}</p>`;
    petListContainer.innerHTML = ''; // Limpia mascotas en caso de error
  }
}
// --- FUNCIÓN PARA CARGAR NOTIFICACIONES NO LEÍDAS (CORREGIDA) ---
async function loadNotifications() {
  // Encuentra TODOS los badges
  const notificationBadges = document.querySelectorAll('#notification-count'); 

  const token = localStorage.getItem('token');
  if (!token) { // Si no hay token, ocultar todos los contadores
      notificationBadges.forEach(badge => {
          badge.textContent = '0';
          badge.style.display = 'none';
      });
      return; 
  }

  try {
    const response = await fetch(`${API_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Si hay error en la petición, ocultar todos los badges
    if (!response.ok) {
      console.error('Error al cargar notificaciones');
      notificationBadges.forEach(badge => badge.style.display = 'none');
      return;
    }

    const notifications = await response.json();
    currentNotifications = notifications;
    const count = notifications.length;

    // Actualizar TODOS los contadores
    notificationBadges.forEach(badge => {
        if (count > 0) {
          badge.textContent = count;
          badge.style.display = 'block'; // Mostrar badge
        } else {
          badge.textContent = '0';
          badge.style.display = 'none'; // Ocultar si no hay
        }
    });

    // (Guardaremos 'notifications' globalmente en el siguiente paso)

  } catch (error) {
    console.error('Error fetching notifications:', error);
    notificationBadges.forEach(badge => badge.style.display = 'none'); // Ocultar si hay error de red
  }
}

// Event Listener para el formulario de REGISTRO
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que el formulario recargue la página
  registerError.textContent = ''; // Limpia errores previos

  // Obtener datos del formulario
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
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
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    // ¡¡ÉXITO!! Guardamos el token
    localStorage.setItem('token', data.token);
    
    // Mostramos la app principal
    showView('app-view');
    loadFeed();
    loadUserPets();
    loadNotifications();
  } catch (error) {
    loginError.textContent = error.message;
  }
});

// Event Listener para el formulario de CREAR POST (¡ACTUALIZADO con FormData!)
createPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  postError.textContent = '';

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
  }
});

// Event Listener para el formulario de REGISTRAR MASCOTA
registerPetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  petRegisterError.textContent = '';

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

    const petImage = pet.profile_picture_url || 'https://via.placeholder.com/40';
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
    loadNotifications();
  }

  // Logo "PetNet" para volver al Feed
  if (e.target.closest('#back-to-feed-from-logo')) {
    e.preventDefault();
    showView('app-view');
    loadFeed();
  }
});

// Usamos 'document.addEventListener' para escuchar envíos de formularios
document.addEventListener('submit', async (e) => {

  // Formulario de Búsqueda
  if (e.target.closest('#search-form')) {
    e.preventDefault();

    // Encontramos el input DENTRO del formulario que se envió
    const searchInput = e.target.querySelector('#search-input');
    const query = searchInput.value;
    if (!query) return;

    const token = localStorage.getItem('token');
    if (!token) {
      showView('login-view');
      return;
    }

    // Cambiamos a la vista de búsqueda ANTES de buscar
    showView('search-view');

    // Obtenemos el contenedor DENTRO de la vista de búsqueda
    const searchResultsContainer = document.getElementById('search-results-container'); // Find the main container
    const userCardsList = searchResultsContainer.querySelector('#user-cards-list'); // Find the inner list
    const feedbackElement = searchResultsContainer.querySelector('#search-feedback'); // Find feedback p
    userCardsList.innerHTML = '<p>Buscando...</p>'; // Show loading in the list area
    feedbackElement.textContent = ''; // Clear feedback
    feedbackElement.className = 'feedback-message';

    try {
      const response = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }

      const users = await response.json();
      renderSearchResults(users); // Llamamos a la función que renderiza

    // Corrected catch block inside search submit listener
    } catch (error) {
      const searchResultsContainer = document.getElementById('search-results-container');
      const userCardsList = searchResultsContainer.querySelector('#user-cards-list');
      userCardsList.innerHTML = `<p class="error-message">${error.message}</p>`; // Show error in list area
    }
  }
});

// Función para renderizar los resultados de la búsqueda (DEBE ESTAR FUERA de los listeners)
// Función para renderizar los resultados de la búsqueda (CORREGIDA)
// app.js -> Reemplaza renderSearchResults
function renderSearchResults(users) {
  const searchResultsContainer = document.getElementById('search-results-container');
  const userCardsList = searchResultsContainer.querySelector('#user-cards-list');
  const feedbackElement = searchResultsContainer.querySelector('#search-feedback');

  userCardsList.innerHTML = ''; 
  feedbackElement.textContent = '';
  feedbackElement.className = 'feedback-message';

  if (users.length === 0) {
    userCardsList.innerHTML = '<p>No se encontraron usuarios.</p>';
    return;
  }

  users.forEach(user => {
    const userCard = document.createElement('div');
    userCard.className = 'user-card';
    // Usa la foto de perfil real
    const userImage = user.profile_picture_url || 'https://via.placeholder.com/50'; 

    // Determinar qué botón mostrar
    let actionButtonHtml = '';
    if (user.friendship_status === 'accepted') {
      actionButtonHtml = `<button class="view-profile-btn" data-user-id="${user.user_id}">Ver Perfil</button>`;
    } else if (user.friendship_status === 'pending') {
        // Podríamos diferenciar si la envié yo o me la enviaron
        actionButtonHtml = `<button class="add-friend-btn pending" data-user-id="${user.user_id}" disabled>Solicitud Pendiente</button>`;
    } else { // 'rejected', null, o cualquier otro caso
      actionButtonHtml = `<button class="add-friend-btn" data-user-id="${user.user_id}">Añadir Amigo</button>`;
    }

    userCard.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; cursor: pointer;" class="user-card-clickable-area" data-user-id="${user.user_id}"> 
        <img src="${userImage}" alt="Foto de ${user.username}">
        <div class="user-card-info">
          <h3>${user.username}</h3>
          </div>
      </div>
      ${actionButtonHtml} 
    `;
    userCardsList.appendChild(userCard);
  });
}
// --- LÓGICA DE SOLICITUDES DE AMISTAD ---

// --- LÓGICA DE SOLICITUDES DE AMISTAD Y VER PERFIL --- (ACTUALIZADO)
searchResultsContainer.addEventListener('click', async (e) => {
  const addFriendButton = e.target.closest('.add-friend-btn');
  const viewProfileButton = e.target.closest('.view-profile-btn');
  const clickableArea = e.target.closest('.user-card-clickable-area'); // Clic en cualquier parte de la info

  const token = localStorage.getItem('token');
  if (!token) { showView('login-view'); return; }

  const feedbackElement = document.getElementById('search-feedback');
  feedbackElement.textContent = ''; 
  feedbackElement.className = 'feedback-message'; 

  // --- Acción: Ver Perfil ---
  if (viewProfileButton || clickableArea) {
      const userIdToView = viewProfileButton ? viewProfileButton.dataset.userId : clickableArea.dataset.userId;
      loadPublicProfilePage(userIdToView); // Carga y muestra el perfil público
      return; // Termina aquí si solo era ver perfil
  }

  // --- Acción: Añadir Amigo ---
  if (addFriendButton) {
      // Si el botón ya está deshabilitado, no hacer nada
      if(addFriendButton.disabled) return; 

      const userIdToSendRequest = addFriendButton.dataset.userId;

      addFriendButton.disabled = true; 
      addFriendButton.textContent = 'Enviando...';

      try {
        const response = await fetch(`${API_URL}/api/friendships/request/${userIdToSendRequest}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al enviar la solicitud');

        addFriendButton.textContent = 'Solicitud Enviada';
        addFriendButton.classList.add('pending');
        feedbackElement.textContent = 'Solicitud de amistad enviada.';
        feedbackElement.classList.add('success');

      } catch (error) {
        console.error('Error sending friend request:', error);
        feedbackElement.textContent = error.message;
        feedbackElement.classList.add('error');
        addFriendButton.disabled = false; 
        addFriendButton.textContent = 'Añadir Amigo'; 
      }
  }
});

// Listener para el botón "Añadir Amigo" DESDE la página de perfil público
publicAddFriendBtn.addEventListener('click', async (e) => {
    const button = e.target;
    const userIdToSendRequest = button.dataset.userId;
    const token = localStorage.getItem('token');

    if (!token || button.disabled) return;

    button.disabled = true;
    button.textContent = 'Enviando...';
    publicFriendshipStatus.textContent = ''; // Limpiar estado previo

    try {
        const response = await fetch(`${API_URL}/api/friendships/request/${userIdToSendRequest}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al enviar la solicitud');

        button.textContent = 'Solicitud Enviada';
        button.classList.add('pending');
        publicFriendshipStatus.textContent = 'Solicitud de amistad enviada.';

    } catch (error) {
        console.error('Error sending friend request from profile:', error);
        publicFriendshipStatus.textContent = `Error: ${error.message}`;
        button.disabled = false;
        button.textContent = 'Añadir Amigo';
    }
});

// --- LÓGICA DEL MENÚ DE NOTIFICACIONES ---

// 1. Mostrar/Ocultar el menú al hacer clic en la campana
document.addEventListener('click', (e) => {
  const bellButton = e.target.closest('#notification-bell');

  if (bellButton) { // Si se hizo clic en la campana (o dentro)
    // Alternar la visibilidad
    const isVisible = notificationDropdown.style.display === 'block';
    notificationDropdown.style.display = isVisible ? 'none' : 'block';

    // Si se va a mostrar, renderizar el contenido
    if (!isVisible) {
      renderNotificationDropdown();

      // (Aquí también llamaremos a 'markNotificationsAsRead' en el futuro)
    }
  } else if (!e.target.closest('#notification-dropdown')) {
    // Si se hizo clic FUERA de la campana Y FUERA del menú, ocultar el menú
    notificationDropdown.style.display = 'none';
  }
});

// 2. Función para renderizar el contenido del menú
// app.js - Reemplaza renderNotificationDropdown
function renderNotificationDropdown() {
  notificationList.innerHTML = ''; // Limpiar lista

  // Filtramos solo las no leídas para mostrar (aunque las guardamos todas en currentNotifications)
  const unreadNotifications = currentNotifications.filter(n => !n.is_read); 

  if (unreadNotifications.length === 0) {
    notificationList.innerHTML = '<p>No hay notificaciones nuevas.</p>';
    return;
  }

  unreadNotifications.forEach(notif => {
    const item = document.createElement('div');
    item.className = 'notification-item';
    // Guardamos todos los datos necesarios en atributos data-*
    item.dataset.notificationId = notif.notification_id;
    item.dataset.type = notif.type;
    item.dataset.relatedId = notif.related_entity_id; // friendship_id
    item.dataset.senderId = notif.sender_id;

    let contentHtml = '';
    const timeAgo = formatTimeAgo(notif.created_at);

    switch (notif.type) {
      case 'friend_request':
        contentHtml = `
          <span class="notification-text"><strong>${notif.sender_username || 'Alguien'}</strong> te envió una solicitud.</span>
          <div class="notification-actions">
              <button class="notification-action-btn accept">Aceptar</button>
              <button class="notification-action-btn reject">Rechazar</button>
          </div>
          <span class="notification-time">${timeAgo}</span>
        `;
        break;
      // Agrega cases para 'like', 'friend_accepted', etc. aquí
      default:
        contentHtml = `
          <span class="notification-text">Nueva notificación (${notif.type})</span>
          <div class="notification-actions">
              <button class="notification-action-btn dismiss">×</button> 
          </div>
          <span class="notification-time">${timeAgo}</span>
        `;
    }

    item.innerHTML = contentHtml;
    notificationList.appendChild(item);
  });
}

// 3. Función auxiliar para formatear "hace X tiempo" (opcional)
function formatTimeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `hace ${interval} años`;
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `hace ${interval} meses`;
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `hace ${interval} días`;
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `hace ${interval} horas`;
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `hace ${interval} min`;
    return `hace ${Math.floor(seconds)} seg`;
}

// --- LISTENER PARA ACCIONES DENTRO DEL MENÚ DE NOTIFICACIONES ---
notificationList.addEventListener('click', async (e) => {
  const targetButton = e.target; // El botón específico presionado
  const notificationItem = targetButton.closest('.notification-item'); // El div de la notificación

  if (!notificationItem) return; // Si no se hizo clic en un item, salir

  const notificationId = notificationItem.dataset.notificationId;
  const relatedId = notificationItem.dataset.relatedId; // friendship_id
  const token = localStorage.getItem('token');

  if (!token) return;

  let actionEndpoint = '';
  let method = 'POST';
  let body = null;
  let actionSuccess = false;

  try {
    if (targetButton.classList.contains('accept')) {
      actionEndpoint = `${API_URL}/api/friendships/${relatedId}/accept`;
    } else if (targetButton.classList.contains('reject')) {
      actionEndpoint = `${API_URL}/api/friendships/${relatedId}/reject`;
    } else if (targetButton.classList.contains('dismiss')) {
      actionEndpoint = `${API_URL}/api/notifications/read`;
      body = JSON.stringify({ notificationIds: [notificationId] });
    } else {
      return; // No se hizo clic en un botón de acción
    }

    // Deshabilitar botones mientras se procesa
    notificationItem.querySelectorAll('.notification-action-btn').forEach(btn => btn.disabled = true);

    const response = await fetch(actionEndpoint, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        // Añadir Content-Type solo si hay body
        ...(body && {'Content-Type': 'application/json'}) 
      },
      body: body 
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Error al procesar la acción');
    }

    actionSuccess = true; // La acción fue exitosa

  } catch (error) {
    console.error("Error en acción de notificación:", error);
    alert(error.message); // Mostrar error al usuario
    // Rehabilitar botones si falla
    notificationItem.querySelectorAll('.notification-action-btn').forEach(btn => btn.disabled = false);
  }

  // Si la acción fue exitosa, quitar la notificación de la UI y recargar el conteo
  if(actionSuccess) {
      notificationItem.remove(); // Quita el elemento de la lista

      // Actualizar el estado local (opcional pero bueno)
      currentNotifications = currentNotifications.filter(n => n.notification_id !== notificationId);

      // Volver a cargar el conteo (esto actualizará el badge si es necesario)
      loadNotifications(); 

      // Si ya no quedan items, mostrar mensaje
      if (notificationList.children.length === 0) {
          renderNotificationDropdown(); // Re-renderiza para mostrar "No hay notificaciones"
      }
  }
});
// 4. (En el siguiente paso añadiremos un listener para los clics DENTRO del menú)
// --- FUNCIÓN PARA MARCAR NOTIFICACIONES COMO LEÍDAS ---
async function markNotificationsAsRead() {
  // Si no hay notificaciones o ya están leídas (o no hay token), no hacer nada
  if (currentNotifications.length === 0 || !localStorage.getItem('token')) {
    return; 
  }

  // Obtener los IDs de las notificaciones NO leídas
  const unreadIds = currentNotifications
    .filter(n => !n.is_read) // (Necesitaremos añadir 'is_read' al backend luego)
    .map(n => n.notification_id);

  // Si no hay IDs no leídos, salir
  if (unreadIds.length === 0) {
    // Opcional: Podríamos quitar el badge rojo aquí si ya no hay no leídas
    // document.querySelectorAll('#notification-count').forEach(badge => badge.style.display = 'none');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/notifications/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ notificationIds: unreadIds })
    });

    if (!response.ok) {
      console.error('Error al marcar notificaciones como leídas');
      return; // No continuar si falla
    }

    // Éxito: Actualizar el estado local y el contador
    currentNotifications.forEach(n => {
      if (unreadIds.includes(n.notification_id)) {
        n.is_read = true; // Marcar como leída localmente (necesitamos añadir 'is_read' al backend)
      }
    });

    // Ocultar TODOS los badges rojos
    document.querySelectorAll('#notification-count').forEach(badge => {
        badge.textContent = '0';
        badge.style.display = 'none';
    });

  } catch (error) {
    console.error('Error marking notifications read:', error);
  }
}

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

// --- 5. INICIALIZACIÓN ---
// Comprobar si ya existe un token al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Si hay token, mostramos la app (luego verificaremos si es válido)
    showView('app-view');
    loadFeed();
    loadUserPets();
    loadNotifications();
  } else {
    // Si no hay token, mostramos el login
    showView('login-view');
  }
});

