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
    encRenderInforme();
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

// ══ INFORME POR PROFESIONAL (encuestas) ══
// Junta bienvenida y bajas del profesional seleccionado. Solo datos reales de las planillas.
function encInformeDatosScope(){
    // Respeta el filtro de sede; si hay profesional elegido, filtra por él
    const f = a => a.filter(r =>
        (encMState.sede==='todas' || r.sede===encMState.sede) &&
        (encMState.profe==='todos' || r.profe===encMState.profe));
    const B = f((encMAll && encMAll['bienvenida']) || []);
    const C = f((encMAll && encMAll['baja']) || []);
    const nps = a => { const n=a.map(r=>r.nps).filter(v=>v!=null); return n.length?{v:calcNPS(n), n:n.length,
        prom:n.filter(x=>x>=9).length, pas:n.filter(x=>x>=7&&x<=8).length, det:n.filter(x=>x<=6).length}:null; };
    const motivos={};
    C.forEach(r=>{ const m=(r.motivo||'').trim(); if(m) motivos[m]=(motivos[m]||0)+1; });
    const topMot = Object.entries(motivos).sort((a,b)=>b[1]-a[1]).slice(0,4);
    return {B, C, npsB:nps(B), npsC:nps(C), topMot};
}

// Comentarios que aportan: los más extensos, priorizando detractores (lo que hay que corregir)
function encDestacados(arr, cant){
    return arr
        .filter(r => (r.comentario||'').trim().length > 25)
        .sort((a,b)=>{
            const pa = (a.nps!=null && a.nps<=6) ? 1 : 0, pb = (b.nps!=null && b.nps<=6) ? 1 : 0;
            if(pa!==pb) return pb-pa;
            return (b.comentario||'').length - (a.comentario||'').length;
        })
        .slice(0, cant);
}

function encRenderInforme(){
    const cont=document.getElementById('encMInforme'); if(!cont) return;
    const d=encInformeDatosScope();
    if(!d.B.length && !d.C.length){ cont.innerHTML=''; return; }
    const profe=encMState.profe, indiv = profe && profe!=='todos';
    const scope = indiv ? profe : (encMState.sede==='todas' ? 'Todas las sedes' : encMState.sede);

    const kpi=(lbl,val,col,sub)=>`<div style="flex:1;min-width:118px;background:var(--bg);border-radius:10px;padding:9px 12px;">
        <div style="font-size:.62rem;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.4px;">${lbl}</div>
        <div style="font-size:1.4rem;font-weight:800;color:${col};font-family:monospace;line-height:1.25;">${val}</div>
        ${sub?`<div style="font-size:.64rem;color:var(--muted);">${sub}</div>`:''}</div>`;
    const colNps=v=>v==null?'var(--muted)':v>=50?'#10b981':v>=30?'#3b82f6':v>=0?'#f59e0b':'#ef4444';

    let mot='';
    if(d.topMot.length) mot=`<div style="margin-top:10px;font-size:.78rem;">
        <span style="color:var(--muted);font-weight:600;">Motivos de baja:</span>
        ${d.topMot.map(m=>`<span style="display:inline-block;background:var(--bg);border-radius:8px;padding:3px 9px;margin:3px 4px 0 0;">${m[0]} <b>(${m[1]})</b></span>`).join('')}</div>`;

    // Comentarios destacados
    const cita = (r, tipo) => {
        const n = r.nps;
        const cat = n==null ? {t:tipo, c:'#94a3b8'} : n>=9 ? {t:'Promotor', c:'#10b981'} : n>=7 ? {t:'Pasivo', c:'#f59e0b'} : {t:'Detractor', c:'#ef4444'};
        const fec = r.fecha ? (r.fecha.getDate()+' '+ENCM_MS[r.fecha.getMonth()]) : '';
        return `<div style="border-left:3px solid ${cat.c};background:var(--bg);border-radius:0 8px 8px 0;padding:9px 12px;margin-bottom:8px;">
            <div style="font-size:.78rem;line-height:1.5;color:var(--text);">“${(r.comentario||'').replace(/</g,'&lt;')}”</div>
            <div style="font-size:.66rem;color:var(--muted);margin-top:5px;">
                <span style="color:${cat.c};font-weight:700;">${cat.t}${n!=null?' · '+n:''}</span>
                ${indiv?'':' · <b>'+r.profe+'</b>'} · ${r.sede||''} ${fec?'· '+fec:''}
                ${r.motivo?' · <i>'+r.motivo+'</i>':''}
            </div></div>`;
    };
    const destB = encDestacados(d.B, 3), destC = encDestacados(d.C, 3);
    let coment='';
    if(destB.length || destC.length){
        coment=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:14px;">
            <div><div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:8px;">
                <i class="fas fa-comment" style="color:#10b981;margin-right:5px;"></i>Qué dicen los socios nuevos</div>
                ${destB.length?destB.map(r=>cita(r,'Bienvenida')).join(''):'<div style="font-size:.76rem;color:var(--muted);">Sin comentarios cargados.</div>'}</div>
            <div><div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:8px;">
                <i class="fas fa-comment-slash" style="color:#ef4444;margin-right:5px;"></i>Qué dicen los que se fueron</div>
                ${destC.length?destC.map(r=>cita(r,'Baja')).join(''):'<div style="font-size:.76rem;color:var(--muted);">Sin comentarios cargados.</div>'}</div>
        </div>`;
    }

    const btn = `<div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="aud-btn-save" onclick="encImagen(this)" style="background:var(--card);border:1px solid var(--border);color:var(--text);font-size:.8rem;padding:8px 16px;"><i class="fas fa-image"></i> Imagen</button>
        ${indiv
            ? `<button class="aud-btn-save" onclick="encMsgAbrir()" style="font-size:.8rem;padding:8px 16px;"><i class="fas fa-comment-dots"></i> Generar mensaje</button>`
            : `<span style="font-size:.72rem;color:var(--muted);align-self:center;">Elegí un profesional para su devolución</span>`}
    </div>`;

    cont.innerHTML=`<div class="card" style="margin-bottom:16px;border-left:3px solid var(--accent);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
            <div class="card-title" style="margin:0;"><i class="fas fa-user-check" style="color:var(--accent);"></i> Informe de encuestas
                <span style="font-size:.72rem;font-weight:600;color:var(--muted);">· ${scope}</span></div>
            ${btn}
        </div>
        <div style="display:flex;gap:9px;flex-wrap:wrap;">
            ${kpi('NPS bienvenida', d.npsB?d.npsB.v:'—', colNps(d.npsB?d.npsB.v:null), d.npsB?d.npsB.n+' respuestas':'sin datos')}
            ${kpi('Promotores', d.npsB?d.npsB.prom:'—', '#10b981', d.npsB?'de '+d.npsB.n:'')}
            ${kpi('Detractores', d.npsB?d.npsB.det:'—', '#ef4444', d.npsB?'de '+d.npsB.n:'')}
            ${kpi('Bajas', d.C.length, d.C.length?'#f59e0b':'#10b981', 'encuestas de baja')}
            ${kpi('NPS de bajas', d.npsC?d.npsC.v:'—', colNps(d.npsC?d.npsC.v:null), d.npsC?d.npsC.n+' con puntaje':'sin datos')}
        </div>
        ${mot}
        ${coment}
        <div style="font-size:.68rem;color:var(--muted);margin-top:10px;"><i class="fas fa-circle-info"></i> Comentarios reales de las planillas, priorizando los de detractores. El mensaje se redacta solo con estos datos.</div>
    </div>`;
}

// ══ IMAGEN del informe de encuestas ══
async function encImagen(btn){
    const o=btn.innerHTML; btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Generando…';
    try{
        const d=encInformeDatosScope();
        const indiv = encMState.profe && encMState.profe!=='todos';
        const titulo = indiv ? encMState.profe : (encMState.sede==='todas'?'Todas las sedes':encMState.sede);
        const sub = indiv ? ((d.B[0]&&d.B[0].sede)||(d.C[0]&&d.C[0].sede)||'') : 'Informe general';
        const destB=encDestacados(d.B,2), destC=encDestacados(d.C,2);
        try{ await document.fonts.load('700 60px Poppins'); await document.fonts.ready; }catch(e){}

        const W=1080, H=1500, cv=document.createElement('canvas'); cv.width=W; cv.height=H;
        const x=cv.getContext('2d');
        const BG='#0f1420',CARD='#1a2132',CARD2='#1f293d',ACC='#10b981',WHITE='#fff',MUT='#94a3b8',RED='#ef4444',AMB='#f59e0b',BLUE='#3b82f6';
        const F=s=>`${s}px Poppins, 'Segoe UI', system-ui, sans-serif`;
        const rr=(a,b,c,dd,r,f)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+c,b,a+c,b+dd,r);x.arcTo(a+c,b+dd,a,b+dd,r);x.arcTo(a,b+dd,a,b,r);x.arcTo(a,b,a+c,b,r);x.closePath();x.fillStyle=f;x.fill();};
        const txt=(t,px,py,wt,sz,c,al)=>{x.font=`${wt} ${F(sz)}`;x.fillStyle=c;x.textAlign=al||'left';x.textBaseline='alphabetic';x.fillText(t,px,py);};
        const wrap=(t,px,py,maxW,lh,wt,sz,c,maxL)=>{
            x.font=`${wt} ${F(sz)}`;x.fillStyle=c;x.textAlign='left';
            const ws=String(t).split(/\s+/); let ln='',n=0;
            for(let i=0;i<ws.length;i++){
                const test=ln?ln+' '+ws[i]:ws[i];
                if(x.measureText(test).width>maxW && ln){
                    if(n===maxL-1){ x.fillText(ln.replace(/[.,;]$/,'')+'…',px,py+n*lh); return py+(n+1)*lh; }
                    x.fillText(ln,px,py+n*lh); ln=ws[i]; n++;
                } else ln=test;
            }
            x.fillText(ln,px,py+n*lh); return py+(n+1)*lh;
        };

        x.fillStyle=BG; x.fillRect(0,0,W,H);
        x.fillStyle='#0b0f19'; x.fillRect(0,0,W,210);
        rr(60,52,92,92,22,ACC); txt('M',106,118,'700',68,WHITE,'center');
        txt('MOVE',176,106,'700',54,WHITE);
        txt('INFORME DE ENCUESTAS',179,150,'500',21,MUT);
        txt(titulo,W-60,106,'700',46,WHITE,'right');
        txt(sub,W-60,150,'400',24,ACC,'right');

        // KPIs
        let y=252; txt('Voz del socio',60,y+34,'700',36,WHITE);
        const kp=[
            {l:'NPS BIENVENIDA', v:d.npsB?String(d.npsB.v):'—', c:!d.npsB?MUT:d.npsB.v>=50?ACC:d.npsB.v>=30?BLUE:AMB, s:d.npsB?d.npsB.n+' respuestas':'sin datos'},
            {l:'PROMOTORES', v:d.npsB?String(d.npsB.prom):'—', c:ACC, s:d.npsB?'de '+d.npsB.n:''},
            {l:'DETRACTORES', v:d.npsB?String(d.npsB.det):'—', c:RED, s:d.npsB?'de '+d.npsB.n:''},
            {l:'BAJAS', v:String(d.C.length), c:d.C.length?AMB:ACC, s:'encuestas de baja'},
            {l:'NPS DE BAJAS', v:d.npsC?String(d.npsC.v):'—', c:!d.npsC?MUT:d.npsC.v>=50?ACC:d.npsC.v>=0?AMB:RED, s:d.npsC?d.npsC.n+' con puntaje':'sin datos'},
        ];
        const cw=(W-120-4*14)/5, ch=132, yb=y+58;
        kp.forEach((k,i)=>{ const cx=60+i*(cw+14);
            rr(cx,yb,cw,ch,16,CARD); rr(cx,yb,6,ch,3,k.c);
            txt(k.v,cx+20,yb+66,'700',44,k.c);
            txt(k.l,cx+21,yb+96,'700',14,MUT);
            if(k.s) txt(k.s,cx+21,yb+118,'400',14,MUT);
        });

        // Motivos
        let yy=yb+ch+34;
        if(d.topMot.length){
            txt('Motivos de baja declarados',60,yy+22,'700',26,WHITE);
            let mx=60, my=yy+56;
            d.topMot.forEach(m=>{
                const t=`${m[0]}  (${m[1]})`;
                x.font=`500 ${F(19)}`; const w=x.measureText(t).width+30;
                if(mx+w>W-60){ mx=60; my+=44; }
                rr(mx,my-24,w,36,10,CARD2); txt(t,mx+15,my,'500',19,MUT); mx+=w+10;
            });
            yy=my+34;
        }

        // Comentarios
        const bloque=(titulo2,col,arr,yTop,alto)=>{
            rr(60,yTop,W-120,alto,16,'#151c2b');
            txt(titulo2,86,yTop+38,'700',24,col);
            let cy=yTop+78;
            if(!arr.length){ txt('Sin comentarios cargados.',86,cy,'400',19,MUT); return; }
            arr.forEach(r=>{
                const n=r.nps;
                const cat=n==null?{t:'',c:MUT}:n>=9?{t:'Promotor',c:ACC}:n>=7?{t:'Pasivo',c:AMB}:{t:'Detractor',c:RED};
                x.fillStyle=cat.c; x.fillRect(86,cy-20,4,52);
                const fin=wrap('“'+(r.comentario||'').trim()+'”',102,cy,W-220,27,'400',19,'#e2e8f0',3);
                const meta=[cat.t+(n!=null?' · '+n:''), (indiv?'':r.profe), r.sede, r.motivo].filter(Boolean).join('  ·  ');
                txt(meta,102,fin+4,'600',15,cat.c);
                cy=fin+40;
            });
        };
        const altoB=Math.min(330, 120+destB.length*118);
        bloque('Qué dicen los socios nuevos',ACC,destB,yy,altoB);
        const y2=yy+altoB+18;
        bloque('Qué dicen los que se fueron',RED,destC,y2,Math.min(330,120+destC.length*118));

        const yf=H-58; x.fillStyle=CARD2; x.fillRect(60,yf,W-120,3);
        txt('Cada socio, un atleta. Cada mes, un paso hacia una mejor versión de MOVE.',60,yf+36,'300',22,MUT);
        txt(new Date().toLocaleDateString('es-AR'),W-60,yf+36,'400',21,MUT,'right');

        const a=document.createElement('a');
        a.download=`MOVE_Encuestas_${titulo.replace(/\s+/g,'_')}.png`;
        a.href=cv.toDataURL('image/png'); a.click();
    }catch(e){ alert('No se pudo generar la imagen: '+e.message); }
    btn.disabled=false; btn.innerHTML=o;
}

// ── Mensaje al profesional a partir de las encuestas ──
function encMsgCerrar(){ document.getElementById('encMsgModal').classList.remove('open'); }
function encMsgCopiar(btn){
    const t=document.getElementById('encMsgTexto');
    t.select(); document.execCommand('copy');
    const o=btn.innerHTML; btn.innerHTML='<i class="fas fa-check"></i> ¡Copiado!';
    setTimeout(()=>btn.innerHTML=o,1600);
}
function encMsgAbrir(){
    document.getElementById('encMsgProfe').textContent = encMState.profe;
    document.getElementById('encMsgScope').textContent =
        (encMState.sede==='todas'?'Todas las sedes':encMState.sede);
    document.getElementById('encMsgModal').classList.add('open');
    encMsgGenerar(false);
}
async function encMsgGenerar(regen){
    const st=document.getElementById('encMsgStatus'), txt=document.getElementById('encMsgTexto');
    const key = (typeof aeGetKey==='function') ? aeGetKey() : '';
    st.style.display='block';
    if(!key){ st.innerHTML='<span style="color:#f59e0b;"><i class="fas fa-key"></i> Configurá la API Key de Groq desde Análisis Entrenadores → Generar mensaje.</span>'; return; }
    st.innerHTML='<i class="fas fa-spinner fa-spin"></i> Redactando con IA…'; txt.value='';

    const profe=encMState.profe, d=encInformeDatosScope();
    d.sede = encMState.sede==='todas' ? ((d.B[0]&&d.B[0].sede)||(d.C[0]&&d.C[0].sede)||'—') : encMState.sede;
    d.comB = encDestacados(d.B,6).map(r=>(r.comentario||'').trim());
    d.comC = encDestacados(d.C,6).map(r=>(r.comentario||'').trim());
    const L=[];
    L.push(`Profesional: ${profe} (sede ${d.sede})`);
    if(d.npsB) L.push(`ENCUESTA DE BIENVENIDA — NPS ${d.npsB.v} sobre ${d.npsB.n} respuestas: ${d.npsB.prom} promotores, ${d.npsB.pas} pasivos, ${d.npsB.det} detractores.`);
    else L.push('ENCUESTA DE BIENVENIDA — sin respuestas cargadas.');
    if(d.comB.length) L.push('Comentarios textuales de socios nuevos:\n' + d.comB.map(c=>'· "'+c+'"').join('\n'));
    L.push(`ENCUESTAS DE BAJA — ${d.C.length} registradas${d.npsC?` · NPS de bajas ${d.npsC.v}`:''}.`);
    if(d.topMot.length) L.push('Motivos declarados: ' + d.topMot.map(m=>`${m[0]} (${m[1]})`).join(' · '));
    if(d.comC.length) L.push('Comentarios textuales de socios que se fueron:\n' + d.comC.map(c=>'· "'+c+'"').join('\n'));

    const foco=(document.getElementById('encMsgFocus').value||'').trim();
    const sys = `Actuás como Emanuel Lezcano, Coordinador Deportivo de MOVE, cadena de gimnasios boutique de la Patagonia argentina. Le escribís a un profesional del equipo una devolución basada en lo que dijeron SUS socios en las encuestas de bienvenida y de baja.

QUIÉN SOS: un líder que desarrolla personas, no un jefe que audita. Conocés a cada profe, lo acompañás y le das devoluciones para que crezca.

REGLAS INNEGOCIABLES:
- Usá ÚNICAMENTE los datos y comentarios que te paso. NO inventes números, ni frases de socios, ni situaciones. Si un dato no está, no lo menciones.
- Podés citar textualmente algún comentario de los socios (son reales) para que la devolución tenga peso.
- SIEMPRE empezás reconociendo algo positivo y concreto.
- Los aspectos a mejorar se plantean como oportunidades ("creo que hay una oportunidad en…", "me gustaría que trabajemos…"), nunca como reproche.
- Cerrás preguntando cómo lo podés ayudar y con una frase motivadora.
- Si hay comentarios sobre cosas que no dependen del profesional (precio, horarios, equipamiento), aclaralo para no cargarle culpa: eso es del gimnasio, no suyo.

ESTRUCTURA (WhatsApp):
1) Saludo cálido por su nombre.
2) Qué dicen sus socios nuevos (NPS y lo positivo que destacan, citando algún comentario).
3) Qué se puede leer de las bajas (motivos, y si son evitables o no).
4) Uno o dos focos de mejora concretos que dependan de él.
5) Pregunta genuina de cómo ayudarlo.
6) Cierre motivador.

ESTILO: español argentino (vos/tenés/sos) con registro FORMAL y profesional: cálido y cercano pero prolijo, sin lunfardo. Sin markdown ni asteriscos. Emojis solo si aportan, con mucha moderación. Entre 180 y 240 palabras.`;

    const usr = `Escribí la devolución para ${profe}.${foco?`\n\nENFOQUE PRIORITARIO QUE PIDIÓ EMANUEL: "${foco}"`:''}\n\nDATOS REALES DE SUS ENCUESTAS:\n\n${L.join('\n\n')}`;

    try{
        const resp=await fetch('https://api.groq.com/openai/v1/chat/completions',{
            method:'POST',
            headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
            body:JSON.stringify({model:AE_GROQ_MODEL,messages:[{role:'system',content:sys},{role:'user',content:usr}],temperature:regen?1.05:0.9,max_tokens:950})
        });
        if(!resp.ok) throw new Error('HTTP '+resp.status+' — '+(await resp.text()).slice(0,160));
        const data=await resp.json();
        txt.value=(data.choices&&data.choices[0]&&data.choices[0].message.content||'').trim()||'(respuesta vacía)';
        st.style.display='none';
    }catch(e){
        st.innerHTML=`<span style="color:#ef4444;"><i class="fas fa-triangle-exclamation"></i> ${e.message}</span>`;
    }
}

cargarTodo();