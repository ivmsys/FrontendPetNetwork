// js/main.js

import { registerUser, loginUser, getPosts, createPost, likePost, deletePost, getMe, getPets, registerPet, uploadPetPicture, deletePet, searchUsers, getNotifications, markNotificationsRead as apiMarkNotificationsRead, acceptFriendship, rejectFriendship, sendFriendRequest, getUserPublicProfile, uploadProfilePicture } from './api.js';

import { showView } from './utils.js';

import { initSearch } from './search.js';

import { initPublicProfile, loadPublicProfilePage } from './publicProfile.js';

import { initNotifications, loadNotifications as moduleLoadNotifications } from './notifications.js';

import { initFeed, loadFeed, loadUserPets } from './feed.js';

import { initProfile, loadProfilePage } from './profile.js';

import { initMouseBackground, cleanupMouseBackground } from './mousebackground.js';

// --- 1. CONFIGURACIÓN ---
const API_URL = 'https://petnet-tuyr.onrender.com';

let userPets = [];
let selectedPetTags = [];
let selectedPostFiles = [];
let currentNotifications = [];

// --- 2. ELEMENTOS DEL DOM ---
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const appView = document.getElementById('app-view');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const logoutButton = document.getElementById('logout-button');

const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// --- 3. NAVEGACIÓN ENTRE VISTAS ---
showRegisterLink.addEventListener('click', (e) => {
  e.preventDefault();
  showView('register-view');
});

showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  showView('login-view');
});

// ⭐ ELIMINAR: No agregues listeners aquí para elementos que no existen todavía
// logoutButton, showProfileLink, etc. se manejan con el listener global más abajo

// Event Listener para el formulario de REGISTRO
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerError.textContent = '';

  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    await registerUser(username, email, password);
    alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
    showView('login-view');
  } catch (error) {
    registerError.textContent = error.message;
  }
});

// Event Listener para el formulario de LOGIN
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const data = await loginUser(email, password);
    localStorage.setItem('token', data.token);
    
    try {
      const payloadBase64 = data.token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decodedPayload = JSON.parse(decodedJson);
      localStorage.setItem('userId', decodedPayload.user.id);
    } catch (e) {
      console.error("Error decoding token:", e);
      localStorage.removeItem('userId');
    }

    showView('app-view');
    
    // Inicializar search toggle después de mostrar app-view
    initSearchToggle();
    
    loadFeed();
    loadUserPets();
    moduleLoadNotifications();
  } catch (error) {
    loginError.textContent = error.message;
  }
});

// ⭐ LISTENER GLOBAL para manejar todos los clicks
document.addEventListener('click', (e) => {
  // Logout
  if (e.target.closest('#logout-button')) {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    showView('login-view');
  }

  // Ver perfil
  if (e.target.closest('#profile-link') || e.target.closest('#show-profile-link')) {
    e.preventDefault();
    showView('profile-view');
    loadProfilePage();
  }

  // Volver al feed desde el logo
  if (e.target.closest('#back-to-feed-from-logo') || e.target.closest('.header-logo')) {
    e.preventDefault();
    showView('app-view');
    loadFeed();
  }
});

// ⭐ FUNCIÓN PARA INICIALIZAR EL SEARCH TOGGLE
// ⭐ FUNCIÓN PARA INICIALIZAR EL SEARCH TOGGLE
function initSearchToggle() {
  const searchToggleBtn = document.getElementById('search-toggle-btn');
  const searchInputWrapper = document.getElementById('search-input-wrapper');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const searchInput = document.getElementById('search-input');

  if (!searchToggleBtn || !searchInputWrapper || !searchCloseBtn || !searchInput) {
    console.log('Elementos de búsqueda no encontrados en el DOM');
    return;
  }

  // Abrir búsqueda
  searchToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchInputWrapper.classList.add('active');
    setTimeout(() => {
      searchInput.focus();
    }, 300);
  });

  // Cerrar búsqueda
  function closeSearch() {
    searchInputWrapper.classList.remove('active');
    searchInput.value = '';
    searchInput.blur();
  }

  searchCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeSearch();
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchInputWrapper.classList.contains('active')) {
      closeSearch();
    }
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (searchInputWrapper.classList.contains('active')) {
      const isClickInsideSearch = searchInputWrapper.contains(e.target);
      const isClickOnToggle = searchToggleBtn.contains(e.target);
      
      if (!isClickInsideSearch && !isClickOnToggle) {
        closeSearch();
      }
    }
  });

  // Prevenir que clics dentro del search lo cierren
  searchInputWrapper.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}


// --- 5. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar módulos
  initMouseBackground();
  initSearch({ showView, loadPublicProfilePage });
  initPublicProfile({ showView });
  initNotifications({ showView });
  initFeed({ showView });
  initProfile({ showView });

  // Verificar token existente
  const token = localStorage.getItem('token');
  if (token) {
    showView('app-view');
    
    // Inicializar search toggle si ya hay sesión
    initSearchToggle();
    
    loadFeed();
    loadUserPets();
    moduleLoadNotifications();
  } else {
    showView('login-view');
  }
});
