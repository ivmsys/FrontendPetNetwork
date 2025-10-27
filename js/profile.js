// js/profile.js
import { getMe, getPets, registerPet, uploadPetPicture, deletePet, uploadProfilePicture } from './api.js';

let showViewRef = null;

// DOM refs (init)
let userInfoContainer;
let petListContainer;
let registerPetForm;
let petRegisterError;
let profilePictureImg;
let changePictureBtn;
let profilePictureInput;
let profilePictureError;
let profileUsername;
let profileEmail;
let profileJoined;

export function initProfile({ showView }) {
  showViewRef = showView;

  userInfoContainer = document.getElementById('user-info-container');
  petListContainer = document.getElementById('pet-list-container');
  registerPetForm = document.getElementById('register-pet-form');
  petRegisterError = document.getElementById('pet-register-error');
  profilePictureImg = document.getElementById('profile-picture-img');
  changePictureBtn = document.getElementById('change-picture-btn');
  profilePictureInput = document.getElementById('profile-picture-input');
  profilePictureError = document.getElementById('profile-picture-error');
  profileUsername = document.getElementById('profile-username');
  profileEmail = document.getElementById('profile-email');
  profileJoined = document.getElementById('profile-joined');

  if (registerPetForm) {
    registerPetForm.addEventListener('submit', onRegisterPetSubmit);
  }

  if (petListContainer) {
    petListContainer.addEventListener('submit', onUploadPetPhotoSubmit);
    petListContainer.addEventListener('click', onDeletePetClick);
  }

  if (changePictureBtn && profilePictureInput) {
    changePictureBtn.addEventListener('click', () => profilePictureInput.click());
    profilePictureInput.addEventListener('change', onProfilePictureChange);
  }
}

export async function loadProfilePage() {
  const token = localStorage.getItem('token');
  if (!token) {
    if (showViewRef) showViewRef('login-view');
    return;
  }

  try {
    const [userData, petsData] = await Promise.all([
      getMe(token),
      getPets(token)
    ]);

    if (profileUsername) profileUsername.textContent = userData.username;
    if (profileEmail) profileEmail.textContent = userData.email;
    if (profileJoined) profileJoined.textContent = new Date(userData.created_at).toLocaleDateString();
    if (profilePictureImg) profilePictureImg.src = userData.profile_picture_url || 'https://res.cloudinary.com/dk4am2opk/image/upload/v1761374308/images_ofhhpx.jpg';
    if (profilePictureError) profilePictureError.textContent = '';

    if (!petListContainer) petListContainer = document.getElementById('pet-list-container');
    if (!petListContainer) return;
    petListContainer.innerHTML = '';

    if (!petsData || petsData.length === 0) {
      petListContainer.innerHTML = '<p>No tienes mascotas registradas.</p>';
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

            <form class="upload-pet-photo-form" data-pet-id="${pet.pet_id}">
              <input type="file" name="image" required>
              <button type="submit">Subir Foto</button>
            </form>

            <button class="delete-pet-btn" data-pet-id="${pet.pet_id}">Eliminar Mascota</button>
            </div>
        `;
        petListContainer.appendChild(petCard);
      });
    }
  } catch (error) {
    if (userInfoContainer) userInfoContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
    if (petListContainer) petListContainer.innerHTML = '';
  }
}

function onRegisterPetSubmit(e) {
  e.preventDefault();
  if (!petRegisterError) petRegisterError = document.getElementById('pet-register-error');
  petRegisterError.textContent = '';

  const submitButton = registerPetForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Registrando...';
  }

  const token = localStorage.getItem('token');
  if (!token) {
    if (showViewRef) showViewRef('login-view');
    return;
  }

  const petData = {
    name: document.getElementById('pet-name').value,
    species: document.getElementById('pet-species').value,
    breed: document.getElementById('pet-breed').value,
    birthDate: document.getElementById('pet-birthdate').value || null
  };

  (async () => {
    try {
      await registerPet(petData, token);
      registerPetForm.reset();
      loadProfilePage();
    } catch (error) {
      petRegisterError.textContent = error.message;
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Registrar Mascota';
      }
    }
  })();
}

function onUploadPetPhotoSubmit(e) {
  if (!e.target.classList.contains('upload-pet-photo-form')) return;
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) {
    if (showViewRef) showViewRef('login-view');
    return;
  }
  const form = e.target;
  const petId = form.dataset.petId;
  const fileInput = form.querySelector('input[type="file"]');
  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Por favor, selecciona un archivo.');
    return;
  }
  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  (async () => {
    try {
      await uploadPetPicture(petId, formData, token);
      loadProfilePage();
    } catch (error) {
      alert(error.message);
    }
  })();
}

function onDeletePetClick(e) {
  if (!e.target.classList.contains('delete-pet-btn')) return;
  const button = e.target;
  const petId = button.dataset.petId;
  const petCard = button.closest('.pet-card');
  const petName = petCard?.querySelector('h3')?.textContent || '';
  if (!confirm(`¿Estás seguro de que quieres eliminar a ${petName}? Esta acción no se puede deshacer.`)) return;
  const token = localStorage.getItem('token');
  if (!token) { if (showViewRef) showViewRef('login-view'); return; }
  button.disabled = true;
  button.textContent = 'Eliminando...';
  (async () => {
    try {
      await deletePet(petId, token);
      petCard.remove();
    } catch (error) {
      alert(error.message);
      button.disabled = false;
      button.textContent = 'Eliminar';
    }
  })();
}

function onProfilePictureChange(e) {
  if (!e.target.files || e.target.files.length === 0) return;
  const file = e.target.files[0];
  const token = localStorage.getItem('token');
  if (!profilePictureError) profilePictureError = document.getElementById('profile-picture-error');
  profilePictureError.textContent = '';
  if (!token) { if (showViewRef) showViewRef('login-view'); return; }
  const changePictureBtnLocal = document.getElementById('change-picture-btn');
  if (changePictureBtnLocal) {
    changePictureBtnLocal.textContent = 'Subiendo...';
    changePictureBtnLocal.disabled = true;
  }
  const formData = new FormData();
  formData.append('image', file);
  (async () => {
    try {
      const data = await uploadProfilePicture(formData, token);
      if (!profilePictureImg) profilePictureImg = document.getElementById('profile-picture-img');
      if (profilePictureImg) profilePictureImg.src = data.user.profile_picture_url;
    } catch (error) {
      profilePictureError.textContent = error.message;
    } finally {
      if (changePictureBtnLocal) {
        changePictureBtnLocal.textContent = 'Cambiar Foto';
        changePictureBtnLocal.disabled = false;
      }
      if (profilePictureInput) profilePictureInput.value = '';
    }
  })();
}