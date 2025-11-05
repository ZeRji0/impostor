// Funciones básicas + modo oscuro con almacenamiento local
(function() {
  const root = document.documentElement;
  const THEME_KEY = "site_theme";
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark") root.classList.add("dark");
  if (saved === "light") root.classList.remove("dark");

  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const isDark = root.classList.toggle("dark");
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    });
  }

  const cta = document.getElementById("cta");
  const res = document.getElementById("cta-result");
  if (cta && res) {
    cta.addEventListener("click", () => {
      const now = new Date().toLocaleString();
      res.textContent = "Funciona ✅ — Último clic: " + now;
    });
  }

  // Manejo simple del envío del formulario mostrando feedback inmediato
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      // Si el action es mailto, no interferir
      if ((form.action || "").startsWith("mailto:")) return;
      e.preventDefault();
      const data = new FormData(form);
      try {
        const resp = await fetch(form.action, {
          method: form.method || "POST",
          body: data,
          headers: { "Accept": "application/json" }
        });
        if (resp.ok) {
          alert("¡Mensaje enviado! Revisa tu bandeja en Formspree.");
          form.reset();
        } else {
          alert("No se pudo enviar. Revisa tu Form ID o usa mailto:.");
        }
      } catch (err) {
        alert("Error de red. Prueba de nuevo o cambia a mailto:.");
      }
    });
  }
})();