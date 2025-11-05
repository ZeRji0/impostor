// === Estado global ===
const state = {
  jugadores: [],
  palabra: null,
  impostorIndex: null,
  modo: "personalizadas",
  _revealIndex: 0,
};

// === Utilidades DOM y navegación ===
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function show(id) {
  $$(".view").forEach(v => v.classList.remove("active"));
  $("#"+id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "instant" });
}

// === Inicio / Config ===
$("#btn-empezar").addEventListener("click", () => { show("view-setup"); renderNombreInputs(); });
$("#btn-prev-home").addEventListener("click", () => show("view-home"));

$("#tab-personalizadas").addEventListener("click", () => switchTab("personalizadas"));
$("#tab-aleatorias").addEventListener("click", () => switchTab("aleatorias"));

function switchTab(modo) {
  state.modo = modo;
  $("#tab-personalizadas").classList.toggle("active", modo === "personalizadas");
  $("#tab-aleatorias").classList.toggle("active", modo === "aleatorias");
  $("#panel-personalizadas").classList.toggle("active", modo === "personalizadas");
  $("#panel-aleatorias").classList.toggle("active", modo === "aleatorias");
}

function renderNombreInputs() {
  const n = clamp(parseInt($("#num-jugadores").value || "5", 10), 3, 20);
  const cont = $("#nombres-container");
  cont.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const inp = document.createElement("input");
    inp.placeholder = "Jugador " + (i + 1);
    inp.dataset.idx = String(i);
    cont.appendChild(inp);
  }
}
$("#num-jugadores").addEventListener("input", renderNombreInputs);
$("#btn-autorelleno").addEventListener("click", () => {
  $$("#nombres-container input").forEach((inp, i) => inp.value = `Jugador ${i+1}`);
});

// === Ronda ===
$("#btn-comenzar-ronda").addEventListener("click", async () => {
  const n = clamp(parseInt($("#num-jugadores").value || "5", 10), 3, 20);

  // Nombres
  const nombres = $$("#nombres-container input").map(i => (i.value || i.placeholder).trim());
  while (nombres.length < n) nombres.push(`Jugador ${nombres.length + 1}`);
  state.jugadores = nombres.slice(0, n);

  // Palabra
  try {
    if (state.modo === "personalizadas") {
      const txt = ($("#lista-palabras").value || "").split(",").map(s => s.trim()).filter(Boolean);
      if (!txt.length) throw new Error("Sin palabras");
      shuffle(txt);
      state.palabra = txt[0];
    } else {
      state.palabra = await fetchRandomSpanishWord();
    }
  } catch (e) {
    alert("⚠️ No hay conexión o no se pudo obtener una palabra aleatoria.\n\nUsa el modo 'Mis palabras' o revisa Internet.");
    return;
  }

  // Impostor aleatorio
  state.impostorIndex = Math.floor(Math.random() * n);

  // Preparar reveal
  state._revealIndex = 0;
  $("#reveal-pista").textContent = "Toca “Siguiente” y pasa el móvil.";
  $("#reveal-contenido").textContent = "Pulsa “Siguiente” para ver tu rol";
  $("#reveal-etiqueta").textContent = etiquetaJugador(0);

  show("view-reveal");
});

// Mostrar roles / palabra
$("#btn-siguiente").addEventListener("click", () => {
  const i = state._revealIndex ?? 0;

  if (i >= state.jugadores.length) {
    // Fin de reparto: ir a ¡JUGAD!
    show("view-jugad");
    return;
  }

  const esImpostor = i === state.impostorIndex;
  $("#reveal-etiqueta").textContent = etiquetaJugador(i);
  $("#reveal-contenido").textContent = esImpostor ? "Eres el IMPOSTOR 👀" : state.palabra;
  $("#reveal-pista").textContent = esImpostor ? "Intenta sonar convincente sin saber la palabra…" : "Di palabras relacionadas sin revelar demasiado.";

  state._revealIndex = i + 1;

  if (state._revealIndex >= state.jugadores.length) {
    $("#reveal-pista").textContent = "Eres el último. Al pulsar de nuevo, aparecerá “¡Jugad!”";
  }
});

$("#btn-ocultar").addEventListener("click", () => {
  $("#reveal-contenido").textContent = "Oculto. Pasa el móvil al siguiente.";
  $("#reveal-pista").textContent = "Entrega el móvil al siguiente jugador.";
  const i = state._revealIndex ?? 0;
  $("#reveal-etiqueta").textContent = i < state.jugadores.length ? etiquetaJugador(i) : "Todos listos";
});

// Nueva partida: misma configuración, nueva palabra e impostor
$("#btn-nueva-partida").addEventListener("click", async () => {
  try {
    if (state.modo === "aleatorias") {
      state.palabra = await fetchRandomSpanishWord();
    } else {
      const txt = ($("#lista-palabras").value || "").split(",").map(s => s.trim()).filter(Boolean);
      if (!txt.length) throw new Error("Sin palabras");
      shuffle(txt);
      state.palabra = txt[0];
    }
  } catch (e) {
    alert("⚠️ No hay conexión o no se pudo obtener una palabra aleatoria.\n\nUsa el modo 'Mis palabras' o revisa Internet.");
    return;
  }

  state.impostorIndex = Math.floor(Math.random() * state.jugadores.length);
  state._revealIndex = 0;
  $("#reveal-pista").textContent = "Toca “Siguiente” y pasa el móvil.";
  $("#reveal-contenido").textContent = "Pulsa “Siguiente” para ver tu rol";
  $("#reveal-etiqueta").textContent = etiquetaJugador(0);
  show("view-reveal");
});

// Cambiar configuración
$("#btn-volver-config").addEventListener("click", () => show("view-setup"));

// === Utilidades ===
function etiquetaJugador(i) {
  const nombre = state.jugadores[i] || `Jugador ${i+1}`;
  return `${nombre}`;
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function clamp(x, mn, mx) { return Math.min(mx, Math.max(mn, x)); }

// === Obtener palabra aleatoria real en español ===
async function fetchRandomSpanishWord() {
  const tryEndpoints = [
    async () => {
      const url = "https://random-word-api.vercel.app/api?words=1&lang=es";
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error("bad status");
      const data = await r.json();
      if (Array.isArray(data) && data[0]) return String(data[0]);
      throw new Error("bad shape");
    },
    async () => {
      const url = "https://palabras-aleatorias-public-api.herokuapp.com/random";
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error("bad status");
      const data = await r.json();
      const w = data?.body?.Word || data?.body?.word || data?.Word || data?.word;
      if (w) return String(w);
      throw new Error("bad shape");
    },
    async () => {
      const url = "https://random-word.ryanrk.com/api/es/word/random?count=1";
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error("bad status");
      const data = await r.json();
      if (Array.isArray(data) && data[0]) return String(data[0]);
      if (typeof data === "string") return data;
      throw new Error("bad shape");
    },
  ];

  let lastErr = null;
  for (const fn of tryEndpoints) {
    try {
      const w = await fn();
      const word = w.trim();
      if (word) return word;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("No endpoints");
}

// Accesibilidad (por si se usa en escritorio)
document.addEventListener("keydown", (ev) => {
  if ($("#view-reveal").classList.contains("active")) {
    if (ev.key === "ArrowRight" || ev.key?.toLowerCase() === "enter") $("#btn-siguiente").click();
  }
});
