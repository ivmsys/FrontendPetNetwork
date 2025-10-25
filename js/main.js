// js/main.js
// import duplicado eliminado
import { registerUser, loginUser, getPosts, createPost, likePost, deletePost, getMe, getPets, registerPet, uploadPetPicture, deletePet, searchUsers, getNotifications, markNotificationsRead as apiMarkNotificationsRead, acceptFriendship, rejectFriendship, sendFriendRequest, getUserPublicProfile, uploadProfilePicture } from './api.js';
import { showView } from './utils.js';
import { initSearch } from './search.js';
import { initPublicProfile, loadPublicProfilePage } from './publicProfile.js';
import { initNotifications, loadNotifications as moduleLoadNotifications } from './notifications.js';
import { initFeed, loadFeed, loadUserPets } from './feed.js';
import { initProfile, loadProfilePage } from './profile.js';

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
// Movido a js/feed.js (importado como loadFeed)


// --- FUNCIÓN PARA CARGAR LA PÁGINA DE PERFIL ---
// Movido a js/profile.js (importado como loadProfilePage)

// --- FUNCIÓN PARA CARGAR LAS MASCOTAS DEL USUARIO ---
// Movido a js/feed.js (importado como loadUserPets)
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

// Listener de crear post movido a js/feed.js (initFeed)

// Listener de registrar mascota movido a js/profile.js (initProfile)

// Listeners de subida de foto de mascota movidos a js/profile.js (initProfile)

// ... (al final de app.js)

// Listener de like en posts movido a js/feed.js (initFeed)

// --- LÓGICA DE SUBIDA DE MEDIA ---

// Listener de abrir input de media movido a js/feed.js (initFeed)

// Listener de selección de archivos de media movido a js/feed.js (initFeed)

// Bloque de manejo de archivos de media movido a js/feed.js (initFeed)

// Función y listener de vistas previas de media movidos a js/feed.js (initFeed)

// --- LÓGICA DE ETIQUETADO DE MASCOTAS ---

// Listeners de etiquetado de mascotas movidos a js/feed.js (initFeed)

// Listener de cerrar modal movido a js/feed.js (initFeed)
// Listener de cerrar modal al hacer clic fuera movido a js/feed.js (initFeed)

// Función de render de modal de selección de mascotas movida a js/feed.js (initFeed)

// Listener de selección de mascota del modal movido a js/feed.js (initFeed)

// Función de render de etiquetas de mascotas movida a js/feed.js (initFeed)

// Listener de quitar etiqueta de mascota movido a js/feed.js (initFeed)

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

// Lógica de cambio de foto de perfil movida a js/profile.js (initProfile)
// app.js -> Cerca del listener de petListContainer 'submit'
// Listener de eliminar mascota movido a js/profile.js (initProfile)

// Listener de eliminar post movido a js/feed.js (initFeed)
// --- 5. INICIALIZACIÓN ---
// Comprobar si ya existe un token al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar módulos (listeners y lógica propia)
  initSearch({ showView, loadPublicProfilePage });
  initPublicProfile({ showView });
  initNotifications({ showView });
  initFeed({ showView });
  initProfile({ showView });

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

