# IMPOSTOR — ULTRA (Web móvil)
Modos de palabras:
1) **Mis palabras** — manual, separadas por comas.
2) **Aleatorias (ES)** — palabra real vía Internet; si falla o no es español, usa diccionario local.
3) **Cooperativo** — cada jugador aporta palabras (una por línea). Se consumen una vez y los impostores **no pueden** recibir palabras que hayan escrito ellos.

Impostores:
- **Fijo** — cantidad exacta.
- **Aleatorio** — de 1 a ⌊n/3⌋.

Flujo:
- Inicio → Config → (si cooperativo, fase de aportes) → Reparto → **¡Jugad!** → **Nueva partida** (misma configuración).

Notas:
- Todo funciona en el navegador (HTML/CSS/JS). Sin servidor.
- Para mejor soporte de JS en móvil, sube a GitHub Pages / Netlify / Vercel.
