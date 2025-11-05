# Web estática gratuita
Sube esta carpeta a **GitHub Pages**, **Netlify** o **Vercel** para tener tu web online gratis.

## GitHub Pages (rápido)
1. Crea un repositorio en GitHub (p.ej. `mi-web`).
2. Sube los archivos tal cual (index.html, styles.css, script.js).
3. En *Settings → Pages*, selecciona la rama `main` y la carpeta `/ (root)`.
4. Guarda. En 1-3 minutos tendrás una URL del tipo: `https://TU_USUARIO.github.io/mi-web`.

## Netlify (muy fácil)
1. Entra en https://app.netlify.com y crea cuenta.
2. Opción **Deploy site** → **Drag and drop** y arrastra la carpeta.
3. Te dará una URL gratuita del tipo `https://algo-netlify.app` que puedes personalizar.

## Vercel (también fácil)
1. En https://vercel.com crea cuenta.
2. Importa tu repo o arrastra la carpeta.
3. Obtendrás una URL tipo `https://mi-web.vercel.app`.

## Hacer funcional el formulario
- Opción A (recomendada): Regístrate en **Formspree** y reemplaza `YOUR_FORM_ID` en `index.html`.
- Opción B (sin servicios): cambia el `action` del formulario por `mailto:tu@correo.com` (se abrirá el cliente de correo del visitante).

## Personaliza
- Texto e imágenes en `index.html`.
- Estilos en `styles.css`.
- JS en `script.js`.
