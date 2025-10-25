// js/feed.js
import { getPosts, createPost, likePost, deletePost, getPets } from './api.js';

let userPets = [];
let selectedPetTags = [];
let selectedPostFiles = [];
let showViewRef = null;

// Referencias del DOM (se toman en init)
let feedContainer;
let createPostForm;
let postError;
let addMediaButton;
let postMediaInput;
let postMediaPreviewContainer;
let tagPetButton;
let petTagsContainer;
let petSelectionModal;
let petSelectionList;
let closeModalButton;

export function initFeed({ showView }) {
  showViewRef = showView;

  feedContainer = document.getElementById('feed-container');
  createPostForm = document.getElementById('create-post-form');
  postError = document.getElementById('post-error');
  addMediaButton = document.getElementById('add-media-button');
  postMediaInput = document.getElementById('post-media-input');
  postMediaPreviewContainer = document.getElementById('post-media-preview-container');
  tagPetButton = document.getElementById('tag-pet-button');
  petTagsContainer = document.getElementById('pet-tags-container');
  petSelectionModal = document.getElementById('pet-selection-modal');
  petSelectionList = document.getElementById('pet-selection-list');
  closeModalButton = document.getElementById('close-modal-button');

  if (createPostForm) {
    createPostForm.addEventListener('submit', onCreatePostSubmit);
  }

  if (addMediaButton) {
    addMediaButton.addEventListener('click', () => postMediaInput && postMediaInput.click());
  }

  if (postMediaInput) {
    postMediaInput.addEventListener('change', onPostMediaChange);
  }

  if (postMediaPreviewContainer) {
    postMediaPreviewContainer.addEventListener('click', onRemoveMediaPreview);
  }

  if (tagPetButton) {
    tagPetButton.addEventListener('click', () => {
      renderPetSelectionModal();
      if (petSelectionModal) petSelectionModal.style.display = 'flex';
    });
  }

  if (closeModalButton && petSelectionModal) {
    closeModalButton.addEventListener('click', () => {
      petSelectionModal.style.display = 'none';
    });

    petSelectionModal.addEventListener('click', (e) => {
      if (e.target === petSelectionModal) {
        petSelectionModal.style.display = 'none';
      }
    });
  }

  if (petSelectionList) {
    petSelectionList.addEventListener('click', onSelectPetFromModal);
  }

  if (petTagsContainer) {
    petTagsContainer.addEventListener('click', onRemovePetTag);
  }

  if (feedContainer) {
    feedContainer.addEventListener('click', onFeedContainerClick);
  }
}

export async function loadFeed() {
  if (!feedContainer) {
    feedContainer = document.getElementById('feed-container');
  }
  if (!feedContainer) return;

  feedContainer.innerHTML = '<p>Cargando publicaciones...</p>';

  try {
    const token = localStorage.getItem('token');
    const posts = await getPosts(token);

    feedContainer.innerHTML = '';

    if (!posts || posts.length === 0) {
      feedContainer.innerHTML = '<p>No hay publicaciones todavía. ¡Sé el primero!</p>';
      return;
    }

    posts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.className = 'post-card';

      const postDate = new Date(post.created_at).toLocaleString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit'
      });

      const likedClass = post.user_has_liked ? 'liked' : 'not-liked';

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

      const currentUserId = localStorage.getItem('userId');
      let deleteButtonHtml = '';
      if (currentUserId && post.author_id === currentUserId) {
        deleteButtonHtml = `<button class="delete-post-btn" data-post-id="${post.post_id}" title="Eliminar post">&times;</button>`;
      }

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

export async function loadUserPets() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    const petsData = await getPets(token);
    userPets = petsData || [];
  } catch (error) {
    console.error(error.message);
  }
}

function onCreatePostSubmit(e) {
  e.preventDefault();
  if (!postError) postError = document.getElementById('post-error');
  postError.textContent = '';

  const submitButton = createPostForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Publicando...';
  }

  const content = document.getElementById('post-content').value;
  const token = localStorage.getItem('token');

  if (!token) {
    postError.textContent = 'Error: Debes iniciar sesión para publicar.';
    if (showViewRef) showViewRef('login-view');
    return;
  }

  const formData = new FormData();
  formData.append('content', content);
  const petIds = selectedPetTags.map(pet => pet.pet_id);
  formData.append('petIds', JSON.stringify(petIds));
  selectedPostFiles.forEach(file => formData.append('media', file));

  (async () => {
    try {
      await createPost(formData, token);
      document.getElementById('post-content').value = '';
      selectedPetTags = [];
      selectedPostFiles = [];
      renderSelectedPetTags();
      renderPostMediaPreviews();
      loadFeed();
    } catch (error) {
      postError.textContent = error.message;
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Publicar';
      }
    }
  })();
}

function onPostMediaChange(e) {
  if (!e.target.files) return;
  const files = Array.from(e.target.files);
  const totalFiles = selectedPostFiles.length + files.length;
  if (totalFiles > 4) {
    alert('Puedes subir un máximo de 4 archivos por post.');
    postMediaInput.value = '';
    return;
  }
  selectedPostFiles.push(...files);
  renderPostMediaPreviews();
  postMediaInput.value = '';
}

function renderPostMediaPreviews() {
  if (!postMediaPreviewContainer) return;
  postMediaPreviewContainer.innerHTML = '';

  selectedPostFiles.forEach((file, index) => {
    const previewItem = document.createElement('div');
    previewItem.className = 'media-preview-item';
    const fileType = file.type.startsWith('video') ? 'video' : 'image';
    const fileUrl = URL.createObjectURL(file);
    if (fileType === 'image') {
      previewItem.innerHTML = `<img src="${fileUrl}" alt="Vista previa">`;
    } else {
      previewItem.innerHTML = `<video src="${fileUrl}" muted></video>`;
    }
    const removeBtn = document.createElement('button');
    removeBtn.className = 'media-preview-remove-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.dataset.index = index;
    previewItem.appendChild(removeBtn);
    postMediaPreviewContainer.appendChild(previewItem);
  });
}

function onRemoveMediaPreview(e) {
  const removeButton = e.target.closest('.media-preview-remove-btn');
  if (!removeButton) return;
  const indexToRemove = parseInt(removeButton.dataset.index, 10);
  selectedPostFiles.splice(indexToRemove, 1);
  renderPostMediaPreviews();
}

function renderPetSelectionModal() {
  if (!petSelectionList) return;
  petSelectionList.innerHTML = '';
  if (userPets.length === 0) {
    petSelectionList.innerHTML = '<p>No tienes mascotas registradas.</p>';
    return;
  }
  const availablePets = userPets.filter(pet => !selectedPetTags.find(tag => tag.pet_id === pet.pet_id));
  if (availablePets.length === 0) {
    petSelectionList.innerHTML = '<p>Todas tus mascotas ya están etiquetadas.</p>';
    return;
  }
  availablePets.forEach(pet => {
    const petItem = document.createElement('div');
    petItem.className = 'pet-selection-item';
    petItem.dataset.petId = pet.pet_id;
    const petImage = pet.profile_picture_url || 'https://res.cloudinary.com/dk4am2opk/image/upload/v1761374308/images_ofhhpx.jpg';
    petItem.innerHTML = `
      <img src="${petImage}" alt="${pet.name}">
      <span>${pet.name}</span>
    `;
    petSelectionList.appendChild(petItem);
  });
}

function onSelectPetFromModal(e) {
  const petItem = e.target.closest('.pet-selection-item');
  if (!petItem) return;
  const petId = petItem.dataset.petId;
  const pet = userPets.find(p => p.pet_id === petId);
  if (pet) {
    selectedPetTags.push(pet);
    renderSelectedPetTags();
    if (petSelectionModal) petSelectionModal.style.display = 'none';
  }
}

function renderSelectedPetTags() {
  if (!petTagsContainer) return;
  petTagsContainer.innerHTML = '';
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

function onRemovePetTag(e) {
  const removeButton = e.target.closest('.pet-tag-remove-btn');
  if (!removeButton) return;
  const petId = removeButton.dataset.petId;
  selectedPetTags = selectedPetTags.filter(pet => pet.pet_id !== petId);
  renderSelectedPetTags();
}

async function onFeedContainerClick(e) {
  if (e.target.classList.contains('like-button')) {
    const button = e.target;
    const postId = button.dataset.postId;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para dar "me gusta".');
      if (showViewRef) showViewRef('login-view');
      return;
    }
    try {
      const data = await likePost(postId, token);
      const likeCountSpan = button.nextElementSibling;
      likeCountSpan.textContent = data.newLikeCount;
      button.classList.toggle('liked', data.userHasLiked);
      button.classList.toggle('not-liked', !data.userHasLiked);
    } catch (error) {
      alert(error.message);
    }
    return;
  }

  if (e.target.classList.contains('delete-post-btn')) {
    const button = e.target;
    const postId = button.dataset.postId;
    const postCard = button.closest('.post-card');
    if (!confirm('¿Estás seguro de que quieres eliminar este post?')) return;
    const token = localStorage.getItem('token');
    if (!token) { if (showViewRef) showViewRef('login-view'); return; }
    button.disabled = true;
    try {
      await deletePost(postId, token);
      postCard.remove();
    } catch (error) {
      alert(error.message);
      button.disabled = false;
    }
    return;
  }
}