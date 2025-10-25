export function showView(viewId) {
  document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  // Cerrar dropdowns de notificaciones al cambiar de vista
  document.querySelectorAll('.notification-dropdown').forEach(dd => dd.style.display = 'none');
  document.querySelectorAll('.notification-bell').forEach(bell => bell.setAttribute('aria-expanded', 'false'));
}