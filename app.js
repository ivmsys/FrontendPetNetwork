// ¡¡¡CAMBIA ESTA URL POR LA TUYA DE RENDER!!!
const API_URL = 'https://petnet-tuyr.onrender.com/';

// 1. Encontrar los elementos del DOM
const btn = document.getElementById('btnProbar');
const resultadoDiv = document.getElementById('resultado');

// 2. Añadir un "escuchador" de clics al botón
btn.addEventListener('click', () => {
  console.log('Botón presionado. Llamando a la API...');
  resultadoDiv.innerText = 'Cargando...';

  // 3. Usar fetch para llamar a la ruta /pingdb de tu API
  fetch('${API_URL}/pingdb')
    .then(response => {
      // Si la respuesta no es OK (ej. 404 o 500)
      if (!response.ok) {
        throw new Error(`Error de red: ${response.status}`);
      }
      return response.json(); // Convertir la respuesta a JSON
    })
    .then(data => {
      // 4. Mostrar el mensaje de éxito en la página
      console.log('Datos recibidos:', data);
      resultadoDiv.innerText = data.message;
    })
    .catch(error => {
      // 5. Mostrar cualquier error en la página
      console.error('Hubo un error al llamar a la API:', error);
      resultadoDiv.innerText = `Error: ${error.message}`;
      resultadoDiv.style.color = 'red';
    });
});