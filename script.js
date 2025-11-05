// Estado del juego en memoria
const state = {
  jugadores: [], // array de nombres o "Jugador 1"...
  palabra: null,
  impostorIndex: null,
  modo: "personalizadas", // o "aleatorias"
};

// Helper: navegación entre pantallas
function show(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "instant" });
}

// Helpers varios
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// Inicio
$("#btn-empezar").addEventListener("click", () => {
  show("view-setup");
  renderNombreInputs();
});

$("#btn-prev-home").addEventListener("click", () => show("view-home"));

// Tabs palabras
$("#tab-personalizadas").addEventListener("click", () => switchTab("personalizadas"));
$("#tab-aleatorias").addEventListener("click", () => switchTab("aleatorias"));

function switchTab(modo) {
  state.modo = modo;
  $("#tab-personalizadas").classList.toggle("active", modo === "personalizadas");
  $("#tab-aleatorias").classList.toggle("active", modo === "aleatorias");
  $("#panel-personalizadas").classList.toggle("active", modo === "personalizadas");
  $("#panel-aleatorias").classList.toggle("active", modo === "aleatorias");
}

// Render inputs de nombres
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

// Comenzar ronda
$("#btn-comenzar-ronda").addEventListener("click", () => {
  const n = clamp(parseInt($("#num-jugadores").value || "5", 10), 3, 20);

  // Nombres
  const nombres = $$("#nombres-container input").map(i => (i.value || i.placeholder).trim());
  while (nombres.length < n) nombres.push(`Jugador ${nombres.length + 1}`);
  state.jugadores = nombres.slice(0, n);

  // Palabra
  let palabra = null;
  if (state.modo === "personalizadas") {
    const txt = ($("#lista-palabras").value || "").split(",").map(s => s.trim()).filter(Boolean);
    if (txt.length === 0) {
      alert("Escribe al menos 1 palabra o cambia al modo Aleatorias.");
      return;
    }
    shuffle(txt);
    palabra = txt[0];
  } else {
    const cat = $("#categoria").value || "mixto";
    const lista = (window.PALABRAS_BASE?.[cat] || window.PALABRAS_BASE.mixto).slice();
    if (!lista.length) { alert("No hay palabras en esa categoría."); return; }
    shuffle(lista);
    palabra = lista[0];
  }
  state.palabra = palabra;

  // Impostor aleatorio
  state.impostorIndex = Math.floor(Math.random() * n);

  // Preparar reveal
  state._revealIndex = 0;
  $("#reveal-pista").textContent = "Toca “Siguiente” y pasa el móvil.";
  $("#reveal-contenido").textContent = "Pulsa “Siguiente” para ver tu rol";
  $("#reveal-etiqueta").textContent = etiquetaJugador(0);

  show("view-reveal");
});

// Botones reveal
$("#btn-siguiente").addEventListener("click", () => {
  const i = state._revealIndex ?? 0;
  if (i >= state.jugadores.length) {
    // Ir a listo
    terminarPreparacion();
    return;
  }
  // Mostrar rol/palabra al jugador i
  const esImpostor = i === state.impostorIndex;
  $("#reveal-etiqueta").textContent = etiquetaJugador(i);
  $("#reveal-contenido").textContent = esImpostor ? "Eres el IMPOSTOR 👀" : state.palabra;
  $("#reveal-pista").textContent = esImpostor ? "Intenta sonar convincente sin saber la palabra…" : "Di palabras relacionadas sin revelar demasiado.";

  // Avanzar índice: la siguiente pulsación muestra el recuadro oculto primero
  state._revealIndex = i + 1;
});

$("#btn-ocultar").addEventListener("click", () => {
  $("#reveal-contenido").textContent = "Oculto. Pasa el móvil al siguiente.";
  $("#reveal-pista").textContent = "Entrega el móvil al siguiente jugador.";
  const i = state._revealIndex ?? 0;
  if (i < state.jugadores.length) {
    $("#reveal-etiqueta").textContent = etiquetaJugador(i);
  } else {
    $("#reveal-etiqueta").textContent = "Todos listos";
  }
});

function terminarPreparacion() {
  $("#palabra-final").textContent = state.palabra;
  $("#contador-jugadores").textContent = state.jugadores.length;
  $("#quien-impostor").textContent = `Impostor: ${state.jugadores[state.impostorIndex]} (jugador ${state.impostorIndex+1})`;
  show("view-listo");
}

// Nueva ronda con misma configuración
$("#btn-nueva-ronda").addEventListener("click", () => {
  // Elegir nueva palabra si aleatorias o rebarajar personalizadas
  if (state.modo === "aleatorias") {
    const cat = $("#categoria").value || "mixto";
    const lista = (window.PALABRAS_BASE?.[cat] || window.PALABRAS_BASE.mixto).slice();
    shuffle(lista);
    state.palabra = lista[0];
  } else {
    // reusar textarea
    const txt = ($("#lista-palabras").value || "").split(",").map(s => s.trim()).filter(Boolean);
    if (txt.length) { shuffle(txt); state.palabra = txt[0]; }
  }
  state.impostorIndex = Math.floor(Math.random() * state.jugadores.length);
  state._revealIndex = 0;
  $("#reveal-pista").textContent = "Toca “Siguiente” y pasa el móvil.";
  $("#reveal-contenido").textContent = "Pulsa “Siguiente” para ver tu rol";
  $("#reveal-etiqueta").textContent = etiquetaJugador(0);
  show("view-reveal");
});

// Nueva configuración
$("#btn-nueva-config").addEventListener("click", () => show("view-setup"));

// Utilidades
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function clamp(x, mn, mx) { return Math.min(mx, Math.max(mn, x)); }
function etiquetaJugador(i) {
  const nombre = state.jugadores[i] || `Jugador ${i+1}`;
  return `${nombre}`;
}

// Accesibilidad básica con teclado (por si se usa en escritorio)
document.addEventListener("keydown", (ev) => {
  if ($("#view-reveal").classList.contains("active")) {
    if (ev.key === "ArrowRight" || ev.key?.toLowerCase() === "enter") $("#btn-siguiente").click();
  }
});
