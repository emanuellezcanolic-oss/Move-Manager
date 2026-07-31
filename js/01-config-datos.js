// ══════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════
const SHEET_ENC_ID  = '1GhDYhMnueahKDbX1Ezx9eLlawmfQ-NCXA1ZiLe_r_SY';
const SCRIPT_URL    = 'https://script.google.com/macros/s/AKfycbyQQ8v-cxcbncGh4E9iJGr5_9FwfQ03FJ_GdjbTpq-YVhk_FkzRNTcxwbJbzZiGKWBX/exec';
const MESES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const SEDE_MAP = {
    // El Bolsón — nombres cortos (Apps Script) y largos (encuestas)
    'Enzo':'El Bols\u00f3n',
    'Belu':'El Bols\u00f3n','Belen':'El Bols\u00f3n','Bel\u00e9n':'El Bols\u00f3n',
    'Fer':'El Bols\u00f3n','Fernando':'El Bols\u00f3n',
    'Francisco':'El Bols\u00f3n',
    // Lago Puelo
    'Javi':'Lago Puelo','Javier':'Lago Puelo',
    'Agus':'Lago Puelo','Agustina':'Lago Puelo',
    'Valeria':'Lago Puelo','Facundo':'Lago Puelo',
    'Luz':'Lago Puelo','Leonardo':'Lago Puelo','Emanuel':'Ambas',
    // Bariloche
    'Camila':'Bariloche','Carla':'Bariloche','Estefania':'Bariloche'
};
const PROFE_CONTEXT = {
    'Belu':     {reemplazaA:'Francisco', turno:'Ma\u00f1ana'},
    'Fer':      {reemplazaA:'Belu',      turno:'Tarde'},
    'Enzo':     {reemplazaA:null,        turno:'Noche'},
    'Francisco':{reemplazadoPor:'Belu',  turno:'Ma\u00f1ana'},
    'Javi':     {reemplazaA:'Luz',       turno:'Ma\u00f1ana'},
    'Agus':     {reemplazaA:'Facundo',   turno:null},
    'Luz':      {reemplazadoPor:'Javi',  turno:'Ma\u00f1ana'},
    'Facundo':  {reemplazadoPor:'Agus',  turno:null},
};
const BARILOCHE_PROFES = [
    {nombre:'Camila Romero',     id:'1n8n7z1RgJlvyvdzvc8DGqI4e-64bStI1', gid:'328722414'},
    {nombre:'Carla Agostini',    id:'19zuljlNy--GZPm9Sdf2xwlACHmTsrsHZ', gid:'328722414'},
    {nombre:'Estefanía',id:'1bOyKt3MJ180nv6pPxCJOutBDlSAP22nt', gid:'328722414'},
];
// Columnas de meses en planilla Bariloche: C=1,D=2,E=3,F=4,[G skip],H=6,I=7,J=8,K=9,[L skip],M=11,N=12,O=13,P=14 (offset desde col B)
const BARI_MONTH_COLS = [1,2,3,4,6,7,8,9,11,12,13,14];

const SHEET_METRICS_ID  = '14FQBk6AThswAUZ65mFzyeObepuMhng9K8EqWKpCZZxk';
const SHEET_METRICS_GID = '1303962381';
// VS pairs — gviz ri = sheet_row - 1 (range A1:T55, 0-based)
// Sección 1 (sheet 2-9): Altas2025=row4→ri3, Altas2026=row5→ri4, %Deserc2026=row9→ri8
// Sección +1 cada 10 filas (9 datos + 1 vacía)
const VS_PAIRS = [
    {n26:'Belu',  ri26:4,  riD26:8,  n25:'Fran',  ri25:3,  sede:'El Bolsón'},
    {n26:'Fer',   ri26:13, riD26:17, n25:'Belu',  ri25:12, sede:'El Bolsón'},
    {n26:'Enzo',  ri26:22, riD26:26, n25:'Enzo',  ri25:21, sede:'El Bolsón'},
    {n26:'Javi',  ri26:31, riD26:35, n25:'Luz',   ri25:30, sede:'Lago Puelo'},
    {n26:'Agus',  ri26:40, riD26:44, n25:'Facu',  ri25:39, sede:'Lago Puelo'},
];

// Intercept Google gviz format
const _sheetCBs = {};
window.google = { visualization: { Query: { setResponse: function(data) {
    const cb = _sheetCBs[data.reqId];
    if (cb) { delete _sheetCBs[data.reqId]; cb(data); }
}}}};

let CH = {}, planData = null, wData = [], cData = [], bariData = [], metricsData = null, vsMonth = -1;

function setVsMonth(idx) { vsMonth = idx; renderVersus(); }

// cargarTodo with 10s safety timeout
async function cargarTodo() {
    const hideTimer = setTimeout(() => { document.getElementById('loadOv').style.display='none'; }, 3000);
    document.getElementById('refreshIco').className = 'fas fa-spinner fa-spin';
    await Promise.allSettled([loadPlanillas(), loadEncuestas(), loadBariloche(), loadMetrics()]);
    clearTimeout(hideTimer);
    integrarBariEnOverview();
    renderEstado();
    renderVersus();
    document.getElementById('refreshIco').className = 'fas fa-sync-alt';
    document.getElementById('lastUpd').textContent = 'Actualizado: ' + new Date().toLocaleTimeString('es-AR');
    document.getElementById('loadOv').style.display = 'none';
}

// loadPlanillas with 60s timeout, falls back to demoData
function loadPlanillas() {
    return new Promise(resolve => {
        if (!SCRIPT_URL || SCRIPT_URL === 'TU_URL_AQUI') { planData=demoData(); renderPlanillas(); return resolve(); }
        const cb = 'moveCB_'+Date.now();
        const timer = setTimeout(()=>{ if(window[cb]){delete window[cb]; planData=demoData(); renderPlanillas(); resolve();} },60000);
        window[cb] = d=>{ clearTimeout(timer); delete window[cb]; const el=document.getElementById('jsonpEl'); if(el)el.remove(); planData=d; renderPlanillas(); resolve(); };
        const s=document.createElement('script');
        s.id='jsonpEl';
        s.onerror=()=>{ clearTimeout(timer); delete window[cb]; planData=demoData(); renderPlanillas(); resolve(); };
        s.src=SCRIPT_URL+'?callback='+cb;
        document.body.appendChild(s);
    });
}

// ══ BARILOCHE — carga desde gviz ══
function loadBariloche() {
    return Promise.all(BARILOCHE_PROFES.map(p =>
        Promise.all([loadBariProfe(p), loadBariActivos(p)])
            .then(([data, activos]) => {
                if(data) data.activos = activos;
                return data;
            })
    )).then(results => {
        bariData = results.filter(Boolean);
        if(bariData.length) renderBariloche();
    });
}

// Fetch separado solo para S13 (CONTAR.SI cross-sheet — gviz no lo resuelve en rango grande)
function loadBariActivos(profe) {
    const reqId = 'bariAct_' + profe.nombre.replace(/\s+/g,'_');
    return new Promise(resolve => {
        const timer = setTimeout(() => { delete _sheetCBs[reqId]; resolve(0); }, 10000);
        _sheetCBs[reqId] = r => {
            clearTimeout(timer);
            try {
                const c = r.table.rows[0].c[0];
                const v = c ? (c.v != null ? c.v : parseFloat(c.f || '0')) : 0;
                resolve(Math.round(parseFloat(v) || 0));
            } catch(e) { resolve(0); }
        };
        const s = document.createElement('script');
        s.onerror = () => { clearTimeout(timer); delete _sheetCBs[reqId]; resolve(0); };
        s.src = `https://docs.google.com/spreadsheets/d/${profe.id}/gviz/tq?tqx=out:json;reqId:${reqId}&headers=0&gid=${profe.gid}&range=S13`;
        document.body.appendChild(s);
    });
}

function loadBariProfe(profe) {
    const reqId = 'bari_' + profe.nombre.replace(/\s+/g,'_');
    return new Promise(resolve => {
        const timer = setTimeout(() => { delete _sheetCBs[reqId]; resolve(null); }, 15000);
        _sheetCBs[reqId] = r => { clearTimeout(timer); resolve(parseBariData(r, profe.nombre)); };
        const s = document.createElement('script');
        s.onerror = () => { clearTimeout(timer); delete _sheetCBs[reqId]; resolve(null); };
        s.src = `https://docs.google.com/spreadsheets/d/${profe.id}/gviz/tq?tqx=out:json;reqId:${reqId}&headers=0&gid=${profe.gid}&range=B12:S35`;
        document.body.appendChild(s);
    });
}

function parseBariData(json, nombre) {
    if(!json || !json.table || !json.table.rows) return null;
    const rows = json.table.rows;
    // cell: cuando .v es null (fórmula cross-sheet), gviz devuelve {v:null, f:"63"} → usar .f
    const cell = (ri, ci) => {
        try {
            const c = rows[ri] && rows[ri].c && rows[ri].c[ci];
            if (!c) return 0;
            const v = (c.v !== null && c.v !== undefined) ? c.v : c.f;
            const n = parseFloat(v);
            return isNaN(n) ? 0 : n;
        } catch(e) { return 0; }
    };
    // Estructura de filas (rango B12:S35, índices 0-based en gviz):
    //  ri=0  → fila vacía (ci=16 tiene activos VIVOS)
    //  ri=1  → NUEVO    ri=2 → RENUEVA   ri=3 → RENX2
    //  ri=4  → BAJA     ri=5 → RUBEN     ri=6 → KEILA
    //  ri=13 → %DESERCIÓN
    // Altas totales = NUEVO + RENUEVA + RENX2 + RUBEN + KEILA
    const activos = 0; // sobreescrito por loadBariActivos con fetch directo a S13
    const months = BARI_MONTH_COLS.map((c, i) => {
        const nuevo   = cell(1, c);
        const renueva = cell(2, c);
        const renx2   = cell(3, c);
        const ruben   = cell(5, c);
        const keila   = cell(6, c);
        const baja    = cell(4, c);
        const deseRc  = cell(13, c);   // decimal: 0.05 = 5%
        return { mes: MESES[i], nuevo, renueva, renx2, ruben, keila, baja, deseRc,
                 altas: nuevo + renueva + renx2 + ruben + keila };
    });
    // Padrón real: fila "Activos al cierre de mes" (búsqueda por etiqueta, robusta)
    const cellRaw=(ri,ci)=>{ try{ const c=rows[ri]&&rows[ri].c&&rows[ri].c[ci]; if(!c) return ''; return ((c.v!=null&&c.v!==undefined)?c.v:c.f)||''; }catch(e){ return ''; } };
    let cierreRi=-1;
    for(let ri=0; ri<rows.length; ri++){
        let lbl='';
        for(let ci=0; ci<4; ci++){ lbl += ' ' + String(cellRaw(ri,ci)).toLowerCase(); }
        if(lbl.includes('activos al cierre')){ cierreRi=ri; break; }
    }
    const histActivosCierre = BARI_MONTH_COLS.map(c => cierreRi>=0 ? (cell(cierreRi,c)||null) : null);
    return {
        nombre, activos, months,
        histAltas:  months.map(m => m.altas),
        histBajas:  months.map(m => m.baja),
        histDeserc: months.map(m => m.deseRc),
        histActivosCierre,
    };
}

// ══ METRICS — Estado del Gym + VS 2025 vs 2026 ══
function loadMetrics() {
    const reqId = 'metrics_main';
    return new Promise(resolve => {
        const timer = setTimeout(() => { delete _sheetCBs[reqId]; resolve(); }, 15000);
        _sheetCBs[reqId] = r => {
            clearTimeout(timer);
            metricsData = parseMetrics(r);
            resolve();
        };
        const s = document.createElement('script');
        s.onerror = () => { clearTimeout(timer); delete _sheetCBs[reqId]; resolve(); };
        s.src = `https://docs.google.com/spreadsheets/d/${SHEET_METRICS_ID}/gviz/tq?tqx=out:json;reqId:${reqId}&headers=0&gid=${SHEET_METRICS_GID}&range=A1:T55`;
        document.body.appendChild(s);
    });
}

function parseMetrics(json) {
    if (!json || !json.table || !json.table.rows) return null;
    const rows = json.table.rows;
    const cell = (ri, ci) => {
        try {
            const c = rows[ri] && rows[ri].c && rows[ri].c[ci];
            if (!c) return 0;
            const v = (c.v !== null && c.v !== undefined) ? c.v : c.f;
            const n = parseFloat(v);
            return isNaN(n) ? 0 : n;
        } catch(e) { return 0; }
    };
    // Detect current month: last ci (1-12) where Belu 2026 altas (ri=4) > 5
    let currentMesIdx = 0;
    for (let ci = 1; ci <= 12; ci++) {
        if (cell(4, ci) > 5) currentMesIdx = ci - 1;
    }
    // VS pairs: extract 12 months of altas25, altas26, and current %deseRc
    const vs = VS_PAIRS.map(p => {
        const altas25 = Array.from({length:12}, (_, i) => cell(p.ri25, i+1));
        const altas26 = Array.from({length:12}, (_, i) => cell(p.ri26, i+1));
        const deseRc26 = Array.from({length:12}, (_, i) => cell(p.riD26, i+1));
        return { n26: p.n26, n25: p.n25, sede: p.sede, altas25, altas26, deseRc26 };
    });
    return { currentMesIdx, vs };
}

function demoData() {
    const r12=()=>Array.from({length:12},()=>Math.floor(Math.random()*12+1));
    return { profes:[
        {nombre:'Belu',histAltas26:r12(),histAltas25:r12(),histDeserc26:r12(),activos:45,estadoActivos:'\uD83D\uDFE2 Ideal'},
        {nombre:'Fer', histAltas26:r12(),histAltas25:r12(),histDeserc26:r12(),activos:38,estadoActivos:'\uD83D\uDFE2 Ideal'},
        {nombre:'Enzo',histAltas26:r12(),histAltas25:r12(),histDeserc26:r12(),activos:52,estadoActivos:'\uD83D\uDFE2 Ideal'},
        {nombre:'Javi',histAltas26:r12(),histAltas25:r12(),histDeserc26:r12(),activos:41,estadoActivos:'\uD83D\uDFE2 Ideal'},
        {nombre:'Agus',histAltas26:r12(),histAltas25:r12(),histDeserc26:r12(),activos:29,estadoActivos:'\uD83D\uDFE2 Ideal'},
    ], histBolson25:r12(),histBolson26:r12(),histPuelo25:r12(),histPuelo26:r12() };
}

// loadEncuestas using gid and reqId intercept
function loadEncuestas() {
    return Promise.all([
        sheetLoad(SHEET_ENC_ID, '1563858316', 'bienvenida'),
        sheetLoad(SHEET_ENC_ID, '839375428',  'baja')
    ]).then(([w,c])=>{ wData=w||[]; cData=c||[]; renderEnc(); });
}

function sheetLoad(id, gid, reqId) {
    return new Promise(resolve => {
        const timer=setTimeout(()=>{ delete _sheetCBs[reqId]; resolve([]); },10000);
        _sheetCBs[reqId]=r=>{ clearTimeout(timer); resolve(parseSheet(r)); };
        const s=document.createElement('script');
        s.onerror=()=>{ clearTimeout(timer); delete _sheetCBs[reqId]; resolve([]); };
        const qp = String(gid).startsWith('sheet:') ? `sheet=${encodeURIComponent(gid.slice(6))}` : `gid=${gid}`;
        s.src=`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json;reqId:${reqId}&${qp}`;
        document.body.appendChild(s);
    });
}

function parseSheet(json) {
    if(!json.table||!json.table.rows)return[];
    const h=json.table.cols.map(c=>c.label);
    return json.table.rows.map(r=>{ const o={}; (r.c||[]).forEach((c,j)=>{ o[h[j]]=c?(c.v??''):''; }); return o; });
}
