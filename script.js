// ===== Estado =====
const state = {
  jugadores: [],
  nombres: [],
  modoPalabras: "mis", // mis | aleatorias | coop
  impostorModo: "fixed", // fixed | random
  impostorCount: 1,
  palabra: null,
  impostores: [], // array de índices
  _revealIndex: 0,

  // Coop
  coop: {
    aportes: [], // [{autorIndex: n, palabra: "..." , usada:false}]
    idxActual: 0,
  }
};

// Diccionario local ES (fallback) — recortado pero variado
const LOCAL_ES = [
  "playa","montaña","museo","biblioteca","aeropuerto","mercado","restaurante","hospital","universidad","teatro","parque","escuela",
  "robot","algoritmo","antena","bluetooth","wifi","servidor","router","satélite","aplicación","sensor","consola",
  "café","chocolate","tortilla","paella","gazpacho","sushi","ensalada","bocadillo","hamburguesa","empanada","tarta","helado",
  "martillo","llave","linterna","paraguas","mochila","reloj","cámara","cargador","telescopio","gafas","ordenador",
  "fútbol","baloncesto","tenis","natación","ciclismo","carrera","yoga","boxeo","surf","golf","esgrima",
  "volcán","desierto","selva","océano","río","lago","isla","bosque","ciudad","pueblo","castillo","puente",
  "profesor","médico","ingeniero","artista","panadero","mecánico","piloto","bombero","policía","carpintero","electricista"
];

// ===== Utilidades DOM =====
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function show(id) {
  $$(".view").forEach(v => v.classList.remove("active"));
  $("#"+id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function shuffle(a){ for (let i=a.length-1; i>0; i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function clamp(x,mn,mx){ return Math.min(mx, Math.max(mn, x)); }

// ===== Setup básico =====
$("#btn-empezar").addEventListener("click", () => { show("view-setup"); renderNombreInputs(); });
$("#btn-prev-home").addEventListener("click", () => show("view-home"));

function renderNombreInputs() {
  const n = clamp(parseInt($("#num-jugadores").value || "5", 10), 3, 20);
  const cont = $("#nombres-container");
  cont.innerHTML = "";
  for (let i=0;i<n;i++){
    const inp = document.createElement("input");
    inp.placeholder = "Jugador " + (i+1);
    inp.dataset.idx = String(i);
    cont.appendChild(inp);
  }
  const impCount = $("#imp-count");
  impCount.max = Math.max(1, Math.floor(n/2));
  if (+impCount.value > +impCount.max) impCount.value = impCount.max;
}
$("#num-jugadores").addEventListener("input", renderNombreInputs);
$("#btn-autorelleno").addEventListener("click", ()=>{ $$("#nombres-container input").forEach((inp,i)=>inp.value=`Jugador ${i+1}`); });

// Tabs modo palabras
["tab-mis","tab-aleatorias","tab-coop"].forEach(id=>{
  $("#"+id).addEventListener("click", (ev)=>{
    const mode = ev.currentTarget.dataset.mode;
    state.modoPalabras = mode;
    $$(".tab").forEach(t=>t.classList.remove("active"));
    ev.currentTarget.classList.add("active");
    $$(".panel").forEach(p=>p.classList.remove("active"));
    if(mode==="mis") $("#panel-mis").classList.add("active");
    if(mode==="aleatorias") $("#panel-aleatorias").classList.add("active");
    if(mode==="coop") $("#panel-coop").classList.add("active");
  });
});

// Impostores
$("#imp-fixed").addEventListener("change", ()=> state.impostorModo = "fixed");
$("#imp-random").addEventListener("change", ()=> state.impostorModo = "random");
$("#imp-count").addEventListener("input", ()=> state.impostorCount = clamp(parseInt($("#imp-count").value||"1",10),1,Math.floor((parseInt($("#num-jugadores").value||"5",10))/2)));

// Coop: iniciar aportes
$("#btn-empezar-coop").addEventListener("click", ()=>{
  // Preparar estructura
  state.coop.aportes = [];
  state.coop.idxActual = 0;

  // Validar jugadores definidos ya en setup
  const n = clamp(parseInt($("#num-jugadores").value || "5", 10), 3, 20);
  const nombres = $$("#nombres-container input").map(i => (i.value || i.placeholder).trim());
  while (nombres.length < n) nombres.push(`Jugador ${nombres.length + 1}`);
  state.jugadores = nombres.slice(0, n);
  state.nombres = state.jugadores.slice();

  $("#coop-progreso").textContent = `0/${state.jugadores.length} jugadores han aportado`;
  $("#coop-textarea").value = "";
  $("#coop-etiqueta").textContent = `${state.jugadores[0]}: escribe tus palabras (una por línea)`;
  show("view-coop-input");
});

$("#btn-coop-listo").addEventListener("click", ()=>{
  const idx = state.coop.idxActual;
  const txt = $("#coop-textarea").value || "";
  const palabras = txt.split("\n").map(s=>s.trim()).filter(Boolean);
  palabras.forEach(p=> state.coop.aportes.push({autorIndex: idx, palabra: p, usada: false}));

  const next = idx + 1;
  if (next >= state.jugadores.length){
    // Fin de aportes
    alert("¡Aportes completos! Ya puedes Comenzar ronda.");
    show("view-setup");
  } else {
    state.coop.idxActual = next;
    $("#coop-progreso").textContent = `${next}/${state.jugadores.length} jugadores han aportado`;
    $("#coop-textarea").value = "";
    $("#coop-etiqueta").textContent = `${state.jugadores[next]}: escribe tus palabras (una por línea)`;
  }
});

$("#btn-coop-saltar").addEventListener("click", ()=>{
  const next = state.coop.idxActual + 1;
  if (next >= state.jugadores.length){
    alert("Se han saltado jugadores. Aportes listos.");
    show("view-setup");
  } else {
    state.coop.idxActual = next;
    $("#coop-progreso").textContent = `${next}/${state.jugadores.length} jugadores han aportado`;
    $("#coop-textarea").value = "";
    $("#coop-etiqueta").textContent = `${state.jugadores[next]}: escribe tus palabras (una por línea)`;
  }
});

// ===== Comenzar ronda =====
$("#btn-comenzar-ronda").addEventListener("click", async ()=>{
  // Preparar jugadores
  const n = clamp(parseInt($("#num-jugadores").value || "5", 10), 3, 20);
  const nombres = $$("#nombres-container input").map(i => (i.value || i.placeholder).trim());
  while (nombres.length < n) nombres.push(`Jugador ${nombres.length + 1}`);
  state.jugadores = nombres.slice(0, n);
  state.nombres = state.jugadores.slice();

  // Elegir impostores
  const impSet = pickImpostors(n);
  if (!impSet || !impSet.length){ alert("No se pudieron seleccionar impostores."); return; }
  state.impostores = impSet;

  // Elegir palabra según modo
  try {
    if (state.modoPalabras === "mis") {
      const txt = ($("#lista-palabras").value || "").split(",").map(s => s.trim()).filter(Boolean);
      if (!txt.length) throw new Error("Sin palabras manuales");
      shuffle(txt);
      state.palabra = txt[0];
    } else if (state.modoPalabras === "aleatorias") {
      state.palabra = await getSpanishWordHybrid();
    } else { // coop
      const palabraElegida = pickCoopWordExcludingImpostors();
      if (!palabraElegida) {
        alert("No quedan palabras válidas (todas las restantes son de impostores). Inicia nueva partida o cambia de modo.");
        return;
      }
      state.palabra = palabraElegida.palabra;
      // marcar usada
      palabraElegida.usada = true;
    }
  } catch (e) {
    alert("⚠️ No hay conexión o no se pudo obtener una palabra válida.\n\nUsa el modo 'Mis palabras' o revisa Internet.");
    return;
  }

  // Preparar reveal
  state._revealIndex = 0;
  $("#reveal-etiqueta").textContent = etiquetaJugador(0);
  $("#reveal-contenido").textContent = "Pulsa “Siguiente” para ver tu rol";
  $("#reveal-pista").textContent = "Toca “Siguiente” y pasa el móvil.";
  show("view-reveal");
});

// ===== Reveal =====
$("#btn-siguiente").addEventListener("click", ()=>{
  const i = state._revealIndex ?? 0;
  if (i >= state.jugadores.length){
    show("view-jugad");
    updateJugadInfo();
    return;
  }
  const esImpostor = state.impostores.includes(i);
  $("#reveal-etiqueta").textContent = etiquetaJugador(i);
  $("#reveal-contenido").textContent = esImpostor ? "Eres el IMPOSITOR 👀" : state.palabra;
  $("#reveal-pista").textContent = esImpostor ? "Actúa convincente sin saber la palabra…" : "Di palabras relacionadas sin revelar demasiado.";
  state._revealIndex = i + 1;
  if (state._revealIndex >= state.jugadores.length) {
    $("#reveal-pista").textContent = "Eres el último. Al pulsar de nuevo, aparecerá “¡Jugad!”";
  }
});

$("#btn-ocultar").addEventListener("click", ()=>{
  $("#reveal-contenido").textContent = "Oculto. Pasa el móvil al siguiente.";
  $("#reveal-pista").textContent = "Entrega el móvil al siguiente jugador.";
  const i = state._revealIndex ?? 0;
  $("#reveal-etiqueta").textContent = i < state.jugadores.length ? etiquetaJugador(i) : "Todos listos";
});

// ===== ¡Jugad! =====
$("#btn-nueva-partida").addEventListener("click", async ()=>{
  // Elegir nuevos impostores y palabra con los mismos ajustes
  const n = state.jugadores.length;
  state.impostores = pickImpostors(n);

  try {
    if (state.modoPalabras === "mis") {
      const txt = ($("#lista-palabras").value || "").split(",").map(s => s.trim()).filter(Boolean);
      if (!txt.length) throw new Error("Sin palabras manuales");
      shuffle(txt);
      state.palabra = txt[0];
    } else if (state.modoPalabras === "aleatorias") {
      state.palabra = await getSpanishWordHybrid();
    } else {
      const palabraElegida = pickCoopWordExcludingImpostors();
      if (!palabraElegida) {
        alert("No quedan palabras válidas (todas usadas o pertenecen a impostores). Inicia nueva partida.");
        return;
      }
      state.palabra = palabraElegida.palabra;
      palabraElegida.usada = true;
    }
  } catch (e) {
    alert("⚠️ No hay conexión o no se pudo obtener una palabra válida.\n\nUsa el modo 'Mis palabras' o revisa Internet.");
    return;
  }

  state._revealIndex = 0;
  $("#reveal-etiqueta").textContent = etiquetaJugador(0);
  $("#reveal-contenido").textContent = "Pulsa “Siguiente” para ver tu rol";
  $("#reveal-pista").textContent = "Toca “Siguiente” y pasa el móvil.";
  show("view-reveal");
});

$("#btn-volver-config").addEventListener("click", ()=> show("view-setup"));

// ===== Helpers de juego =====
function etiquetaJugador(i){
  return state.jugadores[i] || `Jugador ${i+1}`;
}

function pickImpostors(n){
  let k;
  if (state.impostorModo === "fixed"){
    k = clamp(parseInt($("#imp-count").value || "1",10),1,Math.max(1,Math.floor(n/2)));
  } else {
    const maxRand = Math.max(1, Math.floor(n/3));
    k = Math.floor(Math.random()*maxRand)+1;
  }
  // muestreo aleatorio sin reemplazo
  const indices = Array.from({length:n}, (_,i)=>i);
  shuffle(indices);
  return indices.slice(0,k);
}

// Coop: elegir palabra que no sea de ningún impostor y no usada
function pickCoopWordExcludingImpostors(){
  const candidatos = state.coop.aportes.filter(a => !a.usada && !state.impostores.includes(a.autorIndex));
  if (!candidatos.length) return null;
  shuffle(candidatos);
  return candidatos[0];
}

function updateJugadInfo(){
  if (state.modoPalabras === "coop"){
    const restantes = state.coop.aportes.filter(a=>!a.usada && !state.impostores.includes(a.autorIndex)).length;
    $("#jugad-restantes").textContent = restantes>0 ? `Quedan ${restantes} palabra(s) válidas.` : "No quedan palabras válidas para otra ronda.";
  } else {
    $("#jugad-restantes").textContent = "";
  }
}

// ===== Español aleatorio (híbrido) =====
async function getSpanishWordHybrid(){
  // 1) Intentar APIs públicas en ES
  const endpoints = [
    async () => {
      const url = "https://palabras-aleatorias-public-api.herokuapp.com/random";
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error("status");
      const data = await r.json();
      const w = data?.body?.Word || data?.body?.word || data?.Word || data?.word;
      if (w && isSpanishish(w)) return w.trim();
      throw new Error("shape/es");
    },
    async () => {
      const url = "https://random-word-api.vercel.app/api?words=1&lang=es";
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error("status");
      const data = await r.json();
      const w = Array.isArray(data) ? data[0] : null;
      if (w && isSpanishish(w)) return w.trim();
      throw new Error("shape/es");
    },
    async () => {
      const url = "https://random-word.ryanrk.com/api/es/word/random?count=1";
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error("status");
      const data = await r.json();
      let w = Array.isArray(data) ? data[0] : (typeof data==="string"?data:null);
      if (w && isSpanishish(w)) return w.trim();
      throw new Error("shape/es");
    },
  ];
  for (const fn of endpoints){
    try { const w = await fn(); if (w) return w; } catch(e){ /* try next */ }
  }
  // 2) Fallback local
  shuffle(LOCAL_ES);
  return LOCAL_ES[0];
}

// Heurística muy simple para filtrar inglés evidente
function isSpanishish(w){
  const s = String(w).toLowerCase();
  // contiene caracteres comunes del ES o termina en vocal común; descarta mayúsculas raras o 'the'
  if (s.includes("ñ") || /[áéíóúü]/.test(s)) return true;
  if (/(ción|sión|dad|ario|ente|oso|osa|al|ar|er|ir|or|ora|ado|ada|ero|era|ista|ismo)$/.test(s)) return true;
  if (s === "the" || s === "and" || s === "of") return false;
  // longitud mínima
  return s.length >= 3;
}

// Accesibilidad de teclado en escritorio (opcional)
document.addEventListener("keydown",(ev)=>{
  if ($("#view-reveal").classList.contains("active")){
    if (ev.key === "ArrowRight" || ev.key?.toLowerCase() === "enter") $("#btn-siguiente").click();
  }
});
