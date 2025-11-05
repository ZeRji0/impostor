# 🎮 IMPOSTOR — Cerveza’s Version v2.2 (Cooperativa Final)

Versión web ligera para jugar **en móvil** al juego del impostor con palabras en español.  
Incluye **modo cooperativo**, **impostores fijos o aleatorios simples** y **mostrar/ocultar** durante el reparto.

## 🚀 Novedades v2.2
- ✅ **Modo Cooperativo**: cada jugador aporta palabras (una por línea). Se consumen una vez. Los impostores **no reciben** palabras que hayan aportado ellos.  
- ✅ **Aleatorias (ES) verificadas**: usa 3 APIs en español y **solo** recurre al diccionario local si todas fallan. Ya **no** se repite siempre “cerveza”.  
- ✅ **Impostores**: fijo (exacto) o aleatorio simple (1..N con probabilidad uniforme).  
- ✅ Al terminar el último jugador → pasa **automáticamente** a “¡Jugad!”.

## 🕹️ Cómo jugar
1. Abre `index.html` (recomendado en GitHub Pages/Netlify).  
2. Configura número de jugadores y nombres (opcional).  
3. Elige **modo de palabras**:  
   - **Mis palabras** (separadas por comas)  
   - **Aleatorias (ES)**  
   - **Cooperativo** (aportes por jugador)  
4. Elige **impostores**: número fijo o aleatorio simple.  
5. Comienza la ronda y pasa el móvil; cada jugador pulsa **Mostrar** para ver su rol.

## 🧰 Notas técnicas
- Sin backend. HTML/CSS/JS puro.  
- Las **APIs** usadas para palabras en español:  
  1. `palabras-aleatorias-public-api.herokuapp.com`  
  2. `random-word-api.vercel.app?lang=es`  
  3. `random-word.ryanrk.com`  
- Si fallan las APIs, se usa un **diccionario local** variado en ES.

## 📦 Estructura
- `index.html` — interfaz.  
- `styles.css` — estilos.  
- `script.js` — lógica.  

¡A jugar y brindar por el impostor (o por librarse de él)! 🍻
