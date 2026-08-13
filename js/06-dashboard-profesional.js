// ══════════════════════════════════════════════════
// DASHBOARD POR PROFESIONAL
// ══════════════════════════════════════════════════
// Fecha real de una auditoría: el id trae el timestamp ('aud'+Date.now()); si no, se parsea el string de fecha (es-AR).
function audFechaAud(a){
    const m = /^aud(\d+)$/.exec(a.id||'');
    if(m) return new Date(Number(m[1]));
    const p = (a.date||'').split('/');
    if(p.length===3) return new Date(+p[2], +p[1]-1, +p[0]);
    return new Date(0);
}
function audRenderDashboard(){
    const el = document.getElementById('audDashboard');
    if(!el) return;

    const ahora = new Date();
    const esteMes = (audHistorial||[]).filter(a=>{
        const d = audFechaAud(a);
        return d.getMonth()===ahora.getMonth() && d.getFullYear()===ahora.getFullYear();
    });
    const nombreMes = ahora.toLocaleDateString('es-AR',{month:'long', year:'numeric'});
    const aviso = `<div style="font-size:.72rem;color:var(--muted);margin-bottom:14px;"><i class="fas fa-calendar-day" style="color:var(--accent);margin-right:4px;"></i>Mostrando auditorías de <b style="text-transform:capitalize;">${nombreMes}</b> (el mes se reinicia solo). El historial completo está en la pestaña Historial.</div>`;

    if(!esteMes.length){
        el.innerHTML = aviso + '<div class="aud-empty"><i class="fas fa-chart-bar"></i>Todavía no hay auditorías cargadas este mes.</div>';
        return;
    }

    // Agrupar por profesional (solo auditorías de este mes)
    const porProfe = {};
    esteMes.forEach(a=>{
        if(!porProfe[a.profe]) porProfe[a.profe]={
            nombre:a.profe, auditorias:[], totalSocios:0, vencidosProm:0,
            evalProm:0, objProm:0, semaforos:Object.fromEntries(AUD_SECTIONS.map(s=>[s.key,[]]))
        };
        porProfe[a.profe].auditorias.push(a);
    });

    // Estados de las tareas/hallazgos cargados en el mes, por profesional
    const estadosPorProfe = {};
    esteMes.forEach(a=>{
        const e = estadosPorProfe[a.profe] = estadosPorProfe[a.profe] || {};
        (a.detalleSocios||[]).forEach(d=>{
            const camps = ['hallazgos', ...Object.keys(d.obs||{}).filter(k=>d.obs[k]).map(k=>'obs_'+k)];
            camps.forEach(f=>{
                if(f!=='hallazgos' && !d.obs[f.replace('obs_','')]) return;
                if(f==='hallazgos' && !d.hallazgos) return;
                const st = (d.estados||{})[f] || 'pendiente';
                e[st] = (e[st]||0)+1;
            });
        });
    });

    // Calcular métricas por profesional
    const profes = Object.values(porProfe).map(p=>{
        const auds = p.auditorias;
        const n = auds.length;
        const totalSocios = auds[0]?.totalActivos || 0;
        const vencProm = Math.round(auds.reduce((s,a)=>s+(a.planesVencidos||0),0)/n);
        const evalProm = Math.round(auds.reduce((s,a)=>s+(a.conEvaluacion||0),0)/n);
        const objProm = Math.round(auds.reduce((s,a)=>s+(a.conObjetivo||0),0)/n);
        // Score promedio de semáforos
        const semScores = Object.fromEntries(AUD_SECTIONS.map(s=>[s.key,[]]));
        auds.forEach(a=>{
            AUD_SECTIONS.forEach(sec=>{
                const v=a.semaforos?.[sec.key];
                if(v) semScores[sec.key].push(v==='verde'?100:v==='amarillo'?60:20);
            });
        });
        const semAvg = {};
        AUD_SECTIONS.forEach(sec=>{
            const arr=semScores[sec.key];
            semAvg[sec.key]=arr.length?Math.round(arr.reduce((s,v)=>s+v,0)/arr.length):0;
        });
        const scoreGlobal=Math.round(Object.values(semAvg).reduce((s,v)=>s+v,0)/AUD_SECTIONS.length);
        const ultimaAud=auds[0]?.date||'—';
        return {nombre:p.nombre, n, totalSocios, vencProm, evalProm, objProm, semAvg, scoreGlobal, ultimaAud,
                estados: estadosPorProfe[p.nombre]||{}};
    });

    // Semáforo del score
    const semColor=s=>s>=80?'#10b981':s>=60?'#f59e0b':'#ef4444';
    const semLabel=s=>s>=80?'Óptimo':s>=60?'A mejorar':'Crítico';
    const semBg=s=>s>=80?'#d1fae5':s>=60?'#fef3c7':'#fee2e2';
    const semTxt=s=>s>=80?'#065f46':s>=60?'#92400e':'#991b1b';

    el.innerHTML = aviso + `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">
            ${profes.map(p=>{
                const totTareas = Object.values(p.estados).reduce((s,v)=>s+v,0);
                const tareasHtml = totTareas ? `
                    <div style="padding-top:12px;margin-top:12px;border-top:1px solid var(--border);">
                        <div style="font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Tareas cargadas este mes (${totTareas})</div>
                        <div style="display:flex;flex-wrap:wrap;gap:5px;">
                            ${AUD_ESTADOS.map(es=>{
                                const c = p.estados[es.k]||0; if(!c) return '';
                                return `<span style="display:inline-flex;align-items:center;gap:4px;background:${es.color}18;color:${es.color};font-weight:700;font-size:.68rem;padding:3px 9px;border-radius:20px;">${es.icon} ${c} ${es.label}</span>`;
                            }).join('')}
                        </div>
                    </div>` : '';
                return `
            <div class="card" style="padding:0;overflow:hidden;">
                <div style="height:4px;background:${semColor(p.scoreGlobal)};"></div>
                <div style="padding:18px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
                        <div>
                            <div style="font-size:1rem;font-weight:800;color:var(--text);">${p.nombre}</div>
                            <div style="font-size:.72rem;color:var(--muted);margin-top:2px;">${p.n} auditoría${p.n!==1?'s':''} este mes · última: ${p.ultimaAud}</div>
                        </div>
                        <span style="background:${semBg(p.scoreGlobal)};color:${semTxt(p.scoreGlobal)};border-radius:20px;padding:3px 10px;font-size:.72rem;font-weight:700;">${semLabel(p.scoreGlobal)}</span>
                    </div>

                    <!-- Score global -->
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
                        <div style="font-size:2rem;font-weight:900;color:${semColor(p.scoreGlobal)};line-height:1;">${p.scoreGlobal}%</div>
                        <div style="flex:1;">
                            <div style="height:6px;background:var(--border);border-radius:4px;overflow:hidden;">
                                <div style="height:100%;width:${p.scoreGlobal}%;background:${semColor(p.scoreGlobal)};border-radius:4px;transition:width .6s;"></div>
                            </div>
                            <div style="font-size:.65rem;color:var(--muted);margin-top:3px;">Score metodológico promedio</div>
                        </div>
                    </div>

                    <!-- Semáforos por sección -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px;">
                        ${AUD_SECTIONS.map(sec=>`
                        <div style="background:var(--bg);border-radius:8px;padding:8px 10px;">
                            <div style="font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;">${sec.label.split(' ')[0]}</div>
                            <div style="display:flex;align-items:center;gap:5px;">
                                <div style="height:4px;flex:1;background:var(--border);border-radius:2px;overflow:hidden;">
                                    <div style="height:100%;width:${p.semAvg[sec.key]}%;background:${semColor(p.semAvg[sec.key])};border-radius:2px;"></div>
                                </div>
                                <span style="font-size:.7rem;font-weight:700;color:${semColor(p.semAvg[sec.key])};">${p.semAvg[sec.key]}%</span>
                            </div>
                        </div>`).join('')}
                    </div>

                    <!-- KPIs de planilla -->
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;padding-top:12px;border-top:1px solid var(--border);">
                        <div style="text-align:center;">
                            <div style="font-size:1.1rem;font-weight:800;color:var(--text);">${p.totalSocios}</div>
                            <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase;">Socios</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="font-size:1.1rem;font-weight:800;color:${p.vencProm>0?'#ef4444':'#10b981'};">${p.vencProm}</div>
                            <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase;">Venc. prom.</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="font-size:1.1rem;font-weight:800;color:var(--accent);">${p.totalSocios?Math.round(p.evalProm/p.totalSocios*100):0}%</div>
                            <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase;">Con eval.</div>
                        </div>
                    </div>
                    ${tareasHtml}
                </div>
            </div>`;}).join('')}
        </div>`;
}
