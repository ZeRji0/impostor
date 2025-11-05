# 🎮 IMPOSTOR — Cerveza’s Version v2.1 (Fixed)

Una versión web ligera del clásico juego del impostor, pensada para jugar **en móvil** con tus amigos 🍻.  
Cada jugador verá su rol (palabra o impostor) **en su turno** de forma individual.  
¡Pásale el móvil a cada jugador sin que los demás miren y que empiece la ronda!

---

## 🚀 Características principales

### 👁‍🗨 Reparto con mostrar/ocultar
- Cada jugador ve su rol **oculto por defecto**.
- Puede pulsar “👁 Mostrar” para revelar su palabra o si es impostor.
- Al pasar al siguiente jugador, la vista vuelve a estar oculta.

### 🕵️‍♂️ Modo impostores
- **Número fijo:** se reparten exactamente los impostores indicados.  
- **Aleatorio simple:** el número de impostores se elige aleatoriamente entre 1 y N (todas las opciones igual de probables).  
- Se muestra un texto informativo dinámico con el número de impostores esperados.

### 🔤 Modo de palabras
- **Mis palabras:** los jugadores introducen una lista de palabras separadas por comas.  
- **Aleatorias (ES):** obtiene una palabra en español desde una API o usa una palabra local (“cerveza 🍺”) si no hay conexión.

### 🎮 Flujo de juego
1. Configura número de jugadores, impostores y modo de palabras.  
2. Cada jugador ve su rol en secreto.  
3. Cuando el último jugador termine, la página pasa **automáticamente** a “¡Jugad!”.  
4. ¡Empieza la ronda y debatid quién es el impostor!  

### 💡 Otras características
- Interfaz adaptada a **pantallas móviles**.  
- Diseño minimalista, oscuro y limpio.  
- Totalmente funcional sin backend.  

---

## 🛠️ Cómo usarla

### 🔹 Opción 1: Abrir localmente
1. Descarga el archivo `impostor-cervezas-version-v21-fixed.zip`.
2. Descomprímelo en tu ordenador o móvil.
3. Abre el archivo `index.html` con tu navegador (Chrome, Edge, etc.).

> ⚠️ En algunos móviles puede requerir conexión a Internet si usas el modo “Aleatorias (ES)”.

### 🔹 Opción 2: Subir a GitHub Pages
1. Crea un nuevo repositorio en GitHub (por ejemplo, `impostor-cervezas-version`).
2. Sube los archivos `index.html`, `styles.css`, `script.js` y este `README.md`.
3. Activa **GitHub Pages** (en *Settings → Pages → Deploy from branch → main*).
4. Abre la URL generada y juega desde tu móvil.

---

## 🧾 Créditos
- Desarrollado por **Cerveza’s Dev Edition 🍺**  
- Adaptado y optimizado por ChatGPT (versión GPT-5, 2025).  
- APIs de palabras:  
  - [Palabras Aleatorias API](https://palabras-aleatorias-public-api.herokuapp.com/)  
  - Fallback local en caso de fallo.

---

## 🧩 Próximas mejoras sugeridas
- Pantalla de **resumen de ronda** (mostrar quiénes eran impostores).  
- Efectos de sonido y vibración al revelar al impostor.  
- Temporizador opcional por turno.

---

¡Disfruta el juego con tus amigos y brinda por el impostor! 🍻
