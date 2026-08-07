// ══════════════════════════════════════════════════
// ENCUESTAS — ANÁLISIS MENSUAL (filtros + comparativas)
// ══════════════════════════════════════════════════
const ENCM_MS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
let encMState = { sede:'todas', profe:'todos', tipo:'bienvenida' };
let encMAll = null;       // {bienvenida:[...], baja:[...]}
let encMCargando = false;

// Catálogo oficial de profesionales (normaliza nombres sueltos de las encuestas)
const ENC_PROFES = [
    {nombre:'Agustina Ostarriecht', sede:'Lago Puelo', activo:true,  keys:['agustina','ostarr']},
    {nombre:'Belen Juarez',         sede:'El Bolsón',  activo:true,  keys:['belen','juarez','con belen']},
    {nombre:'Camila Romeo',         sede:'Bariloche',  activo:true,  keys:['camila','romeo','romero']},
    {nombre:'Carla Agostini',       sede:'Bariloche',  activo:true,  keys:['carla','agostini']},
    {nombre:'Emanuel Lezcano',      sede:'Ambas',      activo:true,  kine:true, keys:['emanuel','lezcano']},
    {nombre:'Enzo Lega',            sede:'El Bolsón',  activo:true,  keys:['enzo','lega']},
    {nombre:'Federico Avalos',      sede:'El Bolsón',  activo:false, keys:['federico','avalos']},
    {nombre:'Fernando Sebrie',      sede:'El Bolsón',  activo:true,  keys:['fernando','sebrie']},
    {nombre:'Giuliano Palomeque',   sede:'Bariloche',  activo:false, keys:['giuliano','palomeque']},
    {nombre:'Javier Larramendy',    sede:'Lago Puelo', activo:true,  keys:['javier','larramendy']},
    {nombre:'Leonardo Alfaro',      sede:'Lago Puelo', activo:false, keys:['leonardo','alfaro']},
    {nombre:'Lucas Siebenlist',     sede:'Ambas',      activo:true,  kine:true, keys:['lucas','siebenlist']},
    {nombre:'Sol Carballo',         sede:'Bariloche',  activo:true,  kine:true, keys:['sol carballo','carballo']},
    {nombre:'Sofia Bertinotti',     sede:'Bariloche',  activo:true,  kine:true, keys:['sofia','bertinotti']},
    {nombre:'Estefania Eberstein',  sede:'Bariloche',  activo:true,  keys:['estefania','eberstein']},
];
const _encNorm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function encMatchProfe(raw){
    const t=_encNorm(raw); if(!t) return null;
    for(const p of ENC_PROFES){ for(const k of p.keys){ if(t.includes(_encNorm(k))) return p; } }
    return null;
}
function encProfeMeta(nombre){ return ENC_PROFES.find(p=>p.nombre===nombre); }
function encProfeLabel(nombre){ const m=encProfeMeta(nombre); if(!m) return nombre; let s=nombre; if(m.kine) s+=' · Kine'; if(!m.activo) s+=' · inactivo'; return s; }

function encParseFecha(v){
    if(!v) return null;
    if(v instanceof Date) return isNaN(v)?null:v;
    const s = String(v).trim();
    let m = s.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/);
    if(m) return new Date(+m[1],+m[2],+m[3],+(m[4]||0),+(m[5]||0),+(m[6]||0));
    m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if(m){ let y=+m[3]; if(y<100) y+=2000; return new Date(y,(+m[2])-1,+m[1]); }
    const d = new Date(s); return isNaN(d)?null:d;
}
function encMBuild(rows, tipo, sedeHint){
    return (rows||[]).map(r=>{
        const profeRaw = String(getCol(r,'profesor')||getCol(r,'profesional')||getCol(r,'profe')||'').trim();
        const canon = encMatchProfe(profeRaw);
        const profe = canon ? canon.nombre : 'Sin asignar';
        let sede = sedeHint;
        if(!sede){
            if(canon && canon.sede!=='Ambas') sede = infNormSede(canon.sede);
            else { const s=getCol(r,'sede'); sede = s?infNormSede(s):infNormSede(getSede(profeRaw)); }
        }
        let f = encParseFecha(getCol(r,'temporal')||getCol(r,'marca')||getCol(r,'fecha')||getCol(r,'timestamp'));
        if(!f){ for(const v of Object.values(r)){ const s=String(v||''); if(/^Date\(\d/.test(s) || /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s)){ const d=encParseFecha(s); if(d){ f=d; break; } } } }
        let nps = tipo==='bienvenida' ? getNPSVal(r) : getNPSValStrict(r);
        if(nps==null||isNaN(nps)) nps=null;
        const horario = String(getCol(r,'horario')||'').trim();
        const comentario = tipo==='bienvenida'
            ? String(getCol(r,'mejorar una')||getCol(r,'mejorar')||'').trim()
            : String(getCol(r,'mejorar')||'').trim();
        const motivo = tipo==='baja' ? String(getCol(r,'motivo')||'').trim() : '';
        return { sede, profe, profeRaw, fecha:f, nps, tipo, horario, comentario, motivo };
    });
}
async function encMInit(){
    encMRenderTipoBtns();
    if(encMAll){ encMRebuildControls(); encMRender(); return; }
    if(encMCargando) return;
    encMCargando = true;
    document.getElementById('encMStatus').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando encuestas de las tres sedes…';
    let bw=[],bc=[],barw=[],barc=[];
    try { [bw,bc] = await Promise.all([ sheetLoad(SHEET_ENC_ID,'1563858316','encmBolBienv'), sheetLoad(SHEET_ENC_ID,'839375428','encmBolBaja') ]); } catch(e){}
    try { [barw,barc] = await Promise.all([ sheetLoad(SHEET_BARI_ENC_ID,SHEET_BARI_BIENV_GID,'encmBariBienv'), sheetLoad(SHEET_BARI_ENC_ID,SHEET_BARI_BAJAS_GID,'encmBariBaja') ]); } catch(e){}
    encMAll = {
        bienvenida: [ ...encMBuild(bw,'bienvenida',null), ...encMBuild(barw,'bienvenida','Bariloche') ],
        baja:       [ ...encMBuild(bc,'baja',null),        ...encMBuild(barc,'baja','Bariloche') ]
    };
    encMCargando = false;
    document.getElementById('encMStatus').innerHTML = '';
    encMRebuildControls();
    encMRender();
}
function encMScopeRows(ignoreProfe){
    let rows = (encMAll && encMAll[encMState.tipo]) ? encMAll[encMState.tipo] : [];
    if(encMState.sede!=='todas') rows = rows.filter(r=>r.sede===encMState.sede);
    if(!ignoreProfe && encMState.profe!=='todos') rows = rows.filter(r=>r.profe===encMState.profe);
    return rows;
}
function encMBtn(label, active, onclick){
    return `<button class="tab ${active?'active':''}" style="font-size:.74rem;padding:5px 12px;" onclick="${onclick}">${label}</button>`;
}
function encMRenderTipoBtns(){
    const el=document.getElementById('encMTipoBtns'); if(!el) return;
    el.innerHTML = encMBtn('🟢 Bienvenida (NPS)', encMState.tipo==='bienvenida', "encMSetTipo('bienvenida')")
                 + encMBtn('🔴 Bajas', encMState.tipo==='baja', "encMSetTipo('baja')");
}
function encMRebuildControls(){
    // Sedes
    const sedes=['todas','El Bolsón','Lago Puelo','Bariloche'];
    document.getElementById('encMSedeBtns').innerHTML = sedes.map(s=>
        encMBtn(s==='todas'?'Todas':s, encMState.sede===s, `encMSetSede('${s.replace(/'/g,"\\'")}')`)).join('');
    // Profes dentro del scope sede+tipo (solo nombres reales; "Sin asignar" no se lista)
    const rows = encMScopeRows(true);
    const profes = [...new Set(rows.map(r=>r.profe))].filter(p=>p!=='Sin asignar').sort();
    document.getElementById('encMProfeBtns').innerHTML =
        encMBtn('Todos', encMState.profe==='todos', "encMSetProfe('todos')")
        + profes.map(p=>{ const m=encProfeMeta(p); const lbl=encProfeLabel(p); const style=m&&!m.activo?'opacity:.6;':''; return `<button class="tab ${encMState.profe===p?'active':''}" style="font-size:.74rem;padding:5px 12px;${style}" onclick="encMSetProfe('${p.replace(/'/g,"\\'")}')">${lbl}</button>`; }).join('');
    encMRenderTipoBtns();
}
function encMSetSede(s){ encMState.sede=s; encMState.profe='todos'; encMRebuildControls(); encMRender(); }
function encMSetProfe(p){ encMState.profe=p; encMRebuildControls(); encMRender(); }
function encMSetTipo(t){ encMState.tipo=t; encMState.profe='todos'; encMRebuildControls(); encMRender(); }

function encMRender(){
    const rows = encMScopeRows();
    const esBienv = encMState.tipo==='bienvenida';

    // Agrupar por mes
    const byMonth = {};
    rows.forEach(r=>{
        const key = r.fecha ? (r.fecha.getFullYear()+'-'+String(r.fecha.getMonth()+1).padStart(2,'0')) : 'zzzz';
        const lbl = r.fecha ? (ENCM_MS[r.fecha.getMonth()]+' '+r.fecha.getFullYear()) : 'Sin fecha';
        (byMonth[key] = byMonth[key] || {lbl, rows:[]}).rows.push(r);
    });
    const keys = Object.keys(byMonth).sort();

    // KPIs
    const npsAll = rows.map(r=>r.nps).filter(n=>n!=null);
    const npsGen = npsAll.length ? calcNPS(npsAll) : null;
    let mejor=null, peor=null;
    keys.forEach(k=>{ if(k==='zzzz') return; const ns=byMonth[k].rows.map(r=>r.nps).filter(n=>n!=null); if(!ns.length) return; const v=calcNPS(ns); if(mejor===null||v>mejor.v) mejor={l:byMonth[k].lbl,v}; if(peor===null||v<peor.v) peor={l:byMonth[k].lbl,v}; });
    const kpiCard=(l,v,c,sub)=>`<div class="stat-card" style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px;border-left:3px solid ${c};">
        <div style="font-size:1.5rem;font-weight:800;color:${c};font-family:monospace;">${v}</div>
        <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-top:4px;">${l}</div>
        ${sub?`<div style="font-size:.68rem;color:var(--muted);margin-top:2px;">${sub}</div>`:''}</div>`;
    let kpis = kpiCard('Respuestas totales', rows.length, 'var(--accent)', (encMState.sede==='todas'?'Todas las sedes':encMState.sede));
    if(esBienv){
        const npsCol = npsGen==null?'#94a3b8':npsGen>=50?'#10b981':npsGen>=30?'#3b82f6':npsGen>=0?'#f59e0b':'#ef4444';
        kpis += kpiCard('NPS general', npsGen==null?'—':npsGen, npsCol, npsAll.length+' con puntaje');
        kpis += kpiCard('Mejor mes', mejor?mejor.v:'—', '#10b981', mejor?mejor.l:'');
        kpis += kpiCard('Mes más bajo', peor?peor.v:'—', '#ef4444', peor?peor.l:'');
    } else {
        const meses = keys.filter(k=>k!=='zzzz').length;
        kpis += kpiCard('Meses con bajas', meses, '#f59e0b', '');
        if(npsAll.length){
            const npsCol = npsGen==null?'#94a3b8':npsGen>=50?'#10b981':npsGen>=30?'#3b82f6':npsGen>=0?'#f59e0b':'#ef4444';
            kpis += kpiCard('NPS de bajas', npsGen==null?'—':npsGen, npsCol, npsAll.length+' con puntaje');
        }
    }
    document.getElementById('encMKpis').innerHTML = kpis;

    // Tabla por mes — ambas encuestas tienen NPS; en bajas se suma el motivo principal.
    const headEl = document.getElementById('encMTablaMesHead');
    if(headEl) headEl.innerHTML = esBienv
        ? '<th>Mes</th><th>Respuestas</th><th>NPS</th><th>Promotores</th><th>Pasivos</th><th>Detractores</th>'
        : '<th>Mes</th><th>Bajas</th><th>NPS</th><th>Promotores</th><th>Pasivos</th><th>Detractores</th><th>Motivo principal</th>';
    const nCols = esBienv ? 6 : 7;
    let tb='';
    keys.forEach(k=>{
        const g=byMonth[k];
        const ns=g.rows.map(r=>r.nps).filter(n=>n!=null);
        const nps=ns.length?calcNPS(ns):null;
        const prom=ns.filter(n=>n>=9).length, pas=ns.filter(n=>n>=7&&n<=8).length, det=ns.filter(n=>n<=6).length;
        const npsCol=nps==null?'#94a3b8':nps>=50?'#10b981':nps>=30?'#3b82f6':nps>=0?'#f59e0b':'#ef4444';
        let extra='';
        if(!esBienv){
            const cnt={};
            g.rows.forEach(r=>{ const m=(r.motivo||'').trim(); if(m) cnt[m]=(cnt[m]||0)+1; });
            const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
            extra = `<td>${top?`${top[0]} <span style="color:var(--muted);font-size:.75rem;">(${top[1]})</span>`:'—'}</td>`;
        }
        tb+=`<tr>
            <td><b>${g.lbl}</b></td>
            <td>${g.rows.length}</td>
            <td>${nps==null?'—':`<span style="color:${npsCol};font-weight:700;">${nps}</span>`}</td>
            <td>${ns.length?prom:'—'}</td>
            <td>${ns.length?pas:'—'}</td>
            <td>${ns.length?det:'—'}</td>
            ${extra}
        </tr>`;
    });
    document.getElementById('encMTablaMes').innerHTML = tb || `<tr><td colspan="${nCols}" style="text-align:center;color:var(--muted);padding:18px;">Sin datos para este filtro</td></tr>`;

    // Tabla comparativa por profesional (dentro de sede+tipo, ignora filtro de profe)
    const scopeProfe = encMScopeRows(true);
    const byProfe={};
    scopeProfe.forEach(r=>{ (byProfe[r.profe]=byProfe[r.profe]||{sede:r.sede,rows:[]}).rows.push(r); });
    const pArr = Object.entries(byProfe).map(([p,o])=>{
        const ns=o.rows.map(r=>r.nps).filter(n=>n!=null);
        const cnt={}; o.rows.forEach(r=>{ const m=(r.motivo||'').trim(); if(m) cnt[m]=(cnt[m]||0)+1; });
        const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
        return {p, sede:o.sede, n:o.rows.length, nps:ns.length?calcNPS(ns):null, motivo: top?`${top[0]} <span style="color:var(--muted);font-size:.75rem;">(${top[1]})</span>`:'—'};
    });
    pArr.sort((a,b)=> (b.nps==null?-999:b.nps)-(a.nps==null?-999:a.nps));
    const headP=document.getElementById('encMTablaProfeHead');
    if(headP) headP.innerHTML = esBienv
        ? '<th>Profesional</th><th>Sede</th><th>Respuestas</th><th>NPS</th>'
        : '<th>Profesional</th><th>Sede</th><th>Bajas</th><th>NPS</th><th>Motivo principal</th>';
    let pb='';
    pArr.forEach(x=>{
        const npsCol=x.nps==null?'#94a3b8':x.nps>=50?'#10b981':x.nps>=30?'#3b82f6':x.nps>=0?'#f59e0b':'#ef4444';
        const sel = encMState.profe===x.p;
        const meta=encProfeMeta(x.p); const inact=meta&&!meta.activo;
        pb+=`<tr style="cursor:pointer;${sel?'background:#eef2ff;':''}${inact?'opacity:.65;':''}" onclick="encMSetProfe('${x.p.replace(/'/g,"\\'")}')">
            <td><b>${x.p}</b>${meta&&meta.kine?' <span style="font-size:.6rem;color:#6366f1;font-weight:700;">KINE</span>':''}${inact?' <span style="font-size:.6rem;color:#94a3b8;font-weight:700;">INACTIVO</span>':''}</td><td>${x.sede}</td><td>${x.n}</td>
            <td><span style="color:${npsCol};font-weight:700;">${x.nps==null?'—':x.nps}</span></td>
            ${esBienv?'':`<td>${x.motivo}</td>`}
        </tr>`;
    });
    document.getElementById('encMTablaProfe').innerHTML = pb || `<tr><td colspan="${esBienv?4:5}" style="text-align:center;color:var(--muted);padding:18px;">Sin datos</td></tr>`;

    // Respuestas individuales (ordenadas por fecha, más nuevas primero)
    // Ambas encuestas tienen la pregunta de recomendación → NPS y Categoría siempre.
    // En bajas se suma la columna Motivo.
    const headR = document.getElementById('encMRespHead');
    if(headR) headR.innerHTML = esBienv
        ? '<th style="width:92px;">Fecha</th><th style="width:150px;">Profesional</th><th style="width:56px;">NPS</th><th style="width:104px;">Categoría</th><th>Comentario</th>'
        : '<th style="width:92px;">Fecha</th><th style="width:150px;">Profesional</th><th style="width:56px;">NPS</th><th style="width:104px;">Categoría</th><th style="width:210px;">Motivo</th><th>Comentario</th>';
    const nColsR = esBienv ? 5 : 6;
    const det = rows.slice().sort((a,b)=>(b.fecha?b.fecha.getTime():0)-(a.fecha?a.fecha.getTime():0));
    const ahora = Date.now();
    const esNueva = f => f && (ahora - f.getTime()) <= 5*86400000 && (ahora - f.getTime()) >= -86400000;
    let rb='';
    det.forEach(r=>{
        const fl = r.fecha ? (r.fecha.getDate()+' '+ENCM_MS[r.fecha.getMonth()]+' '+r.fecha.getFullYear()) : 'Sin fecha';
        const nuevo = esNueva(r.fecha) ? ' <span style="background:#10b981;color:#fff;font-size:.58rem;font-weight:700;padding:1px 7px;border-radius:9px;margin-left:4px;white-space:nowrap;">● NUEVA</span>' : '';
        const n=r.nps;
        const cat = n==null?{t:'—',c:'#94a3b8'} : n>=9?{t:'Promotor',c:'#10b981'} : n>=7?{t:'Pasivo',c:'#f59e0b'} : {t:'Detractor',c:'#ef4444'};
        const cNps = n==null?'<span class="inf-muted">—</span>':`<b style="color:${cat.c};">${n}</b>`;
        const cCat = n==null?'<span class="inf-muted">—</span>':`<span style="background:${cat.c}22;color:${cat.c};font-weight:700;font-size:.68rem;padding:2px 9px;border-radius:9px;">${cat.t}</span>`;
        const cMot = esBienv ? '' : `<td style="min-width:190px;line-height:1.45;vertical-align:top;padding-top:10px;">${r.motivo ? r.motivo.replace(/</g,'&lt;') : '<span class="inf-muted">—</span>'}</td>`;
        const com = r.comentario ? r.comentario.replace(/</g,'&lt;') : '';
        const meta=encProfeMeta(r.profe); const profLbl = r.profe + (meta&&!meta.activo?' <span style="font-size:.58rem;color:#94a3b8;font-weight:700;">INACTIVO</span>':'') + (meta&&meta.kine?' <span style="font-size:.58rem;color:#6366f1;font-weight:700;">KINE</span>':'');
        rb += `<tr>
            <td style="white-space:nowrap;">${fl}${nuevo}</td>
            <td>${profLbl}</td>
            <td>${cNps}</td>
            <td>${cCat}</td>
            ${cMot}
            <td style="font-size:.78rem;color:var(--muted);min-width:340px;line-height:1.5;white-space:normal;word-break:normal;overflow-wrap:break-word;text-align:left;vertical-align:top;padding-top:10px;">${com}</td>
        </tr>`;
    });
    document.getElementById('encMTablaResp').innerHTML = rb || `<tr><td colspan="${nColsR}" style="text-align:center;color:var(--muted);padding:18px;">Sin respuestas para este filtro</td></tr>`;
    document.getElementById('encMRespCount').textContent = '('+det.length+')';
    document.getElementById('encMRespHint').innerHTML = encMState.profe==='todos'
        ? 'Mostrando todas las respuestas del filtro actual. Seleccioná un profesional para ver solo las suyas.'
        : ('Todas las respuestas de <b>'+encMState.profe+'</b> ('+det.length+').');

    // Gráficos
    const chartKeys = keys.filter(k=>k!=='zzzz');
    const labels = chartKeys.map(k=>byMonth[k].lbl);
    const respData = chartKeys.map(k=>byMonth[k].rows.length);
    const npsData = chartKeys.map(k=>{ const ns=byMonth[k].rows.map(r=>r.nps).filter(n=>n!=null); return ns.length?calcNPS(ns):0; });
    const wrap=document.getElementById('encMCharts');
    if(esBienv && labels.length){ wrap.style.display='grid'; try{ line('encMChartNps',labels,[{l:'NPS',d:npsData,c:'#6366f1'}]); bar('encMChartResp',labels,[{l:'Respuestas',d:respData,c:'#10b981'}]); }catch(e){} }
    else { wrap.style.display='none'; if(CH['encMChartNps'])CH['encMChartNps'].destroy(); if(CH['encMChartResp'])CH['encMChartResp'].destroy(); }
}

cargarTodo();