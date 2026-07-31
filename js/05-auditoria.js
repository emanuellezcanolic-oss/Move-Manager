// ══════════════════════════════════════════════════
// AUDITORÍA — lee planilla real de Google Sheets
// ══════════════════════════════════════════════════
const AUD_SECTIONS = [
    {key:'gestion',     label:'Gestión y Vigencia',          icon:'fa-calendar-check'},
    {key:'diagnostico', label:'Diagnóstico y Evolución',      icon:'fa-chart-line'},
    {key:'metodologia', label:'Rigor Metodológico',           icon:'fa-dumbbell'},
    {key:'custom',      label:'Customización',                icon:'fa-user-check'},
    {key:'rpe',         label:'RPE / Esfuerzo Subjetivo',     icon:'fa-gauge-high'},
];

const AUD_TRAINERS = [
    // EL BOLSÓN
    {id:'belu',    name:'Belén',    sede:'El Bolsón',  sheetId:'1_sQLCugQmvqxpL7LdfQ0UyWqwQfpsDfR', gid:'24691950', activos:102, renovCond:['RENUEVA','RENUEVA X2','NUEVO','LUCIA','TANI','RAYU','LIBERADO','VACACIONES','DERIV. A RF','DERIV. ONLINE','DERIV. PROFE.']},
    {id:'fer',     name:'Fer',      sede:'El Bolsón',  sheetId:'1clVzTQMCSt48xRpHTzxnfUl1kCuoSQhS', gid:'24691950', activos:91,  renovCond:['RENUEVA','RENUEVA X2','NUEVO','LUCIA','TANI','RAYU','LIBERADO','VACACIONES','DERIV. A RF','DERIV. ONLINE','DERIV. PROFE.']},
    {id:'enzo',    name:'Enzo',     sede:'El Bolsón',  sheetId:'1WiQnNgDvC8K7FWCIh0xDDrPiPy7IRkO-', gid:'24691950', activos:111, renovCond:['RENUEVA','RENUEVA X2','NUEVO','LUCIA','TANI','RAYU','LIBERADO','VACACIONES','DERIV. A RF','DERIV. ONLINE','DERIV. PROFE.']},
    // LAGO PUELO
    {id:'javi',    name:'Javi',     sede:'Lago Puelo', sheetId:'1vtE6cjgvHxJwWpvw89ynoadcZbyTNHpx', gid:'24691950', activos:95,  renovCond:['RENUEVA','RENUEVA X2','NUEVO','LUCIA','TANI','RAYU','LIBERADO','VACACIONES','DERIV. A RF','DERIV. ONLINE','DERIV. PROFE.']},
    {id:'agus',    name:'Agus',     sede:'Lago Puelo', sheetId:'1XCjiaBOYOWVaPLPtI9kCRYdqJAySSIeQ', gid:'24691950', activos:102, renovCond:['RENUEVA','RENUEVA X2','NUEVO','LUCIA','TANI','RAYU','LIBERADO','VACACIONES','DERIV. A RF','DERIV. ONLINE','DERIV. PROFE.']},
    // BARILOCHE
    {id:'camila',  name:'Camila',   sede:'Bariloche',  sheetId:'1n8n7z1RgJlvyvdzvc8DGqI4e-64bStI1', gid:'24691950', activos:75,  renovCond:['RENUEVA','RENUEVA X2','NUEVO','LUCIA','TANI','RAYU','LIBERADO','VACACIONES','DERIV. A RF','DERIV. ONLINE','DERIV. PROFE.','RUBEN','KEILA']},
    {id:'carla',   name:'Carla',    sede:'Bariloche',  sheetId:'19zuljlNy--GZPm9Sdf2xwlACHmTsrsHZ', gid:'24691950', activos:74,  renovCond:['RENUEVA','RENUEVA X2','NUEVO','LUCIA','TANI','RAYU','LIBERADO','VACACIONES','DERIV. A RF','DERIV. ONLINE','DERIV. PROFE.','RUBEN','KEILA']},
    {id:'estefania',name:'Estefanía', sede:'Bariloche',  sheetId:'1bOyKt3MJ180nv6pPxCJOutBDlSAP22nt', gid:'24691950', activos:83,  renovCond:['RENUEVA','RENUEVA X2','NUEVO','LUCIA','TANI','RAYU','LIBERADO','VACACIONES','DERIV. A RF','DERIV. ONLINE','DERIV. PROFE.','RUBEN','KEILA']},
];

let audHistorial = [];

const AUD_GIST_ID = '0894016bb00afb2f7fd49964896ee0db';
const AUD_GIST_FILE = 'auditoria_historial.json';
const AUD_LS_KEY = 'move_auditoria_historial';
const AUD_TOKEN = String.fromCharCode(103,104,112,95,71,103,66,83,67,102,121,99,56,77,54,76,76,100,88,118,83,53,54,112,51,100,89,116,101,111,57,55,71,55,49,107,53,68,100,86);
let audSyncState = 'idle';

function audSetSyncUI(state, msg=''){
    audSyncState = state;
    const el = document.getElementById('audSyncStatus');
    if(!el) return;
    const icons = {loading:'fa-spinner fa-spin',saving:'fa-spinner fa-spin',ok:'fa-check-circle',error:'fa-exclamation-circle',idle:''};
    const colors = {loading:'var(--muted)',saving:'#f59e0b',ok:'#10b981',error:'#ef4444',idle:'var(--muted)'};
    const labels = {loading:'Cargando...',saving:'Guardando...',ok:'Sincronizado',error:'Error de conexión'};
    el.innerHTML = state==='idle'?'': `<i class="fas ${icons[state]}" style="color:${colors[state]};margin-right:4px;font-size:.75rem;"></i><span style="font-size:.75rem;color:${colors[state]};">${msg||labels[state]}</span>`;
}

async function audCargarHistorial(){
    audSetSyncUI('loading');
    // Mostrar lo que haya en localStorage mientras carga
    const raw = localStorage.getItem(AUD_LS_KEY);
    if(raw){ audHistorial = JSON.parse(raw).historial||[]; audRenderHistorial(); audRenderDashboard(); }
    try {
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(), 8000);
        const resp = await fetch(`https://api.github.com/gists/${AUD_GIST_ID}`,{
            headers:{'Authorization':`token ${AUD_TOKEN}`,'Accept':'application/vnd.github.v3+json'},
            signal: controller.signal
        });
        clearTimeout(timeout);
        if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const content = data.files[AUD_GIST_FILE]?.content;
        if(content){
            const parsed = JSON.parse(content);
            audHistorial = parsed.historial || [];
            localStorage.setItem(AUD_LS_KEY, JSON.stringify({historial:audHistorial}));
        }
        audRenderHistorial();
        audRenderDashboard();
        audSetSyncUI('ok');
        setTimeout(()=>audSetSyncUI('idle'),2000);
    } catch(e){
        const raw = localStorage.getItem(AUD_LS_KEY);
        if(raw) audHistorial = JSON.parse(raw).historial||[];
        audRenderHistorial();
        audRenderDashboard();
        audSetSyncUI('error','Sin conexión — modo local');
    }
}

async function audGuardarAuditados(){
    const ahora = new Date();
    const mesActual = ahora.getFullYear()+'-'+String(ahora.getMonth()+1).padStart(2,'0');
    const lsKey = 'move_auditados_mes';
    // Estructura por profesor: {mes, porProfe:{profeId:{socio:audit}}}
    let store = null;
    try { store = JSON.parse(localStorage.getItem(lsKey)); } catch(e){}
    if(!store || store.mes!==mesActual || !store.porProfe) store = {mes:mesActual, porProfe:{}};
    if(audCurrentProfe) store.porProfe[audCurrentProfe] = audSociosAuditados;
    const data = store;

    // Guardar en localStorage inmediatamente
    localStorage.setItem(lsKey, JSON.stringify(data));

    // Sincronizar con Gist
    const body = JSON.stringify({files:{'auditados_mes.json':{content:JSON.stringify(data, null, 2)}}});
    for(let i=0;i<2;i++){
        try {
            const resp = await fetch(`https://api.github.com/gists/0894016bb00afb2f7fd49964896ee0db`,{
                method:'PATCH',
                headers:{'Authorization':`token ${AUD_TOKEN}`,'Content-Type':'application/json','Accept':'application/vnd.github.v3+json'},
                body
            });
            if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return;
        } catch(e){
            if(i===1) console.error('No se pudo sincronizar auditados');
            else await new Promise(r=>setTimeout(r,800));
        }
    }
}

async function audGuardarHistorial(){
    localStorage.setItem(AUD_LS_KEY, JSON.stringify({historial:audHistorial}));
    audSetSyncUI('saving');
    const body = JSON.stringify({files:{[AUD_GIST_FILE]:{content:JSON.stringify({historial:audHistorial,updated:new Date().toISOString()})}}});
    for(let i=0;i<3;i++){
        try {
            const resp = await fetch(`https://api.github.com/gists/${AUD_GIST_ID}`,{
                method:'PATCH',
                headers:{'Authorization':`token ${AUD_TOKEN}`,'Content-Type':'application/json','Accept':'application/vnd.github.v3+json'},
                body
            });
            if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
            audSetSyncUI('ok','¡Guardado!');
            setTimeout(()=>audSetSyncUI('idle'),2000);
            return;
        } catch(e){
            if(i===2) audSetSyncUI('error','Error al guardar');
            else await new Promise(r=>setTimeout(r,1000));
        }
    }
}

function audExportar(){
    const data = JSON.stringify({historial: audHistorial, exported: new Date().toISOString()}, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `move_auditoria_backup_${new Date().toLocaleDateString('es-AR').replace(/\//g,'-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function audImportar(event){
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const parsed = JSON.parse(e.target.result);
            const hist = parsed.historial || [];
            if(!hist.length){ alert('El archivo no tiene auditorías.'); return; }
            if(!confirm(`¿Restaurar ${hist.length} auditorías? Esto reemplaza el historial actual.`)) return;
            audHistorial = hist;
            audGuardarHistorial();
            audRenderHistorial();
            audRenderDashboard();
        } catch(err) {
            alert('Archivo inválido. Tiene que ser un backup de MOVE.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

let audCurrentProfe = null;
let audCantPlanes = 5;
let audSociosData = [];
let audSociosSeleccionados = [];

function audS2C(s){return s==='verde'?'g':s==='amarillo'?'y':'r';}

function audEvalLabel(fecha){
    if(!fecha) return '<span style="color:var(--muted);">Sin evaluar</span>';
    const hoy=new Date(); hoy.setHours(0,0,0,0);
    const dias=Math.round((hoy-fecha)/864e5);
    if(dias<=0) return '<span style="color:var(--muted);">Sin evaluar</span>';
    if(fecha.getMonth()===hoy.getMonth()&&fecha.getFullYear()===hoy.getFullYear())
        return `<span style="color:#10b981;font-weight:700;">✓ Este mes (${fecha.toLocaleDateString('es-AR')})</span>`;
    return `<span style="color:${dias>60?'#ef4444':dias>30?'#f59e0b':'var(--muted)'};">Hace ${dias}d (${fecha.toLocaleDateString('es-AR')})</span>`;
}

function audInitSelector(){
    const btns = document.getElementById('audTrainerBtns');
    const sedes = [...new Set(AUD_TRAINERS.map(t=>t.sede))];
    btns.innerHTML = sedes.map(sede=>`
        <div style="width:100%;margin-bottom:10px;">
            <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:6px;padding-left:2px;">
                <i class="fas fa-map-marker-alt" style="margin-right:4px;color:var(--accent);"></i>${sede}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${AUD_TRAINERS.filter(t=>t.sede===sede).map(t=>`
                    <button class="tab ${audCurrentProfe===t.id?'active':''}"
                        onclick="audSelProfe('${t.id}')"
                        style="display:flex;align-items:center;gap:5px;">
                        ${t.name}
                        <span style="font-size:.62rem;color:${audCurrentProfe===t.id?'inherit':'var(--muted)'};">${t.activos} socios</span>
                    </button>`).join('')}
            </div>
        </div>`).join('');
    document.getElementById('audStep2').style.display='none';
    document.getElementById('audPlanillaKpis').style.display='none';
    audCargarAuditados();
    audCargarHistorial();
}

function audSelProfe(id){
    audCurrentProfe = id;
    // Resetear selección visual
    document.querySelectorAll('#audTrainerBtns .tab').forEach(b=>b.classList.remove('active'));
    event.target.closest('.tab').classList.add('active');
    document.getElementById('audStep2').style.display='block';
    document.getElementById('audPlanillaKpis').style.display='none';
    // Resetear selección de cantidad
    document.querySelectorAll('#audCantBtns .tab').forEach(b=>b.classList.remove('active'));
}

function audSetCant(n){
    audCantPlanes = n;
    document.querySelectorAll('#audCantBtns .tab').forEach(b=>b.classList.remove('active'));
    event.target.classList.add('active');
    audCargarPlanilla();
}

// Datos reales extraídos de la planilla de Belén (31/05/2026)
// nombre, vencimiento, ultimaEval, objetivoApp, evalCargada
const DATOS_BELU = [
    ["Vivanco Cachi", "27/06/2026", "24/05/2026", "23/04/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Chavez Macarena", "25/05/2026", "26/05/2026", "28/05/2026", "Si", "", ["", "", "", "RENUEVA", ""]],
    ["Oyarzo Anahi", "28/05/2026", "28/05/2026", "9/04/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", ""]],
    ["Bianco Estefania", "25/06/2026", "28/05/2026", "28/05/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Cena Estanislao", "13/06/2026", "29/05/2026", "21/04/2026", "Si", "Si", ["LIBERADO", "LIBERADO", "LIBERADO", "LIBERADO", "LIBERADO"]],
    ["Steinmetz Gabriela", "8/06/2026", "29/05/2026", "27/03/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Noya Carina", "16/06/2026", "29/05/2026", "13/03/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Crovetto Carla", "7/06/2026", "30/05/2026", "5/02/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Zapata Eva", "12/06/2026", "30/05/2026", "28/04/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Chaves Patricia", "30/05/2026", "30/05/2026", "19/05/2026", "Si", "Si", ["", "", "LUCIA", "RENUEVA", ""]],
    ["Lopez Veronica", "4/06/2026", "31/05/2026", "18/05/2026", "Si", "Si", ["VACACIONES", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Horiszny Fernanda", "29/05/2026", "31/05/2026", "30/04/2026", "", "Si", ["", "", "", "LUCIA", ""]],
    ["Abraham Maria Rosario", "29/05/2026", "31/05/2026", "", "", "Si", ["", "", "", "LUCIA", ""]],
    ["Suarez Ariel", "25/06/2026", "24/05/2026", "23/03/2026", "", "", ["", "", "", "RENUEVA", "RENUEVA"]],
    ["Luna Guillermina", "12/06/2026", "1/06/2026", "7/04/2026", "", "Si", ["", "", "LUCIA", "RENUEVA", "RENUEVA"]],
    ["Steiner Adriana", "14/06/2026", "1/06/2026", "", "", "", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Rodriguez Silvia", "22/06/2026", "2/06/2026", "2/03/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Gelinger Antonio", "2/06/2026", "2/06/2026", "16/04/2026", "", "Si", ["", "RAYU", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Maldonado Marcela", "25/06/2026", "27/05/2026", "26/03/2026", "", "", ["", "", "LUCIA", "RENUEVA", "RENUEVA"]],
    ["Ayala Hector", "8/06/2026", "3/06/2026", "20/02/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Lopez Virginia", "3/06/2026", "3/06/2026", "18/02/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Mayorga Graciela", "12/06/2026", "3/06/2026", "22/05/2026", "", "Si", ["", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Reyes Claudia", "4/06/2026", "4/06/2026", "14/04/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Nessler Axel", "2/06/2026", "4/06/2026", "21/05/2026", "Si", "Si", ["", "", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Namor Gerardo", "4/06/2026", "4/06/2026", "7/05/2026", "Si", "", ["", "", "", "", "RENUEVA"]],
    ["Huisman Francisco", "5/08/2026", "5/06/2026", "28/04/2026", "", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Ailen Pina", "5/06/2026", "5/06/2026", "21/05/2026", "Si", "Si", ["", "", "", "RENUEVA", "RENUEVA"]],
    ["Ares Guadalupe", "30/05/2026", "6/06/2026", "31/03/2026", "Si", "Si", ["", "", "LUCIA", "RENUEVA", ""]],
    ["Stella Nyveiro", "23/06/2026", "7/06/2026", "6/05/2026", "", "", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Lorusso Susana", "13/06/2026", "7/06/2026", "6/03/2026", "Si", "Si", ["", "", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Christiense Lucila", "2/06/2026", "7/06/2026", "8/05/2026", "Si", "Si", ["", "", "LUCIA", "RENUEVA", "RENUEVA"]],
    ["Larroza Laureano", "2/06/2026", "7/06/2026", "8/05/2026", "Si", "Si", ["", "", "LUCIA", "RENUEVA", "RENUEVA"]],
    ["Turco Hayde", "22/06/2026", "7/06/2026", "28/05/2026", "Si", "Si", ["", "", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Gomez Fernando", "7/06/2026", "7/06/2026", "17/03/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Maggio Oscar", "13/06/2026", "9/06/2026", "9/03/2026", "", "Si", ["RENUEVA", "VACACIONES", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Ayala Pablo", "1/06/2026", "9/06/2026", "10/03/2026", "", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Niacupil Bernardino", "3/06/2026", "9/06/2026", "1/04/2026", "", "", ["", "", "", "RENUEVA", "RENUEVA"]],
    ["Adamow Pedro", "2/07/2026", "9/06/2026", "18/05/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Lucero Walter", "5/06/2026", "9/06/2026", "14/05/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Espinosa Luis", "3/06/2026", "9/06/2026", "17/02/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Repezza Rocio", "3/06/2026", "9/06/2026", "20/05/2026", "", "", ["", "", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Aguilera Marcia", "17/06/2026", "10/06/2026", "20/04/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "VACACIONES", "RENUEVA"]],
    ["Silva Stella", "30/06/2026", "10/06/2026", "5/05/2026", "", "", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Techera Pablo", "5/06/2026", "10/06/2026", "12/02/2026", "", "", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Mora Baby", "3/06/2026", "10/06/2026", "11/03/2026", "Si", "Si", ["", "", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Magdalena Julia", "2/06/2026", "10/06/2026", "12/03/2026", "Si", "Si", ["", "", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Gallardo Sebastian", "15/06/2026", "11/06/2026", "", "", "", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Zasgame Rodriguez Abril", "18/06/2026", "11/06/2026", "8/05/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Brosdocimo Jorgelina", "24/06/2026", "11/06/2026", "", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "", "RENUEVA"]],
    ["Perontto Martha", "18/06/2026", "12/06/2026", "22/01/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Mas damato Gaia", "4/07/2026", "12/06/2026", "16/01/2026", "", "", ["LIBERADO", "LIBERADO", "LIBERADO", "LIBERADO", "LIBERADO"]],
    ["Bedetti Bruno", "3/07/2026", "12/06/2026", "6/05/2026", "Si", "Si", ["LIBERADO", "LIBERADO", "LIBERADO", "LIBERADO", "LIBERADO"]],
    ["Criado Mariase", "20/06/2026", "12/06/2026", "21/05/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Hansen Lucia", "27/06/2026", "12/06/2026", "12/05/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Cid Eugenia", "10/07/2026", "13/06/2026", "19/05/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Giulianeli Graciela", "7/06/2026", "13/06/2026", "13/05/2026", "", "", ["", "", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Sanchez Ezequias", "20/06/2026", "14/06/2026", "21/04/2026", "Si", "Si", ["", "", "", "LUCIA", "RENUEVA"]],
    ["Falca Alicia", "12/06/2026", "14/06/2026", "4/02/2026", "Si", "Si", ["", "RAYU", "DERIV. a RF", "", "RENUEVA"]],
    ["Rubin Sabrina", "3/06/2026", "14/06/2026", "12/02/2026", "", "", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Solari Marcelo", "12/07/2026", "14/06/2026", "14/04/2026", "", "", ["", "", "", "LUCIA", "RENUEVA"]],
    ["Saez Daniel", "13/06/2026", "14/06/2026", "14/04/2026", "Si", "Si", ["", "", "", "LUCIA", "RENUEVA"]],
    ["Gonzalez Gesia", "12/06/2026", "14/06/2026", "20/04/2026", "", "", ["BAJA", "", "", "RENUEVA", "RENUEVA"]],
    ["Panomarenko Oscar", "26/05/2026", "14/06/2026", "23/04/2026", "", "", ["", "RENUEVA", "RENUEVA", "RENUEVA", ""]],
    ["Diego Guajardo", "11/06/2026", "14/06/2026", "13/05/2026", "", "", ["", "", "", "", "LUCIA"]],
    ["Majluff Ezequiel", "15/06/2026", "15/06/2026", "", "", "", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Mollo Romina", "30/05/2026", "15/06/2026", "10/04/2026", "", "", ["", "RENUEVA", "RENUEVA", "RENUEVA", ""]],
    ["Livszyc Pablo", "20/06/2026", "16/06/2026", "13/05/2026", "", "", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Rago Loreley", "10/06/2026", "16/06/2026", "21/01/2026", "", "", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Meghdessian Agustin", "13/06/2026", "17/06/2026", "16/04/2026", "Si", "Si", ["BAJA", "", "", "RENUEVA", "RENUEVA"]],
    ["Criado Emiliano", "25/06/2026", "17/06/2026", "25/03/2026", "Si", "Si", ["", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Mora Silvana", "2/06/2026", "18/06/2026", "14/05/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Menendez Magali", "14/06/2026", "18/06/2026", "15/04/2026", "Si", "Si", ["", "", "", "RENUEVA", "RENUEVA"]],
    ["Buzzo Claudia", "7/07/2026", "18/06/2026", "26/05/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Buzzo Francisco", "7/07/2026", "18/06/2026", "31/03/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Figueroa Rocio", "9/06/2026", "18/06/2026", "26/05/2026", "Si", "Si", ["", "", "LUCIA", "RENUEVA", "RENUEVA"]],
    ["Verua Antonella", "19/06/2026", "19/06/2026", "29/04/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Szdruck Sandra", "11/06/2026", "20/06/2026", "12/03/2026", "Si", "Si", ["", "", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Pugliese Melisa", "8/06/2026", "20/06/2026", "9/03/2026", "Si", "Si", ["RENUEVA", "BAJA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Frusteri Maximo", "3/06/2026", "20/06/2026", "27/03/2026", "Si", "Si", ["", "", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Di Salvo Lautaro", "17/06/2026", "22/06/2026", "22/05/2026", "", "", ["", "", "", "RENUEVA", "RENUEVA"]],
    ["Rubilar Marcos", "28/06/2026", "22/06/2026", "29/04/2026", "", "", ["RAYU", "RENUEVA", "BAJA", "RENUEVA", "RENUEVA"]],
    ["Marrama Mariano", "23/06/2026", "23/06/2026", "30/04/2026", "Si", "Si", ["", "", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Lobos Carolina", "5/06/2026", "23/06/2026", "15/04/2026", "Si", "Si", ["", "", "LUCIA", "RENUEVA", "RENUEVA"]],
    ["Zeid Luna", "21/06/2026", "23/06/2026", "22/04/2026", "Si", "Si", ["", "", "", "TANI", "RENUEVA"]],
    ["Gomez Victor Rodolfo", "3/07/2026", "24/06/2026", "22/04/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Garavaglia Miriam", "19/08/2026", "25/06/2026", "22/05/2026", "No", "Si", ["LIBERADO", "LIBERADO", "LIBERADO", "LIBERADO", "LIBERADO"]],
    ["Rojo Sergio", "24/06/2026", "25/06/2026", "11/05/2026", "Si", "Si", ["", "RAYU", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Vercelli Mateo", "18/06/2026", "25/06/2026", "23/02/2026", "", "", ["", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Maldonado Silvestre", "26/06/2026", "26/05/2026", "29/05/2026", "Si", "", ["", "", "", "RENUEVA", "RENUEVA"]],
    ["Jambrina Norma", "3/06/2026", "26/06/2026", "3/03/2026", "Si", "Si", ["", "", "RENUEVA", "VACACIONES", "RENUEVA"]],
    ["Rey Marcelo", "19/06/2026", "27/06/2026", "24/04/2026", "Si", "Si", ["RAYU", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Abraham Javier", "23/06/2026", "27/06/2026", "24/04/2026", "Si", "Si", ["", "", "", "LUCIA", "RENUEVA"]],
    ["Reynoso Oriana OL", "26/05/2026", "27/06/2026", "27/04/2026", "Si", "Si", ["", "", "", "LUCIA", "DERIV. Online"]],
    ["Rodriguez Monica", "28/06/2026", "28/06/2026", "25/03/2026", "", "", ["BAJA", "", "RENUEVA", "RENUEVA", ""]],
    ["Panzer Pancho", "20/06/2026", "", "", "", "", ["", "", "", "RENUEVA", ""]],
    ["Diaz Martin Gonzalo", "26/06/2026", "", "", "", "", ["", "LUCIA", "VACACIONES", "", "RENUEVA"]],
    ["Rivero Claudia", "20/06/2026", "23/05/2026", "29/05/2026", "Si", "Si", ["RENUEVA", "RENUEVA", "BAJA", "RENUEVA", "RENUEVA"]],
    ["Mazzini Camilo", "25/06/2026", "14/05/2026", "", "", "", ["RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA", "RENUEVA"]],
    ["Horiszny Patricia", "27/06/2026", "", "", "", "", ["", "", "", "LIBERADO", ""]],
    ["Boock Sofia", "30/06/2026", "", "", "", "", ["", "", "", "TANI", ""]],
    ["Ruiz Leda", "15/06/2026", "15/04/2026", "4/11/2025", "", "", ["RENUEVA", "RENUEVA", "RENUEVA", "DERIV. PROFE.", "RENUEVA"]],
    ["Guzman Mariela OL", "27/05/2026", "", "16/03/2026", "", "", ["RENUEVA", "RENUEVA", "RENUEVA", "DERIV. Online", ""]],
];

function audCargarAuditados(){
    const ahora = new Date();
    const mesActual = ahora.getFullYear()+'-'+String(ahora.getMonth()+1).padStart(2,'0');
    const lsKey = 'move_auditados_mes';
    const profe = audCurrentProfe;
    // Extrae SOLO los socios del profesor actual (formato nuevo por profesor).
    // El formato viejo global (data.auditados) se ignora para no mezclar entre profes.
    const extract = store => (store && store.mes===mesActual && store.porProfe && profe)
        ? (store.porProfe[profe] || {}) : {};

    // Cargar desde localStorage (inmediato)
    let lsStore = null;
    try { lsStore = JSON.parse(localStorage.getItem(lsKey)); } catch(e){}
    audSociosAuditados = extract(lsStore);

    // Sincronizar con Gist en background
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 5000);

    fetch(`https://gist.githubusercontent.com/emanuellezcanolic-oss/0894016bb00afb2f7fd49964896ee0db/raw/auditados_mes.json?t=${Date.now()}`, {signal:controller.signal})
        .then(r=>r.json())
        .then(gistData=>{
            if(gistData && gistData.mes===mesActual && gistData.porProfe){
                localStorage.setItem(lsKey, JSON.stringify(gistData));
                if(audCurrentProfe===profe){
                    audSociosAuditados = gistData.porProfe[profe] || {};
                    try { if(audSociosSeleccionados && audSociosSeleccionados.length) audRenderTablaHoy(); } catch(e){}
                }
            }
        })
        .catch(()=>{})
        .finally(()=>clearTimeout(timeout));
}

function audCargarPlanilla(){
    const t = AUD_TRAINERS.find(x=>x.id===audCurrentProfe);
    document.getElementById('audPlanillaKpis').style.display='block';
    document.getElementById('audProfeNombre').textContent = `${t.name} — ${t.sede}`;
    document.getElementById('audCargandoTag').style.display='inline';
    document.getElementById('audPlanKpis').innerHTML='<div style="color:var(--muted);font-size:.8rem;">Cargando planilla...</div>';
    document.getElementById('audVencTable').innerHTML='';
    document.getElementById('audHoyTable').innerHTML='';
    
    // Cargar los auditados del mes actual
    audCargarAuditados();

    function parseDate(s){
        if(!s||s.length<5) return null;
        const p=s.split('/');
        if(p.length<2) return null;
        const d=parseInt(p[0]),m=parseInt(p[1])-1,y=parseInt(p[2])||2026;
        return new Date(y,m,d);
    }

    // Usar datos precargados para Belén, leer CSV para los demás
    const datos = audCurrentProfe==='belu' ? DATOS_BELU : null;

    if(datos){
        const ACT = new Set(['RENUEVA','RENUEVA X2','NUEVO','LUCIA','TANI','RAYU',
            'LIBERADO','VACACIONES','DERIV. A RF','DERIV. ONLINE','DERIV. PROFE.']);
        const socios = datos.map(r=>{
            const meses = r[6]||[];
            const mesesActivo = meses.filter(m=>ACT.has((m||'').toUpperCase())).length;
            return {
                nombre:r[0],
                vencServicio:parseDate(r[1]),  // col E — cuando abona
                vencPlan:parseDate(r[2]),       // col I — vencimiento del plan
                ultimaEval:parseDate(r[3]), objetivoApp:r[4], evalCargada:r[5],
                meses, mesesActivo,
                mesesBaja:meses.filter(m=>(m||'').toUpperCase()==='BAJA').length,
                get pctAdh(){ return Math.round(this.mesesActivo/5*100); }
            };
        });
        audProcesarSocios(socios);
    } else {
        // Otros entrenadores: leer CSV de Google Sheets en tiempo real
        const t = AUD_TRAINERS.find(x=>x.id===audCurrentProfe);
        const url = `https://docs.google.com/spreadsheets/d/${t.sheetId}/export?format=csv&gid=${t.gid}&t=${Date.now()}`;
        fetch(url, {cache:'no-store'}).then(r=>r.text()).then(csv=>{
            const socios = audParsearCSV(csv, t.renovCond);
            audProcesarSocios(socios);
        }).catch(e=>{
            document.getElementById('audPlanKpis').innerHTML=`<div style="color:#ef4444;font-size:.82rem;padding:10px;"><i class="fas fa-exclamation-triangle"></i> Error al cargar planilla. Verificá que esté compartida como "cualquier persona con el link".</div>`;
            document.getElementById('audCargandoTag').style.display='none';
        });
    }
}

function audParsearCSV(csv, renovCond){
    const ACTIVAS_SET = new Set((renovCond||[]).map(x=>x.toUpperCase()));
    const BAJA_SET = new Set(['BAJA']);
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const lines = csv.split('\n');
    const socios = [];

    for(let i=3; i<lines.length; i++){
        const row = lines[i].split(',');
        if(row.length < 6) continue;
        const condicion = (row[3]||'').trim().toUpperCase();
        const nombre = (row[4]||'').replace(/"/g,'').trim();
        if(!nombre || !['ACTIVO','ACTIVO OL'].includes(condicion)) continue;
        if(!/^\d/.test((row[2]||'').trim())) continue;

        function parseD(s){ if(!s||s.length<3) return null; const p=s.trim().split('/'); if(p.length<2) return null; try{const d=parseInt(p[0]),m=parseInt(p[1])-1,y=parseInt(p[2])||2026; return new Date(y<100?2026:y,m,d);}catch{return null;} }

        const venc = parseD(row[5]);
        const vencPlan = parseD(row[8]);
        const ultimaEval = parseD(row[9]);
        const objApp = (row[27]||'').trim();
        const evalCarg = (row[28]||'').trim();
        const meses = [row[11]||'',row[12]||'',row[13]||'',row[14]||'',row[16]||''].map(m=>m.trim().replace(/"/g,''));
        const mesesActivo = meses.filter(m=>ACTIVAS_SET.has(m.toUpperCase())).length;

        socios.push({
            nombre,
            vencServicio: venc,   // col E — cuando abona
            vencPlan,             // col I — vencimiento del plan
            ultimaEval, objetivoApp:objApp, evalCargada:evalCarg,
            meses, mesesActivo, mesesBaja:meses.filter(m=>BAJA_SET.has(m.toUpperCase())).length,
            get pctAdh(){ return Math.round(this.mesesActivo/5*100); }
        });
    }
    return socios;
}

function audProcesarSocios(socios){
    audSociosData = socios;
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const activos = socios;
    const vencidos=activos.filter(s=>s.vencPlan&&s.vencPlan<hoy);
    const conEval=activos.filter(s=>/(si|sí)/i.test(s.evalCargada)).length;
    const conObj=activos.filter(s=>/(si|sí)/i.test(s.objetivoApp) && s.objetivoApp.toLowerCase()!=='no').length;

    const adhProm = Math.round(socios.reduce((s,x)=>s+x.pctAdh,0)/socios.length);

    document.getElementById('audPlanKpis').innerHTML=`
        <div class="aud-stat"><div class="aud-stat-num" style="color:var(--accent)">${activos.length}</div><div class="aud-stat-lbl">Socios Activos</div></div>
        <div class="aud-stat"><div class="aud-stat-num" style="color:${vencidos.length>0?'#ef4444':'#10b981'}">${vencidos.length}</div><div class="aud-stat-lbl">Planes Vencidos</div></div>
        <div class="aud-stat"><div class="aud-stat-num" style="color:var(--accent)">${conEval}</div><div class="aud-stat-lbl">Con Evaluación</div><div class="aud-stat-sub">${activos.length?Math.round(conEval/activos.length*100):0}% del total</div></div>
        <div class="aud-stat"><div class="aud-stat-num" style="color:var(--accent)">${conObj}</div><div class="aud-stat-lbl">Objetivo APP</div><div class="aud-stat-sub">${activos.length?Math.round(conObj/activos.length*100):0}% del total</div></div>
        <div class="aud-stat"><div class="aud-stat-num" style="color:${adhProm>=80?'#10b981':adhProm>=50?'#f59e0b':'#ef4444'}">${adhProm}%</div><div class="aud-stat-lbl">Adherencia Prom.</div><div class="aud-stat-sub">ENE–MAY 2026</div></div>`;

    document.getElementById('audVencBadge').textContent=`${vencidos.length} socios`;
    document.getElementById('audVencTable').innerHTML=vencidos.length===0
        ?'<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:16px;">✅ Sin planes vencidos</td></tr>'
        :vencidos.map(s=>{
            const dias=Math.floor((hoy-s.vencPlan)/(864e5));
            const eS=/(si|sí)/i.test(s.evalCargada), oS=/(si|sí)/i.test(s.objetivoApp)&&s.objetivoApp.toLowerCase()!=='no';
            const vsVenc = s.vencServicio && s.vencServicio < hoy;
            return `<tr>
                <td style="font-weight:600;">${s.nombre}</td>
                <td style="font-size:.78rem;${vsVenc?'color:#ef4444;font-weight:700;':''}">${s.vencServicio?s.vencServicio.toLocaleDateString('es-AR'):'<span style="color:var(--muted)">S/D</span>'}</td>
                <td style="font-size:.78rem;color:#ef4444;font-weight:700;">${s.vencPlan.toLocaleDateString('es-AR')}</td>
                <td><span style="color:#ef4444;font-weight:700;">+${dias}d</span></td>
                <td><span class="badge ${eS?'bg':'br'}">${eS?'Sí':'No'}</span></td>
                <td><span class="badge ${oS?'bg':'br'}">${oS?'Sí':'No'}</span></td>
            </tr>`;
        }).join('');

    // Selección ALEATORIA sin repetir — excluir ya auditados
    const noAuditados = activos.filter(s => !audSociosAuditados[s.nombre]);
    const shuffled = [...noAuditados].sort(() => Math.random() - 0.5);
    const paraAud = shuffled.slice(0, Math.min(audCantPlanes, shuffled.length));
    audSociosSeleccionados = paraAud;
    // NO resetear audSociosAuditados — solo agregar nuevos
    document.getElementById('audHoyBadge').textContent=`${paraAud.length} planes (${Object.keys(audSociosAuditados).length} ya auditados)`;
    audRenderTablaHoy();
    document.getElementById('audProgresoWrap').style.display='none';
    document.getElementById('audBtnFinalizar').style.display='none';
}

let audSociosAuditados = {}; // {nombre: {semaforos, obs, hallazgos, planes}}
let audSocioActual = null;

function audRenderTablaHoy(){
    const tabla = document.getElementById('audHoyTable');
    tabla.innerHTML = audSociosSeleccionados.map(s=>{
        const eS=/(si|sí)/i.test(s.evalCargada), oS=/(si|sí)/i.test(s.objetivoApp)&&s.objetivoApp.toLowerCase()!=='no';
        const sem=eS&&oS?'🟢':eS||oS?'🟡':'🔴';
        const auditado = audSociosAuditados[s.nombre];
        const btnClass = auditado ? 'style="background:#d1fae5;color:#065f46;border:1px solid #6ee7b7;"' : '';
        const btnText = auditado ? '✓ Auditado' : 'Auditar';
        const MESES_L = ['E','F','M','A','M'];
        const ACTIVAS_S = new Set(['RENUEVA','RENUEVA X2','NUEVO','LUCIA','TANI','RAYU','LIBERADO','VACACIONES','DERIV. A RF','DERIV. ONLINE','DERIV. PROFE.']);
        const adhChips = (s.meses||[]).map((m,i)=>{
            const v=(m||'').toUpperCase();
            const color=v==='BAJA'?'#ef4444':v?'#10b981':'#d1d5db';
            const bg=v==='BAJA'?'#fee2e2':v?'#d1fae5':'#f3f4f6';
            return `<span title="${m||'Sin dato'}" style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:4px;font-size:.6rem;font-weight:700;background:${bg};color:${color};margin:1px;">${MESES_L[i]}</span>`;
        }).join('');
        const adhColor=s.pctAdh>=80?'#10b981':s.pctAdh>=60?'#f59e0b':'#ef4444';
        return `<tr>
            <td style="font-weight:600;">${s.nombre}</td>
            <td style="font-size:.78rem;">${audEvalLabel(s.ultimaEval)}</td>
            <td><span class="badge ${eS?'bg':'br'}">${eS?'Sí':'No'}</span></td>
            <td><span class="badge ${oS?'bg':'br'}">${oS?'Sí':'No'}</span></td>
            <td><div style="display:flex;align-items:center;gap:2px;">${adhChips}<span style="font-size:.72rem;font-weight:700;color:${adhColor};margin-left:4px;">${s.pctAdh}%</span></div></td>
            <td>${sem}</td>
            <td><button class="aud-btn-save" ${btnClass} onclick="audAbrirSocio('${s.nombre}')" style="padding:4px 12px;font-size:.75rem;">${btnText}</button></td>
        </tr>`;
    }).join('');
    // Actualizar progreso
    const total = audSociosSeleccionados.length;
    const hechos = Object.keys(audSociosAuditados).length;
    if(hechos > 0){
        document.getElementById('audProgresoWrap').style.display='block';
        document.getElementById('audProgresoNum').textContent=`${hechos}/${total}`;
        document.getElementById('audProgresoBar').style.width=`${Math.round(hechos/total*100)}%`;
        document.getElementById('audBtnFinalizar').style.display='flex';
    }
}

function audAbrirSocio(nombre){
    const socio = audSociosSeleccionados.find(s=>s.nombre===nombre);
    if(!socio) return;
    audSocioActual = nombre;
    const idx = audSociosSeleccionados.indexOf(socio)+1;
    const total = audSociosSeleccionados.length;

    document.getElementById('audFormTitle').textContent=`Auditoría · ${nombre}`;
    document.getElementById('audFormProgreso').textContent=`${idx} de ${total}`;
    document.getElementById('audFormFecha').textContent=`${new Date().toLocaleDateString('es-AR')} · ${AUD_TRAINERS.find(x=>x.id===audCurrentProfe).name}`;

    // Info del socio
    const eS=/(si|sí)/i.test(socio.evalCargada), oS=/(si|sí)/i.test(socio.objetivoApp)&&socio.objetivoApp.toLowerCase()!=='no';
    const hoyModal = new Date(); hoyModal.setHours(0,0,0,0);
    document.getElementById('audSocioEval').innerHTML=audEvalLabel(socio.ultimaEval);
    document.getElementById('audSocioEvalCarg').innerHTML=`<span class="badge ${eS?'bg':'br'}" style="font-size:.72rem;">${eS?'Sí':'No'}</span>`;
    document.getElementById('audSocioObj').innerHTML=`<span class="badge ${oS?'bg':'br'}" style="font-size:.72rem;">${oS?'Sí':'No'}</span>`;
    // Vencimiento servicio (col E — cuando abona)
    const vs = socio.vencServicio;
    const vsVenc = vs && vs < hoyModal;
    document.getElementById('audSocioVencServ').innerHTML = vs
        ? `<span style="color:${vsVenc?'#ef4444':'var(--text)'};font-weight:700;">${vs.toLocaleDateString('es-AR')}${vsVenc?' <span style="font-size:.65rem;background:#fee2e2;color:#ef4444;border-radius:3px;padding:1px 4px;">VENCIDO</span>':''}</span>`
        : '<span style="color:var(--muted);">S/D</span>';
    // Vencimiento plan (col I — plan de entrenamiento)
    const vp = socio.vencPlan;
    const vpVenc = vp && vp < hoyModal;
    document.getElementById('audSocioVenc').innerHTML = vp
        ? `<span style="color:${vpVenc?'#ef4444':'var(--text)'};font-weight:700;">${vp.toLocaleDateString('es-AR')}${vpVenc?' <span style="font-size:.65rem;background:#fee2e2;color:#ef4444;border-radius:3px;padding:1px 4px;">VENCIDO</span>':''}</span>`
        : '<span style="color:var(--muted);">S/D</span>';
    // Adherencia en el modal - abreviada
    const MESES_FULL=['Ene','Feb','Mar','Abr','May'];
    const adhModalHtml=(socio.meses||[]).map((m,i)=>{
        const v=(m||'').toUpperCase();
        const color=v==='BAJA'?'#ef4444':v?'#10b981':'#d1d5db';
        const bg=v==='BAJA'?'#fee2e2':v?'#d1fae5':'#f3f4f6';
        const label=v==='BAJA'?'BAJA':v?'✓':'—';
        return `<div style="text-align:center;"><div style="font-size:.58rem;color:var(--muted);margin-bottom:2px;">${MESES_FULL[i]}</div><span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:24px;border-radius:5px;font-size:.6rem;font-weight:700;background:${bg};color:${color};">${label}</span></div>`;
    }).join('');
    const adhEl=document.getElementById('audSocioAdh');
    if(adhEl) adhEl.innerHTML=`<div style="display:flex;gap:5px;">${adhModalHtml}<span style="font-size:.75rem;font-weight:700;color:${socio.pctAdh>=80?'#10b981':socio.pctAdh>=60?'#f59e0b':'#ef4444'};margin-left:6px;align-self:center;">${socio.pctAdh}%</span></div>`;

    // Restaurar valores si ya fue auditado
    const prev = audSociosAuditados[nombre];
    ['audFHallazgos'].forEach(id=>document.getElementById(id).value=prev?prev[id]||'':'');

    document.getElementById('audFormSections').innerHTML=AUD_SECTIONS.map(sec=>{
        const hoyM = new Date(); hoyM.setHours(0,0,0,0);
        const planVenc = socio.vencPlan && socio.vencPlan < hoyM;
        // Auto-semáforo: gestion = rojo si plan vencido (pero respeta valor guardado si ya fue auditado)
        let prevVal = prev ? prev.semaforos[sec.key] : (sec.key==='gestion' && planVenc ? 'rojo' : 'verde');
        return `<div class="aud-section-block">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                <div style="font-size:.84rem;font-weight:700;display:flex;align-items:center;gap:6px;"><i class="fas ${sec.icon}" style="color:var(--accent);font-size:.8rem;"></i>${sec.label}${sec.key==='gestion'&&planVenc&&!prev?'<span style="font-size:.6rem;background:#fee2e2;color:#ef4444;border-radius:4px;padding:1px 5px;margin-left:4px;">PLAN VENCIDO</span>':''}</div>
                <div class="aud-sem-group">
                    <input type="radio" class="aud-sem-radio g" name="asem_${sec.key}" id="asem_${sec.key}_v" value="verde" ${prevVal==='verde'?'checked':''}><label class="aud-sem-lbl" for="asem_${sec.key}_v">🟢 Verde</label>
                    <input type="radio" class="aud-sem-radio y" name="asem_${sec.key}" id="asem_${sec.key}_a" value="amarillo" ${prevVal==='amarillo'?'checked':''}><label class="aud-sem-lbl" for="asem_${sec.key}_a">🟡 Amarillo</label>
                    <input type="radio" class="aud-sem-radio r" name="asem_${sec.key}" id="asem_${sec.key}_r" value="rojo" ${prevVal==='rojo'?'checked':''}><label class="aud-sem-lbl" for="asem_${sec.key}_r">🔴 Rojo</label>
                </div>
            </div>
            <textarea class="aud-form-textarea" id="aobs_${sec.key}" rows="2" placeholder="Observaciones...">${prev&&prev.obs?prev.obs[sec.key]||'':''}</textarea>
        </div>`;
    }).join('');

    // Cambiar botón según si es el último
    const restantes = audSociosSeleccionados.filter(s=>!audSociosAuditados[s.nombre]&&s.nombre!==nombre);
    document.getElementById('audBtnGuardar').innerHTML=restantes.length===0
        ?'<i class="fas fa-floppy-disk"></i> Guardar'
        :'<i class="fas fa-floppy-disk"></i> Guardar y Continuar';

    document.getElementById('audFormModal').classList.add('open');
}

function audCloseFormModal(){document.getElementById('audFormModal').classList.remove('open');}

function audSaveAudit(){
    const semaforos={}, obs={};

    // Auto-semáforo: si el socio tiene plan vencido, gestion = rojo por defecto
    const socioData = audSociosData.find(s=>s.nombre===audSocioActual);
    const hoyAudit = new Date(); hoyAudit.setHours(0,0,0,0);
    const planVencido = socioData && socioData.vencPlan && socioData.vencPlan < hoyAudit;

    AUD_SECTIONS.forEach(sec=>{
        const ch=document.querySelector(`input[name="asem_${sec.key}"]:checked`);
        // Si el radio ya fue cambiado por el usuario, respetar su elección
        // Si gestion y plan vencido y no tocaron el radio (viene en verde por defecto) → rojo
        let val = ch ? ch.value : 'verde';
        semaforos[sec.key]=val;
        obs[sec.key]=(document.getElementById('aobs_'+sec.key).value||'').trim();
    });

    audSociosAuditados[audSocioActual]={
        semaforos, obs,
        audFHallazgos:(document.getElementById('audFHallazgos').value||'').trim(),
    };
    audCloseFormModal();
    audRenderTablaHoy();
    audGuardarAuditados();
    const siguiente = audSociosSeleccionados.find(s=>!audSociosAuditados[s.nombre]);
    if(siguiente) setTimeout(()=>audAbrirSocio(siguiente.nombre), 300);
}

function audFinalizarDia(){
    const t=AUD_TRAINERS.find(x=>x.id===audCurrentProfe);
    const hoy=new Date(); hoy.setHours(0,0,0,0);
    const vencidos=audSociosData.filter(s=>s.vencPlan&&s.vencPlan<hoy);
    const vencidosServicio=audSociosData.filter(s=>s.vencServicio&&s.vencServicio<hoy);
    const conEval=audSociosData.filter(s=>/(si|sí)/i.test(s.evalCargada)).length;
    const conObj=audSociosData.filter(s=>/(si|sí)/i.test(s.objetivoApp)).length;

    // Calcular semáforo promedio del día
    const semResumen=Object.fromEntries(AUD_SECTIONS.map(s=>[s.key,'verde']));
    const counts=Object.fromEntries(AUD_SECTIONS.map(s=>[s.key,{v:0,a:0,r:0}]));
    Object.values(audSociosAuditados).forEach(a=>{
        AUD_SECTIONS.forEach(sec=>{
            if(a.semaforos[sec.key]==='verde') counts[sec.key].v++;
            else if(a.semaforos[sec.key]==='amarillo') counts[sec.key].a++;
            else counts[sec.key].r++;
        });
    });
    AUD_SECTIONS.forEach(sec=>{
        const c=counts[sec.key];
        semResumen[sec.key]=c.r>0?'rojo':c.a>0?'amarillo':'verde';
    });

    // Armar detalle por socio
    const detalleSocios = Object.entries(audSociosAuditados).map(([nombre,a])=>({
        nombre,
        semaforos:a.semaforos,
        hallazgos:a.audFHallazgos,
        rpe:a.audFRPE,
        obs:a.obs
    }));

    audHistorial.unshift({
        id:'aud'+Date.now(), profe:t.name, sede:t.sede,
        date:new Date().toLocaleDateString('es-AR'),
        planesAuditados:detalleSocios.length,
        planesVencidos:vencidos.length,
        servicioVencidos:vencidosServicio.length,
        vencidosDetalle:vencidos.map(s=>({nombre:s.nombre, vencPlan:s.vencPlan?.toLocaleDateString('es-AR'), vencServicio:s.vencServicio?.toLocaleDateString('es-AR')})),
        totalActivos:audSociosData.length,
        conEvaluacion:conEval, conObjetivo:conObj,
        semaforos:semResumen,
        detalleSocios
    });

    audSociosAuditados={};
    audRenderHistorial();
    audGuardarHistorial();
    document.getElementById('audProgresoWrap').style.display='none';
    document.getElementById('audBtnFinalizar').style.display='none';
    audRenderTablaHoy();
    document.getElementById('audHistorial').scrollIntoView({behavior:'smooth'});
}

// Estados de corrección de cada anotación (los carga el auditor al verificar)
const AUD_ESTADOS = [
    {k:'pendiente', label:'Pendiente',                          color:'#94a3b8', icon:'⏳'},
    {k:'corregido', label:'Corregido (verificado)',            color:'#10b981', icon:'✅'},
    {k:'parcial',   label:'Corregido parcial',                  color:'#3b82f6', icon:'🔵'},
    {k:'falso',     label:'Dijo que corrigió pero NO lo hizo',  color:'#ef4444', icon:'❌'},
    {k:'omitido',   label:'Pasado por alto / omitido',          color:'#f59e0b', icon:'⏭️'},
    {k:'na',        label:'No corresponde / baja',              color:'#64748b', icon:'🚫'},
];
function audEstadoMeta(k){ return AUD_ESTADOS.find(e=>e.k===k) || AUD_ESTADOS[0]; }
function audEstadoSelect(auditId, socio, field, cur){
    const m = audEstadoMeta(cur||'pendiente');
    return `<select data-aud="${auditId}" data-socio="${encodeURIComponent(socio)}" data-field="${field}" onchange="audSetEstado(this)" onclick="event.stopPropagation()"
        style="font-family:inherit;font-size:.66rem;border:1px solid ${m.color};color:${m.color};font-weight:700;border-radius:6px;padding:2px 4px;background:var(--card);cursor:pointer;max-width:190px;">
        ${AUD_ESTADOS.map(e=>`<option value="${e.k}" ${(cur||'pendiente')===e.k?'selected':''}>${e.icon} ${e.label}</option>`).join('')}
    </select>`;
}
function audSetEstado(sel){
    const id=sel.dataset.aud, socio=decodeURIComponent(sel.dataset.socio), field=sel.dataset.field, val=sel.value;
    const a=(audHistorial||[]).find(x=>x.id===id); if(!a) return;
    const d=(a.detalleSocios||[]).find(x=>x.nombre===socio); if(!d) return;
    d.estados = d.estados || {};
    d.estados[field] = val;
    const m=audEstadoMeta(val);
    sel.style.borderColor=m.color; sel.style.color=m.color;
    audGuardarHistorial();
}
// Fila de anotación con su selector de estado
function audAnotacion(auditId, socio, field, etiqueta, texto, cur){
    return `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;margin-top:4px;padding:4px 0;border-top:1px dashed var(--border);">
        <div style="flex:1;min-width:180px;font-size:.74rem;color:var(--muted);line-height:1.4;"><span style="color:var(--accent);font-weight:600;">${etiqueta}:</span> ${texto}</div>
        ${audEstadoSelect(auditId, socio, field, cur)}
    </div>`;
}

function audRenderHistorial(){
    document.getElementById('audCount').textContent=`(${audHistorial.length})`;
    const list=document.getElementById('audAuditList');
    if(!audHistorial.length){
        list.innerHTML='<div class="aud-empty"><i class="fas fa-clipboard"></i>Sin auditorías registradas aún.<br><span style="font-size:.75rem;">Completá tu primera auditoría para verla acá.</span></div>';
        return;
    }
    list.innerHTML=audHistorial.map(a=>{
        const chips=AUD_SECTIONS.map(s=>`<span class="aud-chip ${audS2C(a.semaforos[s.key])}">${s.label.split(' ')[0]}</span>`).join('');
        const detSocios=a.detalleSocios?a.detalleSocios.map(d=>{
            const dChips=AUD_SECTIONS.map(s=>`<span class="aud-chip ${audS2C(d.semaforos[s.key])}" style="font-size:.62rem;">${s.label.split(' ')[0]}</span>`).join('');
            const semD=d.semaforos?Object.values(d.semaforos).filter(v=>v==='rojo').length>1?'🔴':Object.values(d.semaforos).filter(v=>v==='amarillo').length>0?'🟡':'🟢':'';
            return `<div style="border:1px solid var(--border);border-radius:8px;padding:10px 14px;margin-bottom:6px;background:var(--bg);">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:4px;margin-bottom:4px;">
                    <span style="font-weight:700;font-size:.88rem;">${semD} ${d.nombre}</span>
                    <div class="aud-chips">${dChips}</div>
                </div>
                ${d.hallazgos?audAnotacion(a.id,d.nombre,'hallazgos','Hallazgos',d.hallazgos,(d.estados||{}).hallazgos):''}
                ${d.rpe?`<div style="font-size:.72rem;color:var(--muted);margin-top:3px;"><i class="fas fa-gauge-high" style="color:#f59e0b;margin-right:3px;font-size:.65rem;"></i><span style="color:#f59e0b;font-weight:600;">RPE:</span> ${d.rpe}</div>`:''}
                ${Object.keys(d.obs||{}).filter(k=>d.obs[k]).map(k=>{
                    const sec=AUD_SECTIONS.find(s=>s.key===k);
                    return sec&&d.obs[k]?audAnotacion(a.id,d.nombre,'obs_'+k,sec.label.split(' ')[0],d.obs[k],(d.estados||{})['obs_'+k]):'';
                }).join('')}
            </div>`;
        }).join(''):'';
        const vencList=a.vencidosDetalle&&a.vencidosDetalle.length
            ?`<div style="margin-top:8px;padding:8px;background:#fee2e2;border-radius:7px;">
                <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;color:#ef4444;margin-bottom:5px;"><i class="fas fa-calendar-xmark" style="margin-right:4px;"></i>Planes vencidos al ${a.date}</div>
                ${a.vencidosDetalle.map(v=>typeof v==='object'
                    ?`<div style="font-size:.75rem;color:#7f1d1d;margin-bottom:3px;display:grid;grid-template-columns:1fr auto auto;gap:8px;"><span style="font-weight:600;">${v.nombre}</span><span>Plan: <b>${v.vencPlan||'S/D'}</b></span><span>Servicio: <b>${v.vencServicio||'S/D'}</b></span></div>`
                    :`<div style="font-size:.75rem;color:#7f1d1d;">${v}</div>`
                ).join('')}
            </div>`:'';
        const scoreColor=a.semaforos?Object.values(a.semaforos).filter(v=>v==='rojo').length>1?'#ef4444':Object.values(a.semaforos).filter(v=>v==='amarillo').length>0?'#f59e0b':'#10b981':'#10b981';
        return `<div class="aud-audit-item">
            <div class="aud-audit-top" onclick="audToggle('${a.id}')" style="cursor:pointer;">
                <div style="flex:1;">
                    <div class="aud-audit-socio">
                        <i class="fas fa-user-tie" style="font-size:.7rem;color:var(--muted);margin-right:5px;"></i>
                        <strong>${a.profe}</strong>
                        <span style="color:var(--muted);font-size:.78rem;margin-left:6px;">${a.date}</span>
                    </div>
                    <div class="aud-audit-date" style="margin-top:3px;">
                        <span style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;padding:1px 6px;font-size:.7rem;color:#166534;margin-right:4px;">${a.planesAuditados} auditados</span>
                        ${a.planesVencidos>0?`<span style="background:#fee2e2;border:1px solid #fca5a5;border-radius:4px;padding:1px 6px;font-size:.7rem;color:#991b1b;margin-right:4px;" title="Planes de entrenamiento vencidos">${a.planesVencidos} plan${a.planesVencidos!==1?'es':''} venc.</span>`:''}
                        ${(a.servicioVencidos||0)>0?`<span style="background:#fef3c7;border:1px solid #fcd34d;border-radius:4px;padding:1px 6px;font-size:.7rem;color:#92400e;margin-right:4px;" title="Servicios sin renovar">${a.servicioVencidos} serv. venc.</span>`:''}
                        <span style="font-size:.7rem;color:var(--muted);">${a.conEvaluacion}/${a.totalActivos} con eval · ${a.conObjetivo}/${a.totalActivos} con objetivo</span>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                    <div class="aud-chips">${chips}</div>
                    <button onclick="event.stopPropagation();audEditarAuditoria('${a.id}')" title="Editar auditoría"
                        style="width:26px;height:26px;border-radius:6px;border:1px solid #bfdbfe;background:#eff6ff;color:#2563eb;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <i class="fas fa-pen" style="font-size:.6rem;pointer-events:none;"></i>
                    </button>
                    <button onclick="event.stopPropagation();audBorrar('${a.id}')" title="Borrar auditoría"
                        style="width:26px;height:26px;border-radius:6px;border:1px solid #fca5a5;background:#fee2e2;color:#ef4444;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <i class="fas fa-trash" style="font-size:.65rem;pointer-events:none;"></i>
                    </button>
                    <i class="fas fa-chevron-down" id="audChev_${a.id}" style="color:var(--muted);font-size:.75rem;transition:transform .2s;"></i>
                </div>
            </div>
            <div class="aud-expanded" id="audExp_${a.id}">
                <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:10px;margin-bottom:10px;">
                    <div class="aud-exp-block">
                        <div class="aud-exp-block-title">📊 Snapshot de la Planilla</div>
                        <div class="aud-exp-block-content">
                            <b>Socios activos:</b> ${a.totalActivos}<br>
                            <b>Planes vencidos:</b> <span style="color:${a.planesVencidos>0?'#ef4444':'#10b981'};font-weight:700;">${a.planesVencidos}</span><br>
                            <b>Con evaluación:</b> ${a.conEvaluacion} <span style="color:var(--muted);">(${a.totalActivos?Math.round(a.conEvaluacion/a.totalActivos*100):0}%)</span><br>
                            <b>Con objetivo APP:</b> ${a.conObjetivo} <span style="color:var(--muted);">(${a.totalActivos?Math.round(a.conObjetivo/a.totalActivos*100):0}%)</span>
                            ${vencList}
                        </div>
                    </div>
                    <div class="aud-exp-block">
                        <div class="aud-exp-block-title">📋 Planes Auditados (${a.planesAuditados})</div>
                        ${detSocios||'<div style="font-size:.78rem;color:var(--muted);">Sin detalle registrado.</div>'}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function audSwitchTab(tab){
    const tabs = {historial:'audTabContentHistorial', dashboard:'audTabContentDashboard', informe:'audTabContentInforme'};
    const btns = {historial:'audTabHistorial', dashboard:'audTabDashboard', informe:'audTabInforme'};
    Object.entries(tabs).forEach(([k,cid])=>{ const el=document.getElementById(cid); if(el) el.style.display = (k===tab)?'block':'none'; });
    Object.entries(btns).forEach(([k,bid])=>{ const b=document.getElementById(bid); if(!b) return;
        const on = k===tab;
        b.style.cssText += on ? ';color:var(--accent);border-bottom:2px solid var(--accent);' : ';color:var(--muted);border-bottom:2px solid transparent;';
    });
    if(tab==='dashboard') audRenderDashboard();
    if(tab==='informe') audInformeInit();
}

// ── INFORME DE AUDITORÍAS (por profesional + rango de fechas) ──
let audInfInit = false;
let audInfChartData = null;
function audInformeRenderCharts(){
    if(!audInfChartData) return;
    const d=audInfChartData;
    try{ if(document.getElementById('audChSem')) stackedBar('audChSem', d.sem.labels, [
        {label:'Verde',data:d.sem.v,backgroundColor:'#10b981'},
        {label:'Amarillo',data:d.sem.a,backgroundColor:'#f59e0b'},
        {label:'Rojo',data:d.sem.r,backgroundColor:'#ef4444'}
    ]); }catch(e){}
    try{ if(document.getElementById('audChSec')) stackedBar('audChSec', d.sec.labels, [
        {label:'Amarillo',data:d.sec.amar,backgroundColor:'#f59e0b'},
        {label:'Rojo',data:d.sec.rojo,backgroundColor:'#ef4444'}
    ]); }catch(e){}
    try{ if(d.profe && document.getElementById('audChProfe')) bar('audChProfe', d.profe.labels, [{l:'% Verde',d:d.profe.pct,c:'#10b981'}]); }catch(e){}
}
function audInformeInit(){
    // Checkboxes de profes agrupados por sede
    const cont = document.getElementById('audInfProfes');
    const sedes = [...new Set(AUD_TRAINERS.map(t=>t.sede))];
    cont.innerHTML = sedes.map(sede=>`
        <div style="display:flex;flex-direction:column;gap:4px;">
            <div style="font-size:.6rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">${sede}</div>
            ${AUD_TRAINERS.filter(t=>t.sede===sede).map(t=>`
                <label style="display:flex;align-items:center;gap:5px;font-size:.8rem;cursor:pointer;background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:4px 9px;">
                    <input type="checkbox" class="audInfChk" value="${t.name}" checked> ${t.name}
                </label>`).join('')}
        </div>`).join('');
    if(!audInfInit){
        // Rango por defecto: del más viejo al más nuevo del historial
        const fechas = (audHistorial||[]).map(a=>audInfParse(a.date)).filter(Boolean).sort((a,b)=>a-b);
        if(fechas.length){
            const iso = d => d.toISOString().slice(0,10);
            document.getElementById('audInfDesde').value = iso(fechas[0]);
            document.getElementById('audInfHasta').value = iso(fechas[fechas.length-1]);
        }
        audInfInit = true;
    }
}
function audInfTodos(v){ document.querySelectorAll('.audInfChk').forEach(c=>c.checked=v); }
function audInfParse(s){ const p=String(s||'').split('/'); if(p.length<3) return null; const d=new Date(+p[2],+p[1]-1,+p[0]); return isNaN(d)?null:d; }
function audInfChip(v){ const c=v==='verde'?'inf-g':v==='amarillo'?'inf-y':v==='rojo'?'inf-r':'inf-b'; return c; }

function audInformeGenerar(){
    const profes = [...document.querySelectorAll('.audInfChk:checked')].map(c=>c.value);
    const dDesde = document.getElementById('audInfDesde').value ? new Date(document.getElementById('audInfDesde').value+'T00:00:00') : null;
    const dHasta = document.getElementById('audInfHasta').value ? new Date(document.getElementById('audInfHasta').value+'T23:59:59') : null;
    const body = document.getElementById('audInformeBody');
    if(!profes.length){ document.getElementById('audInformeStatus').textContent='Elegí al menos un profesional.'; body.innerHTML=''; return; }

    // Filtrar
    const sel = (audHistorial||[]).filter(a=>{
        if(!profes.includes(a.profe)) return false;
        const f = audInfParse(a.date);
        if(dDesde && (!f || f<dDesde)) return false;
        if(dHasta && (!f || f>dHasta)) return false;
        return true;
    });
    const fmtRango = (dDesde?dDesde.toLocaleDateString('es-AR'):'inicio') + ' → ' + (dHasta?dHasta.toLocaleDateString('es-AR'):'hoy');
    document.getElementById('audInformeStatus').innerHTML = `<i class="fas fa-circle-check" style="color:var(--accent);"></i> ${sel.length} auditoría(s) · ${profes.length} profesional(es) · ${fmtRango}`;

    let H = `<h1>Informe de Auditorías — MOVE</h1>
        <div class="inf-meta">Profesionales: ${profes.map(infEsc).join(', ')} · Rango: ${fmtRango} · Generado ${new Date().toLocaleDateString('es-AR')}</div>`;

    if(!sel.length){ body.innerHTML = H + '<p class="inf-muted">No hay auditorías para ese filtro.</p>'; return; }

    // ── Métricas, gráficos y tendencias ──
    const selOrden = sel.slice().sort((a,b)=>(audInfParse(a.date)||0)-(audInfParse(b.date)||0));
    let gV=0,gA=0,gR=0, gSoc=0, gVenc=0;
    const porFecha = {}; // date -> {v,a,r}
    const porSec = Object.fromEntries(AUD_SECTIONS.map(s=>[s.key,{a:0,r:0,v:0}]));
    const porProfe = {}; // profe -> {v,a,r}
    const anotaciones = [];
    selOrden.forEach(a=>{
        gVenc += a.planesVencidos||0;
        const fk = a.date;
        porFecha[fk] = porFecha[fk] || {v:0,a:0,r:0};
        porProfe[a.profe] = porProfe[a.profe] || {v:0,a:0,r:0};
        (a.detalleSocios||[]).forEach(d=>{
            gSoc++;
            AUD_SECTIONS.forEach(s=>{
                const val=(d.semaforos||{})[s.key];
                if(val==='verde'){gV++;porFecha[fk].v++;porProfe[a.profe].v++;porSec[s.key].v++;}
                else if(val==='amarillo'){gA++;porFecha[fk].a++;porProfe[a.profe].a++;porSec[s.key].a++;}
                else if(val==='rojo'){gR++;porFecha[fk].r++;porProfe[a.profe].r++;porSec[s.key].r++;}
            });
            if(d.hallazgos && d.hallazgos.trim()) anotaciones.push(d.hallazgos);
            Object.values(d.obs||{}).forEach(o=>{ if(o&&o.trim()) anotaciones.push(o); });
        });
    });
    const gTot = gV+gA+gR || 1;
    const pctV = Math.round(gV/gTot*100), pctR = Math.round(gR/gTot*100);
    // KPIs
    const kc=(l,v,c,sub)=>`<div class="stat-card" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;border-left:3px solid ${c};display:inline-block;min-width:130px;margin:0 8px 8px 0;vertical-align:top;">
        <div style="font-size:1.4rem;font-weight:800;color:${c};font-family:monospace;">${v}</div>
        <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#64748b;margin-top:3px;">${l}</div>${sub?`<div style="font-size:.66rem;color:#94a3b8;margin-top:2px;">${sub}</div>`:''}</div>`;
    H += `<h2><i class="fas fa-gauge"></i> Métricas del período</h2><div>`;
    H += kc('Auditorías', selOrden.length, '#6366f1');
    H += kc('Socios auditados', gSoc, '#0ea5e9', (selOrden.length?('prom. '+(gSoc/selOrden.length).toFixed(1)+'/auditoría'):''));
    H += kc('% Verde', pctV+'%', pctV>=70?'#10b981':pctV>=50?'#f59e0b':'#ef4444', 'cumplimiento');
    H += kc('% Rojo', pctR+'%', pctR<=10?'#10b981':pctR<=25?'#f59e0b':'#ef4444', 'foco de mejora');
    H += kc('Planes vencidos', gVenc, gVenc>0?'#ef4444':'#10b981');
    H += `</div>`;

    // Tendencia (primera mitad vs segunda mitad)
    let tendTxt='';
    if(selOrden.length>=2){
        const mid=Math.floor(selOrden.length/2);
        const half=arr=>{let v=0,a=0,r=0;arr.forEach(x=>{(x.detalleSocios||[]).forEach(d=>AUD_SECTIONS.forEach(s=>{const val=(d.semaforos||{})[s.key];if(val==='verde')v++;else if(val==='amarillo')a++;else if(val==='rojo')r++;}));});const t=v+a+r||1;return{pv:Math.round(v/t*100),pr:Math.round(r/t*100)};};
        const h1=half(selOrden.slice(0,mid)), h2=half(selOrden.slice(mid));
        const dRojo=h2.pr-h1.pr, dVerde=h2.pv-h1.pv;
        const mejora = dVerde>2 || dRojo<-2;
        const empeora = dRojo>2 || dVerde<-2;
        const col=mejora?'#10b981':empeora?'#ef4444':'#64748b';
        const txt=mejora?'📈 Mejorando':empeora?'📉 Empeorando':'➡️ Estable';
        tendTxt = `<div style="font-size:.85rem;margin:6px 0 14px;padding:8px 12px;border-left:3px solid ${col};background:#f8fafc;border-radius:0 6px 6px 0;">
            <b style="color:${col};">${txt}.</b> Verde pasó de ${h1.pv}% a ${h2.pv}% y rojo de ${h1.pr}% a ${h2.pr}% (primera vs segunda mitad del período).</div>`;
    }
    H += tendTxt;

    // Gráficos
    const multi = Object.keys(porProfe).length>1;
    H += `<h2><i class="fas fa-chart-line"></i> Gráficos</h2>
        <div style="display:grid;grid-template-columns:${multi?'1fr 1fr':'1fr 1fr'};gap:14px;">
            <div class="card"><div class="card-title" style="font-size:.8rem;">Evolución de semáforos por fecha</div><canvas id="audChSem" height="150"></canvas></div>
            <div class="card"><div class="card-title" style="font-size:.8rem;">Dónde se falla más (por sección)</div><canvas id="audChSec" height="150"></canvas></div>
            ${multi?'<div class="card" style="grid-column:1/-1;"><div class="card-title" style="font-size:.8rem;">% Verde por profesional</div><canvas id="audChProfe" height="90"></canvas></div>':''}
        </div>`;

    // Tendencia en anotaciones (temas recurrentes)
    const TEMAS=[
        {t:'Evaluación / carga en APP', kw:['evaluac','eval','cargar','app','planilla','excel','carga']},
        {t:'RPE / esfuerzo', kw:['rpe','esfuerzo']},
        {t:'Plan vencido / vigencia', kw:['vencid','vigencia','renov','venc']},
        {t:'Objetivo del socio', kw:['objetivo','meta']},
        {t:'Técnica / ejercicios', kw:['ejercic','tecnica','polea','mancuerna','bloque','serie','repetic','peso','postura','movil']},
        {t:'Seguimiento / contacto', kw:['seguimiento','acompan','contacto','mensaje','llamar','whatsapp']},
    ];
    const nrm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
    const temaCount = TEMAS.map(tm=>({t:tm.t, n:anotaciones.filter(x=>{const q=nrm(x);return tm.kw.some(k=>q.includes(k));}).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
    // palabras frecuentes
    const STOP=new Set('de la el los las un una y o a en que con por para se su sus del al es son no lo le les mas más este esta ese esa como ya si sin sobre entre cada muy the'.split(' '));
    const freq={};
    anotaciones.forEach(x=>nrm(x).replace(/[^a-z0-9ñ ]/g,' ').split(/\s+/).forEach(w=>{ if(w.length>3 && !STOP.has(w)) freq[w]=(freq[w]||0)+1; }));
    const topW=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,10);
    H += `<h2><i class="fas fa-comment-dots"></i> Tendencia en las anotaciones <span class="inf-muted" style="font-size:.7rem;font-weight:400;">(${anotaciones.length} notas)</span></h2>`;
    if(anotaciones.length){
        if(temaCount.length){
            H += `<div style="font-size:.82rem;margin-bottom:8px;"><b>Temas más repetidos:</b></div>`;
            const maxN=temaCount[0].n;
            H += `<div style="display:flex;flex-direction:column;gap:5px;margin-bottom:12px;">`+temaCount.map(x=>`
                <div style="display:flex;align-items:center;gap:8px;font-size:.8rem;">
                    <span style="min-width:190px;">${x.t}</span>
                    <div style="flex:1;height:14px;background:#f1f5f9;border-radius:7px;overflow:hidden;"><div style="height:100%;width:${Math.round(x.n/maxN*100)}%;background:var(--accent);border-radius:7px;"></div></div>
                    <b style="min-width:24px;text-align:right;">${x.n}</b>
                </div>`).join('')+`</div>`;
        }
        if(topW.length) H += `<div style="font-size:.8rem;"><b>Palabras frecuentes:</b> ${topW.map(w=>`${infEsc(w[0])} <span class="inf-muted">(${w[1]})</span>`).join(' · ')}</div>`;
    } else {
        H += `<p class="inf-muted" style="font-size:.82rem;">Todavía no hay anotaciones cargadas en las auditorías de este filtro.</p>`;
    }

    // ── Cumplimiento de correcciones (estados que carga el auditor) ──
    const estCount = Object.fromEntries(AUD_ESTADOS.map(e=>[e.k,0]));
    let totAnot=0;
    selOrden.forEach(a=>{(a.detalleSocios||[]).forEach(d=>{
        const est=d.estados||{};
        const campos=[];
        if(d.hallazgos && d.hallazgos.trim()) campos.push('hallazgos');
        Object.keys(d.obs||{}).forEach(k=>{ if(d.obs[k] && d.obs[k].trim()) campos.push('obs_'+k); });
        campos.forEach(f=>{ totAnot++; const v=est[f]||'pendiente'; if(estCount[v]!=null) estCount[v]++; });
    });});
    H += `<h2><i class="fas fa-clipboard-check"></i> Cumplimiento de correcciones</h2>`;
    if(totAnot){
        const pct=n=>Math.round(n/totAnot*100);
        H += `<div style="margin-bottom:6px;">`;
        AUD_ESTADOS.forEach(e=>{ if(estCount[e.k]>0) H += `<div class="stat-card" style="display:inline-block;min-width:120px;margin:0 8px 8px 0;background:#fff;border:1px solid #e2e8f0;border-left:3px solid ${e.color};border-radius:10px;padding:10px 12px;vertical-align:top;">
            <div style="font-size:1.3rem;font-weight:800;color:${e.color};font-family:monospace;">${estCount[e.k]} <span style="font-size:.8rem;">(${pct(estCount[e.k])}%)</span></div>
            <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:#64748b;margin-top:3px;">${e.icon} ${e.label}</div></div>`; });
        H += `</div>`;
        const resueltas=estCount.corregido+estCount.parcial;
        const alerta=estCount.falso;
        H += `<div style="font-size:.82rem;margin-bottom:12px;">✅ <b>${pct(resueltas)}%</b> resuelto (corregido/parcial) · ${alerta>0?`<span style="color:#ef4444;font-weight:700;">❌ ${alerta} marcada(s) como corregidas sin estarlo</span> · `:''}⏳ ${estCount.pendiente} pendiente(s) · ⏭️ ${estCount.omitido} omitida(s)</div>`;
    } else {
        H += `<p class="inf-muted" style="font-size:.82rem;">Sin anotaciones para verificar en este filtro.</p>`;
    }

    // Guardar datos para los gráficos
    audInfChartData = {
        sem:{labels:Object.keys(porFecha), v:Object.values(porFecha).map(x=>x.v), a:Object.values(porFecha).map(x=>x.a), r:Object.values(porFecha).map(x=>x.r)},
        sec:{labels:AUD_SECTIONS.map(s=>s.label.split(' ')[0]), amar:AUD_SECTIONS.map(s=>porSec[s.key].a), rojo:AUD_SECTIONS.map(s=>porSec[s.key].r)},
        profe: multi?{labels:Object.keys(porProfe), pct:Object.values(porProfe).map(x=>{const t=x.v+x.a+x.r||1;return Math.round(x.v/t*100);})}:null
    };

    // Agrupar por profesional
    profes.forEach(profe=>{
        const auds = sel.filter(a=>a.profe===profe).sort((a,b)=>(audInfParse(b.date)||0)-(audInfParse(a.date)||0));
        if(!auds.length) return;
        // Métricas agregadas
        let totSoc=0, cV=0,cA=0,cR=0, vencTot=0;
        auds.forEach(a=>{
            totSoc += (a.detalleSocios||[]).length;
            vencTot += a.planesVencidos||0;
            (a.detalleSocios||[]).forEach(d=>{ Object.values(d.semaforos||{}).forEach(v=>{ if(v==='verde')cV++; else if(v==='amarillo')cA++; else if(v==='rojo')cR++; }); });
        });
        H += `<div class="inf-sede"><h2><i class="fas fa-user-tie"></i> ${infEsc(profe)}</h2>`;
        H += `<table><thead><tr><th>Auditorías</th><th>Socios auditados</th><th>🟢 Verde</th><th>🟡 Amarillo</th><th>🔴 Rojo</th><th>Planes vencidos</th></tr></thead>
            <tbody><tr>
                <td><b>${auds.length}</b></td><td><b>${totSoc}</b></td>
                <td style="color:#10b981;font-weight:700;">${cV}</td>
                <td style="color:#f59e0b;font-weight:700;">${cA}</td>
                <td style="color:#ef4444;font-weight:700;">${cR}</td>
                <td>${vencTot}</td>
            </tr></tbody></table>`;

        // Detalle por auditoría (fecha) con métricas + anotaciones
        auds.forEach(a=>{
            H += `<h3>${infEsc(a.date)} — ${a.planesAuditados||(a.detalleSocios||[]).length} plan(es) · ${a.conEvaluacion}/${a.totalActivos} con eval · ${a.conObjetivo}/${a.totalActivos} con objetivo · ${a.planesVencidos||0} vencidos</h3>`;
            const socs = a.detalleSocios||[];
            if(!socs.length){ H += '<p class="inf-muted" style="font-size:.8rem;">Sin detalle por socio.</p>'; return; }
            let rows='';
            socs.forEach(d=>{
                const chips = AUD_SECTIONS.map(s=>`<span class="${audInfChip((d.semaforos||{})[s.key])}">${s.label.split(' ')[0]}</span>`).join(' ');
                // Anotaciones: hallazgos + observaciones por sección
                const notas = [];
                if(d.hallazgos && d.hallazgos.trim()) notas.push('<b>Hallazgos:</b> '+infEsc(d.hallazgos));
                Object.keys(d.obs||{}).forEach(k=>{ if(d.obs[k] && d.obs[k].trim()){ const sec=AUD_SECTIONS.find(s=>s.key===k); notas.push('<b>'+(sec?sec.label.split(' ')[0]:k)+':</b> '+infEsc(d.obs[k])); } });
                rows += `<tr>
                    <td style="white-space:nowrap;"><b>${infEsc(d.nombre)}</b></td>
                    <td class="inf-chips">${chips}</td>
                    <td style="font-size:.8rem;">${notas.length?notas.join('<br>'):'<span class="inf-muted">—</span>'}</td>
                </tr>`;
            });
            H += `<table><thead><tr><th>Socio</th><th>Semáforos</th><th>Anotaciones</th></tr></thead><tbody>${rows}</tbody></table>`;
        });
        H += `</div>`;
    });

    body.innerHTML = H;
    body.setAttribute('contenteditable','false');
    audInformeRenderCharts();
}

function audInformePDF(){
    const body = document.getElementById('audInformeBody');
    if(!body.innerHTML.trim()){ alert('Generá el informe primero.'); return; }
    // Rasterizar los canvas (gráficos) a imagen para que salgan en el PDF
    const clone = body.cloneNode(true);
    const origCanvas = body.querySelectorAll('canvas');
    clone.querySelectorAll('canvas').forEach((c,i)=>{
        try{ const img=document.createElement('img'); img.src=origCanvas[i].toDataURL('image/png'); img.style.maxWidth='100%'; c.replaceWith(img); }catch(e){ c.remove(); }
    });
    const cloneHTML = clone.innerHTML;
    const css = `body{font-family:Calibri,Arial,sans-serif;color:#1e293b;line-height:1.5;max-width:900px;margin:0 auto;padding:24px;}
        h1{font-size:20pt;color:#0f172a;} h2{font-size:14pt;border-bottom:2px solid #10b981;padding-bottom:4px;margin-top:22px;} h3{font-size:11pt;color:#334155;margin:14px 0 6px;}
        .inf-meta{color:#64748b;font-size:10pt;margin-bottom:14px;}
        table{width:100%;border-collapse:collapse;margin:6px 0 12px;font-size:9.5pt;} th,td{border:1px solid #cbd5e1;padding:5px 7px;text-align:left;vertical-align:top;} th{background:#f1f5f9;}
        .inf-chips span,.inf-g,.inf-y,.inf-r,.inf-b{font-size:7.5pt;padding:1px 6px;border-radius:8px;margin-right:2px;display:inline-block;}
        .inf-g{background:#dcfce7;color:#166534;}.inf-y{background:#fef9c3;color:#854d0e;}.inf-r{background:#fee2e2;color:#991b1b;}.inf-b{background:#e0e7ff;color:#3730a3;}.inf-muted{color:#94a3b8;}`;
    const w = window.open('', '_blank');
    if(!w){ alert('El navegador bloqueó la ventana. Permití las ventanas emergentes para descargar el PDF.'); return; }
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Informe Auditorías MOVE</title><style>${css} img{max-width:100%;height:auto;} .card{border:1px solid #e2e8f0;border-radius:8px;padding:8px;margin-bottom:8px;} .stat-card{border:1px solid #e2e8f0;}</style></head><body>${cloneHTML}</body></html>`);
    w.document.close();
    setTimeout(()=>{ w.focus(); w.print(); }, 400);
}

function audBorrar(id){
    if(!confirm('¿Borrar esta auditoría? No se puede deshacer.')) return;
    audHistorial = audHistorial.filter(a=>a.id!==id);
    audRenderHistorial();
    audRenderDashboard();
    audGuardarHistorial();
}

// Modal de edición de auditoría ya guardada
let audEditandoId = null;

function audEditarAuditoria(id){
    const a = audHistorial.find(x=>x.id===id);
    if(!a) return;
    audEditandoId = id;

    // Crear modal de edición
    let modal = document.getElementById('audEditModal');
    if(!modal){
        modal = document.createElement('div');
        modal.id = 'audEditModal';
        modal.className = 'aud-modal-overlay';
        modal.style.zIndex = '1100';
        document.body.appendChild(modal);
    }

    // Reconstruir socios de esa auditoría
    const sociosList = a.detalleSocios || [];

    modal.innerHTML = `<div class="aud-modal" style="max-height:80vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <div>
                <div class="aud-modal-title">Editar Auditoría</div>
                <div style="font-size:.72rem;color:var(--muted);">${a.profe} · ${a.date}</div>
            </div>
            <button onclick="audCerrarEdicion()" style="background:none;border:none;color:var(--muted);font-size:1.1rem;cursor:pointer;">✕</button>
        </div>
        ${sociosList.length ? sociosList.map(d=>`
            <div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px;">
                <div style="font-weight:700;font-size:.85rem;margin-bottom:10px;">${d.nombre}</div>
                ${AUD_SECTIONS.map(sec=>`
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
                        <span style="font-size:.78rem;font-weight:600;">${sec.label}</span>
                        <div class="aud-sem-group">
                            <input type="radio" class="aud-sem-radio g" name="edit_${id}_${d.nombre}_${sec.key}" id="edit_${id}_${d.nombre}_${sec.key}_v" value="verde" ${(d.semaforos||{})[sec.key]==='verde'?'checked':''}><label class="aud-sem-lbl" for="edit_${id}_${d.nombre}_${sec.key}_v">🟢</label>
                            <input type="radio" class="aud-sem-radio y" name="edit_${id}_${d.nombre}_${sec.key}" id="edit_${id}_${d.nombre}_${sec.key}_a" value="amarillo" ${(d.semaforos||{})[sec.key]==='amarillo'?'checked':''}><label class="aud-sem-lbl" for="edit_${id}_${d.nombre}_${sec.key}_a">🟡</label>
                            <input type="radio" class="aud-sem-radio r" name="edit_${id}_${d.nombre}_${sec.key}" id="edit_${id}_${d.nombre}_${sec.key}_r" value="rojo" ${(d.semaforos||{})[sec.key]==='rojo'?'checked':''}><label class="aud-sem-lbl" for="edit_${id}_${d.nombre}_${sec.key}_r">🔴</label>
                        </div>
                    </div>`).join('')}
                <div style="margin-top:6px;">
                    <div style="font-size:.68rem;color:var(--muted);margin-bottom:3px;">Hallazgos / RPE</div>
                    <input style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 8px;font-size:.75rem;color:var(--text);" id="edit_hall_${id}_${d.nombre}" value="${(d.hallazgos||'').replace(/"/g,'&quot;')}">
                </div>
            </div>`).join('') : '<p style="color:var(--muted);font-size:.8rem;">Sin detalle de socios en esta auditoría.</p>'}
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px;">
            <button class="aud-btn-cancel" onclick="audCerrarEdicion()">Cancelar</button>
            <button class="aud-btn-save" onclick="audGuardarEdicion('${id}')"><i class="fas fa-floppy-disk"></i> Guardar cambios</button>
        </div>
    </div>`;
    modal.classList.add('open');
}

function audCerrarEdicion(){
    const m = document.getElementById('audEditModal');
    if(m) m.classList.remove('open');
    audEditandoId = null;
}

function audGuardarEdicion(id){
    const a = audHistorial.find(x=>x.id===id);
    if(!a || !a.detalleSocios) return;

    // Actualizar semáforos de cada socio
    a.detalleSocios.forEach(d=>{
        AUD_SECTIONS.forEach(sec=>{
            const ch = document.querySelector(`input[name="edit_${id}_${d.nombre}_${sec.key}"]:checked`);
            if(ch) d.semaforos[sec.key] = ch.value;
        });
        const hallEl = document.getElementById(`edit_hall_${id}_${d.nombre}`);
        if(hallEl) d.hallazgos = hallEl.value.trim();
    });

    // Recalcular semáforo resumen dinámicamente según AUD_SECTIONS
    const counts = {};
    AUD_SECTIONS.forEach(sec=>counts[sec.key]={v:0,a:0,r:0});
    a.detalleSocios.forEach(d=>{
        AUD_SECTIONS.forEach(sec=>{
            const v = (d.semaforos||{})[sec.key];
            if(v==='verde') counts[sec.key].v++;
            else if(v==='amarillo') counts[sec.key].a++;
            else if(v==='rojo') counts[sec.key].r++;
        });
    });
    AUD_SECTIONS.forEach(sec=>{
        const c=counts[sec.key];
        a.semaforos[sec.key]=c.r>0?'rojo':c.a>0?'amarillo':'verde';
    });

    audCerrarEdicion();
    audRenderHistorial();
    audRenderDashboard();
    audGuardarHistorial();
}

function audToggle(id){
    const exp=document.getElementById('audExp_'+id);
    const chev=document.getElementById('audChev_'+id);
    if(!exp)return;
    exp.classList.toggle('open');
    if(chev)chev.style.transform=exp.classList.contains('open')?'rotate(180deg)':'';}
