const $=s=>document.querySelector(s);const $$=s=>Array.from(document.querySelectorAll(s));
const state={jugadores:[],impostores:[],palabra:null,_i:0,_vis:false,modo:'mis',impModo:'fixed',impCount:1};

function show(id){$$('.view').forEach(v=>v.classList.remove('active'));$('#'+id).classList.add('active');}
$('#btn-empezar').onclick=()=>{show('view-setup');renderInputs();}
$('#btn-prev-home').onclick=()=>show('view-home');
$('#num-jugadores').oninput=renderInputs;$('#btn-autorelleno').onclick=()=>$$('#nombres-container input').forEach((i,x)=>i.value='Jugador '+(x+1));

function renderInputs(){const n=+$('#num-jugadores').value||5;const c=$('#nombres-container');c.innerHTML='';for(let i=0;i<n;i++){let inp=document.createElement('input');inp.placeholder='Jugador '+(i+1);c.appendChild(inp);}updateImpInfo();}
function updateImpInfo(){const n=+$('#num-jugadores').value||5;const fixed=$('#imp-fixed').checked;const v=+$('#imp-count').value||1;$('#imp-info').textContent=fixed?`Habrá exactamente ${Math.min(v,n)} impostor(es).`:`Habrá entre 1 y ${n} impostores (aleatorio simple).`;}
$('#imp-fixed').onchange=()=>{state.impModo='fixed';updateImpInfo();}
$('#imp-random').onchange=()=>{state.impModo='random';updateImpInfo();}
$('#imp-count').oninput=()=>{state.impCount=+$('#imp-count').value;updateImpInfo();}

$$('.tab').forEach(b=>b.onclick=e=>{$$('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.modo=b.dataset.mode;$$('.panel').forEach(p=>p.classList.remove('active'));$('#panel-'+b.dataset.mode).classList.add('active');});

$('#btn-comenzar').onclick=async()=>{
  const n=+$('#num-jugadores').value||5;const names=$$('#nombres-container input').map(i=>i.value||i.placeholder);state.jugadores=names.slice(0,n);
  state.impostores=pickImpostores(n);
  if(state.modo==='mis'){const arr=$('#lista-palabras').value.split(',').map(s=>s.trim()).filter(Boolean);state.palabra=arr[Math.floor(Math.random()*arr.length)]||'palabra';}
  else{state.palabra=await palabraES();}
  state._i=0;state._vis=false;setReveal();show('view-reveal');
};

function pickImpostores(n){if(state.impModo==='fixed'){let k=Math.min(state.impCount,n);let idx=[...Array(n).keys()];shuffle(idx);return idx.slice(0,k);}else{let k=Math.floor(Math.random()*n)+1;let idx=[...Array(n).keys()];shuffle(idx);return idx.slice(0,k);}}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

$('#btn-toggle').onclick=()=>{state._vis=!state._vis;setReveal();}
$('#btn-siguiente').onclick=()=>{state._i++;state._vis=false;if(state._i>=state.jugadores.length){show('view-jugad');return;}setReveal();}

function setReveal(){const i=state._i,t=state.jugadores.length;$('#prog').textContent=`Jugador ${Math.min(i+1,t)} de ${t}`;$('#etiqueta').textContent=state.jugadores[i]||'';
const box=$('#contenido');if(state._vis){const imp=state.impostores.includes(i);box.textContent=imp?'Eres el IMPOSITOR 👀':state.palabra;box.classList.remove('hidden');$('#btn-toggle').textContent='🙈 Ocultar';}else{box.textContent='— Oculto —';box.classList.add('hidden');$('#btn-toggle').textContent='👁 Mostrar';}}

$('#btn-nueva').onclick=()=>show('view-setup');

async function palabraES(){try{const r=await fetch('https://palabras-aleatorias-public-api.herokuapp.com/random');const j=await r.json();return j.body.Word;}catch(e){return 'cerveza';}}
