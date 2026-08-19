// ══════════════════════════════════════════════════
// INFORME CONSOLIDADO — Resumen General (todas las sedes)
// ══════════════════════════════════════════════════
const INF_PROFE_IDS = ['belen','fer','enzo','javi','agus','camila','carla','estefania'];
const INF_SEDE   = {belen:'El Bolsón',fer:'El Bolsón',enzo:'El Bolsón',javi:'Lago Puelo',agus:'Lago Puelo',camila:'Bariloche',carla:'Bariloche',estefania:'Bariloche'};
const INF_NOMBRE = {belen:'Belén',fer:'Fer',enzo:'Enzo',javi:'Javi',agus:'Agus',camila:'Camila',carla:'Carla',estefania:'Estefanía'};
const INF_SEDES_ORDER = ['El Bolsón','Lago Puelo','Bariloche'];
let informeGenerado = false;
let informeCargando = false;

function informeInit(){ if(!informeGenerado && !informeCargando) informeGenerar(); }
function infSet(msg){ const el=document.getElementById('informeStatus'); if(el) el.innerHTML=msg; }
function infEsc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function infNum(v,suf){ return (v===null||v===undefined||v===''||(typeof v==='number'&&isNaN(v)))?'<span class="inf-muted">—</span>':(v+(suf||'')); }
function infNormSede(s){ s=String(s||''); if(/bols/i.test(s))return 'El Bolsón'; if(/puelo/i.test(s))return 'Lago Puelo'; if(/baril/i.test(s))return 'Bariloche'; return s||'—'; }

async function informeGenerar(){
    if(informeCargando) return;
    informeCargando = true;
    infSet('<i class="fas fa-spinner fa-spin"></i> Leyendo planillas, auditorías y encuestas en vivo… puede tardar unos segundos.');

    // 1) Datos vivos por profesional (planillas Objetivos)
    await Promise.allSettled(INF_PROFE_IDS.map(async id=>{
        if(!aeLiveCargado[id]){
            try { await aeLoadLive(id); }
            catch(e){ AE_DATA[id] = AE_FALLBACK[id]; }
        }
    }));

    // 1b) Planillas generales (altas 2025/2026, deserción) — para Estado y 2025 vs 2026
    try { if(!planData){ await cargarTodo(); } } catch(e){}

    // 2) Auditorías (ya cargadas en localStorage/gist al abrir la sección de auditoría)
    try { if(typeof audCargarHistorial==='function' && (!audHistorial||!audHistorial.length)) audCargarHistorial(); } catch(e){}

    // 3) Encuestas — cargadores propios (no pisan el estado de otras secciones)
    let bw=[],bc=[],barw=[],barc=[];
    try {
        [bw,bc] = await Promise.all([
            sheetLoad(SHEET_ENC_ID,'1563858316','infBolBienv'),
            sheetLoad(SHEET_ENC_ID,'839375428','infBolBaja')
        ]);
    } catch(e){}
    try {
        [barw,barc] = await Promise.all([
            sheetLoad(SHEET_BARI_ENC_ID,SHEET_BARI_BIENV_GID,'infBariBienv'),
            sheetLoad(SHEET_BARI_ENC_ID,SHEET_BARI_BAJAS_GID,'infBariBaja')
        ]);
    } catch(e){}

    const encBienv = [...(bw||[]), ...(barw||[])];
    const encBaja  = [...(bc||[]), ...(barc||[])];

    // Agrupar encuestas por sede
    const sedeOfRow = r => {
        let s = getCol(r,'sede'); if(s) return infNormSede(s);
        const p = getCol(r,'profesor')||getCol(r,'profesional')||getCol(r,'profe');
        return infNormSede(getSede(String(p)));
    };
    const npsBySede={}, bajaBySede={};
    INF_SEDES_ORDER.forEach(s=>{ npsBySede[s]=[]; bajaBySede[s]=[]; });
    encBienv.forEach(r=>{ const s=sedeOfRow(r); const n=getNPSVal(r); if(npsBySede[s]&&!isNaN(n)) npsBySede[s].push(n); });
    encBaja.forEach(r=>{ const s=sedeOfRow(r); if(bajaBySede[s]) bajaBySede[s].push(r); });

    // Auditorías por sede
    const audBySede={}; INF_SEDES_ORDER.forEach(s=>audBySede[s]=[]);
    (audHistorial||[]).forEach(a=>{ const s=infNormSede(a.sede); if(audBySede[s]) audBySede[s].push(a); });

    // ── Construir HTML ──
    const hoy = new Date().toLocaleDateString('es-AR',{day:'2-digit',month:'long',year:'numeric'});
    // Mes de referencia = último mes CERRADO (el mes calendario en curso está incompleto)
    let gMi = new Date().getMonth() - 1; if(gMi<0) gMi=0;
    // si no hay datos de ese mes en ninguna planilla, retroceder hasta encontrarlos
    const _hayMes = ab => INF_PROFE_IDS.some(id=>{ const d=AE_DATA[id]||{}; const ms=d.meses||[]; const j=ms.indexOf(ab); return j>=0 && d.objetivos&&d.objetivos[j]&&d.objetivos[j].activos>0; });
    while(gMi>0 && !_hayMes(MESES[gMi])) gMi--;
    const gAbbr = MESES[gMi];
    const gMesNombre = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][gMi];

    // Métricas por profesional, fijadas al mismo mes para todas las sedes (mes actual vs anterior)
    const infProfe = {};   // id -> {sede,nombre,mes,mesPrev,o,oPrev}
    INF_PROFE_IDS.forEach(id=>{
        const d = AE_DATA[id] || AE_FALLBACK[id] || {};
        const objs = d.objetivos||[]; const ms = d.meses||[];
        let li = ms.indexOf(gAbbr);
        if(li<0 || !objs[li] || !objs[li].activos){ li=-1; objs.forEach((o,i)=>{ if(o&&o.activos>0) li=i; }); }
        const o = li>=0 ? objs[li] : null;
        const pi = li>0 ? li-1 : -1;
        const oPrev = pi>=0 ? objs[pi] : null;
        infProfe[id] = {
            sede: INF_SEDE[id], nombre: INF_NOMBRE[id], li,
            mes: li>=0 ? ((d.mesesFull&&d.mesesFull[li])||ms[li]||'') : '',
            mesPrev: pi>=0 ? ((d.mesesFull&&d.mesesFull[pi])||ms[pi]||'') : '',
            o, oPrev,
            tareas: (d.tareas&&d.tareas[li])||null
        };
    });

    let H = `<h1>Informe Consolidado — MOVE</h1>
        <div class="inf-meta">Generado el ${hoy} · Datos en vivo de las planillas, auditorías y encuestas · Las tres sedes y todos los profesionales</div>`;

    // ── PANORAMA: socios actuales (roster vivo) por sede vs último mes cerrado ──
    // Conteo real de socios HOY (mismo número que los KPIs de la app)
    const liveSede = {'El Bolsón':0,'Lago Puelo':0,'Bariloche':0};
    let liveHay = {'El Bolsón':false,'Lago Puelo':false,'Bariloche':false};
    (planData&&planData.profes||[]).forEach(p=>{ const s=infNormSede(getSede(p.nombre)); if(liveSede[s]!=null){ liveSede[s]+=(p.activos||0); liveHay[s]=true; } });
    (bariData||[]).forEach(p=>{ liveSede['Bariloche']+=(p.activos||0); liveHay['Bariloche']=true; });

    H += `<h2><i class="fas fa-users"></i> Panorama de socios — padrón activo por sede</h2>`;
    H += `<div class="inf-muted" style="font-size:.78rem;margin-bottom:6px;">Socios activos hoy (padrón real en el gym), por sede. Es el mismo número que los KPI de cada sede en el dashboard.</div>`;
    let totCur=0, panRows='';
    INF_SEDES_ORDER.forEach(sede=>{
        const cur = liveHay[sede] ? liveSede[sede] : null;
        if(cur!=null) totCur+=cur;
        panRows += `<tr>
            <td><b>${sede}</b></td>
            <td>${cur!=null?('<b>'+cur+'</b>'):'<span class="inf-muted">—</span>'}</td>
        </tr>`;
    });
    H += `<table>
        <thead><tr><th>Sede</th><th>Socios activos (hoy)</th></tr></thead>
        <tbody>${panRows}</tbody>
        <tfoot><tr style="font-weight:700;background:#eef2ff;">
            <td>TOTAL MOVE</td><td>${totCur||'—'}</td>
        </tr></tfoot>
    </table>`;

    // ══ ESTE MES VS EL ANTERIOR ══
    const comp = INF_PROFE_IDS.map(id=>{
        const p = infProfe[id];
        return {id, nombre:p.nombre, sede:p.sede, o:p.o, oPrev:p.oPrev, mes:p.mes, mesPrev:p.mesPrev};
    }).filter(p=>p.o);
    const mesActNom = (comp.find(c=>c.mes)||{}).mes || gMesNombre;
    const mesPrevNom = (comp.find(c=>c.mesPrev)||{}).mesPrev || 'mes anterior';

    if(comp.length){
        const prom = (arr,f)=>{ const v=arr.map(f).filter(x=>x!=null&&isFinite(x)&&x>0); return v.length? +(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1) : null; };
        const sum  = (arr,f)=> arr.map(f).filter(x=>x!=null&&isFinite(x)).reduce((a,b)=>a+b,0);

        H += `<h2><i class="fas fa-arrow-trend-up"></i> ${mesActNom} vs ${mesPrevNom} — cómo venimos</h2>`;
        H += `<div class="inf-muted" style="font-size:.78rem;margin-bottom:8px;">Comparación directa contra el mes anterior. En verde lo que mejoró, en rojo lo que empeoró.</div>`;

        // KPIs globales
        const kpis = [
            {l:'Deserción promedio', act:prom(comp,c=>c.o.desercion), prev:prom(comp,c=>c.oPrev&&c.oPrev.desercion), u:'%', inv:true},
            {l:'Retención promedio', act:prom(comp,c=>c.o.retencion), prev:prom(comp,c=>c.oPrev&&c.oPrev.retencion), u:'%', inv:false},
            {l:'Re-evaluaciones prom.', act:prom(comp,c=>c.o.reeval), prev:prom(comp,c=>c.oPrev&&c.oPrev.reeval), u:'%', inv:false},
            {l:'Socios activos (liq.)', act:sum(comp,c=>c.o.activos), prev:sum(comp,c=>c.oPrev&&c.oPrev.activos), u:'', inv:false},
        ];
        H += `<table><thead><tr><th>Indicador</th><th>${mesPrevNom}</th><th>${mesActNom}</th><th>Diferencia</th><th>Lectura</th></tr></thead><tbody>`;
        kpis.forEach(k=>{
            const dif = (k.prev!=null&&k.act!=null)? +(k.act-k.prev).toFixed(1) : null;
            const mejor = dif==null?null : (k.inv ? dif<0 : dif>0);
            const col = dif==null||dif===0 ? '#64748b' : mejor ? '#10b981' : '#ef4444';
            const lect = dif==null?'sin base de comparación' : dif===0?'se mantuvo igual' : mejor?'mejoró':'empeoró';
            H += `<tr><td><b>${k.l}</b></td>
                <td>${k.prev!=null?k.prev+k.u:'—'}</td>
                <td><b>${k.act!=null?k.act+k.u:'—'}</b></td>
                <td style="color:${col};font-weight:700;">${dif==null?'—':(dif>0?'▲ +':dif<0?'▼ ':'= ')+Math.abs(dif)+k.u}</td>
                <td style="color:${col};">${lect}</td></tr>`;
        });
        H += `</tbody></table>`;

        // Por sede
        H += `<h3>Por sede</h3><table><thead><tr><th>Sede</th><th>Deserción ${mesPrevNom}</th><th>Deserción ${mesActNom}</th><th>Dif.</th><th>Retención ${mesActNom}</th></tr></thead><tbody>`;
        INF_SEDES_ORDER.forEach(sede=>{
            const g = comp.filter(c=>c.sede===sede); if(!g.length) return;
            const dp = prom(g,c=>c.oPrev&&c.oPrev.desercion), da = prom(g,c=>c.o.desercion), ra = prom(g,c=>c.o.retencion);
            const dif = (dp!=null&&da!=null)? +(da-dp).toFixed(1) : null;
            const col = dif==null||dif===0?'#64748b':dif<0?'#10b981':'#ef4444';
            H += `<tr><td><b>${sede}</b></td><td>${dp!=null?dp+'%':'—'}</td><td><b>${da!=null?da+'%':'—'}</b></td>
                <td style="color:${col};font-weight:700;">${dif==null?'—':(dif>0?'▲ +':'▼ ')+Math.abs(dif)}</td>
                <td>${ra!=null?ra+'%':'—'}</td></tr>`;
        });
        H += `</tbody></table>`;

        // Gráfico de barras: deserción por profesional
        const barrasDes = comp.map(c=>({nombre:c.nombre, prev:c.oPrev?c.oPrev.desercion:null, act:c.o.desercion}))
                              .sort((a,b)=>b.act-a.act);
        H += `<h3>Deserción por profesional</h3>${infSvgBarras(barrasDes, mesPrevNom, mesActNom, '%', true)}`;

        // Campana de Gauss comparada
        const gPrev = comp.filter(c=>c.oPrev&&c.oPrev.activos>0).map(c=>({nombre:c.nombre, v:c.oPrev.desercion}));
        const gAct  = comp.map(c=>({nombre:c.nombre, v:c.o.desercion}));
        const sP = infStats(gPrev.map(p=>p.v)), sA = infStats(gAct.map(p=>p.v));
        if(sA){
            H += `<h3>Distribución del equipo (campana de Gauss)</h3>`;
            H += `<div class="inf-muted" style="font-size:.76rem;margin-bottom:4px;">Cada punto es un profesional. Cuanto más angosta la campana, más pareja es la calidad entre el equipo.</div>`;
            H += infSvgGauss(gPrev, gAct, mesPrevNom.slice(0,3), mesActNom.slice(0,3));
            if(sP){
                const dM = +(sA.m-sP.m).toFixed(1), dS = +(sA.sd-sP.sd).toFixed(1);
                H += `<div style="font-size:.8rem;margin-top:6px;line-height:1.5;">
                    La media del equipo pasó de <b>${sP.m.toFixed(1)}%</b> a <b style="color:${dM<0?'#10b981':'#ef4444'}">${sA.m.toFixed(1)}%</b> (${dM>0?'+':''}${dM} pts).
                    La dispersión pasó de ${sP.sd.toFixed(1)} a <b style="color:${dS<0?'#10b981':'#ef4444'}">${sA.sd.toFixed(1)}</b>:
                    ${dS<0?'el equipo se emparejó, la calidad es más homogénea.':dS>0?'el equipo se dispersó, hay más diferencia entre profesionales.':'la dispersión se mantuvo.'}</div>`;
            }
        }

        // Re-evaluaciones por profesional
        const barrasRe = comp.map(c=>({nombre:c.nombre, prev:c.oPrev?c.oPrev.reeval:null, act:c.o.reeval}))
                             .sort((a,b)=>b.act-a.act);
        H += `<h3>Re-evaluaciones por profesional</h3>${infSvgBarras(barrasRe, mesPrevNom, mesActNom, '%', false)}`;
    }

    // ── ESTADO DEL GYM: semáforo de deserción por profesional ──
    const infSem = d => d<15 ? {c:'#10b981',cls:'inf-g',lbl:'Bajo control'} : d<25 ? {c:'#f59e0b',cls:'inf-y',lbl:'Moderada'} : {c:'#ef4444',cls:'inf-r',lbl:'Crítica'};
    H += `<h2><i class="fas fa-traffic-light"></i> Estado del Gym — Semáforo de deserción por profesional</h2>`;
    H += `<div class="inf-muted" style="font-size:.78rem;margin-bottom:6px;">Deserción del cierre de <b>${gMesNombre}</b> · 🟢 &lt;15% · 🟡 15–25% · 🔴 &gt;25% · tendencia vs mes previo.</div>`;
    INF_SEDES_ORDER.forEach(sede=>{
        const ids = INF_PROFE_IDS.filter(id=>INF_SEDE[id]===sede);
        let rows='';
        ids.forEach(id=>{
            const p=infProfe[id];
            if(!p.o){ rows+=`<tr><td><b>${p.nombre}</b></td><td colspan="4" class="inf-muted">sin datos</td></tr>`; return; }
            const des=p.o.desercion; const s=infSem(des);
            let tend='<span class="inf-muted">—</span>';
            if(p.oPrev && p.oPrev.desercion!=null){
                const diff=des-p.oPrev.desercion;
                if(Math.abs(diff)>=0.5){ const tc=diff>0?'#ef4444':'#10b981'; tend=`<span style="color:${tc};font-weight:700;">${diff>0?'↑':'↓'} ${Math.abs(diff).toFixed(1)}%</span> <span class="inf-muted" style="font-size:.7rem;">vs ${p.mesPrev}</span>`; }
                else tend='<span class="inf-muted">estable</span>';
            }
            rows+=`<tr>
                <td><b>${p.nombre}</b></td>
                <td><span class="${s.cls}">● ${s.lbl}</span></td>
                <td style="color:${s.c};font-weight:700;">${des.toFixed(1)}%</td>
                <td>${tend}</td>
                <td>${p.o.activos} <span class="inf-muted" style="font-size:.7rem;">activos liq.</span></td>
            </tr>`;
        });
        H += `<h3>${sede}</h3><table><thead><tr><th>Profesional</th><th>Estado</th><th>Deserción ${''}</th><th>Tendencia</th><th>Socios</th></tr></thead><tbody>${rows}</tbody></table>`;
    });

    INF_SEDES_ORDER.forEach(sede=>{
        const ids = INF_PROFE_IDS.filter(id=>INF_SEDE[id]===sede);
        H += `<div class="inf-sede"><h2><i class="fas fa-map-marker-alt"></i> ${sede}</h2>`;

        // Tabla de profesionales
        let totAct=0, desArr=[], retArr=[];
        let rows='';
        ids.forEach(id=>{
            const p = infProfe[id] || {};
            const o = p.o || null;
            const mesN = p.mes || '';
            // tareas cumplidas del mes de referencia
            let tareasTxt='<span class="inf-muted">—</span>';
            if(p.tareas){ const ts=p.tareas; const ok=ts.filter(t=>t.ok).length; tareasTxt = ts.length? (ok+'/'+ts.length) : '<span class="inf-muted">—</span>'; }
            if(o){ totAct+=o.activos; if(o.desercion!=null) desArr.push(o.desercion); if(o.retencion!=null) retArr.push(o.retencion); }
            rows += `<tr>
                <td><b>${INF_NOMBRE[id]}</b><br><span class="inf-muted" style="font-size:.7rem;">${mesN||'sin datos'}</span></td>
                <td>${o?infNum(o.activos):'<span class="inf-muted">—</span>'}</td>
                <td>${o?infNum(o.desercion,'%'):'<span class="inf-muted">—</span>'}</td>
                <td>${o?infNum(o.retencion,'%'):'<span class="inf-muted">—</span>'}</td>
                <td>${o?infNum(o.reeval):'<span class="inf-muted">—</span>'}</td>
                <td>${o?infNum(o.puntaje):'<span class="inf-muted">—</span>'}</td>
                <td>${tareasTxt}</td>
            </tr>`;
        });
        const avgDes = desArr.length ? (desArr.reduce((a,b)=>a+b,0)/desArr.length).toFixed(1) : null;
        const avgRet = retArr.length ? (retArr.reduce((a,b)=>a+b,0)/retArr.length).toFixed(1) : null;
        H += `<table>
            <thead><tr><th>Profesional</th><th>Activos liq.</th><th>Deserción</th><th>Retención</th><th>Re-eval.</th><th>Puntaje</th><th>Tareas</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr style="font-weight:700;background:#eef2ff;">
                <td>TOTAL / Promedio</td><td>${totAct||'<span class="inf-muted">—</span>'}</td>
                <td>${infNum(avgDes,'%')}</td><td>${infNum(avgRet,'%')}</td><td>—</td><td>—</td><td>—</td>
            </tr></tfoot>
        </table>`;

        // Encuestas de la sede
        const npsArr = npsBySede[sede]||[];
        const nps = npsArr.length ? calcNPS(npsArr) : null;
        const bajas = bajaBySede[sede]||[];
        H += `<h3><i class="fas fa-star" style="color:#f59e0b;"></i> Encuestas</h3>`;
        if(npsArr.length || bajas.length){
            H += `<table><thead><tr><th>Indicador</th><th>Valor</th></tr></thead><tbody>
                <tr><td>NPS Bienvenida (nuevos socios)</td><td>${nps!=null? '<b>'+nps+'</b> ('+npsArr.length+' respuestas)':'<span class="inf-muted">sin respuestas</span>'}</td></tr>
                <tr><td>Encuestas de baja (ex-socios)</td><td>${bajas.length? '<b>'+bajas.length+'</b> registradas':'<span class="inf-muted">sin registros</span>'}</td></tr>
            </tbody></table>`;
            // Top motivos de baja
            if(bajas.length){
                const mot={};
                bajas.forEach(r=>{ const m=String(getCol(r,'motivo')||'').trim(); if(m){ mot[m]=(mot[m]||0)+1; } });
                const top=Object.entries(mot).sort((a,b)=>b[1]-a[1]).slice(0,4);
                if(top.length){ H+='<div style="font-size:.8rem;margin:2px 0 10px;"><b>Principales motivos de baja:</b> '+top.map(t=>infEsc(t[0])+' ('+t[1]+')').join(' · ')+'</div>'; }
            }
        } else {
            H += `<p class="inf-muted" style="font-size:.82rem;">Sin datos de encuestas disponibles para esta sede (planilla privada o sin respuestas).</p>`;
        }

        // Auditorías de la sede
        const auds = audBySede[sede]||[];
        H += `<h3><i class="fas fa-clipboard-check" style="color:var(--accent);"></i> Auditorías</h3>`;
        if(auds.length){
            // última auditoría por profe
            const porProfe={};
            auds.forEach(a=>{ const k=a.profe||'—'; if(!porProfe[k]) porProfe[k]=a; });
            let arows='';
            Object.values(porProfe).forEach(a=>{
                const sem = a.semaforos||{};
                const chips = AUD_SECTIONS.map(s=>{ const v=sem[s.key]; const c=v==='rojo'?'inf-r':v==='amarillo'?'inf-y':v==='verde'?'inf-g':'inf-b'; return `<span class="${c}">${s.label.split(' ')[0]}</span>`; }).join('');
                arows += `<tr>
                    <td><b>${infEsc(a.profe)}</b><br><span class="inf-muted" style="font-size:.7rem;">${infEsc(a.date||'')}</span></td>
                    <td>${a.planesAuditados!=null?a.planesAuditados:'—'}</td>
                    <td>${a.planesVencidos!=null?a.planesVencidos:'—'}</td>
                    <td class="inf-chips">${chips}</td>
                </tr>`;
            });
            H += `<table><thead><tr><th>Profesional (última)</th><th>Planes auditados</th><th>Planes vencidos</th><th>Semáforos</th></tr></thead><tbody>${arows}</tbody></table>`;
            // Hallazgos recientes
            const hall=[];
            auds.forEach(a=>{ (a.detalleSocios||[]).forEach(d=>{ if(d.hallazgos&&d.hallazgos.trim()) hall.push({p:a.profe,n:d.nombre,h:d.hallazgos}); }); });
            if(hall.length){
                H += `<div style="font-size:.82rem;font-weight:700;margin:10px 0 4px;">Hallazgos técnicos registrados</div>`;
                hall.slice(0,8).forEach(x=>{ H += `<div class="inf-find"><b>${infEsc(x.p)} · ${infEsc(x.n)}:</b> ${infEsc(x.h)}</div>`; });
            }
        } else {
            H += `<p class="inf-muted" style="font-size:.82rem;">Sin auditorías registradas para esta sede.</p>`;
        }

        H += `</div>`; // /inf-sede
    });

    // ── ANÁLISIS DE ENTRENADORES — comparativa (objetivos, tareas, retención) ──
    H += `<h2><i class="fas fa-chart-bar"></i> Análisis de Entrenadores — Comparativa</h2>`;
    H += `<div class="inf-muted" style="font-size:.78rem;margin-bottom:6px;">Objetivos, tareas y retención de <b>${gMesNombre}</b> (datos reales 2026). Ranking por puntaje · variación vs mes previo.</div>`;
    {
        const arr = INF_PROFE_IDS.map(id=>{
            const p = infProfe[id]; if(!p.o) return {id,p,nodata:true};
            const ts = p.tareas||[]; const ok = ts.filter(t=>t.ok).length;
            return {id, p, sede:p.sede, nombre:p.nombre, o:p.o, oPrev:p.oPrev,
                tareasOk:ok, tareasTot:ts.length,
                dPuntaje: p.oPrev? p.o.puntaje - p.oPrev.puntaje : null,
                dRet: p.oPrev? +(p.o.retencion - p.oPrev.retencion).toFixed(1) : null };
        });
        const con = arr.filter(x=>!x.nodata).sort((a,b)=>b.o.puntaje-a.o.puntaje);
        const sin = arr.filter(x=>x.nodata);
        const medalla = i => i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'º';
        const colRet = r => r>=90?'#10b981':r>=75?'#f59e0b':'#ef4444';
        const colDes = d => d<15?'#10b981':d<25?'#f59e0b':'#ef4444';
        const colPun = p => p>=120?'#10b981':p>=80?'#f59e0b':'#ef4444';
        let rows='';
        con.forEach((x,i)=>{
            const dP = x.dPuntaje, dR = x.dRet;
            const dPtxt = dP==null?'<span class="inf-muted">—</span>':`<span style="color:${dP>0?'#10b981':dP<0?'#ef4444':'#64748b'};font-weight:700;">${dP>0?'▲ +':dP<0?'▼ ':'= '}${dP}</span>`;
            const dRtxt = dR==null?'':` <span class="inf-muted" style="font-size:.7rem;">ret ${dR>0?'+':''}${dR}%</span>`;
            rows += `<tr>
                <td style="text-align:center;font-weight:700;">${medalla(i)}</td>
                <td><b>${x.nombre}</b><br><span class="inf-muted" style="font-size:.7rem;">${x.sede}</span></td>
                <td>${x.o.activos}</td>
                <td style="color:${colRet(x.o.retencion)};font-weight:700;">${x.o.retencion}%</td>
                <td style="color:${colDes(x.o.desercion)};font-weight:700;">${x.o.desercion}%</td>
                <td>${x.o.reeval}</td>
                <td>${x.tareasTot? (x.tareasOk+'/'+x.tareasTot):'<span class="inf-muted">—</span>'}</td>
                <td style="color:${colPun(x.o.puntaje)};font-weight:700;">${x.o.puntaje}</td>
                <td>${dPtxt}${dRtxt}</td>
            </tr>`;
        });
        sin.forEach(x=>{ rows += `<tr><td>—</td><td><b>${INF_NOMBRE[x.id]}</b><br><span class="inf-muted" style="font-size:.7rem;">${INF_SEDE[x.id]}</span></td><td colspan="7" class="inf-muted">sin datos del mes</td></tr>`; });
        H += `<table>
            <thead><tr><th>#</th><th>Entrenador</th><th>Activos liq.</th><th>Retención</th><th>Deserción</th><th>Re-eval.</th><th>Tareas</th><th>Puntaje</th><th>vs ${gMi>0?MESES[gMi-1]:'previo'}</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>`;
        // Destacados
        if(con.length){
            const mejor = con[0];
            const peorDes = con.slice().sort((a,b)=>b.o.desercion-a.o.desercion)[0];
            const mejorRet = con.slice().sort((a,b)=>b.o.retencion-a.o.retencion)[0];
            const subePun = con.filter(x=>x.dPuntaje!=null).sort((a,b)=>b.dPuntaje-a.dPuntaje)[0];
            H += `<div style="font-size:.82rem;margin:4px 0 10px;line-height:1.7;">
                <b>🏆 Mejor puntaje:</b> ${mejor.nombre} (${mejor.o.puntaje}) ·
                <b>💪 Mayor retención:</b> ${mejorRet.nombre} (${mejorRet.o.retencion}%) ·
                <b>⚠️ Mayor deserción:</b> ${peorDes.nombre} (${peorDes.o.desercion}%)${subePun&&subePun.dPuntaje>0?` · <b>📈 Más mejoró:</b> ${subePun.nombre} (+${subePun.dPuntaje} pts)`:''}
            </div>`;
        }
    }

    // ── 2025 vs 2026 — Altas (Bolsón y Lago Puelo) ──
    H += `<h2><i class="fas fa-exchange-alt"></i> 2025 vs 2026 — Comparación de altas</h2>`;
    if(planData && planData.profes && planData.profes.length){
        let mi=0;
        for(let i=MESES.length-1;i>=0;i--){ if(planData.profes.some(p=>(p.histAltas26[i]||0)>5)){ mi=i; break; } }
        const activos = planData.profes.filter(p=>{ const ctx=PROFE_CONTEXT[p.nombre]; return !ctx||!ctx.reemplazadoPor; });
        ['El Bolsón','Lago Puelo'].forEach(sede=>{
            const profes = activos.filter(p=>getSede(p.nombre)===sede);
            if(!profes.length) return;
            let rows='', s26=0,s25=0, y26=0,y25=0;
            profes.forEach(p=>{
                const a26=p.histAltas26[mi]||0, a25=p.histAltas25[mi]||0;
                const yt26=p.histAltas26.slice(0,mi+1).reduce((a,b)=>a+b,0);
                const yt25=p.histAltas25.slice(0,mi+1).reduce((a,b)=>a+b,0);
                s26+=a26; s25+=a25; y26+=yt26; y25+=yt25;
                const diff=a26-a25, pct=a25>0?Math.round(diff/a25*100):null;
                const col=diff>=0?'#10b981':'#ef4444';
                rows+=`<tr><td><b>${p.nombre.split(' ')[0]}</b></td><td>${a25}</td><td>${a26}</td>
                    <td style="color:${col};font-weight:700;">${diff>=0?'+':''}${diff}${pct!=null?' ('+(pct>=0?'+':'')+pct+'%)':''}</td>
                    <td>${yt25} → ${y26?'':''}${yt26}</td></tr>`;
            });
            const sDiff=s26-s25, sPct=s25>0?Math.round(sDiff/s25*100):null;
            const yDiff=y26-y25, yPct=y25>0?Math.round(yDiff/y25*100):null;
            const sCol=sDiff>=0?'#10b981':'#ef4444';
            H += `<h3>${sede} — ${MESES[mi]} 2026</h3>
            <table><thead><tr><th>Profesional</th><th>Altas 2025</th><th>Altas 2026</th><th>Diferencia (mes)</th><th>Acum. 25 → 26</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr style="font-weight:700;background:#eef2ff;">
                <td>TOTAL ${sede}</td><td>${s25}</td><td>${s26}</td>
                <td style="color:${sCol};">${sDiff>=0?'+':''}${sDiff}${sPct!=null?' ('+(sPct>=0?'+':'')+sPct+'%)':''}</td>
                <td style="color:${yDiff>=0?'#10b981':'#ef4444'};">${y25} → ${y26}${yPct!=null?' ('+(yPct>=0?'+':'')+yPct+'%)':''}</td>
            </tr></tfoot></table>`;
        });
        H += `<p class="inf-muted" style="font-size:.76rem;">Bariloche no tiene base 2025 para comparar altas (sede nueva en 2026).</p>`;
    } else {
        H += `<p class="inf-muted" style="font-size:.82rem;">Sin datos de planillas para la comparación 2025 vs 2026.</p>`;
    }

    H += `<p style="margin-top:30px;font-size:.74rem;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px;">
        MOVE · Informe generado automáticamente desde el panel. Los valores provienen de las planillas vivas de cada profesional, del historial de auditorías y de las encuestas de bienvenida y baja. Editá cualquier texto antes de descargar.</p>`;

    const body = document.getElementById('informeBody');
    body.innerHTML = H;
    body.setAttribute('contenteditable','true');
    informeGenerado = true;
    informeCargando = false;
    infSet('<i class="fas fa-circle-check" style="color:var(--accent);"></i> Informe listo · ' + hoy + ' — podés editarlo y luego descargarlo.');
}

function informeDescargarPDF(){
    if(!informeGenerado){ alert('Generá el informe primero.'); return; }
    window.print();
}

function informeDescargarHTML(){
    if(!informeGenerado){ alert('Generá el informe primero.'); return; }
    const css = `body{font-family:Calibri,Arial,sans-serif;color:#1e293b;line-height:1.5;max-width:920px;margin:0 auto;padding:20px;}
        h1{font-size:22pt;color:#0f172a;} h2{font-size:15pt;border-bottom:2px solid #10b981;padding-bottom:4px;} h3{font-size:12pt;color:#334155;}
        table{width:100%;border-collapse:collapse;margin:8px 0 14px;font-size:10pt;}
        th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left;} th{background:#f1f5f9;}
        .inf-find{background:#f8fafc;border-left:3px solid #10b981;padding:6px 10px;margin:4px 0;font-size:10pt;}
        .inf-chips span,.inf-g,.inf-y,.inf-r,.inf-b{font-size:8pt;padding:2px 6px;border-radius:8px;}
        .inf-g{background:#dcfce7;color:#166534;}.inf-y{background:#fef9c3;color:#854d0e;}.inf-r{background:#fee2e2;color:#991b1b;}.inf-b{background:#e0e7ff;color:#3730a3;}.inf-muted{color:#94a3b8;}`;
    const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Informe MOVE</title><style>${css}</style></head><body>${document.getElementById('informeBody').innerHTML}</body></html>`;
    const blob = new Blob(['﻿'+doc], {type:'application/msword'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const f = new Date().toISOString().slice(0,10);
    a.href=url; a.download='Informe_MOVE_'+f+'.doc';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 2000);
}

// ══════════════════════════════════════════════════
// HELPERS SVG PARA EL INFORME (se imprimen nítidos en PDF)
// ══════════════════════════════════════════════════
function infEsc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
function infStats(vals){
    const a = vals.filter(v=>v!=null && isFinite(v));
    if(!a.length) return null;
    const m = a.reduce((x,y)=>x+y,0)/a.length;
    const sd = Math.sqrt(a.reduce((x,y)=>x+(y-m)*(y-m),0)/a.length);
    return {m, sd:sd||1, n:a.length};
}

// Campana de Gauss comparando dos meses (deserción del equipo)
function infSvgGauss(prev, act, labelPrev, labelAct){
    const sPrev = infStats(prev.map(p=>p.v)), sAct = infStats(act.map(p=>p.v));
    if(!sAct) return '';
    const W=680, H=250, ml=40, mr=20, mt=26, mb=42;
    const pw=W-ml-mr, ph=H-mt-mb;
    const todos=[...prev.map(p=>p.v), ...act.map(p=>p.v)].filter(v=>v!=null);
    const min=Math.max(0, Math.min(...todos)-8), max=Math.max(...todos)+8;
    const sx=v=>ml+pw*(v-min)/((max-min)||1);
    const dens=(v,s)=>Math.exp(-Math.pow((v-s.m)/s.sd,2)/2);
    const curva=(s,color,dash)=>{
        if(!s) return '';
        let d='';
        for(let i=0;i<=60;i++){
            const v=min+(max-min)*i/60, py=mt+ph-ph*dens(v,s)*0.92;
            d += (i?' L':'M')+sx(v).toFixed(1)+','+py.toFixed(1);
        }
        return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5"${dash?' stroke-dasharray="6,4"':''}/>`;
    };
    const puntos=(arr,s,color)=> !s?'':arr.filter(p=>p.v!=null).map(p=>{
        const py=mt+ph-ph*dens(p.v,s)*0.92;
        return `<circle cx="${sx(p.v).toFixed(1)}" cy="${py.toFixed(1)}" r="4.5" fill="${color}" stroke="#fff" stroke-width="1.5"/>`;
    }).join('');
    let ejes='';
    for(let i=0;i<=4;i++){
        const v=min+(max-min)*i/4;
        ejes += `<line x1="${sx(v)}" y1="${mt+ph}" x2="${sx(v)}" y2="${mt+ph+4}" stroke="#94a3b8"/>
                 <text x="${sx(v)}" y="${mt+ph+17}" font-size="10" fill="#64748b" text-anchor="middle">${v.toFixed(0)}%</text>`;
    }
    const media=(s,color,txt)=> !s?'':`<line x1="${sx(s.m)}" y1="${mt}" x2="${sx(s.m)}" y2="${mt+ph}" stroke="${color}" stroke-width="1.2" stroke-dasharray="3,3" opacity=".7"/>
        <text x="${sx(s.m)}" y="${mt-8}" font-size="10" fill="${color}" text-anchor="middle" font-weight="700">${txt} ${s.m.toFixed(1)}%</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;height:auto;">
        <line x1="${ml}" y1="${mt+ph}" x2="${ml+pw}" y2="${mt+ph}" stroke="#cbd5e1"/>
        ${ejes}
        ${curva(sPrev,'#94a3b8',true)}${curva(sAct,'#10b981',false)}
        ${puntos(prev,sPrev,'#94a3b8')}${puntos(act,sAct,'#10b981')}
        ${media(sPrev,'#94a3b8',labelPrev)}${media(sAct,'#10b981',labelAct)}
        <text x="${ml}" y="${H-6}" font-size="10" fill="#64748b">Deserción por profesional · dispersión del equipo</text>
    </svg>`;
}

// Barras agrupadas: métrica por profesional, mes actual vs anterior
function infSvgBarras(items, labelPrev, labelAct, unidad, invertir){
    if(!items.length) return '';
    const W=680, H=42+items.length*34, ml=104, mr=64;
    const pw=W-ml-mr;
    const max=Math.max(...items.flatMap(i=>[i.prev||0,i.act||0]),1);
    let filas='';
    items.forEach((it,i)=>{
        const y=26+i*34;
        const wPrev=pw*(it.prev||0)/max, wAct=pw*(it.act||0)/max;
        const mejor = invertir ? (it.act<it.prev) : (it.act>it.prev);
        const colAct = it.prev==null ? '#10b981' : mejor ? '#10b981' : (it.act===it.prev ? '#94a3b8' : '#ef4444');
        const dif = (it.prev!=null&&it.act!=null) ? +(it.act-it.prev).toFixed(1) : null;
        filas += `
        <text x="0" y="${y+11}" font-size="11" fill="#334155" font-weight="700">${infEsc(it.nombre)}</text>
        <rect x="${ml}" y="${y}" width="${wPrev.toFixed(1)}" height="10" rx="3" fill="#cbd5e1"/>
        <rect x="${ml}" y="${y+13}" width="${wAct.toFixed(1)}" height="10" rx="3" fill="${colAct}"/>
        <text x="${ml+Math.max(wPrev,wAct)+7}" y="${y+10}" font-size="10" fill="#94a3b8">${it.prev!=null?it.prev+unidad:'—'}</text>
        <text x="${ml+Math.max(wPrev,wAct)+7}" y="${y+23}" font-size="10.5" fill="${colAct}" font-weight="700">${it.act!=null?it.act+unidad:'—'}${dif!=null&&dif!==0?` (${dif>0?'+':''}${dif})`:''}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;height:auto;">
        <rect x="${ml}" y="4" width="10" height="8" rx="2" fill="#cbd5e1"/><text x="${ml+15}" y="12" font-size="10" fill="#64748b">${labelPrev}</text>
        <rect x="${ml+70}" y="4" width="10" height="8" rx="2" fill="#10b981"/><text x="${ml+85}" y="12" font-size="10" fill="#64748b">${labelAct}</text>
        ${filas}</svg>`;
}
