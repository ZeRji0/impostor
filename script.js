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
  competitivo: false,
  scores: {}, // idx -> puntos
  palabra: null,
  impostores: [],
  i: 0,
  vis: false,
  coop: { aportes: [], idx: 0 }
};

// Local fallback words (ES)
const LOCAL_ES = ["playa","montaña","museo","biblioteca","aeropuerto","mercado","restaurante","hospital","universidad","teatro","parque","escuela","robot","algoritmo","antena","bluetooth","wifi","servidor","router","satélite","aplicación","sensor","consola","café","chocolate","tortilla","paella","gazpacho","sushi","ensalada","bocadillo","hamburguesa","empanada","tarta","helado","martillo","llave","linterna","paraguas","mochila","reloj","cámara","cargador","telescopio","gafas","ordenador","fútbol","baloncesto","tenis","natación","ciclismo","carrera","yoga","boxeo","surf","golf","esgrima","volcán","desierto","selva","océano","río","lago","isla","bosque","ciudad","pueblo","castillo","puente","profesor","médico","ingeniero","artista","panadero","mecánico","piloto","bombero","policía","carpintero","electricista"];

// View
function show(id){ $$(".view").forEach(v=>v.classList.remove("active")); $("#"+id).classList.add("active"); }

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }

function toast(msg){
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>{ t.remove(); }, 1800);
}

// HOME
$("#btn-empezar").onclick = ()=>{ show("view-setup"); renderInputs(); refreshScoresHome(); };
$("#btn-prev-home").onclick = ()=>{ show("view-home"); refreshScoresHome(); };

function refreshScoresHome(){
  const hasScores = Object.keys(state.scores).length > 0;
  const card = $("#home-scores");
  if(!hasScores){ card.style.display="none"; return; }
  card.style.display="block";
  const table = $("#scores-table");
  const rows = Object.entries(state.scores).sort((a,b)=>b[1]-a[1]).map(([idx,pts])=>`${state.jugadores[idx]||("Jugador "+(Number(idx)+1))} — ${pts} pts`);
  table.innerHTML = "<pre style='white-space:pre-wrap;margin:0'>" + rows.join("\n") + "</pre>";
}

$("#btn-copy-scores").onclick = async ()=>{
  const rows = Object.entries(state.scores).sort((a,b)=>b[1]-a[1]).map(([idx,pts])=>`${state.jugadores[idx]||("Jugador "+(Number(idx)+1))}: ${pts} puntos`);
  const text = "🏆 Resultados — IMPOSTOR · Definitive Edition\n" + rows.join("\n");
  try{ await navigator.clipboard.writeText(text); toast("Tabla copiada al portapapeles"); }catch(e){ 
    // fallback
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    toast("Tabla copiada (fallback)");
  }
};

$("#btn-reset-scores").onclick = ()=>{
  state.scores = {};
  refreshScoresHome();
  toast("Puntuaciones reiniciadas");
};

// SETUP
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

// Impostores
$("#imp-fixed").onchange = ()=>{ state.impModo = "fixed"; updateImpInfo(); };
$("#imp-random").onchange = ()=>{ state.impModo = "random"; updateImpInfo(); };
$("#imp-count").oninput = ()=>{ state.impCount = +$("#imp-count").value || 1; updateImpInfo(); };
function updateImpInfo(){
  const n = +$("#num-jugadores").value || 5;
  const fixed = $("#imp-fixed").checked;
  const v = +$("#imp-count").value || 1;
  $("#imp-info").textContent = fixed ? `Habrá exactamente ${Math.min(v,n)} impostor(es).` : `Habrá entre 1 y ${n} impostores (aleatorio simple).`;
}

// Competitivo
$("#chk-competitivo").onchange = (e)=>{ state.competitivo = e.currentTarget.checked; };

// Coop
$("#btn-empezar-coop").onclick = ()=>{
  const n = +$("#num-jugadores").value || 5;
  const names = $$("#nombres-container input").map(i => i.value || i.placeholder);
  state.jugadores = names.slice(0,n);
  state.nombres = state.jugadores.slice();
  // init scores for new players if not exist
  state.jugadores.forEach((_,i)=>{ if(state.scores[i]==null) state.scores[i]=0; });
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
  // init scores if undefined
  state.jugadores.forEach((_,i)=>{ if(state.scores[i]==null) state.scores[i]=0; });

  // impostores
  state.impostores = pickImpostores(n);

  // palabra
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

  // reveal
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
    const k = Math.floor(Math.random()*n) + 1; // 1..n
    return idx.slice(0,k);
  }
}

// Reveal logic
$("#btn-toggle").onclick = ()=>{ state.vis = !state.vis; setReveal(); };
$("#btn-siguiente").onclick = ()=>{
  state.i++;
  state.vis = false;
  if(state.i >= state.jugadores.length){
    // último jugador
    updateJugadInfo();
    // mostrar botón de evaluar si es competitivo
    $("#btn-evaluar").style.display = state.competitivo ? "block" : "none";
    show("view-jugad");
    // Si competitivo, abrir modal automáticamente
    if(state.competitivo){ openModal(); }
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

$("#btn-menu").onclick = ()=>{
  // volver al menú principal
  show("view-home");
  refreshScoresHome();
};

function updateJugadInfo(){
  if(state.modo === "coop"){
    const restantes = state.coop.aportes.filter(a => !a.usada && !state.impostores.includes(a.autor)).length;
    $("#jugad-restantes").textContent = restantes>0 ? `Quedan ${restantes} palabra(s) válidas.` : "No quedan palabras válidas para otra ronda.";
  } else {
    $("#jugad-restantes").textContent = "";
  }
}

// Coop selector
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
  // fallback local aleatorio
  return LOCAL_ES[Math.floor(Math.random()*LOCAL_ES.length)];
}

function esEspañol(w){
  const s = String(w).toLowerCase();
  if (s.includes("ñ") || /[áéíóúü]/.test(s)) return true;
  if (/(ción|sión|dad|ario|ente|oso|osa|al|ar|er|ir|or|ora|ado|ada|ero|era|ista|ismo)$/.test(s)) return true;
  if (s==="the"||s==="and"||s==="of") return false;
  return s.length>=3;
}

// Modal competitivo
function openModal(){ $("#modal").style.display = "flex"; }
function closeModal(){ $("#modal").style.display = "none"; }
$("#btn-evaluar").onclick = openModal;
$("#btn-cerrar-modal").onclick = closeModal;

$("#btn-ganan-ciudadanos").onclick = ()=>{
  // ciudadanos (no impostores) +1 punto
  const noImps = state.jugadores.map((_,i)=>i).filter(i => !state.impostores.includes(i));
  noImps.forEach(i => { state.scores[i] = (state.scores[i]||0)+1; });
  toast("✔️ Punto para ciudadanos");
  closeModal();
};

$("#btn-ganan-impostores").onclick = ()=>{
  // impostores +2 puntos
  state.impostores.forEach(i => { state.scores[i] = (state.scores[i]||0)+2; });
  toast("😈 +2 puntos para impostores");
  closeModal();
};
