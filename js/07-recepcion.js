// ══════════════════════════════════════════════════════════
// AUDITORÍA RECEPCIÓN — Control de Ventas
// ══════════════════════════════════════════════════════════
const RECEP_CONFIG = [
    {id:'ara',   name:'Ara',   sede:'Lago Puelo', sheetId:'1fxCZ01-4qmKUt27GvLUBk_vIRR4Jym3W', gid:'1934895'},
    {id:'azul',  name:'Azul',  sede:'Lago Puelo', sheetId:'1XpEKL2YvVTfI0YzrWrTii8ZeuTbCTQcW', gid:'1934895'},
    {id:'keila', name:'Keila', sede:'Bariloche',  sheetId:'1fxFcaVDcwyeJP01zuF9ngD7e_Il9b8KZ', gid:'1934895'},
    {id:'ruben', name:'Rubén', sede:'Bariloche',  sheetId:'1vjxGOb549gQV12gD3_oPZytimSsPTJEl', gid:'1934895'},
    {id:'tani',  name:'Tani',  sede:'El Bolsón',  sheetId:'1olzZWq8VgdUo63M6P6_U8Br8l-SPw_PO', gid:'1934895'},
    {id:'lucia', name:'Lucía', sede:'El Bolsón',  sheetId:'1LTKqNKK9emHZ6GjH6Db80H_T96NUqFxc', gid:'1934895'},
];
const RECEP_MESES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const RECEP_MESES_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const RECEP_OBJ = {ventas:20, planes3m:10, indumentaria:5, mensajes:100, prueba:2};
let recepCurrentId = null;
let recepMesActual = new Date().getMonth(); // mes actual 0-based

function recepInit(){
    const btns = document.getElementById('recepTrainerBtns');
    const sedes = [...new Set(RECEP_CONFIG.map(r=>r.sede))];
    btns.innerHTML = sedes.map(sede=>`
        <div style="margin-bottom:10px;">
            <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:6px;padding-left:2px;">
                <i class="fas fa-map-marker-alt" style="margin-right:4px;color:var(--accent);font-size:.6rem;"></i>${sede}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${RECEP_CONFIG.filter(r=>r.sede===sede).map(r=>`
                    <button class="tab ${recepCurrentId===r.id?'active':''}" onclick="recepSeleccionar('${r.id}')">
                        ${r.name}
                    </button>`).join('')}
            </div>
        </div>`).join('');
    document.getElementById('recepPlanillaKpis').style.display='none';
    document.getElementById('recepError').style.display='none';
    recepTeamLoad();
}

function recepSeleccionar(id){
    recepCurrentId = id;
    document.querySelectorAll('#recepTrainerBtns .tab').forEach(b=>b.classList.remove('active'));
    event.target.closest('.tab').classList.add('active');
    recepCargarDatos(id);
}

async function recepCargarDatos(id){
    const r = RECEP_CONFIG.find(x=>x.id===id);
    document.getElementById('recepNombre').textContent = `${r.name} — ${r.sede}`;
    document.getElementById('recepCargando').style.display='inline';
    document.getElementById('recepPlanillaKpis').style.display='block';
    document.getElementById('recepError').style.display='none';

    try {
        const url = `https://docs.google.com/spreadsheets/d/${r.sheetId}/export?format=csv&gid=${r.gid}&t=${Date.now()}`;
        const resp = await fetch(url, {cache:'no-store'});
        if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const csv = await resp.text();
        const datos = recepParsear(csv);
        document.getElementById('recepCargando').style.display='none';
        recepRenderizar(datos);
    } catch(e){
        document.getElementById('recepCargando').style.display='none';
        document.getElementById('recepPlanillaKpis').style.display='none';
        document.getElementById('recepError').style.display='block';
        document.getElementById('recepErrorMsg').textContent=
            `No se pudo cargar la planilla de ${r.name}. Verificá que esté compartida como "cualquier persona con el link puede ver".`;
    }
}

function recepParsear(csv){
    const lines = csv.split('\n').map(l=>l.split(','));
    // Buscar la sección CONTROL DE VENTAS
    let startRow = 0;
    for(let i=0; i<lines.length; i++){
        const txt = lines[i].join(' ').toLowerCase();
        if(txt.includes('control de ventas')){
            startRow = i;
            break;
        }
    }
    // Encontrar filas de métricas
    let rows = {ventas:-1, planes3m:-1, indumentaria:-1, mensajes:-1, prueba:-1, puntaje:-1};
    // Solo buscar la PRIMERA ocurrencia de cada métrica (bloque ENE-ABR)
    for(let i=startRow; i<Math.min(startRow+80, lines.length); i++){
        const c = ((lines[i][1]||lines[i][0])||'').toLowerCase().trim();
        if(rows.ventas<0 && (c.includes('ventas de nuevos') || c.includes('ventas nuevos'))) rows.ventas = i;
        else if(rows.planes3m<0 && (c.includes('planes de 3') || c.includes('plan de 3'))) rows.planes3m = i;
        else if(rows.indumentaria<0 && (c.includes('indumentaria') || c.includes('venta de indum'))) rows.indumentaria = i;
        else if(rows.mensajes<0 && (c.includes('mensajes enviados') || (c.includes('mensajes') && c.includes('enviad')))) rows.mensajes = i;
        else if(rows.prueba<0 && (c.includes('dias de prueba') || c.includes('días de prueba'))) rows.prueba = i;
        else if(rows.puntaje<0 && c.includes('puntaje')) rows.puntaje = i;
        // Parar cuando encontramos todas las métricas del primer bloque
        if(rows.ventas>=0 && rows.planes3m>=0 && rows.indumentaria>=0 && rows.mensajes>=0 && rows.prueba>=0 && rows.puntaje>=0) break;
    }

    function getCtrl(rowIdx, mesIdx, sinObj=false){
        if(rowIdx < 0) return null;
        const bloque = Math.floor(mesIdx/4);
        const mesEnBloque = mesIdx%4;
        // Métricas con obj+ctrl: col = 2 + mesEnBloque*2 + 1
        // Puntaje (solo ctrl, sin obj): col = 2 + mesEnBloque*2
        const col = 2 + mesEnBloque * 2 + (sinObj ? 0 : 1);

        let targetRow = rowIdx;
        if(bloque > 0){
            const baseLabel = ((lines[rowIdx][1]||lines[rowIdx][0])||'').toLowerCase().trim().replace(/\s+/g,' ');
            let count = 0;
            for(let i=rowIdx+1; i<lines.length; i++){
                const c2 = ((lines[i][1]||lines[i][0])||'').toLowerCase().trim().replace(/\s+/g,' ');
                if(c2.length>4 && (c2===baseLabel || baseLabel.startsWith(c2.substring(0,Math.min(8,c2.length))))){
                    count++;
                    if(count===bloque){ targetRow=i; break; }
                }
            }
        }
        const v = (lines[targetRow]?.[col]||'').trim().replace(/#DIV\/0!|#DIV\\\/0\\!/g,'').replace(/0\.00\s*€/,'0').replace(/\\#DIV\/0\\!/g,'');
        if(v==='' || v==='\\#DIV/0\\!') return null;
        const n = parseFloat(v.replace(/[^\d.-]/g,''));
        return isNaN(n) ? null : n;
    }

    return RECEP_MESES.map((m,i)=>({
        mes: i, label: m, labelFull: RECEP_MESES_FULL[i],
        ventas:      getCtrl(rows.ventas, i),
        planes3m:    getCtrl(rows.planes3m, i),
        indumentaria:getCtrl(rows.indumentaria, i),
        mensajes:    getCtrl(rows.mensajes, i),
        prueba:      getCtrl(rows.prueba, i),
        puntaje:     getCtrl(rows.puntaje, i, true),  // puntaje no tiene columna objetivo
    }));
}

function recepRenderizar(datos){
    // Tabs de mes — solo meses con datos reales (evita meses futuros con 0 espurios)
    const tieneReal = d => (d.ventas>0)||(d.mensajes>0)||(d.puntaje>0);
    const mesesConDato = datos.filter(tieneReal);
    const mesMostrar = mesesConDato.length ? Math.max(...mesesConDato.map(d=>d.mes)) : recepMesActual;
    if(mesesConDato.length) recepMesActual = mesMostrar;

    document.getElementById('recepMesTabs').innerHTML = RECEP_MESES.map((m,i)=>{
        const tieneDato = tieneReal(datos[i]);
        return `<button class="tab ${i===recepMesActual?'active':''} ${!tieneDato?'':''})"
            onclick="recepCambiarMes(${i})"
            style="font-size:.68rem;padding:4px 10px;${!tieneDato?'opacity:.4;':''}">
            ${m}
        </button>`;
    }).join('');

    recepRenderMes(datos, recepMesActual);
}

function recepCambiarMes(i){
    recepMesActual = i;
    document.querySelectorAll('#recepMesTabs .tab').forEach((b,idx)=>b.classList.toggle('active',idx===i));
    // Re-renderizar con los datos ya cargados — necesitamos guardar los datos
    // Por eso los guardamos en el DOM
    const raw = document.getElementById('recepDatosRaw');
    if(raw) recepRenderMes(JSON.parse(raw.textContent), i);
}

function recepRenderMes(datos, mesIdx){
    // Guardar datos para navegación por mes
    let raw = document.getElementById('recepDatosRaw');
    if(!raw){ raw=document.createElement('script'); raw.id='recepDatosRaw'; raw.type='application/json'; document.body.appendChild(raw); }
    raw.textContent = JSON.stringify(datos);

    const d = datos[mesIdx];
    const fmt = v => v===null ? '<span style="color:var(--muted)">—</span>' : v;
    const pct = (v,obj) => v===null ? null : Math.min(Math.round(v/obj*100),100);
    const color = p => p===null?'var(--muted)':p>=80?'#10b981':p>=50?'#f59e0b':'#ef4444';

    // KPIs
    const kpis = [
        {label:'Ventas Nuevas', val:d.ventas, obj:RECEP_OBJ.ventas, icon:'fa-user-plus'},
        {label:'Mensajes',      val:d.mensajes, obj:RECEP_OBJ.mensajes, icon:'fa-message'},
        {label:'Planes 3m',     val:d.planes3m, obj:RECEP_OBJ.planes3m, icon:'fa-calendar-check'},
        {label:'Indumentaria',  val:d.indumentaria, obj:RECEP_OBJ.indumentaria, icon:'fa-shirt'},
        {label:'Días Prueba',   val:d.prueba, obj:RECEP_OBJ.prueba, icon:'fa-clock'},
        {label:'Puntaje',       val:d.puntaje, obj:100, icon:'fa-star'},
    ];
    document.getElementById('recepKpis').innerHTML = kpis.map(k=>{
        const p = pct(k.val, k.obj);
        const c = color(p);
        return `<div class="stat-card" style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px;position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;width:3px;height:100%;background:${c};"></div>
            <div style="font-size:1.4rem;font-weight:800;color:${c};font-family:monospace;">${k.val!==null?k.val:'—'}</div>
            <div style="font-size:.62rem;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-top:4px;">${k.label}</div>
            ${p!==null?`<div style="font-size:.68rem;color:${c};margin-top:3px;font-weight:600;">${p}% del obj. (${k.obj})</div>`:`<div style="font-size:.68rem;color:var(--muted);margin-top:3px;">Sin datos</div>`}
        </div>`;
    }).join('');

    // Barras de objetivos
    const objs = [
        {label:'Ventas de Nuevos', val:d.ventas, obj:RECEP_OBJ.ventas},
        {label:'Planes de 3 Meses', val:d.planes3m, obj:RECEP_OBJ.planes3m},
        {label:'Indumentaria/Suplementos', val:d.indumentaria, obj:RECEP_OBJ.indumentaria},
        {label:'Mensajes Enviados', val:d.mensajes, obj:RECEP_OBJ.mensajes},
        {label:'Días de Prueba', val:d.prueba, obj:RECEP_OBJ.prueba},
    ];
    document.getElementById('recepObjs').innerHTML = objs.map(o=>{
        if(o.val===null) return `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:.78rem;">
            <span style="flex:1;">${o.label}</span>
            <span style="color:var(--muted);">Sin datos</span>
        </div>`;
        const p = Math.min(Math.round(o.val/o.obj*100),100);
        const c = color(p);
        return `<div style="padding:8px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:5px;">
                <span>${o.label}</span>
                <span style="font-family:monospace;font-weight:700;color:${c};">${o.val} / ${o.obj} (${p}%)</span>
            </div>
            <div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden;">
                <div style="height:100%;width:${p}%;background:${c};border-radius:2px;transition:width .5s;"></div>
            </div>
        </div>`;
    }).join('');

    // Tabla historial — solo meses con datos
    document.getElementById('recepTabla').innerHTML = datos.map((d,i)=>{
        const tieneDato = (d.ventas>0)||(d.mensajes>0)||(d.puntaje>0);
        if(!tieneDato) return '';
        const p = pct(d.ventas, RECEP_OBJ.ventas);
        const c = color(p);
        return `<tr style="${i===mesIdx?'background:#f0fdf4;font-weight:600;':''}">
            <td>${d.labelFull}${i===mesIdx?' <span style="font-size:.6rem;color:var(--accent);">← actual</span>':''}</td>
            <td style="font-family:monospace;color:${c}">${d.ventas!==null?d.ventas:'—'}</td>
            <td style="font-family:monospace">${d.planes3m!==null?d.planes3m:'—'}</td>
            <td style="font-family:monospace">${d.indumentaria!==null?d.indumentaria:'—'}</td>
            <td style="font-family:monospace">${d.mensajes!==null?d.mensajes:'—'}</td>
            <td style="font-family:monospace;font-weight:700">${d.puntaje!==null?d.puntaje:'—'}</td>
        </tr>`;
    }).join('');
}

// ══════════════════════════════════════════════════════════
// PANEL DE EQUIPO — VENTAS RECEPCIÓN (métricas + snapshot 5 días)
// ══════════════════════════════════════════════════════════
let recepAllData = null;
let recepTeamCargando = false;
let recepServerLog = null;   // registro automático (GitHub Actions) desde analisis/recep-log.json
const RECEP_LOG_KEY = 'moveRecepLog_v1';

function recepCargarServerLog(){
    return fetch('analisis/recep-log.json?t='+Date.now(), {cache:'no-store'})
        .then(r=> r.ok ? r.json() : [])
        .then(j=>{ recepServerLog = Array.isArray(j)?j:[]; })
        .catch(()=>{ recepServerLog = recepServerLog||[]; });
}
const RECEP_METRICS = [
    {k:'ventas', obj:RECEP_OBJ.ventas}, {k:'planes3m', obj:RECEP_OBJ.planes3m},
    {k:'indumentaria', obj:RECEP_OBJ.indumentaria}, {k:'mensajes', obj:RECEP_OBJ.mensajes},
    {k:'prueba', obj:RECEP_OBJ.prueba}
];
const recepSum = (arr,k) => arr.reduce((s,x)=> s + (x!=null&&x[k]!=null?x[k]:0), 0);

async function recepTeamLoad(force){
    if(recepTeamCargando) return;
    if(recepAllData && !force){ recepRenderTeam(); return; }
    recepTeamCargando = true;
    const st=document.getElementById('recepTeamStatus'); if(st) st.innerHTML='<i class="fas fa-spinner fa-spin"></i> Cargando planillas del equipo…';
    const [res] = await Promise.all([
        Promise.all(RECEP_CONFIG.map(async r=>{
            try {
                const url=`https://docs.google.com/spreadsheets/d/${r.sheetId}/export?format=csv&gid=${r.gid}&t=${Date.now()}`;
                const resp=await fetch(url,{cache:'no-store'}); if(!resp.ok) throw 0;
                const csv=await resp.text(); return {cfg:r, datos:recepParsear(csv)};
            } catch(e){ return {cfg:r, datos:null}; }
        })),
        recepCargarServerLog()
    ]);
    recepAllData = res;
    recepTeamCargando = false;
    if(st) st.innerHTML='';
    recepSnapshotCheck();
    recepRenderTeam();
}

function recepTeamVentasMes(idx){ let t=0; (recepAllData||[]).forEach(x=>{ const dd=x.datos?x.datos[idx]:null; if(dd&&dd.ventas!=null) t+=dd.ventas; }); return t; }
function recepTeamMesIdx(){
    // Último mes con ventas reales del equipo (>5). Evita meses futuros con 0 espurios.
    for(let i=RECEP_MESES.length-1;i>=0;i--){ if(recepTeamVentasMes(i)>5) return i; }
    for(let i=RECEP_MESES.length-1;i>=0;i--){ if(recepTeamVentasMes(i)>0) return i; }
    return new Date().getMonth();
}
function recepPerRecep(mi){
    return (recepAllData||[]).map(x=>{
        const d = x.datos ? x.datos[mi] : null;
        const real = d && (d.ventas>0 || d.puntaje>0 || d.mensajes>0);
        let cumpl=null;
        if(real){
            let suma=0;
            RECEP_METRICS.forEach(m=>{ const v=d[m.k]; if(v!=null) suma += Math.min(v/m.obj,1); });
            cumpl = Math.round(suma/RECEP_METRICS.length*100);
        }
        return { id:x.cfg.id, name:x.cfg.name, sede:x.cfg.sede, d:real?d:null, cumpl, sinDatos:!real };
    });
}

function recepRenderTeam(){
    if(!recepAllData) return;
    const mi = recepTeamMesIdx();
    document.getElementById('recepTeamMes').textContent = RECEP_MESES_FULL[mi] + ' 2026';
    recepCheckDuplicados(mi);
    const pr = recepPerRecep(mi);
    const conD = pr.filter(p=>!p.sinDatos);

    // Totales / métricas de ventas
    const ds = conD.map(p=>p.d);
    const totVentas = recepSum(ds,'ventas'), totPlanes=recepSum(ds,'planes3m'), totMsg=recepSum(ds,'mensajes'), totIndu=recepSum(ds,'indumentaria');
    const puntajes = ds.map(d=>d.puntaje).filter(v=>v!=null);
    const puntProm = puntajes.length ? Math.round(puntajes.reduce((a,b)=>a+b,0)/puntajes.length) : null;
    const cumpls = conD.map(p=>p.cumpl).filter(v=>v!=null);
    const cumplProm = cumpls.length ? Math.round(cumpls.reduce((a,b)=>a+b,0)/cumpls.length) : null;
    const convPlanes = totVentas>0 ? Math.round(totPlanes/totVentas*100) : null;  // % ventas que son plan 3m
    const induXventa = totVentas>0 ? (totIndu/totVentas).toFixed(1) : null;

    const col = p => p==null?'#94a3b8':p>=80?'#10b981':p>=50?'#f59e0b':'#ef4444';
    const kc=(l,v,c,sub)=>`<div class="stat-card" style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px;border-left:3px solid ${c};">
        <div style="font-size:1.45rem;font-weight:800;color:${c};font-family:monospace;">${v}</div>
        <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-top:4px;">${l}</div>
        ${sub?`<div style="font-size:.66rem;color:var(--muted);margin-top:2px;">${sub}</div>`:''}</div>`;
    document.getElementById('recepTeamKpis').innerHTML =
        kc('Ventas equipo', totVentas, 'var(--accent)', 'obj '+(RECEP_OBJ.ventas*conD.length)) +
        kc('Cumplimiento prom.', cumplProm==null?'—':cumplProm+'%', col(cumplProm), 'de objetivos') +
        kc('Puntaje prom.', puntProm==null?'—':puntProm, col(puntProm), 'equipo') +
        kc('Planes 3 meses', totPlanes, '#6366f1', (convPlanes!=null?convPlanes+'% de las ventas':'')) +
        kc('Mensajes', totMsg, '#0ea5e9', 'enviados') +
        kc('Indument. x venta', induXventa==null?'—':induXventa, '#f59e0b', 'unidades');

    // Tabla comparativa (ranking por ventas)
    const rank = pr.slice().sort((a,b)=>((b.d?b.d.ventas||0:-1))-((a.d?a.d.ventas||0:-1)));
    const med = i=>i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'º';
    document.getElementById('recepTeamTabla').innerHTML = rank.map((p,i)=>{
        if(p.sinDatos) return `<tr style="opacity:.55;"><td>—</td><td><b>${p.name}</b></td><td>${p.sede}</td><td colspan="5" class="inf-muted">sin datos cargados este mes</td></tr>`;
        const d=p.d;
        return `<tr>
            <td style="text-align:center;font-weight:700;">${med(i)}</td>
            <td><b>${p.name}</b></td><td>${p.sede}</td>
            <td style="font-weight:700;color:${col(Math.round((d.ventas||0)/RECEP_OBJ.ventas*100))};">${d.ventas!=null?d.ventas:'—'}</td>
            <td>${d.planes3m!=null?d.planes3m:'—'}</td>
            <td>${d.mensajes!=null?d.mensajes:'—'}</td>
            <td style="font-weight:700;color:${col(p.cumpl)};">${p.cumpl}%</td>
            <td style="font-weight:700;">${d.puntaje!=null?d.puntaje:'—'}</td>
        </tr>`;
    }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:18px;">Sin datos del equipo</td></tr>';

    // Gráficos
    const lbls = conD.map(p=>p.name);
    try { bar('recepChartRanking', conD.map(p=>p.name), [{l:'Ventas', d:conD.map(p=>p.d.ventas||0), c:'#10b981'}]); } catch(e){}
    try { bar('recepChartCumpl', lbls, [{l:'Cumplimiento %', d:conD.map(p=>p.cumpl||0), c:'#6366f1'}]); } catch(e){}
    // Evolución ventas equipo por mes
    const mesesLbl=[], serie=[];
    RECEP_MESES.forEach((m,idx)=>{
        let any=false, tot=0;
        (recepAllData||[]).forEach(x=>{ const dd=x.datos?x.datos[idx]:null; if(dd&&dd.ventas!=null){ any=true; tot+=dd.ventas; } });
        if(any){ mesesLbl.push(m); serie.push(tot); }
    });
    try { line('recepChartTrend', mesesLbl, [{l:'Ventas equipo', d:serie, c:'#10b981'}]); } catch(e){}
}

// ── Alerta: mismo socio con el mismo servicio dos veces en el mes ──
async function recepCheckDuplicados(mi){
    const cont=document.getElementById('recepDupAlert'); if(!cont) return;
    const mesFull=RECEP_MESES_FULL[mi];
    cont.innerHTML=`<div style="font-size:.76rem;color:var(--muted);"><i class="fas fa-spinner fa-spin"></i> Revisando servicios duplicados de ${mesFull}…</div>`;
    const normM=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/,/g,' ').split(/\s+/).filter(Boolean).sort().join(' ');
    const normS=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().split(/\s+/).filter(Boolean).join(' ');
    const dups=[], noLeidas=[];
    await Promise.all(RECEP_CONFIG.map(async r=>{
        try{
            const url=`https://docs.google.com/spreadsheets/d/${r.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Planilla '+mesFull)}&t=${Date.now()}`;
            const resp=await fetch(url,{cache:'no-store'}); if(!resp.ok) throw 0;
            const rows=aeParseCSV(await resp.text()); if(!rows.length) throw 0;
            const hdr=rows[0].map(h=>String(h||'').toLowerCase());
            const ci=hdr.findIndex(h=>h.includes('apellido'));
            const si=hdr.findIndex(h=>h.includes('servicios vendidos'));
            if(ci<0||si<0){ noLeidas.push(r.name); return; }
            const IGNORAR=new Set(['averiguadores','averiguador','servicios vendidos']); // no son servicios contratados
            const map={};
            for(let i=1;i<rows.length;i++){ const row=rows[i]; if(!row) continue; const m=String(row[ci]||'').trim(), sv=String(row[si]||'').trim(); if(!m||!sv) continue;
                const svN=normS(sv); if(IGNORAR.has(svN)) continue;
                const mN=normM(m); if(mN.split(' ').filter(Boolean).length<2) continue; // nombre incompleto: no confiable para comparar
                const k=mN+'|'+svN; (map[k]=map[k]||{nombre:m,serv:sv,n:0}).n++; }
            Object.values(map).forEach(x=>{ if(x.n>1) dups.push({recep:r.name, sede:r.sede, nombre:x.nombre, serv:x.serv, n:x.n}); });
        }catch(e){ noLeidas.push(r.name); }
    }));
    const notaNL = noLeidas.length?`<div style="font-size:.68rem;color:#94a3b8;margin-top:6px;">No se pudo leer la planilla de ${mesFull} de: ${noLeidas.join(', ')} (¿pestaña con otro nombre o sin cargar?).</div>`:'';
    if(dups.length){
        dups.sort((a,b)=>a.recep.localeCompare(b.recep));
        cont.innerHTML=`<div style="background:#fef2f2;border:1px solid #fca5a5;border-left:4px solid #ef4444;border-radius:10px;padding:12px 14px;">
            <div style="font-weight:800;color:#b91c1c;font-size:.9rem;margin-bottom:6px;"><i class="fas fa-triangle-exclamation"></i> Servicios repetidos en ${mesFull} — ${dups.length} caso(s) a revisar</div>
            <div style="font-size:.74rem;color:#7f1d1d;margin-bottom:8px;">Un socio no puede tener el mismo servicio dos veces en el mismo mes. Revisá estas cargas en la planilla:</div>
            <div class="tw"><table style="font-size:.78rem;"><thead><tr><th>Recepcionista</th><th>Sede</th><th>Socio</th><th>Servicio repetido</th><th>Veces</th></tr></thead><tbody>
            ${dups.map(d=>`<tr><td><b>${d.recep}</b></td><td>${d.sede}</td><td>${d.nombre.replace(/</g,'&lt;')}</td><td>${d.serv.replace(/</g,'&lt;')}</td><td style="text-align:center;font-weight:700;color:#ef4444;">${d.n}</td></tr>`).join('')}
            </tbody></table></div>${notaNL}</div>`;
    } else {
        cont.innerHTML=`<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #10b981;border-radius:10px;padding:10px 14px;font-size:.8rem;color:#166534;">
            <i class="fas fa-circle-check"></i> <b>Sin servicios duplicados en ${mesFull}.</b> Ningún socio tiene el mismo servicio cargado dos veces.${notaNL}</div>`;
    }
}

// ── Registro automático de avance (snapshot cada 5 días) ──
function recepLeerLog(){ try{ return JSON.parse(localStorage.getItem(RECEP_LOG_KEY))||[]; }catch(e){ return []; } }
function recepGuardarLog(l){ try{ localStorage.setItem(RECEP_LOG_KEY, JSON.stringify(l.slice(-40))); }catch(e){} }
function recepSnapshotCheck(){
    const mi = recepTeamMesIdx();
    const pr = recepPerRecep(mi);
    const conD = pr.filter(p=>!p.sinDatos);
    if(!conD.length){ recepRenderLog(); return; }
    const cumpls = conD.map(p=>p.cumpl).filter(v=>v!=null);
    const avance = cumpls.length?Math.round(cumpls.reduce((a,b)=>a+b,0)/cumpls.length):0;
    const ventasAcum = recepSum(conD.map(p=>p.d),'ventas');
    const punt = conD.map(p=>p.d.puntaje).filter(v=>v!=null);
    const puntProm = punt.length?Math.round(punt.reduce((a,b)=>a+b,0)/punt.length):null;
    const log = recepLeerLog();
    const ahora = Date.now();
    const ultimo = log[log.length-1];
    const pasaron5 = !ultimo || (ahora - (ultimo.ts||0)) >= 5*86400000;
    if(pasaron5){
        log.push({ ts:ahora, fecha:new Date().toLocaleDateString('es-AR'), mes:RECEP_MESES_FULL[mi], avance, ventasAcum, puntProm });
        recepGuardarLog(log);
    }
    recepRenderLog();
}
function recepRenderLog(){
    const body=document.getElementById('recepLogBody'); if(!body) return;
    // Combinar registro automático (nube) + local, deduplicado por fecha (la nube manda)
    const map={};
    recepLeerLog().forEach(e=>{ if(e&&e.fecha) map[e.fecha]=e; });
    (recepServerLog||[]).forEach(e=>{ if(e&&e.fecha) map[e.fecha]={...e, auto:true}; });
    const log=Object.values(map).sort((a,b)=>(a.ts||0)-(b.ts||0)).reverse();
    if(!log.length){ body.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:16px;">Aún sin registros. Se generará el primero automáticamente.</td></tr>'; return; }
    body.innerHTML = log.map((e,i)=>{
        const prev = log[i+1];
        const av = e.avance!=null?e.avance:e.cargaProm;
        let delta='<span class="inf-muted">—</span>';
        if(prev){ const pAv=prev.avance!=null?prev.avance:prev.cargaProm; const dC=av-pAv; const dV=e.ventasAcum-prev.ventasAcum; const c=dC>0?'#10b981':dC<0?'#ef4444':'#64748b';
            delta=`<span style="color:${c};font-weight:700;">${dC>0?'+':''}${dC}% avance</span> <span class="inf-muted" style="font-size:.7rem;">· ${dV>=0?'+':''}${dV} ventas</span>`; }
        const autoBadge = e.auto ? ' <span style="background:#e0e7ff;color:#3730a3;font-size:.55rem;font-weight:700;padding:1px 6px;border-radius:8px;">AUTO</span>' : '';
        return `<tr>
            <td style="white-space:nowrap;"><b>${e.fecha}</b>${autoBadge}<br><span class="inf-muted" style="font-size:.68rem;">${e.mes}</span></td>
            <td style="font-weight:700;">${av}%</td>
            <td>${e.ventasAcum}</td>
            <td>${e.puntProm==null?'—':e.puntProm}</td>
            <td>${delta}</td>
        </tr>`;
    }).join('');
    recepRenderCharts();
}

// ══ GRÁFICOS ANÁLISIS DE VENTAS (Ventas Recepción) ══
let recepTrendMetric='ventas', recepCompMetric='ventas', recepCompSel=null;
let recepChTrend=null, recepChComp=null, recepChAporte=null;
const RECEP_PAL=['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#ec4899','#f97316','#0ea5e9'];

function recepLogCombinado(){
    const map={};
    recepLeerLog().forEach(e=>{ if(e&&e.fecha) map[e.fecha]=e; });
    (recepServerLog||[]).forEach(e=>{ if(e&&e.fecha) map[e.fecha]={...e, auto:true}; });
    return Object.values(map).sort((a,b)=>(a.ts||0)-(b.ts||0));
}
function recepDiaDeMes(e){
    // día del mes DENTRO del mes medido; snapshots de cierre (fecha en el mes siguiente) => día 31
    const p=(e.fecha||'').split('/'); if(p.length<2) return null;
    const dia=parseInt(p[0],10), mesFecha=parseInt(p[1],10);
    const mesMed=RECEP_MESES_FULL.indexOf(e.mes)+1;
    if(mesMed>0 && mesFecha!==mesMed) return 31;
    return isNaN(dia)?null:dia;
}

function recepRenderCharts(){
    const cont=document.getElementById('recepCharts'); if(!cont||!window.Chart) return;
    const log=recepLogCombinado();
    const meses=[...new Set(log.map(e=>e.mes))];
    const tmBtns=[['ventas','Ventas'],['avance','Avance %'],['puntaje','Puntaje']].map(([k,l])=>
        `<button onclick="recepSetTrend('${k}')" data-tm="${k}" style="border:none;cursor:pointer;font-family:inherit;font-size:.78rem;font-weight:600;padding:6px 14px;border-radius:8px;${recepTrendMetric===k?'background:var(--accent);color:#fff;':'background:var(--bg);color:var(--muted);'}">${l}</button>`).join('');

    // recepcionistas (para comparativa) desde recepAllData
    const recs=(recepAllData||[]).map(x=>({name:x.cfg.name, sede:x.cfg.sede, datos:x.datos}));
    if(!recepCompSel) recepCompSel=new Set(recs.map(r=>r.name));
    const cmBtns=[['ventas','Ventas'],['planes3m','Planes 3m'],['mensajes','Mensajes'],['puntaje','Puntaje']].map(([k,l])=>
        `<button onclick="recepSetComp('${k}')" data-cm="${k}" style="border:none;cursor:pointer;font-family:inherit;font-size:.78rem;font-weight:600;padding:6px 14px;border-radius:8px;${recepCompMetric===k?'background:#3b82f6;color:#fff;':'background:var(--bg);color:var(--muted);'}">${l}</button>`).join('');
    const recChecks=recs.map((r,i)=>
        `<label style="display:inline-flex;align-items:center;gap:6px;font-size:.78rem;cursor:pointer;background:var(--bg);padding:5px 10px;border-radius:8px;"><input type="checkbox" ${recepCompSel.has(r.name)?'checked':''} onchange="recepToggleComp('${r.name}')" style="accent-color:${RECEP_PAL[i%8]};"><span style="width:10px;height:10px;border-radius:50%;background:${RECEP_PAL[i%8]};display:inline-block;"></span>${r.name} <span style="color:var(--muted);font-size:.68rem;">${r.sede}</span></label>`).join('');

    cont.innerHTML=`
      <div class="card" style="margin-bottom:16px;border-left:3px solid var(--accent);">
        <div class="card-title"><i class="fas fa-chart-line"></i> Tendencia del mes vs meses anteriores</div>
        <div style="font-size:.74rem;color:var(--muted);margin-bottom:10px;">Cada línea es un mes, superpuestos por día del mes. Sirve para ver si vas mejor o peor que el mes pasado al mismo punto.</div>
        <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">${tmBtns}</div>
        <div style="height:300px;position:relative;"><canvas id="recepTrendCanvas"></canvas></div>
        <div id="recepProy" style="margin-top:12px;font-size:.84rem;"></div>
      </div>

      <div class="card" style="margin-bottom:16px;border-left:3px solid #3b82f6;">
        <div class="card-title"><i class="fas fa-users"></i> Comparativa entre recepcionistas</div>
        <div style="display:flex;gap:6px;margin:2px 0 10px;flex-wrap:wrap;">${cmBtns}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">${recChecks}</div>
        <div style="height:300px;position:relative;"><canvas id="recepCompCanvas"></canvas></div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div class="card-title"><i class="fas fa-chart-pie"></i> Aporte de cada recepcionista a las ventas del mes</div>
        <div style="height:280px;position:relative;"><canvas id="recepAporteCanvas"></canvas></div>
      </div>`;

    recepDrawTrend(log, meses); recepDrawComp(recs); recepDrawAporte(recs);
}

function recepSetTrend(m){ recepTrendMetric=m; document.querySelectorAll('[data-tm]').forEach(b=>{const on=b.getAttribute('data-tm')===m; b.style.background=on?'var(--accent)':'var(--bg)'; b.style.color=on?'#fff':'var(--muted)';}); const log=recepLogCombinado(); recepDrawTrend(log,[...new Set(log.map(e=>e.mes))]); }
function recepSetComp(m){ recepCompMetric=m; document.querySelectorAll('[data-cm]').forEach(b=>{const on=b.getAttribute('data-cm')===m; b.style.background=on?'#3b82f6':'var(--bg)'; b.style.color=on?'#fff':'var(--muted)';}); recepDrawComp((recepAllData||[]).map(x=>({name:x.cfg.name,sede:x.cfg.sede,datos:x.datos}))); }
function recepToggleComp(n){ if(recepCompSel.has(n)) recepCompSel.delete(n); else recepCompSel.add(n); recepDrawComp((recepAllData||[]).map(x=>({name:x.cfg.name,sede:x.cfg.sede,datos:x.datos}))); }

function recepMetricVal(e){ return recepTrendMetric==='ventas'?e.ventasAcum : recepTrendMetric==='avance'?e.avance : e.puntProm; }
function recepDrawTrend(log, meses){
    const cv=document.getElementById('recepTrendCanvas'); if(!cv||!window.Chart) return;
    if(recepChTrend) recepChTrend.destroy();
    const datasets=meses.map((mes,i)=>{
        const pts=log.filter(e=>e.mes===mes).map(e=>({x:recepDiaDeMes(e), y:recepMetricVal(e)})).filter(p=>p.x!=null && p.y!=null).sort((a,b)=>a.x-b.x);
        const col=RECEP_PAL[i%8];
        return {label:mes, data:pts, borderColor:col, backgroundColor:col, tension:.3, borderWidth:3, pointRadius:4};
    }).filter(d=>d.data.length);
    const unit = recepTrendMetric==='avance'?'%':'';
    recepChTrend=new Chart(cv,{type:'line',data:{datasets},
        options:{responsive:true,maintainAspectRatio:false,parsing:false,
            plugins:{legend:{labels:{usePointStyle:true,boxWidth:8,font:{size:12}}},
                tooltip:{callbacks:{title:c=>`Día ${c[0].parsed.x} del mes`,label:c=>`${c.dataset.label}: ${c.parsed.y}${unit}`}}},
            scales:{x:{type:'linear',min:1,max:31,title:{display:true,text:'Día del mes',font:{size:11}},ticks:{stepSize:5},grid:{color:'rgba(120,130,150,.12)'}},
                y:{beginAtZero:true,ticks:{callback:v=>v+unit},grid:{color:'rgba(120,130,150,.15)'}}}}});

    // Proyección de cierre (solo para métrica ventas)
    const proy=document.getElementById('recepProy');
    if(recepTrendMetric!=='ventas'){ proy.innerHTML=''; return; }
    if(meses.length){
        const mesAct=meses[meses.length-1];
        const rowsAct=log.filter(e=>e.mes===mesAct).map(e=>({d:recepDiaDeMes(e),v:e.ventasAcum})).filter(p=>p.d!=null&&p.v!=null).sort((a,b)=>a.d-b.d);
        if(rowsAct.length){
            const ult=rowsAct[rowsAct.length-1];
            const diasMes=new Date(2026,(RECEP_MESES_FULL.indexOf(mesAct)+1),0).getDate();
            const ritmo=ult.v/ult.d;
            const proyeccion=Math.round(ritmo*diasMes);
            let cmp='';
            if(meses.length>1){
                const mesPrev=meses[meses.length-2];
                const prevMax=Math.max(...log.filter(e=>e.mes===mesPrev).map(e=>e.ventasAcum||0));
                const dif=proyeccion-prevMax;
                cmp=` ${mesPrev} cerró en ${prevMax} → proyección de ${mesAct} <b style="color:${dif>=0?'#10b981':'#ef4444'}">${dif>=0?'+':''}${dif}</b> (${dif>=0?'mejor':'peor'}).`;
            }
            proy.innerHTML=`<i class="fas fa-gauge-high" style="color:var(--accent);margin-right:5px;"></i>Al día ${ult.d} van <b>${ult.v}</b> ventas (ritmo ${ritmo.toFixed(1)}/día). A este ritmo, <b>${mesAct}</b> cierra en <b style="color:var(--accent)">~${proyeccion}</b> ventas.${cmp}`;
        } else proy.innerHTML='';
    }
}

function recepCompMonthsAll(recs){
    // meses con algún dato entre los recepcionistas seleccionados
    const idxs=[];
    RECEP_MESES.forEach((m,i)=>{ if(recs.some(r=>r.datos&&r.datos[i]&&(r.datos[i].ventas>0||r.datos[i].mensajes>0||r.datos[i].puntaje>0))) idxs.push(i); });
    return idxs;
}
function recepDrawComp(recs){
    const cv=document.getElementById('recepCompCanvas'); if(!cv||!window.Chart) return;
    if(recepChComp) recepChComp.destroy();
    const idxs=recepCompMonthsAll(recs);
    const labels=idxs.map(i=>RECEP_MESES[i]);
    const datasets=recs.filter(r=>recepCompSel.has(r.name)).map(r=>{
        const gi=recs.indexOf(r), col=RECEP_PAL[gi%8];
        const data=idxs.map(i=>{ const d=r.datos&&r.datos[i]; return d&&d[recepCompMetric]!=null?d[recepCompMetric]:null; });
        return {label:r.name, data, borderColor:col, backgroundColor:col, tension:.3, borderWidth:3, pointRadius:4, spanGaps:true};
    });
    recepChComp=new Chart(cv,{type:'line',data:{labels,datasets},
        options:{responsive:true,maintainAspectRatio:false,
            plugins:{legend:{labels:{usePointStyle:true,boxWidth:8,font:{size:12}}}},
            scales:{y:{beginAtZero:true,grid:{color:'rgba(120,130,150,.15)'}},x:{grid:{display:false}}}}});
}

function recepDrawAporte(recs){
    const cv=document.getElementById('recepAporteCanvas'); if(!cv||!window.Chart) return;
    if(recepChAporte) recepChAporte.destroy();
    const mi=recepTeamMesIdx();
    const rows=recs.map((r,i)=>({n:r.name, v:(r.datos&&r.datos[mi]&&r.datos[mi].ventas)||0, c:RECEP_PAL[i%8]})).filter(x=>x.v>0);
    recepChAporte=new Chart(cv,{type:'doughnut',
        data:{labels:rows.map(r=>r.n),datasets:[{data:rows.map(r=>r.v),backgroundColor:rows.map(r=>r.c),borderWidth:2,borderColor:getComputedStyle(document.body).getPropertyValue('--card')||'#fff'}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{usePointStyle:true,boxWidth:8,font:{size:11}}},
            tooltip:{callbacks:{label:c=>{const t=c.dataset.data.reduce((a,b)=>a+b,0); return `${c.label}: ${c.parsed} ventas (${Math.round(c.parsed/t*100)}%)`;}}}}}});
}
