// Helpers
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// State
const state = {
  jugadores: [],
  nombres: [],
  modo: "mis", // mis | aleatorias | coop
  impModo: "fixed", // fixed | random
  impCount: 1,
  palabra: null,
  impostores: [],
  i: 0,
  vis: false,
  coop: {
    aportes: [], // {autor, palabra, usada:false}
    idx: 0
  }
};

// Local fallback words (ES)
const LOCAL_ES = ["playa","montaña","museo","biblioteca","aeropuerto","mercado","restaurante","hospital","universidad","teatro","parque","escuela","robot","algoritmo","antena","bluetooth","wifi","servidor","router","satélite","aplicación","sensor","consola","café","chocolate","tortilla","paella","gazpacho","sushi","ensalada","bocadillo","hamburguesa","empanada","tarta","helado","martillo","llave","linterna","paraguas","mochila","reloj","cámara","cargador","telescopio","gafas","ordenador","fútbol","baloncesto","tenis","natación","ciclismo","carrera","yoga","boxeo","surf","golf","esgrima","volcán","desierto","selva","océano","río","lago","isla","bosque","ciudad","pueblo","castillo","puente","profesor","médico","ingeniero","artista","panadero","mecánico","piloto","bombero","policía","carpintero","electricista"];

// View helpers
function show(id){ $$(".view").forEach(v=>v.classList.remove("active")); $("#"+id).classList.add("active"); }

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }

// Setup
$("#btn-empezar").onclick = ()=>{ show("view-setup"); renderInputs(); };
$("#btn-prev-home").onclick = ()=> show("view-home");

function renderInputs(){
  const n = +$("#num-jugadores").value || 5;
  const c = $("#nombres-container");
  c.innerHTML = "";
  for(let i=0;i<n;i++){ const inp=document.createElement("input"); inp.placeholder="Jugador "+(i+1); c.appendChild(inp); }
  updateImpInfo();
}
$("#num-jugadores").oninput = renderInputs;
$("#btn-autorelleno").onclick = ()=> $$("#nombres-container input").forEach((inp,i)=> inp.value="Jugador "+(i+1));

// Tabs
$$(".tab").forEach(btn => btn.onclick = e => {
  $$(".tab").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  state.modo = btn.dataset.mode;
  $$(".panel").forEach(p=>p.classList.remove("active"));
  $("#panel-"+state.modo).classList.add("active");
});

// Impostores controls
$("#imp-fixed").onchange = ()=>{ state.impModo = "fixed"; updateImpInfo(); };
$("#imp-random").onchange = ()=>{ state.impModo = "random"; updateImpInfo(); };
$("#imp-count").oninput = ()=>{ state.impCount = +$("#imp-count").value || 1; updateImpInfo(); };

function updateImpInfo(){
  const n = +$("#num-jugadores").value || 5;
  const fixed = $("#imp-fixed").checked;
  const v = +$("#imp-count").value || 1;
  $("#imp-info").textContent = fixed ? `Habrá exactamente ${Math.min(v,n)} impostor(es).` : `Habrá entre 1 y ${n} impostores (aleatorio simple).`;
}

// Coop inputs
$("#btn-empezar-coop").onclick = ()=>{
  // collect players first
  const n = +$("#num-jugadores").value || 5;
  const names = $$("#nombres-container input").map(i => i.value || i.placeholder);
  state.jugadores = names.slice(0,n);
  state.nombres = state.jugadores.slice();
  state.coop.aportes = [];
  state.coop.idx = 0;
  $("#coop-progreso").textContent = `0/${n} jugadores han aportado`;
  $("#coop-etiqueta").textContent = `${state.jugadores[0]}: escribe tus palabras (una por línea)`;
  $("#coop-text").value = "";
  show("view-coop");
};

$("#btn-coop-listo").onclick = ()=>{
  const idx = state.coop.idx;
  const t = $("#coop-text").value || "";
  const palabras = t.split("\n").map(s=>s.trim()).filter(Boolean);
  palabras.forEach(p => state.coop.aportes.push({ autor: idx, palabra: p, usada: false }));
  const n = state.jugadores.length;
  const next = idx+1;
  if(next>=n){
    alert("¡Aportes completos! Ya puedes comenzar la ronda.");
    show("view-setup");
  } else {
    state.coop.idx = next;
    $("#coop-progreso").textContent = `${next}/${n} jugadores han aportado`;
    $("#coop-etiqueta").textContent = `${state.jugadores[next]}: escribe tus palabras (una por línea)`;
    $("#coop-text").value = "";
  }
};

$("#btn-coop-saltar").onclick = ()=>{
  const n = state.jugadores.length || (+$("#num-jugadores").value || 5);
  const next = state.coop.idx+1;
  if(next>=n){
    alert("Se han saltado jugadores. Aportes listos.");
    show("view-setup");
  } else {
    state.coop.idx = next;
    $("#coop-progreso").textContent = `${next}/${n} jugadores han aportado`;
    $("#coop-etiqueta").textContent = `${state.jugadores[next]}: escribe tus palabras (una por línea)`;
    $("#coop-text").value = "";
  }
};

// Comenzar ronda
$("#btn-comenzar").onclick = async ()=>{
  const n = +$("#num-jugadores").value || 5;
  const names = $$("#nombres-container input").map(i=> i.value || i.placeholder);
  state.jugadores = names.slice(0,n);
  state.nombres = state.jugadores.slice();

  // Impostores
  state.impostores = pickImpostores(n);

  // Palabra
  try{
    if(state.modo === "mis"){
      const arr = ($("#lista-palabras").value || "").split(",").map(s=>s.trim()).filter(Boolean);
      if(!arr.length) throw new Error("sin palabras");
      shuffle(arr);
      state.palabra = arr[0];
    } else if (state.modo === "aleatorias"){
      state.palabra = await palabraES_hibrido();
    } else {
      const elegido = pickCoopWordExcludingImpostors();
      if(!elegido){ alert("No quedan palabras válidas (todas usadas o pertenecen a impostores)."); return; }
      elegido.usada = true;
      state.palabra = elegido.palabra;
    }
  }catch(e){
    alert("⚠️ No hay conexión o no se pudo obtener una palabra válida. Usa 'Mis palabras' o revisa Internet.");
    return;
  }

  // Reveal start
  state.i = 0;
  state.vis = false;
  setReveal();
  show("view-reveal");
};

function pickImpostores(n){
  const idx = Array.from({length:n},(_,i)=>i);
  shuffle(idx);
  if(state.impModo === "fixed"){
    const k = Math.max(1, Math.min(state.impCount || 1, n));
    return idx.slice(0,k);
  } else {
    const k = Math.floor(Math.random()*n) + 1; // 1..n uniforme
    return idx.slice(0,k);
  }
}

// Reveal logic
$("#btn-toggle").onclick = ()=>{ state.vis = !state.vis; setReveal(); };
$("#btn-siguiente").onclick = ()=>{
  state.i++;
  state.vis = false;
  if(state.i >= state.jugadores.length){
    // último jugador → directo a ¡Jugad!
    updateJugadInfo();
    show("view-jugad");
    return;
  }
  setReveal();
};

function setReveal(){
  const i = state.i, t = state.jugadores.length;
  $("#prog").textContent = `Jugador ${Math.min(i+1,t)} de ${t}`;
  $("#etiqueta").textContent = state.jugadores[i] || ("Jugador "+(i+1));
  const box = $("#contenido");
  if(state.vis){
    const imp = state.impostores.includes(i);
    box.textContent = imp ? "Eres el IMPOSITOR 👀" : state.palabra;
    box.classList.remove("hidden");
    $("#btn-toggle").textContent = "🙈 Ocultar";
  } else {
    box.textContent = "— Oculto —";
    box.classList.add("hidden");
    $("#btn-toggle").textContent = "👁 Mostrar";
  }
}

$("#btn-nueva").onclick = async ()=>{
  // misma config, nueva palabra e impostores
  state.impostores = pickImpostores(state.jugadores.length);
  try{
    if(state.modo === "mis"){
      const arr = ($("#lista-palabras").value || "").split(",").map(s=>s.trim()).filter(Boolean);
      shuffle(arr);
      state.palabra = arr[0] || "palabra";
    } else if (state.modo === "aleatorias"){
      state.palabra = await palabraES_hibrido();
    } else {
      const elegido = pickCoopWordExcludingImpostors();
      if(!elegido){ alert("No quedan palabras válidas. Empieza nueva partida o cambia de modo."); return; }
      elegido.usada = true;
      state.palabra = elegido.palabra;
    }
  }catch(e){ state.palabra="palabra"; }
  state.i = 0; state.vis = false;
  setReveal();
  show("view-reveal");
};

function updateJugadInfo(){
  if(state.modo === "coop"){
    const restantes = state.coop.aportes.filter(a => !a.usada && !state.impostores.includes(a.autor)).length;
    $("#jugad-restantes").textContent = restantes>0 ? `Quedan ${restantes} palabra(s) válidas.` : "No quedan palabras válidas para otra ronda.";
  } else {
    $("#jugad-restantes").textContent = "";
  }
}

// Coop selector — palabra que NO sea de impostores y no usada
function pickCoopWordExcludingImpostors(){
  const cand = state.coop.aportes.filter(a => !a.usada && !state.impostores.includes(a.autor));
  if(!cand.length) return null;
  shuffle(cand);
  return cand[0];
}

// Aleatorias (ES) — 3 APIs + validación y fallback
async function palabraES_hibrido(){
  const endpoints = [
    async ()=>{
      const r = await fetch("https://palabras-aleatorias-public-api.herokuapp.com/random", {cache:"no-store"});
      if(!r.ok) throw 0;
      const j = await r.json();
      const w = j?.body?.Word || j?.body?.word || j?.Word || j?.word;
      if(w && esEspañol(w)) return w.trim();
      throw 0;
    },
    async ()=>{
      const r = await fetch("https://random-word-api.vercel.app/api?words=1&lang=es", {cache:"no-store"});
      if(!r.ok) throw 0;
      const j = await r.json();
      const w = Array.isArray(j) ? j[0] : null;
      if(w && esEspañol(w)) return w.trim();
      throw 0;
    },
    async ()=>{
      const r = await fetch("https://random-word.ryanrk.com/api/es/word/random?count=1", {cache:"no-store"});
      if(!r.ok) throw 0;
      const j = await r.json();
      const w = Array.isArray(j) ? j[0] : (typeof j==="string" ? j : null);
      if(w && esEspañol(w)) return w.trim();
      throw 0;
    }
  ];
  for(const fn of endpoints){
    try{ const w = await fn(); if(w) return w; }catch(e){}
  }
  // fallback local REAL aleatorio (no fijo "cerveza")
  return LOCAL_ES[Math.floor(Math.random()*LOCAL_ES.length)];
}

// Heurística simple para filtrar inglés
function esEspañol(w){
  const s = String(w).toLowerCase();
  if (s.includes("ñ") || /[áéíóúü]/.test(s)) return true;
  if (/(ción|sión|dad|ario|ente|oso|osa|al|ar|er|ir|or|ora|ado|ada|ero|era|ista|ismo)$/.test(s)) return true;
  if (s==="the"||s==="and"||s==="of") return false;
  return s.length>=3;
}
