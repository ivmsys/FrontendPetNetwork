import { getUserPublicProfile, sendFriendRequest } from './api.js';

let _showView;
export async function loadPublicProfilePage(userId) {
  const token = localStorage.getItem('token');
  if (!token) { _showView && _showView('login-view'); return; }
  _showView && _showView('public-profile-view');
  const userInfoContainer = document.getElementById('public-user-info-container');
  const petListContainer = document.getElementById('public-pet-list-container');
  const addFriendBtn = document.getElementById('public-add-friend-btn');
  const usernameTitle = document.getElementById('public-profile-username-title');
  const petsTitle = document.getElementById('public-profile-username-pets');
  const profilePic = document.getElementById('public-profile-picture-img');
  const usernameSpan = document.getElementById('public-profile-username');
  const joinedSpan = document.getElementById('public-profile-joined');
  const friendshipStatusElement = document.getElementById('public-friendship-status');
  if (usernameTitle) usernameTitle.textContent = 'Usuario';
  if (petsTitle) petsTitle.textContent = 'Usuario';
  if (profilePic) profilePic.src = 'https://res.cloudinary.com/dk4am2opk/image/upload/v1761374308/images_ofhhpx.jpg';
  if (usernameSpan) usernameSpan.textContent = 'Cargando...';
  if (joinedSpan) joinedSpan.textContent = 'Cargando...';
  if (friendshipStatusElement) friendshipStatusElement.textContent = '';
  if (addFriendBtn) addFriendBtn.style.display = 'none';
  petListContainer.innerHTML = '<p>Cargando mascotas...</p>';
  try {
    const profileData = await getUserPublicProfile(userId, token);
    const { user: userData, pets: petsData } = profileData;
    if (usernameTitle) usernameTitle.textContent = userData.username;
    if (petsTitle) petsTitle.textContent = userData.username;
    if (profilePic) profilePic.src = userData.profile_picture_url || 'https://res.cloudinary.com/dk4am2opk/image/upload/v1761374308/images_ofhhpx.jpg';
    if (usernameSpan) usernameSpan.textContent = userData.username;
    if (joinedSpan) joinedSpan.textContent = new Date(userData.created_at).toLocaleDateString();
    const status = profileData.friendshipStatus;
    if (friendshipStatusElement) friendshipStatusElement.textContent = '';
    if (addFriendBtn) addFriendBtn.style.display = 'none';
    if (status === 'accepted') {
      if (friendshipStatusElement) friendshipStatusElement.textContent = 'AMIGOS';
    } else if (status === 'pending') {
      if (friendshipStatusElement) friendshipStatusElement.textContent = 'Hay una solicitud pendiente.';
    } else if (status === 'rejected') {
      if (friendshipStatusElement) friendshipStatusElement.textContent = 'Solicitud rechazada.';
    } else {
      if (addFriendBtn) {
        addFriendBtn.style.display = 'inline-block';
        addFriendBtn.dataset.userId = userData.user_id;
        addFriendBtn.textContent = 'Añadir Amigo';
        addFriendBtn.disabled = false;
        addFriendBtn.classList.remove('pending');
      }
    }
    petListContainer.innerHTML = '';
    if (!petsData || petsData.length === 0) {
      petListContainer.innerHTML = `<p>${userData.username} no tiene mascotas registradas.</p>`;
    } else {
      petsData.forEach(pet => {
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';
        const birthDate = pet.birth_date ? new Date(pet.birth_date).toLocaleDateString() : 'Desconocida';
        const petImage = pet.profile_picture_url || 'https://res.cloudinary.com/dk4am2opk/image/upload/v1761374308/images_ofhhpx.jpg';
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
    console.error('Error en loadPublicProfilePage:', error);
    if (userInfoContainer) userInfoContainer.innerHTML = `<h2>Error</h2><p class="error-message">${error.message}</p>`;
    petListContainer.innerHTML = '';
  }
}

export function initPublicProfile({ showView }) {
  _showView = showView;
  const publicAddFriendBtn = document.getElementById('public-add-friend-btn');
  const publicFriendshipStatus = document.getElementById('public-friendship-status');
  if (!publicAddFriendBtn) return;
  publicAddFriendBtn.addEventListener('click', async (e) => {
    const button = e.target;
    const userIdToSendRequest = button.dataset.userId;
    const token = localStorage.getItem('token');
    if (!token || button.disabled) return;
    button.disabled = true; button.textContent = 'Enviando...';
    if (publicFriendshipStatus) publicFriendshipStatus.textContent = '';
    try {
      await sendFriendRequest(userIdToSendRequest, token);
      button.textContent = 'Solicitud Enviada';
      button.classList.add('pending');
      if (publicFriendshipStatus) publicFriendshipStatus.textContent = 'Solicitud de amistad enviada.';
    } catch (error) {
      console.error('Error sending friend request from profile:', error);
      if (publicFriendshipStatus) publicFriendshipStatus.textContent = `Error: ${error.message}`;
      button.disabled = false; button.textContent = 'Añadir Amigo';
    }
  });
}