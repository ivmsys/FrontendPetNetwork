import { getPosts, createPost, likePost, deletePost, getPets, getCommentsForPost, addCommentToPost } from './api.js'; // <-- AÑADE getCommentsForPost y addCommentToPost
import { formatTimeAgo } from './notifications.js';

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

// js/feed.js

// ... (imports, variables globales let feedContainer;, etc.) ...

export function initFeed({ showView }) {
  showViewRef = showView;

  // Asignar elementos DOM
  feedContainer = document.getElementById('feed-container');
  console.log("Elemento feedContainer:", feedContainer);
  
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

  // Listener para crear post
  if (createPostForm) {
    createPostForm.addEventListener('submit', onCreatePostSubmit);
  }

  // Listener para botón de añadir media
  if (addMediaButton) {
    addMediaButton.addEventListener('click', () => {
      if (postMediaInput) postMediaInput.click();
    });
  }

  // Listener para selección de archivos de media
  if (postMediaInput) {
    postMediaInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length + selectedPostFiles.length > 4) {
        alert('Puedes subir máximo 4 archivos de media.');
        return;
      }
      selectedPostFiles.push(...files);
      renderMediaPreviews();
    });
  }

  // Listener para etiquetar mascotas
  if (tagPetButton) {
    tagPetButton.addEventListener('click', () => {
      renderPetSelectionModal();
      if (petSelectionModal) petSelectionModal.style.display = 'flex';
    });
  }

  // Listener para cerrar el modal
  if (closeModalButton) {
    closeModalButton.addEventListener('click', () => {
      if (petSelectionModal) petSelectionModal.style.display = 'none';
    });
  }

  // Listener para cerrar modal al hacer clic fuera
  if (petSelectionModal) {
    petSelectionModal.addEventListener('click', (e) => {
      if (e.target === petSelectionModal) {
        petSelectionModal.style.display = 'none';
      }
    });
  }

  // Listener para seleccionar mascota del modal
  if (petSelectionList) {
    petSelectionList.addEventListener('click', onSelectPetFromModal);
  }

  // Listener para quitar etiquetas de mascotas
  if (petTagsContainer) {
    petTagsContainer.addEventListener('click', onRemovePetTag);
  }

  // Listener para vista previa de media
  if (postMediaPreviewContainer) {
    postMediaPreviewContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('media-preview-remove-btn')) {
        const index = parseInt(e.target.dataset.index, 10);
        selectedPostFiles.splice(index, 1);
        renderMediaPreviews();
      }
    });
  }

  // Listeners en el feedContainer
  if (feedContainer) {
    feedContainer.addEventListener('click', onFeedContainerClick);
    feedContainer.addEventListener('submit', async (e) => {
      if (e.target.classList.contains('comment-form')) {
        e.preventDefault();
        const form = e.target;
        const postId = form.dataset.postId;
        const input = form.querySelector('.comment-input');
        const button = form.querySelector('.comment-submit-btn');
        const content = input.value.trim();
        const token = localStorage.getItem('token');

        if (!content || !token) return;

        button.disabled = true;
        try {
          const newCommentData = await addCommentToPost(postId, content, token);
          const commentListContainer = document.querySelector(`#comments-${postId} .comment-list`);
          
          if (commentListContainer) {
            const noCommentsMsg = commentListContainer.querySelector('p');
            if (noCommentsMsg && noCommentsMsg.textContent.includes('Sé el primero')) {
              commentListContainer.innerHTML = '';
            }

            const item = document.createElement('div');
            item.className = 'comment-item';
            const commentTime = typeof formatTimeAgo === 'function' 
              ? formatTimeAgo(newCommentData.comment.created_at) 
              : new Date(newCommentData.comment.created_at).toLocaleTimeString();
            
            item.innerHTML = `
              <span class="comment-author">${newCommentData.comment.author}:</span>
              <span class="comment-content">${newCommentData.comment.content}</span>
              <span class="comment-timestamp">${commentTime}</span>
            `;
            commentListContainer.appendChild(item);

            // Actualizar contador
            const toggleBtn = document.querySelector(`.toggle-comments-btn[data-post-id="${postId}"]`);
            const countSpan = toggleBtn?.querySelector('.comment-count-display');
            if (countSpan) {
              const currentCount = parseInt(countSpan.textContent, 10) || 0;
              countSpan.textContent = currentCount + 1;
            }
          }
          input.value = '';
        } catch (error) {
          alert(`Error al enviar comentario: ${error.message}`);
        } finally {
          button.disabled = false;
        }
      }
    });
  } else {
    console.error("¡ERROR! No se encontró el elemento #feed-container.");
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
      if (currentUserId && post.author_id == currentUserId) {
        deleteButtonHtml = `<button class="delete-post-btn" data-post-id="${post.post_id}" title="Eliminar post">&times;</button>`;
      }

      // ⭐ Usar el comment_count del backend
      const commentCount = post.comment_count || 0;

      postElement.innerHTML = `
        <div class="post-header"> 
          <div class="post-author">${post.author_username}</div>
          ${deleteButtonHtml} 
        </div>

        ${post.tagged_pets && post.tagged_pets.length > 0 ? 
        `<div class="post-pet">Etiquetando a: ${post.tagged_pets.map(pet => pet.name).join(', ')}</div>` : 
        ''}

        <p class="post-content">${post.content}</p>

        ${mediaHtml} 

        <div class="post-timestamp">${postDate}</div>

        <div class="post-footer">
          <button class="toggle-comments-btn" data-post-id="${post.post_id}">
            💬 <span class="comment-count-display">${commentCount}</span> Comentarios
          </button>
          
          <div class="post-actions">
            <button class="like-button ${likedClass}" data-post-id="${post.post_id}">❤️</button>
            <span class="like-count">${post.like_count}</span>
          </div>
        </div>

        <div class="comments-section" id="comments-${post.post_id}" style="display: none;">
          <div class="comment-list">
          </div>
          <form class="comment-form" data-post-id="${post.post_id}">
            <input type="text" class="comment-input" placeholder="Escribe un comentario..." required>
            <button type="submit" class="comment-submit-btn">Enviar</button>
          </form>
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

  if (e.target.classList.contains('toggle-comments-btn')) {
        console.log("Toggle comments button clicked!"); // <-- Add for debugging
        const button = e.target;
        const postId = button.dataset.postId;
        const commentsSection = document.getElementById(`comments-${postId}`);
        console.log("Found comments section:", commentsSection); // <-- Add for debugging

        if (!commentsSection) {
            console.error("Could not find comments section for post:", postId);
            return; // Exit if the section doesn't exist
        }

        // Alternar visibilidad
        const isVisible = commentsSection.style.display === 'block';
        console.log("Is currently visible?", isVisible); // <-- Add for debugging
        commentsSection.style.display = isVisible ? 'none' : 'block';
        console.log("New display style:", commentsSection.style.display); // <-- Add for debugging

        // Si se va a mostrar y no se han cargado, cargarlos
        if (!isVisible && !commentsSection.dataset.loaded) {
            console.log("Loading comments for post:", postId); // <-- Add for debugging
            const commentListContainer = commentsSection.querySelector('.comment-list');
            if(commentListContainer) commentListContainer.innerHTML = '<p>Cargando comentarios...</p>';
            
            try {
                const comments = await getCommentsForPost(postId); 
                renderComments(comments, postId); // Check if renderComments exists
                commentsSection.dataset.loaded = 'true'; 
                const countSpan = button.querySelector('.comment-count-display');
                if(countSpan) countSpan.textContent = comments.length;

            } catch (error) {
                console.error("Error loading comments:", error); // <-- Add for debugging
                if(commentListContainer) commentListContainer.innerHTML = `<p class="error-message">Error al cargar: ${error.message}</p>`;
            }
        }
    }
}

// --- LÓGICA DE COMENTARIOS ---

// Función para renderizar comentarios en un post específico
function renderComments(comments, postId) {
  const commentListContainer = document.querySelector(`#comments-${postId} .comment-list`);
  if (!commentListContainer) return;

  commentListContainer.innerHTML = '';

  if (!comments || comments.length === 0) {
    commentListContainer.innerHTML = '<p>Sé el primero en comentar.</p>';
    return;
  }

  comments.forEach(comment => {
    const item = document.createElement('div');
    item.className = 'comment-item';
    
    const commentTime = formatTimeAgo 
      ? formatTimeAgo(comment.created_at) 
      : new Date(comment.created_at).toLocaleTimeString();
    
    // Usa el campo correcto según tu API devuelva para comentarios
    item.innerHTML = `
      <span class="comment-author">${comment.author || comment.author_username || 'Usuario'}:</span>
      <span class="comment-content">${comment.content}</span>
      <span class="comment-timestamp">${commentTime}</span>
    `;
    commentListContainer.appendChild(item);
  });
}
