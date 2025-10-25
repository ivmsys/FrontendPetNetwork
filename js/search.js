import { searchUsers, sendFriendRequest } from './api.js';

export function initSearch({ showView, loadPublicProfilePage }) {
  // Submit del formulario de búsqueda
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('.search-form');
    if (!form) return;
    e.preventDefault();
    const searchInput = form.querySelector('.search-input');
    const query = searchInput.value;
    if (!query) return;
    const token = localStorage.getItem('token');
    if (!token) { showView('login-view'); return; }
    showView('search-view');
    const container = document.getElementById('search-results-container');
    const userCardsList = container.querySelector('#user-cards-list');
    const feedbackElement = container.querySelector('#search-feedback');
    userCardsList.innerHTML = '<p>Buscando...</p>';
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback-message';
    try {
      const users = await searchUsers(query, token);
      renderSearchResults(users);
    } catch (error) {
      userCardsList.innerHTML = `<p class="error-message">${error.message}</p>`;
    }
  });

  // Clicks sobre resultados (ver perfil / añadir amigo)
  const searchResultsContainer = document.getElementById('search-results-container');
  searchResultsContainer.addEventListener('click', async (e) => {
    const addFriendButton = e.target.closest('.add-friend-btn');
    const viewProfileButton = e.target.closest('.view-profile-btn');
    const clickableArea = e.target.closest('.user-card-clickable-area');
    const token = localStorage.getItem('token');
    if (!token) { showView('login-view'); return; }
    const feedbackElement = document.getElementById('search-feedback');
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback-message';
    if (viewProfileButton || clickableArea) {
      const userIdToView = viewProfileButton ? viewProfileButton.dataset.userId : clickableArea.dataset.userId;
      loadPublicProfilePage(userIdToView);
      return;
    }
    if (addFriendButton) {
      if (addFriendButton.disabled) return;
      const userIdToSendRequest = addFriendButton.dataset.userId;
      addFriendButton.disabled = true; addFriendButton.textContent = 'Enviando...';
      try {
        await sendFriendRequest(userIdToSendRequest, token);
        addFriendButton.textContent = 'Solicitud Enviada';
        addFriendButton.classList.add('pending');
        feedbackElement.textContent = 'Solicitud de amistad enviada.';
        feedbackElement.classList.add('success');
      } catch (error) {
        console.error('Error sending friend request:', error);
        feedbackElement.textContent = error.message;
        feedbackElement.classList.add('error');
        addFriendButton.disabled = false; addFriendButton.textContent = 'Añadir Amigo';
      }
    }
  });
}

export function renderSearchResults(users) {
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
    const userImage = user.profile_picture_url || 'https://res.cloudinary.com/dk4am2opk/image/upload/v1761374308/images_ofhhpx.jpg';
    let actionButtonHtml = '';
    if (user.friendship_status === 'accepted') {
      actionButtonHtml = `<button class="view-profile-btn" data-user-id="${user.user_id}">Ver Perfil</button>`;
    } else if (user.friendship_status === 'pending') {
      actionButtonHtml = `<button class="add-friend-btn pending" data-user-id="${user.user_id}" disabled>Solicitud Pendiente</button>`;
    } else {
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