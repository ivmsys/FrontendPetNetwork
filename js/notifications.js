import { getNotifications, acceptFriendship, rejectFriendship, markNotificationsRead as apiMarkNotificationsRead } from './api.js';

let currentNotifications = [];

export function initNotifications({ showView }) {
  // Delegación global: actúa sobre la vista activa
  document.addEventListener('click', async (e) => {
     const activeView = document.querySelector('.view.active') || document.body;
     const dropdown = activeView.querySelector('.notification-dropdown');
     const list = activeView.querySelector('.notification-list');
 
     // Toggle del menú al pulsar la campana
     const bellButton = e.target.closest('.notification-bell');
     if (bellButton && dropdown) {
       const isVisible = dropdown.style.display === 'block';
       dropdown.style.display = isVisible ? 'none' : 'block';
       bellButton.setAttribute('aria-expanded', (!isVisible).toString());
       if (!isVisible) renderNotificationDropdown(activeView);
       return;
     }
     // Cerrar al hacer clic fuera
     if (dropdown && !e.target.closest('.notification-dropdown')) {
       dropdown.style.display = 'none';
       const headerBell = activeView.querySelector('.notification-bell');
       if (headerBell) headerBell.setAttribute('aria-expanded', 'false');
     }
 
     // Acciones dentro del listado de notificaciones
     const targetButton = e.target.closest('.notification-action-btn');
     if (!targetButton || !list) return;

    const notificationItem = targetButton.closest('.notification-item');
    if (!notificationItem || !list.contains(notificationItem)) return;

    const notificationId = notificationItem.dataset.notificationId;
    const relatedId = notificationItem.dataset.relatedId;
    const token = localStorage.getItem('token');
    if (!token) return;

    let actionSuccess = false;
    try {
      notificationItem.querySelectorAll('.notification-action-btn').forEach(btn => btn.disabled = true);
      if (targetButton.classList.contains('accept')) {
        await acceptFriendship(relatedId, token);
      } else if (targetButton.classList.contains('reject')) {
        await rejectFriendship(relatedId, token);
      } else if (targetButton.classList.contains('dismiss')) {
        await apiMarkNotificationsRead([notificationId], token);
      } else {
        notificationItem.querySelectorAll('.notification-action-btn').forEach(btn => btn.disabled = false);
        return;
      }
      actionSuccess = true;
    } catch (error) {
      console.error('Error en acción de notificación:', error);
      alert(error.message);
      notificationItem.querySelectorAll('.notification-action-btn').forEach(btn => btn.disabled = false);
    }
    if (actionSuccess) {
      notificationItem.remove();
      currentNotifications = currentNotifications.filter(n => n.notification_id !== notificationId);
      await loadNotifications();
      if (!list || list.children.length === 0) {
        renderNotificationDropdown(activeView);
      }
    }
  });
}

export async function loadNotifications() {
  const notificationBadges = document.querySelectorAll('.notification-count');
  const token = localStorage.getItem('token');
  if (!token) {
    notificationBadges.forEach(badge => { badge.textContent = '0'; badge.style.display = 'none'; });
    return;
  }
  try {
    const notifications = await getNotifications(token);
    currentNotifications = notifications;
    const count = notifications.length;
    notificationBadges.forEach(badge => {
      if (count > 0) { badge.textContent = count; badge.style.display = 'block'; }
      else { badge.textContent = '0'; badge.style.display = 'none'; }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    notificationBadges.forEach(badge => badge.style.display = 'none');
  }
}

function renderNotificationDropdown(activeView = document.querySelector('.view.active') || document.body) {
  const container = activeView.querySelector('.notification-dropdown');
  const list = activeView.querySelector('.notification-list');
  if (!container || !list) return;

  const token = localStorage.getItem('token');
  if (!token) {
    container.style.display = 'none';
    list.innerHTML = '<p>No tienes notificaciones recientes.</p>';
    return;
  }

  // Filtramos solo las no leídas (usando la variable global)
  const unreadNotifications = currentNotifications.filter(n => !n.is_read);

  if (unreadNotifications.length === 0) {
    list.innerHTML = '<p>No tienes notificaciones recientes.</p>';
    return;
  }

  list.innerHTML = '';
  unreadNotifications.forEach(n => {
    const item = document.createElement('div');
    item.className = 'notification-item';
    item.dataset.notificationId = n.notification_id;
    item.dataset.relatedId = n.related_entity_id; // <-- Corregido (usa el ID de la entidad)
    item.dataset.type = n.type;
    item.dataset.senderId = n.sender_id;

    const timeAgo = formatTimeAgo(n.created_at);
    let messageText = ''; // <-- Variable vacía
    let actionsHtml = '';

    // Switch para construir el mensaje Y las acciones
    switch (n.type) {
      case 'friend_request':
        messageText = `<strong>${n.sender_username || 'Alguien'}</strong> te envió una solicitud de amistad.`;
        actionsHtml = `
          <div class="notification-actions">
            <button class="notification-action-btn accept">Aceptar</button>
            <button class="notification-action-btn reject">Rechazar</button>
            <button class="notification-action-btn dismiss">Descartar</button>
          </div>
        `;
        break;

      case 'friend_accepted': 
        messageText = `<strong>${n.sender_username || 'Alguien'}</strong> aceptó tu solicitud de amistad.`;
        actionsHtml = `<div class="notification-actions"><button class="notification-action-btn dismiss">Descartar</button></div>`;
        break;

      case 'like': 
        messageText = `<strong>${n.sender_username || 'Alguien'}</strong> le dio Me Gusta a tu publicación.`;
        actionsHtml = `<div class="notification-actions"><button class="notification-action-btn dismiss">Descartar</button></div>`;
        break;

      case 'comment': 
        messageText = `<strong>${n.sender_username || 'Alguien'}</strong> comentó en tu publicación.`;
        actionsHtml = `<div class="notification-actions"><button class="notification-action-btn dismiss">Descartar</button></div>`;
        break;

      default: // Caso genérico
        messageText = n.message ?? 'Nueva notificación'; // Fallback por si acaso
        actionsHtml = `<div class="notification-actions"><button class="notification-action-btn dismiss">Descartar</button></div>`;
    }

    // Usar la estructura CSS grid correcta
    item.innerHTML = `
        <span class="notification-text">${messageText}</span>
        ${actionsHtml}
        <span class="notification-time">${timeAgo}</span>
    `;
    list.appendChild(item);
  });
}

export function formatTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const seconds = Math.floor((now - past) / 1000);
  const intervals = [
    { label: 'año', seconds: 31536000 },
    { label: 'mes', seconds: 2592000 },
    { label: 'día', seconds: 86400 },
    { label: 'hora', seconds: 3600 },
    { label: 'minuto', seconds: 60 }
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} atrás`;
  }
  return 'justo ahora';
}