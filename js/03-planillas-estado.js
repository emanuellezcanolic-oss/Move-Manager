// ══════════════════════════════════════════════════
// RENDER PLANILLAS
// ══════════════════════════════════════════════════
function renderPlanillas(){
    const d=planData;
    const totAct=d.profes.reduce((s,p)=>s+(p.activos||0),0);
    const a26=d.profes.reduce((s,p)=>s+p.histAltas26.reduce((a,b)=>a+b,0),0);
    const a25=d.profes.reduce((s,p)=>s+p.histAltas25.reduce((a,b)=>a+b,0),0);
    const pct=a25>0?Math.round(((a26-a25)/a25)*100):0;
    const desArr=d.profes.flatMap(p=>p.histDeserc26.filter(v=>v>0));
    const avgD=desArr.length?(desArr.reduce((a,b)=>a+b)/desArr.length*100).toFixed(1):'--';
    set('k-activos',totAct||'--'); set('k-altas26',a26);
    set('k-altas-sub',(pct>=0?'+':'')+pct+'% vs 2025 ('+a25+')');
    set('k-deserc',avgD+'%');
    const tot25=MESES.map((_,i)=>(d.histBolson25[i]||0)+(d.histPuelo25[i]||0));
    const tot26=MESES.map((_,i)=>(d.histBolson26[i]||0)+(d.histPuelo26[i]||0));
    line('chOvTotal',MESES,[{l:'2025',d:tot25,c:'#94a3b8'},{l:'2026',d:tot26,c:'#10b981'}]);
    line('chOvBolson',MESES,[{l:'2025',d:d.histBolson25,c:'#94a3b8'},{l:'2026',d:d.histBolson26,c:'#10b981'}]);
    line('chOvPuelo',MESES,[{l:'2025',d:d.histPuelo25,c:'#94a3b8'},{l:'2026',d:d.histPuelo26,c:'#6366f1'}]);
    renderBolson();
    renderPuelo();
}

// Integra Bariloche en los KPIs y el chart total del Overview (corre cuando ya cargaron planData + bariData)
function integrarBariEnOverview(){
    if(!planData) return;
    const d=planData;
    // Bolsón + Lago Puelo
    const actBP = d.profes.reduce((s,p)=>s+(p.activos||0),0);
    const a26BP = d.profes.reduce((s,p)=>s+p.histAltas26.reduce((a,b)=>a+b,0),0);
    const a25   = d.profes.reduce((s,p)=>s+p.histAltas25.reduce((a,b)=>a+b,0),0);
    const desBP = d.profes.flatMap(p=>p.histDeserc26.filter(v=>v>0));
    // Bariloche
    const actBari = bariData.reduce((s,p)=>s+(p.activos||0),0);
    const a26Bari = bariData.reduce((s,p)=>s+(p.histAltas||[]).reduce((a,b)=>a+b,0),0);
    const desBari = bariData.flatMap(p=>(p.histDeserc||[]).filter(v=>v>0));
    const bari26  = MESES.map((_,i)=>bariData.reduce((s,p)=>s+((p.histAltas||[])[i]||0),0));

    // KPIs totales (las 3 sedes)
    const totAct = actBP + actBari;
    const totA26 = a26BP + a26Bari;
    const desAll = desBP.concat(desBari);
    const avgD = desAll.length?(desAll.reduce((a,b)=>a+b)/desAll.length*100).toFixed(1):'--';
    const pct = a25>0?Math.round(((a26BP-a25)/a25)*100):0;  // % vs 2025: solo Bolsón+Puelo (Bariloche no tiene 2025)
    set('k-activos', totAct||'--');
    set('k-altas26', totA26);
    set('k-altas-sub', (pct>=0?'+':'')+pct+'% vs 2025 ('+a25+') · Bariloche +'+a26Bari);
    set('k-deserc', avgD+'%');

    // Chart total: 2026 suma las 3 sedes (2025 solo Bolsón+Puelo, Bariloche no existía)
    const tot25 = MESES.map((_,i)=>(d.histBolson25[i]||0)+(d.histPuelo25[i]||0));
    const tot26 = MESES.map((_,i)=>(d.histBolson26[i]||0)+(d.histPuelo26[i]||0)+bari26[i]);
    line('chOvTotal',MESES,[{l:'2025',d:tot25,c:'#94a3b8'},{l:'2026',d:tot26,c:'#10b981'}]);
    // Card Bariloche en el Overview
    if(document.getElementById('chOvBari')) line('chOvBari',MESES,[{l:'2026',d:bari26,c:'#f59e0b'}]);
}


// ══ RENDER SEDES (El Bolsón, Lago Puelo) ══
function profePorSede(sede) {
    if(!planData) return [];
    return planData.profes.filter(p => {
        const k = Object.keys(SEDE_MAP).find(key => p.nombre.includes(key));
        return k && SEDE_MAP[k] === sede;
    });
}

function renderBolson() {
    if(!planData) return;
    const profes = profePorSede('El Bols\u00f3n');
    const a26 = planData.histBolson26.reduce((a,b)=>a+b,0);
    const a25 = planData.histBolson25.reduce((a,b)=>a+b,0);
    const pct  = a25>0 ? Math.round(((a26-a25)/a25)*100) : 0;
    const totAct = profes.reduce((s,p)=>s+(p.activos||0),0);
    const desArr = profes.flatMap(p=>p.histDeserc26.filter(v=>v>0));
    const avgD = desArr.length?(desArr.reduce((a,b)=>a+b)/desArr.length*100).toFixed(1):'--';
    document.getElementById('bolsonKpis').innerHTML =
        kpiCard('Activos',totAct||'--','Total sede')+
        kpiCard('Altas 2026',a26,(pct>=0?'+':'')+pct+'% vs 2025 ('+a25+')', '#10b981')+
        kpiCard('Deserci\u00f3n prom.',avgD+'%','Mensual 2026','#ef4444');
    line('chBolsonTotal',MESES,[{l:'2025',d:planData.histBolson25,c:'#94a3b8'},{l:'2026',d:planData.histBolson26,c:'#10b981'}]);
    renderSedeTabs('bolsonTabs',profes,'bolson');
}

function renderPuelo() {
    if(!planData) return;
    const profes = profePorSede('Lago Puelo');
    const a26 = planData.histPuelo26.reduce((a,b)=>a+b,0);
    const a25 = planData.histPuelo25.reduce((a,b)=>a+b,0);
    const pct  = a25>0 ? Math.round(((a26-a25)/a25)*100) : 0;
    const totAct = profes.reduce((s,p)=>s+(p.activos||0),0);
    const desArr = profes.flatMap(p=>p.histDeserc26.filter(v=>v>0));
    const avgD = desArr.length?(desArr.reduce((a,b)=>a+b)/desArr.length*100).toFixed(1):'--';
    document.getElementById('pueloKpis').innerHTML =
        kpiCard('Activos',totAct||'--','Total sede')+
        kpiCard('Altas 2026',a26,(pct>=0?'+':'')+pct+'% vs 2025 ('+a25+')', '#6366f1')+
        kpiCard('Deserci\u00f3n prom.',avgD+'%','Mensual 2026','#ef4444');
    line('chPueloTotal',MESES,[{l:'2025',d:planData.histPuelo25,c:'#94a3b8'},{l:'2026',d:planData.histPuelo26,c:'#6366f1'}]);
    renderSedeTabs('pueloTabs',profes,'puelo');
}

function kpiCard(label,value,sub,color){
    return `<div class="kpi-card"><div class="kpi-label">${label}</div><div class="kpi-value"${color?` style="color:${color}"`:''}>${value}</div><div class="kpi-sub">${sub}</div></div>`;
}

function renderSedeTabs(tabsId, profes, prefix) {
    const tabs = document.getElementById(tabsId);
    if(!tabs) return;
    tabs.innerHTML = '';
    if(!profes.length){ tabs.innerHTML='<span style="color:#94a3b8;font-size:.8rem">Sin datos de profesionales</span>'; return; }
    profes.forEach((p,i) => {
        const t = document.createElement('div');
        t.className = 'tab' + (i===0?' active':'');
        t.textContent = p.nombre.split(' ')[0];
        t.onclick = () => { tabs.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); t.classList.add('active'); renderProfeEnSede(p,prefix); };
        tabs.appendChild(t);
    });
    renderProfeEnSede(profes[0], prefix);
}

function renderProfeEnSede(p, prefix) {
    set(prefix+'PnAltas', p.nombre);
    set(prefix+'PnDeserc', p.nombre);
    line('ch'+prefix.charAt(0).toUpperCase()+prefix.slice(1)+'ProfAltas', MESES,
        [{l:'Altas 2025',d:p.histAltas25,c:'#94a3b8'},{l:'Altas 2026',d:p.histAltas26,c:'#10b981'}]);
    // Deserción: 2026 y, si existe, la del profe equivalente de 2025 (misma hoja de métricas)
    const setsDes = [];
    const nom26 = p.nombre.split(' ')[0];
    const par = (metricsData && metricsData.vs) ? metricsData.vs.find(v => normNom(v.n26) === normNom(nom26)) : null;
    // los % pueden venir como fracción (0.25) o ya en porcentaje (25) → normalizamos
    const aPct = arr => { const mx = Math.max(...arr.map(v=>Math.abs(v||0))); const f = mx<=1.5 ? 100 : 1; return arr.map(v=>+(((v||0)*f)).toFixed(1)); };
    if (par && par.deseRc25 && par.deseRc25.some(v => v > 0)) {
        setsDes.push({l:'% Deserc 2025 ('+par.n25+')', d:aPct(par.deseRc25), c:'#94a3b8'});
    }
    setsDes.push({l:'% Deserc 2026', d:p.histDeserc26.map(v=>+(v*100).toFixed(1)), c:'#ef4444'});
    line('ch'+prefix.charAt(0).toUpperCase()+prefix.slice(1)+'ProfDeserc', MESES, setsDes);
    const a26=p.histAltas26.reduce((a,b)=>a+b,0), a25=p.histAltas25.reduce((a,b)=>a+b,0);
    const pct = a25>0?Math.round(((a26-a25)/a25)*100):0;
    const firstName = p.nombre.split(' ')[0];
    const ctx = PROFE_CONTEXT[firstName];
    let note = '';
    if(ctx?.reemplazaA) note = `\u21A9 Reemplaz\u00f3 a ${ctx.reemplazaA}${ctx.turno?' \u00b7 '+ctx.turno:''}`;
    else if(ctx?.reemplazadoPor) note = `\u21AA Reemplazado/a por ${ctx.reemplazadoPor}`;
    else if(ctx?.turno) note = '\uD83D\uDD50 '+ctx.turno;
    document.getElementById(prefix+'ProfKpis').innerHTML =
        kpiCard('Activos',p.activos||'--','Alumnos activos')+
        kpiCard('Altas 2026',a26,(pct>=0?'+':'')+pct+'% vs 2025 ('+a25+')','#10b981')+
        kpiCard('Estado',p.estadoActivos||'--',note||'Turno / estado');
}

// ══ RENDER BARILOCHE ══
function renderBariloche() {
    if(!bariData.length) return;
    const totActivos = bariData.reduce((s,p)=>s+(p.activos||0),0);
    const sedeAltas  = MESES.map((_,i) => bariData.reduce((s,p)=>s+(p.histAltas[i]||0),0));
    const totAltas   = sedeAltas.reduce((a,b)=>a+b,0);
    const sedeBajas  = MESES.map((_,i) => bariData.reduce((s,p)=>s+(p.histBajas[i]||0),0));
    const desArr = bariData.flatMap(p=>p.histDeserc.filter(v=>v>0));
    const avgD = desArr.length?(desArr.reduce((a,b)=>a+b)/desArr.length*100).toFixed(1):'--';
    document.getElementById('bariKpis').innerHTML =
        kpiCard('Activos',totActivos||'--','Total sede')+
        kpiCard('Altas 2026',totAltas,'Total a\u00f1o','#10b981')+
        kpiCard('Deserci\u00f3n prom.',avgD+'%','Mensual 2026','#ef4444');
    line('chBariTotal',MESES,[{l:'Altas 2026',d:sedeAltas,c:'#10b981'}]);
    renderBariTabs();
}

function renderBariTabs() {
    const tabs = document.getElementById('bariTabs');
    if(!tabs || !bariData.length) return;
    tabs.innerHTML = '';
    bariData.forEach((p,i) => {
        const t = document.createElement('div');
        t.className = 'tab'+(i===0?' active':'');
        t.textContent = p.nombre.split(' ')[0];
        t.onclick = () => { tabs.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); t.classList.add('active'); renderBariProfe(p); };
        tabs.appendChild(t);
    });
    renderBariProfe(bariData[0]);
}

function renderBariProfe(p) {
    set('bariPnAltas', p.nombre);
    set('bariPnDeserc', p.nombre);
    line('chBariProfAltas', MESES, [{l:'Altas 2026',d:p.histAltas,c:'#10b981'}]);
    line('chBariProfDeserc', MESES, [{l:'% Deserc 2026',d:p.histDeserc.map(v=>+(v*100).toFixed(1)),c:'#ef4444'}]);
    const totAltas = p.histAltas.reduce((a,b)=>a+b,0);
    const desArr = p.histDeserc.filter(v=>v>0);
    const avgD = desArr.length?(desArr.reduce((a,b)=>a+b)/desArr.length*100).toFixed(1):'--';
    document.getElementById('bariProfKpis').innerHTML =
        kpiCard('Activos',p.activos||'--','Alumnos activos')+
        kpiCard('Altas 2026',totAltas,'Total a\u00f1o','#10b981')+
        kpiCard('Deserci\u00f3n prom.',avgD+'%','Mensual 2026','#ef4444');
}

function renderBariMesesTabs(p) {
    const tabs = document.getElementById('bariMesesTabs');
    if(!tabs) return;
    tabs.innerHTML = '';
    // Último mes con datos reales como default
    let defaultIdx = 0;
    for(let i = p.months.length - 1; i >= 0; i--) {
        if(p.months[i].activos > 0 || p.months[i].altas > 0 || p.months[i].baja > 0) {
            defaultIdx = i; break;
        }
    }
    p.months.forEach((m, i) => {
        const hasData = m.activos > 0 || m.altas > 0 || m.baja > 0;
        const t = document.createElement('div');
        t.className = 'tab' + (i === defaultIdx ? ' active' : '');
        if(!hasData) t.style.opacity = '0.35';
        t.textContent = m.mes;
        t.onclick = () => {
            tabs.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
            t.classList.add('active');
            renderBariMesKpis(m);
        };
        tabs.appendChild(t);
    });
    renderBariMesKpis(p.months[defaultIdx]);
}

function renderBariMesKpis(m) {
    // %Deserción: usar valor de planilla; calcular como fallback
    let desPct = '\u2014';
    if(m.deseRc > 0) {
        desPct = (m.deseRc * 100).toFixed(1) + '%';
    } else if(m.baja > 0 && m.activos > 0) {
        desPct = (m.baja / m.activos * 100).toFixed(1) + '%';
    } else if(m.activos > 0 || m.altas > 0) {
        desPct = '0,0%';
    }
    const netMes = m.altas - m.baja;
    document.getElementById('bariMesKpis').innerHTML =
        kpiCard('Activos', m.activos || '\u2014', m.mes + ' \u00b7 Total activos') +
        kpiCard('Nuevos',  m.nuevo,  'Ingresos nuevos \u00b7 ' + m.mes, '#3b82f6') +
        kpiCard('Renovaciones', m.renueva + (m.renx2 > 0 ? ' (+' + m.renx2 + ')' : ''), 'Renov. + ReX2 \u00b7 ' + m.mes, '#10b981') +
        kpiCard('Bajas',   m.baja,   'Bajas del mes \u00b7 ' + m.mes, '#ef4444') +
        kpiCard('Neto mes', netMes >= 0 ? '+' + netMes : netMes, 'Altas \u2212 Bajas', netMes >= 0 ? '#10b981' : '#ef4444') +
        kpiCard('Deserci\u00f3n', desPct, 'Tasa mensual', '#f59e0b');
}

// ══ RENDER ESTADO DEL GYM ══
function renderEstado() {
    const SEDES_ORDER = ['El Bolsón','Lago Puelo','Bariloche'];
    const bySedeMap = {};

    // Detect current month: last idx where any profe has altas26 > 5
    let mesIdx = 0;
    if (planData) {
        for (let i = MESES.length - 1; i >= 0; i--) {
            if (planData.profes.some(p => (p.histAltas26[i]||0) > 5)) { mesIdx = i; break; }
        }
        // No pasar del mes calendario actual (evita meses futuros con altas pre-cargadas)
        mesIdx = Math.min(mesIdx, new Date().getMonth());
        planData.profes.forEach(p => {
            const sede = getSede(p.nombre);
            const des  = (p.histDeserc26[mesIdx]  || 0) * 100;
            const desP = mesIdx > 0 ? (p.histDeserc26[mesIdx-1] || 0) * 100 : null;
            const alt  = p.histAltas26[mesIdx] || 0;
            const alt25= p.histAltas25[mesIdx] || 0;
            const ytdArr = p.histDeserc26.slice(0, mesIdx+1).filter(v=>v>0);
            const ytd  = ytdArr.length ? ytdArr.reduce((a,b)=>a+b,0)/ytdArr.length*100 : 0;
            if (!bySedeMap[sede]) bySedeMap[sede] = [];
            bySedeMap[sede].push({ nombre: p.nombre.split(' ')[0], activos: p.activos,
                des, desP, alt, alt25, ytd, sede });
        });
    }

    // Bariloche: prefer mesIdx from planData; fallback to local detection with threshold >3
    let bMesIdx = mesIdx;
    if (!planData) {
        for (let i = MESES.length - 1; i >= 0; i--) {
            if (bariData.some(p => (p.histAltas[i]||0) > 3)) { bMesIdx = i; break; }
        }
        bMesIdx = Math.min(bMesIdx, new Date().getMonth());
    }
    bariData.forEach(p => {
        const des  = (p.histDeserc[bMesIdx]  || 0) * 100;
        const desP = bMesIdx > 0 ? (p.histDeserc[bMesIdx-1] || 0) * 100 : null;
        const alt  = p.histAltas[bMesIdx] || 0;
        const ytdArr = p.histDeserc.slice(0, bMesIdx+1).filter(v=>v>0);
        const ytd  = ytdArr.length ? ytdArr.reduce((a,b)=>a+b,0)/ytdArr.length*100 : 0;
        if (!bySedeMap['Bariloche']) bySedeMap['Bariloche'] = [];
        bySedeMap['Bariloche'].push({ nombre: p.nombre.split(' ')[0], activos: p.activos,
            des, desP, alt, alt25: 0, ytd, sede: 'Bariloche' });
    });

    const sem = d => d < 15 ? {color:'#10b981',label:'Bajo control'} :
                     d < 25 ? {color:'#f59e0b',label:'Moderada'} :
                               {color:'#ef4444',label:'Crítica'};

    const card = (p, mi) => {
        const s = sem(p.des);
        // Tendencia deserción vs mes anterior
        let tendHTML = '';
        if (p.desP !== null) {
            const diff = p.des - p.desP;
            if (Math.abs(diff) >= 0.5) {
                const tc = diff > 0 ? '#ef4444' : '#10b981';
                tendHTML = `<div class="estado-chip"><div class="estado-chip-val" style="color:${tc};font-size:.88rem">${diff>0?'↑':'↓'} ${Math.abs(diff).toFixed(1)}%</div><div class="estado-chip-lbl">vs ${MESES[mi-1]}</div></div>`;
            }
        }
        // VS 2025 altas mismo mes
        let vs25 = '';
        if (p.sede !== 'Bariloche' && p.alt25 > 0) {
            const diff = p.alt - p.alt25;
            const pct  = Math.round(diff / p.alt25 * 100);
            const col  = diff >= 0 ? '#10b981' : '#ef4444';
            vs25 = `<div class="estado-vs2025"><i class="fas fa-exchange-alt"></i> vs 2025: <strong style="color:${col}">${diff>=0?'+':''}${diff} altas (${pct>=0?'+':''}${pct}%)</strong></div>`;
        }
        return `<div class="estado-card2">
          <div class="estado-card2-header">
            <div class="estado-dot" style="background:${s.color};box-shadow:0 0 8px ${s.color}88"></div>
            <div class="estado-card2-title">
              <span class="estado-nombre2">${p.nombre}</span>
              <span class="estado-sem-label" style="color:${s.color}">${s.label} &middot; ${p.des.toFixed(1)}% deserción ${MESES[mi]}</span>
            </div>
          </div>
          <div class="estado-chips">
            <div class="estado-chip"><div class="estado-chip-val">${p.activos||'--'}</div><div class="estado-chip-lbl">Activos</div></div>
            <div class="estado-chip"><div class="estado-chip-val" style="color:#10b981">${p.alt}</div><div class="estado-chip-lbl">Altas ${MESES[mi]}</div></div>
            <div class="estado-chip"><div class="estado-chip-val" style="color:#f59e0b">${p.ytd.toFixed(0)}%</div><div class="estado-chip-lbl">Prom YTD</div></div>
            ${tendHTML}
          </div>
          ${vs25}
        </div>`;
    };

    // ── Serie de altas (ventas) por sede, para el panel de meta ──
    const sedeAltas = {};
    if (planData) planData.profes.forEach(p => {
        const s = getSede(p.nombre);
        sedeAltas[s] = sedeAltas[s] || new Array(12).fill(0);
        (p.histAltas26||[]).forEach((v,i)=>{ sedeAltas[s][i] += (v||0); });
    });
    bariData.forEach(p => {
        sedeAltas['Bariloche'] = sedeAltas['Bariloche'] || new Array(12).fill(0);
        (p.histAltas||[]).forEach((v,i)=>{ sedeAltas['Bariloche'][i] += (v||0); });
    });

    // Panel: cuánto falta este mes para igualar el promedio y el mejor mes
    const metaPanel = (sede, mi, profes) => {
        const serie = sedeAltas[sede]; if (!serie) return '';
        const activos = profes.reduce((a,p)=>a+(p.activos||0),0);
        const actual = serie[mi] || 0;
        const cerrados = [];
        for (let m=0; m<mi; m++) if (serie[m] > 0) cerrados.push({m, v:serie[m]});
        if (!cerrados.length) return '';
        const prom = Math.round(cerrados.reduce((a,b)=>a+b.v,0)/cerrados.length);
        const mejor = cerrados.reduce((a,b)=> b.v>a.v ? b : a);
        const faltaProm = Math.max(0, prom - actual);
        const faltaMejor = Math.max(0, mejor.v - actual);
        // El techo real del mes son los socios activos: si liquidan todos, ese es el número.
        const porLiquidar = Math.max(0, activos - actual);
        const pctLiq = activos > 0 ? Math.round(actual / activos * 100) : 0;
        const hoy = new Date();
        const diasMes = new Date(2026, mi+1, 0).getDate();
        const esMesActual = (hoy.getMonth() === mi);
        const diaHoy = esMesActual ? hoy.getDate() : diasMes;
        const restan = Math.max(0, diasMes - diaHoy);
        const necDia = restan > 0 ? (porLiquidar/restan) : 0;
        const box = (lbl, val, col, sub) => `<div style="flex:1;min-width:104px;background:var(--bg);border-radius:10px;padding:9px 12px;">
            <div style="font-size:.62rem;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.4px;">${lbl}</div>
            <div style="font-size:1.35rem;font-weight:800;color:${col};font-family:monospace;line-height:1.25;">${val}</div>
            ${sub?`<div style="font-size:.64rem;color:var(--muted);">${sub}</div>`:''}</div>`;
        // ¿El techo alcanza para promedio/récord?
        let techoTxt;
        if (activos >= mejor.v) techoTxt = `Si liquidan los <b>${activos}</b>, sería <b style="color:#10b981">récord</b> (supera a ${MESES[mejor.m]}: ${mejor.v}).`;
        else if (activos >= prom) techoTxt = `Si liquidan los <b>${activos}</b>, se supera el promedio (${prom}), pero <b>no alcanza el récord</b> de ${MESES[mejor.m]} (${mejor.v}): faltarían ${mejor.v - activos} altas nuevas.`;
        else techoTxt = `Aun liquidando los <b>${activos}</b>, queda por debajo del promedio (${prom}): hacen falta <b style="color:#f59e0b">${prom - activos} altas nuevas</b> además de las renovaciones.`;
        return `<div style="background:var(--card);border:1px solid var(--border);border-left:3px solid #6366f1;border-radius:12px;padding:12px 14px;margin-bottom:14px;">
            <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6366f1;margin-bottom:9px;">
                <i class="fas fa-bullseye"></i> Meta de ventas · ${MESES[mi]}</div>
            <div style="display:flex;gap:9px;flex-wrap:wrap;">
                ${box('Socios a liquidar', activos, 'var(--text)', 'techo del mes')}
                ${box('Liquidados '+MESES[mi], actual, pctLiq>=80?'#10b981':pctLiq>=50?'#f59e0b':'#ef4444', pctLiq+'% de los activos')}
                ${box('Faltan liquidar', porLiquidar||'✓', porLiquidar?'#f59e0b':'#10b981', esMesActual?`en ${restan} días`:'mes cerrado')}
                ${box('Mejor mes', mejor.v, '#6366f1', MESES[mejor.m]+' · prom '+prom)}
            </div>
            <div style="margin-top:9px;font-size:.78rem;line-height:1.5;">
                ${techoTxt}
                ${esMesActual && restan>0 && porLiquidar>0 ? ` Para que no quede nadie sin renovar hacen falta <b style="color:#6366f1">${necDia.toFixed(1)} por día</b> en los ${restan} días que quedan.` : ''}
            </div>
        </div>`;
    };

    let html = `<div class="estado-mes-badge"><i class="fas fa-calendar-alt"></i>&nbsp;${MESES[mesIdx]} 2026</div>`;
    SEDES_ORDER.forEach(sede => {
        const profes = bySedeMap[sede];
        if (!profes || !profes.length) return;
        const mi = sede === 'Bariloche' ? bMesIdx : mesIdx;
        html += `<div class="estado-sede-card"><div class="estado-sede-title"><i class="fas fa-map-marker-alt"></i> ${sede}</div>`;
        html += metaPanel(sede, mi, profes);
        html += `<div class="estado-list2">`;
        profes.forEach(p => { html += card(p, mi); });
        html += '</div></div>';
    });
    document.getElementById('estadoCards').innerHTML = html || '<div class="alert">Sin datos disponibles</div>';

    // ── Datos unificados por profe (serie mensual completa) para los gráficos ──
    const unified = [];
    if (planData) planData.profes.forEach(p => {
        unified.push({ nombre: p.nombre.split(' ')[0], sede: getSede(p.nombre),
            deserc: p.histDeserc26.map(v => +( (v||0)*100 ).toFixed(1)),
            altas:  p.histAltas26.map(v => v||0) });
    });
    bariData.forEach(p => {
        unified.push({ nombre: p.nombre.split(' ')[0], sede: 'Bariloche',
            deserc: p.histDeserc.map(v => +( (v||0)*100 ).toFixed(1)),
            altas:  p.histAltas.map(v => v||0) });
    });
    renderEstadoCharts(unified, mesIdx);
}

// ══ GRÁFICOS Estado del Gym ══
let estadoUnified=[], estadoSel=new Set(), estadoMetric='deserc', estadoMi=0;
let egLineChart=null, egBarChart=null, egPieChart=null;
const ESTADO_PAL=['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#ec4899','#f97316','#0ea5e9'];

function renderEstadoCharts(unified, mi){
    estadoUnified = unified; estadoMi = mi;
    const cont = document.getElementById('estadoCharts');
    if(!cont) return;
    if(!unified.length || !window.Chart){ cont.innerHTML=''; return; }
    if(!estadoSel.size) unified.slice(0,3).forEach(p=>estadoSel.add(p.nombre));

    const metricBtns = [['deserc','Deserción'],['altas','Altas']].map(([k,l])=>
        `<button onclick="estadoSetMetric('${k}')" data-mk="${k}" style="border:none;cursor:pointer;font-family:inherit;font-size:.78rem;font-weight:600;padding:6px 14px;border-radius:8px;${estadoMetric===k?'background:var(--accent);color:#fff;':'background:var(--bg);color:var(--muted);'}">${l}</button>`).join('');
    const checks = unified.map((p,i)=>
        `<label style="display:inline-flex;align-items:center;gap:6px;font-size:.78rem;cursor:pointer;background:var(--bg);padding:5px 10px;border-radius:8px;"><input type="checkbox" ${estadoSel.has(p.nombre)?'checked':''} onchange="estadoToggleProfe('${p.nombre}')" style="accent-color:${ESTADO_PAL[i%8]};"><span style="width:10px;height:10px;border-radius:50%;background:${ESTADO_PAL[i%8]};display:inline-block;"></span>${p.nombre} <span style="color:var(--muted);font-size:.68rem;">${p.sede}</span></label>`).join('');

    cont.innerHTML = `
      <div class="estado-sede-card" style="margin-top:18px;">
        <div class="estado-sede-title"><i class="fas fa-chart-line"></i> Comparativa entre profesores</div>
        <div style="display:flex;gap:6px;margin:4px 0 12px;flex-wrap:wrap;">${metricBtns}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">${checks}</div>
        <div style="height:320px;position:relative;"><canvas id="egLine"></canvas></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-top:16px;">
        <div class="estado-sede-card"><div class="estado-sede-title"><i class="fas fa-chart-column"></i> Deserción ${MESES[mi]} por profe</div><div style="height:300px;position:relative;"><canvas id="egBar"></canvas></div></div>
        <div class="estado-sede-card"><div class="estado-sede-title"><i class="fas fa-chart-pie"></i> Participación de altas ${MESES[mi]}</div><div style="height:300px;position:relative;"><canvas id="egPie"></canvas></div></div>
      </div>`;
    estadoDrawLine(); estadoDrawBar(); estadoDrawPie();
    renderEstadoStats();
}

// ══ ANÁLISIS ESTADÍSTICO (interactivo) ══
let statMetric='deserc', statProfe=null, statTrendChart=null;
function statLabel(){ return statMetric==='deserc'?'Deserción':statMetric==='ret'?'Retención':'Altas'; }
function statUnit(){ return statMetric==='altas'?'':'%'; }
function statSerie(p){
    const d=p.deserc.slice(0,estadoMi+1);
    if(statMetric==='deserc') return d;
    if(statMetric==='ret') return d.map(v=>+(100-v).toFixed(1));
    return p.altas.slice(0,estadoMi+1);
}
function statLinReg(ys){
    const n=ys.length; if(n<2) return {slope:0,intercept:ys[0]||0,r2:0};
    let sx=0,sy=0,sxy=0,sxx=0,syy=0;
    ys.forEach((y,x)=>{sx+=x;sy+=y;sxy+=x*y;sxx+=x*x;syy+=y*y;});
    const denom=(n*sxx-sx*sx)||1;
    const slope=(n*sxy-sx*sy)/denom;
    const intercept=(sy-slope*sx)/n;
    const rd=Math.sqrt((n*sxx-sx*sx)*(n*syy-sy*sy))||1;
    const r=(n*sxy-sx*sy)/rd;
    return {slope,intercept,r2:r*r};
}
function statMeanStd(a){ const n=a.length; if(!n) return {m:0,sd:0}; const m=a.reduce((x,y)=>x+y,0)/n; const sd=Math.sqrt(a.reduce((x,y)=>x+(y-m)*(y-m),0)/n); return {m,sd}; }

function renderEstadoStats(){
    const cont=document.getElementById('estadoStats'); if(!cont) return;
    const U=estadoUnified;
    if(!U.length || !window.Chart){ cont.innerHTML=''; return; }
    if(!statProfe || !U.some(p=>p.nombre===statProfe)) statProfe=U[0].nombre;

    const metricBtns=[['deserc','Deserción'],['ret','Retención'],['altas','Altas']].map(([k,l])=>
        `<button onclick="statSetMetric('${k}')" data-sk="${k}" style="border:none;cursor:pointer;font-family:inherit;font-size:.78rem;font-weight:600;padding:6px 14px;border-radius:8px;${statMetric===k?'background:var(--accent);color:#fff;':'background:var(--bg);color:var(--muted);'}">${l}</button>`).join('');
    const profeBtns=U.map(p=>
        `<button onclick="statSetProfe('${p.nombre}')" data-sp="${p.nombre}" style="border:none;cursor:pointer;font-family:inherit;font-size:.74rem;font-weight:600;padding:5px 11px;border-radius:8px;${statProfe===p.nombre?'background:#3b82f6;color:#fff;':'background:var(--bg);color:var(--muted);'}">${p.nombre}</button>`).join('');

    cont.innerHTML=`
      <div class="estado-sede-card" style="margin-top:18px;border-left:3px solid #3b82f6;">
        <div class="estado-sede-title"><i class="fas fa-square-root-variable"></i> Análisis estadístico</div>
        <div style="display:flex;gap:6px;margin:2px 0 14px;flex-wrap:wrap;">${metricBtns}</div>

        <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:8px;"><i class="fas fa-arrow-trend-up" style="margin-right:5px;color:#3b82f6;"></i>Tendencia y proyección</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;">${profeBtns}</div>
        <div style="height:280px;position:relative;"><canvas id="statTrend"></canvas></div>
        <div id="statTrendConc" style="margin-top:10px;font-size:.82rem;"></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-top:16px;">
        <div class="estado-sede-card">
          <div class="estado-sede-title"><i class="fas fa-bell-concierge"></i> Campana de Gauss · outliers del equipo (z-score)</div>
          <div id="statOutliers"></div>
        </div>
        <div class="estado-sede-card">
          <div class="estado-sede-title"><i class="fas fa-arrows-left-right-to-line"></i> Homogeneidad entre profes</div>
          <div id="statHomog"></div>
        </div>
      </div>
      <div class="estado-sede-card" style="margin-top:16px;border-left:3px solid #f59e0b;">
        <div class="estado-sede-title"><i class="fas fa-calendar-check"></i> Deserción año contra año · anticipación de bajas</div>
        <div style="font-size:.78rem;color:var(--muted);margin-bottom:10px;">Compara 2026 contra 2025 mes a mes y detecta los meses de riesgo históricos, para preparar acciones antes de que lleguen. Bolsón y Lago Puelo (Bariloche es sede nueva, sin base 2025).</div>
        <div id="yoySedeBtns" style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;"></div>
        <div style="height:290px;position:relative;"><canvas id="statYoY"></canvas></div>
        <div id="statYoYConc" style="margin-top:10px;font-size:.84rem;line-height:1.45;"></div>
        <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin:18px 0 8px;"><i class="fas fa-user-group" style="margin-right:5px;color:#f59e0b;"></i>Comparativa por profesional</div>
        <div id="statYoYTabla"></div>
        <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin:18px 0 8px;"><i class="fas fa-triangle-exclamation" style="margin-right:5px;color:#ef4444;"></i>Meses de riesgo (estacionalidad 2025)</div>
        <div style="height:230px;position:relative;"><canvas id="statEstac"></canvas></div>
        <div id="statEstacConc" style="margin-top:10px;font-size:.84rem;line-height:1.45;"></div>
      </div>

      <div class="estado-sede-card" style="margin-top:16px;border-left:3px solid #0ea5e9;">
        <div class="estado-sede-title"><i class="fas fa-filter-circle-xmark"></i> Bajas evitables vs no evitables</div>
        <div style="font-size:.78rem;color:var(--muted);margin-bottom:12px;">Separa las bajas que MOVE puede evitar (horarios, cupos, expectativas, atención) de las que no dependen del gimnasio (mudanza, salud, trabajo). Sobre las evitables es donde rinde el esfuerzo.</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;align-items:start;">
          <div style="height:230px;position:relative;"><canvas id="statEvit"></canvas></div>
          <div id="statEvitDetalle"></div>
        </div>
        <div id="statEvitConc" style="margin-top:12px;font-size:.84rem;line-height:1.45;"></div>
      </div>

      <div class="estado-sede-card" style="margin-top:16px;border-left:3px solid #14b8a6;">
        <div class="estado-sede-title"><i class="fas fa-seedling"></i> Retención por cohorte · los primeros 90 días</div>
        <div style="font-size:.78rem;color:var(--muted);margin-bottom:10px;">Sigue a los socios según el mes en que entraron y mide cuántos siguen activos al mes 1, 2 y 3. Es el indicador que mejor anticipa el valor de un socio en el negocio del fitness.</div>
        <details style="margin-bottom:12px;">
          <summary style="cursor:pointer;font-size:.76rem;font-weight:600;color:#14b8a6;">Cómo se calcula y cómo leerlo</summary>
          <div style="font-size:.76rem;color:var(--muted);line-height:1.55;margin-top:8px;padding-left:4px;border-left:2px solid var(--border);padding:8px 0 8px 12px;">
            <b>Cómo se calcula.</b> Recorre socio por socio las 8 planillas, fila por fila. El <b>mes de alta</b> de cada socio es el primer mes en que aparece con un recepcionista cargado (Lucía/Tani, Ara/Azul o Keila/Rubén según la sede), que es como se registra un ingreso nuevo. A partir de ahí mira los meses siguientes de esa misma fila: si en alguno figura <b>BAJA</b>, ese socio se considera perdido desde ese mes; si no, sigue activo. Todos los que entraron el mismo mes forman una <b>cohorte</b>.<br><br>
            <b>Un detalle importante:</b> solo se cuentan los meses que ya ocurrieron y están cargados. Si un socio entró en junio, todavía no tiene mes 3, así que <u>no</u> se lo cuenta como perdido: queda fuera de ese cálculo. Por eso el porcentaje del mes 3 se calcula solo sobre los socios que realmente llegaron a cumplir 3 meses (en estadística se llama censura, y evita que las cohortes nuevas hundan el número).<br><br>
            <b>Cómo leerlo.</b> Cada línea es un mes de ingreso y arranca en 100%. Lo que importa no es tanto el número final sino <b>dónde cae la curva</b>: si el escalón grande está entre el alta y el mes 1, el problema es la primera experiencia (onboarding); si cae entre el mes 2 y el 3, el problema es el seguimiento. Como referencia del sector boutique, a los 90 días se considera bueno arriba del 70%. Solo se muestran cohortes con 5 altas o más, para que el porcentaje sea representativo.
          </div>
        </details>
        <div id="cohorteBox"><button class="aud-btn-save" onclick="cohorteAnalisis(this)" style="font-size:.82rem;padding:9px 18px;"><i class="fas fa-play"></i> Analizar cohortes</button></div>
      </div>

      <div class="estado-sede-card" style="margin-top:16px;border-left:3px solid #f43f5e;">
        <div class="estado-sede-title"><i class="fas fa-person-walking-arrow-right"></i> Bajas precoces · socios nuevos que no llegan al segundo mes</div>
        <div style="font-size:.78rem;color:var(--muted);margin-bottom:10px;">Detecta a los socios que entraron por recepción (Lucía/Tani, Ara/Azul o Keila/Rubén según la sede) y al mes siguiente figuran como BAJA. <b>La baja se cuenta en el mes en que ocurrió</b>: si el alta fue en marzo y la baja en abril, aparece en abril.</div>
        <details style="margin-bottom:12px;">
          <summary style="cursor:pointer;font-size:.76rem;font-weight:600;color:#f43f5e;">Cómo se calcula</summary>
          <div style="font-size:.76rem;color:var(--muted);line-height:1.55;margin-top:8px;padding:8px 0 8px 12px;border-left:2px solid var(--border);">
            Recorre socio por socio las 8 planillas. Un <b>socio nuevo</b> es el que en algún mes tiene cargado el nombre de un recepcionista de su sede (así se registra un ingreso). Después mira el mes siguiente de esa misma fila: si dice <b>BAJA</b>, es una <b>baja precoz</b> — entró y se fue en el primer ciclo.<br><br>
            El porcentaje de cada celda es <i>bajas precoces del mes ÷ altas del mes anterior</i>. Enero no se puede evaluar (no hay mes previo) y aparece como "—".
          </div>
        </details>
        <div id="precozBox"><button class="aud-btn-save" onclick="precozAnalisis(this)" style="font-size:.82rem;padding:9px 18px;background:#f43f5e;"><i class="fas fa-play"></i> Analizar bajas precoces</button></div>
      </div>

      <div class="estado-sede-card" style="margin-top:16px;border-left:3px solid #8b5cf6;">
        <div class="estado-sede-title"><i class="fas fa-hourglass-half"></i> Re-evaluaciones → Deserción: ¿impacto inmediato o con retraso?</div>
        <div style="font-size:.78rem;color:var(--muted);margin-bottom:12px;">Mide si reevaluar socios reduce las bajas en el mismo mes o recién 1-2 meses después. Correlación con retraso, juntando los 8 profes para tener más muestra.</div>
        <div id="lagBox"><button class="aud-btn-save" onclick="aeLagAnalysis(this)" style="font-size:.82rem;padding:9px 18px;"><i class="fas fa-play"></i> Analizar</button></div>
      </div>

      <div style="font-size:.68rem;color:var(--muted);margin-top:10px;padding:0 4px;"><i class="fas fa-circle-info"></i> Regresión lineal por mínimos cuadrados sobre ENE–${MESES[estadoMi]}. Las conclusiones se generan solas según los números.</div>`;

    statDrawTrend(); statRenderOutliers(); statRenderHomog(); statRenderYoY(); statRenderEvitables();
}

// ══ PUNTO 5 · Bajas evitables vs no evitables ══
// Clasifica cada baja mirando motivo Y comentario (el comentario suele revelar la causa real).
const BAJA_CAUSAS = [
    {id:'horarios', label:'Horarios y cupos', evitable:true,  kw:['horario','turno','cupo','se lleno','se llenó','lugar','reserv','agenda','completo','falta de tiempo','no consegu','llena','lleno']},
    {id:'expect',   label:'Expectativas / resultados', evitable:true, kw:['expectativa','no cumpl','resultado','esperaba','aburr','rutina','monoton','variar','no me gust']},
    {id:'atencion', label:'Atención y seguimiento', evitable:true, kw:['atencion','atención','trato','profe','entrenador','seguimiento','acompan','acompañ','caso omiso','no me ayud']},
    {id:'insta',    label:'Instalaciones y equipamiento', evitable:true, kw:['equipamiento','maquina','máquina','pesas','vestuario','limpi','musica','música','espacio','calor','frio','frío','app','aplicacion','aplicación']},
    {id:'compe',    label:'Se fue a otra opción', evitable:true, kw:['otra opcion','otra opción','otro gimnasio','prefer','competencia','cambio de gimnasio']},
    {id:'precio',   label:'Precio / valor percibido', evitable:null, kw:['econom','precio','costo','caro','plata','pagar','suscripcion','suscripción']},
    {id:'salud',    label:'Lesión o salud', evitable:false, kw:['lesion','lesión','salud','enferm','embaraz','operac','cirug','dolor','medic']},
    {id:'mudanza',  label:'Mudanza / trabajo / estudio', evitable:false, kw:['mudan','ciudad','viaj','trabajo','laboral','estudi','facultad','cambio de rutina']},
    {id:'vacas',    label:'Vacaciones / pausa', evitable:false, kw:['vacacion','vacación','pausa','receso','verano','invierno']},
];
function clasificarBaja(motivo, comentario){
    const t = ((motivo||'') + ' ' + (comentario||'')).toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    for(const c of BAJA_CAUSAS){
        if(c.kw.some(k => t.indexOf(k.normalize('NFD').replace(/[\u0300-\u036f]/g,'')) >= 0)) return c;
    }
    return {id:'otros', label:'Sin clasificar', evitable:null, kw:[]};
}
let statEvitChart=null;
function statRenderEvitables(){
    const cv=document.getElementById('statEvit'); if(!cv||!window.Chart) return;
    const todas=[].concat(
        (typeof cData!=='undefined'&&cData)?cData:[],
        (typeof bbData!=='undefined'&&bbData)?bbData:[]
    );
    const det=document.getElementById('statEvitDetalle'), conc=document.getElementById('statEvitConc');
    if(!todas.length){ if(conc) conc.innerHTML='<span style="color:var(--muted)">Todavía no hay encuestas de baja cargadas.</span>'; return; }

    const cuenta={}; let ev=0, no=0, parc=0;
    todas.forEach(r=>{
        const c=clasificarBaja(getCol(r,'motivo'), getCol(r,'coment')||getCol(r,'sugerenc')||getCol(r,'mejorar'));
        cuenta[c.id]=cuenta[c.id]||{label:c.label, n:0, evitable:c.evitable};
        cuenta[c.id].n++;
        if(c.evitable===true) ev++; else if(c.evitable===false) no++; else parc++;
    });
    const total=todas.length;

    if(statEvitChart) statEvitChart.destroy();
    statEvitChart=new Chart(cv,{type:'doughnut',
        data:{labels:['Evitables','Parcialmente evitables','No evitables'],
            datasets:[{data:[ev,parc,no],backgroundColor:['#ef4444','#f59e0b','#10b981'],borderWidth:2,borderColor:'#fff'}]},
        options:{responsive:true,maintainAspectRatio:false,
            plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:9,font:{size:11}}},
                tooltip:{callbacks:{label:c=>`${c.label}: ${c.parsed} bajas (${Math.round(c.parsed/total*100)}%)`}}}}});

    const orden=Object.values(cuenta).sort((a,b)=>b.n-a.n);
    det.innerHTML=orden.map(c=>{
        const col=c.evitable===true?'#ef4444':c.evitable===false?'#10b981':'#f59e0b';
        const et=c.evitable===true?'evitable':c.evitable===false?'no evitable':'a revisar';
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-size:.82rem;">
            <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${col};margin-right:7px;"></span>${c.label} <span style="color:var(--muted);font-size:.68rem;">${et}</span></span>
            <b>${c.n}</b> <span style="color:var(--muted);font-size:.72rem;">(${Math.round(c.n/total*100)}%)</span>
        </div>`;
    }).join('');

    const pctEv=Math.round(ev/total*100);
    const topEv=orden.filter(c=>c.evitable===true)[0];
    let txt=`Sobre <b>${total} bajas</b> registradas, <b style="color:#ef4444">${pctEv}% son evitables</b> por MOVE`;
    if(parc) txt+=` y otro ${Math.round(parc/total*100)}% son de precio/valor, que en el fondo también se trabaja con percepción de valor`;
    txt+='. ';
    if(topEv) txt+=`La causa evitable número uno es <b>${topEv.label}</b> (${topEv.n} casos). `;
    if(pctEv>=40) txt+=`<b>Es mucho: casi la mitad de las bajas se podían prevenir.</b> Ahí está la palanca más grande de retención que tenés hoy.`;
    else if(pctEv>=20) txt+=`Hay margen real de mejora: una de cada ${Math.round(100/pctEv)} bajas se podía evitar.`;
    else txt+=`La mayoría de las bajas son por causas externas, que es la mejor señal posible: el servicio no las está provocando.`;
    conc.innerHTML=txt;
}

// ══ PUNTO 3 · Retención por cohorte (primeros 90 días) ══
let cohorteChart=null;
async function cohorteAnalisis(btn){
    const box=document.getElementById('cohorteBox');
    btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Leyendo planillas…';
    const ids=Object.keys(AE_SHEETS||{});
    const maxMes = estadoMi;   // último mes con datos cargados
    // cohortes[mesAlta] = {n, obs:[m1,m2,m3], vivos:[m1,m2,m3]}
    const coh={};
    await Promise.all(ids.map(async id=>{
        try{
            const plan=await aeExportCSV(AE_SHEETS[id]);
            const RECEP = (typeof AE_RECEP_SEDE!=='undefined' && AE_RECEP_SEDE[AE_SEDE[id]]) || AE_RECEP;
            for(let i=6;i<plan.length;i++){
                const r=plan[i]; if(!r) continue;
                if(!/^\d/.test((r[2]||'').trim())) continue;
                if(!(r[4]||'').trim()) continue;
                // estado mes a mes
                const est=AE_MES_COLS.map(c=> (r[c]||'').trim().toUpperCase());
                // mes de alta = primer mes con recepcionista (socio nuevo)
                let alta=-1;
                for(let m=0;m<est.length;m++){ if(est[m] && RECEP.has(est[m])){ alta=m; break; } }
                if(alta<0) continue;
                // mes en que dio de baja (si dio)
                let bajaMes=-1;
                for(let m=alta+1;m<est.length;m++){ if(est[m]==='BAJA'){ bajaMes=m; break; } }
                coh[alta]=coh[alta]||{n:0,obs:[0,0,0],vivos:[0,0,0]};
                coh[alta].n++;
                for(let k=1;k<=3;k++){
                    const m=alta+k;
                    if(m>maxMes || m>=est.length) break;   // ese mes todavía no ocurrió/no se cargó → no se cuenta
                    coh[alta].obs[k-1]++;                   // socio observable en ese horizonte
                    if(bajaMes<0 || bajaMes>m) coh[alta].vivos[k-1]++;
                }
            }
        }catch(e){}
    }));

    const meses=Object.keys(coh).map(Number).sort((a,b)=>a-b).filter(m=>coh[m].n>=5);
    if(!meses.length){ box.innerHTML='<div style="font-size:.85rem;color:var(--muted)">No hay suficientes altas cargadas para armar cohortes todavía.</div>'; return; }

    const r1=[],r2=[],r3=[];
    meses.forEach(m=>{ const c=coh[m];
        const tasa=k=> c.obs[k]>0 ? +(c.vivos[k]/c.obs[k]*100).toFixed(1) : null;
        r1.push(tasa(0)); r2.push(tasa(1)); r3.push(tasa(2));
    });
    const prom=a=>{ const v=a.filter(x=>x!=null); return v.length?+(v.reduce((x,y)=>x+y,0)/v.length).toFixed(1):0; };
    const p1=prom(r1), p2=prom(r2), p3=prom(r3);

    box.innerHTML=`<div style="height:280px;position:relative;"><canvas id="statCohorte"></canvas></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;">
            ${[['Mes 1',p1],['Mes 2',p2],['Mes 3 (90 días)',p3]].map(([l,v])=>{
                const c=v>=80?'#10b981':v>=65?'#f59e0b':'#ef4444';
                return `<div style="flex:1;min-width:120px;background:var(--bg);border-radius:10px;padding:10px 14px;">
                    <div style="font-size:.68rem;color:var(--muted);font-weight:600;text-transform:uppercase;">${l}</div>
                    <div style="font-size:1.5rem;font-weight:800;color:${c};font-family:monospace;">${v}%</div></div>`;}).join('')}
        </div>
        <div id="cohorteConc" style="margin-top:12px;font-size:.84rem;line-height:1.45;"></div>`;

    if(cohorteChart) cohorteChart.destroy();
    cohorteChart=new Chart(document.getElementById('statCohorte'),{type:'line',
        data:{labels:['Alta','Mes 1','Mes 2','Mes 3'],
            datasets:meses.map((m,i)=>{
                const col=ESTADO_PAL[i%8];
                return {label:MESES[m]+' ('+coh[m].n+')',data:[100,r1[i],r2[i],r3[i]],borderColor:col,backgroundColor:col+'22',borderWidth:2.5,tension:.3,pointRadius:4};
            })},
        options:{responsive:true,maintainAspectRatio:false,
            plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:8,font:{size:10}}},
                title:{display:true,text:'% de socios que siguen activos según el mes en que entraron',font:{size:11},color:'#94a3b8'},
                tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.parsed.y}% activos`}}},
            scales:{y:{beginAtZero:true,max:105,ticks:{callback:v=>v+'%'},grid:{color:'rgba(120,130,150,.15)'}},x:{grid:{display:false}}}}});

    const caida1=+(100-p1).toFixed(1), caida3=+(100-p3).toFixed(1);
    let txt=`De cada 100 socios nuevos, a los <b>90 días siguen ${p3}</b>. La caída más fuerte se da `;
    const c1=100-p1, c2=p1-p2, c3=p2-p3;
    const mayor=Math.max(c1,c2,c3);
    txt += mayor===c1 ? `<b style="color:#ef4444">en el primer mes</b> (se van ${caida1} de cada 100).`
         : mayor===c2 ? `<b style="color:#ef4444">entre el mes 1 y el 2</b>.`
         : `<b style="color:#ef4444">entre el mes 2 y el 3</b>.`;
    if(p3>=70) txt+=` Un ${p3}% a 90 días está en el rango bueno para un gimnasio boutique.`;
    else if(p3>=55) txt+=` Un ${p3}% a 90 días es mejorable: el estándar boutique se ubica cerca del 70%.`;
    else txt+=` <b>Un ${p3}% a 90 días es bajo</b>: el problema está en el onboarding, no en la captación.`;
    txt += mayor===c1
        ? ` Con esa forma de curva, el foco es la <b>primera experiencia</b>: evaluación inicial, objetivo concreto y contacto en la primera semana.`
        : ` Con esa forma de curva, el foco es el <b>seguimiento del segundo y tercer mes</b>: re-evaluación y cambio de plan antes de que se aburran.`;
    document.getElementById('cohorteConc').innerHTML=txt;
}

// ══ Deserción año contra año + estacionalidad (anticipación de bajas) ══
let yoySede='Todas', statYoYChart=null, statEstacChart=null;
function yoyPct(arr){ if(!arr) return null; const mx=Math.max(...arr.map(v=>Math.abs(v||0))); const f=mx<=1.5?100:1; return arr.map(v=>+(((v||0)*f)).toFixed(1)); }
function yoyProfes(){
    if(!metricsData || !metricsData.vs) return [];
    return metricsData.vs
        .filter(p => yoySede==='Todas' || p.sede===yoySede)
        .map(p => ({...p, d25: yoyPct(p.deseRc25), d26: yoyPct(p.deseRc26)}));
}
function yoyProm(lista, campo, mes){
    const vals = lista.map(p => p[campo] && p[campo][mes]).filter(v => v!=null && v>0);
    return vals.length ? +(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : null;
}
function statSetYoYSede(s){ yoySede=s; statRenderYoY(); }

function statRenderYoY(){
    const cv=document.getElementById('statYoY'); if(!cv||!window.Chart) return;
    const btns=document.getElementById('yoySedeBtns');
    if(btns) btns.innerHTML=['Todas','El Bolsón','Lago Puelo'].map(s=>
        `<button onclick="statSetYoYSede('${s}')" style="border:none;cursor:pointer;font-family:inherit;font-size:.78rem;font-weight:600;padding:6px 14px;border-radius:8px;${yoySede===s?'background:#f59e0b;color:#fff;':'background:var(--bg);color:var(--muted);'}">${s}</button>`).join('');

    const lista=yoyProfes();
    if(!lista.length || !lista.some(p=>p.d25)){
        document.getElementById('statYoYConc').innerHTML='<span style="color:var(--muted)">Todavía no hay datos de 2025 cargados para comparar.</span>';
        document.getElementById('statYoYTabla').innerHTML=''; return;
    }
    const s25=MESES.map((_,m)=>yoyProm(lista,'d25',m));
    const s26=MESES.map((_,m)=> m<=estadoMi ? yoyProm(lista,'d26',m) : null);

    if(statYoYChart) statYoYChart.destroy();
    statYoYChart=new Chart(cv,{type:'line',
        data:{labels:MESES,datasets:[
            {label:'Deserción 2025',data:s25,borderColor:'#94a3b8',backgroundColor:'#94a3b822',borderWidth:3,tension:.3,pointRadius:4,spanGaps:true},
            {label:'Deserción 2026',data:s26,borderColor:'#ef4444',backgroundColor:'#ef444422',borderWidth:3,tension:.3,pointRadius:5,spanGaps:true}
        ]},
        plugins:[SUBTLE_LABELS],
        options:{responsive:true,maintainAspectRatio:false,layout:{padding:{top:14}},
            plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:9,font:{size:11}}},
                tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.parsed.y}%`}}},
            scales:{y:{beginAtZero:true,ticks:{callback:v=>v+'%'},grid:{color:'rgba(120,130,150,.15)'}},x:{grid:{display:false}}}}});

    // Conclusión YTD
    const v25=[],v26=[];
    for(let m=0;m<=estadoMi;m++){ if(s25[m]!=null) v25.push(s25[m]); if(s26[m]!=null) v26.push(s26[m]); }
    const p25=v25.length?v25.reduce((a,b)=>a+b,0)/v25.length:null;
    const p26=v26.length?v26.reduce((a,b)=>a+b,0)/v26.length:null;
    let conc='';
    if(p25!=null && p26!=null){
        const dif=+(p26-p25).toFixed(1), mejor=dif<0;
        const col=mejor?'#10b981':'#ef4444';
        conc=`<b>${yoySede}</b> · acumulado ENE–${MESES[estadoMi]}: la deserción promedio de <b>2026 es ${p26.toFixed(1)}%</b> contra <b>${p25.toFixed(1)}%</b> en 2025 → <b style="color:${col}">${dif>0?'+':''}${dif} puntos</b> (${mejor?'mejoró':'empeoró'}).`;
        // meses donde empeoró
        const peores=[];
        for(let m=0;m<=estadoMi;m++){ if(s25[m]!=null&&s26[m]!=null&&s26[m]-s25[m]>=3) peores.push(`${MESES[m]} (+${(s26[m]-s25[m]).toFixed(1)})`); }
        if(peores.length) conc+=` Los meses que se despegaron para peor: <b>${peores.join(' · ')}</b>.`;
        else if(mejor) conc+=` Ningún mes empeoró más de 3 puntos: la mejora es pareja, no un golpe de suerte de un mes puntual.`;
    }
    document.getElementById('statYoYConc').innerHTML=conc;

    // Tabla por profesional
    let filas='';
    lista.forEach(p=>{
        const a25=[],a26=[];
        for(let m=0;m<=estadoMi;m++){ if(p.d25&&p.d25[m]>0)a25.push(p.d25[m]); if(p.d26&&p.d26[m]>0)a26.push(p.d26[m]); }
        const m25=a25.length?a25.reduce((a,b)=>a+b,0)/a25.length:null;
        const m26=a26.length?a26.reduce((a,b)=>a+b,0)/a26.length:null;
        const dif=(m25!=null&&m26!=null)?+(m26-m25).toFixed(1):null;
        const col=dif==null?'var(--muted)':dif<0?'#10b981':dif>0?'#ef4444':'var(--muted)';
        filas+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);font-size:.82rem;">
            <span><b>${p.n26}</b> <span style="color:var(--muted);font-size:.7rem;">${p.sede} · vs ${p.n25} 2025</span></span>
            <span style="font-family:monospace;">${m25!=null?m25.toFixed(1)+'%':'—'} → <b>${m26!=null?m26.toFixed(1)+'%':'—'}</b>
                <span style="color:${col};font-weight:700;margin-left:6px;">${dif==null?'':(dif>0?'▲ +':'▼ ')+Math.abs(dif)}</span></span>
        </div>`;
    });
    document.getElementById('statYoYTabla').innerHTML=filas;

    statDrawEstacional(lista, s25);
}

function statDrawEstacional(lista, s25){
    const cv=document.getElementById('statEstac'); if(!cv||!window.Chart) return;
    const vals=s25.map(v=>v==null?0:v);
    const conDato=vals.filter(v=>v>0);
    if(!conDato.length){ document.getElementById('statEstacConc').innerHTML=''; return; }
    const media=conDato.reduce((a,b)=>a+b,0)/conDato.length;
    const cols=vals.map(v=> v===0?'#e2e8f0' : v>=media*1.2?'#ef4444' : v>=media?'#f59e0b' : '#10b981');
    if(statEstacChart) statEstacChart.destroy();
    statEstacChart=new Chart(cv,{type:'bar',
        data:{labels:MESES,datasets:[{data:vals,backgroundColor:cols,borderRadius:6}]},
        plugins:[SUBTLE_LABELS],
        options:{responsive:true,maintainAspectRatio:false,layout:{padding:{top:14}},
            plugins:{legend:{display:false},title:{display:true,text:`Deserción 2025 por mes · media anual ${media.toFixed(1)}%`,font:{size:11},color:'#94a3b8'},
                tooltip:{callbacks:{label:c=>c.parsed.y+'% de deserción'}}},
            scales:{y:{beginAtZero:true,ticks:{callback:v=>v+'%'},grid:{color:'rgba(120,130,150,.15)'}},x:{grid:{display:false}}}}});

    // Conclusión: meses críticos y qué se viene
    const criticos=vals.map((v,m)=>({m,v})).filter(o=>o.v>=media*1.2).sort((a,b)=>b.v-a.v);
    let txt='';
    if(criticos.length){
        txt=`Históricamente los meses de mayor fuga en <b>${yoySede}</b> son <b style="color:#ef4444">${criticos.slice(0,3).map(o=>MESES[o.m]+' ('+o.v.toFixed(1)+'%)').join(' · ')}</b>, contra una media anual de ${media.toFixed(1)}%.`;
        const prox=(estadoMi+1)%12;
        const esCritico=criticos.some(o=>o.m===prox);
        if(esCritico) txt+=` <b style="color:#ef4444">Atención: el mes que viene (${MESES[prox]}) fue crítico en 2025 (${vals[prox].toFixed(1)}%).</b> Conviene adelantar re-evaluaciones y contacto con socios en riesgo <b>este mes</b>, no cuando ya se estén yendo.`;
        else txt+=` El mes que viene (${MESES[prox]}) no figura entre los críticos, es buen momento para trabajar fidelización de cara a los que sí lo son.`;
    } else {
        txt=`No hay meses que se despeguen claramente de la media (${media.toFixed(1)}%): la deserción de 2025 fue pareja a lo largo del año.`;
    }
    document.getElementById('statEstacConc').innerHTML=txt;
}

function statSetMetric(m){ statMetric=m; document.querySelectorAll('[data-sk]').forEach(b=>{const on=b.getAttribute('data-sk')===m; b.style.background=on?'var(--accent)':'var(--bg)'; b.style.color=on?'#fff':'var(--muted)';}); statDrawTrend(); statRenderOutliers(); statRenderHomog(); }
function statSetProfe(n){ statProfe=n; document.querySelectorAll('[data-sp]').forEach(b=>{const on=b.getAttribute('data-sp')===n; b.style.background=on?'#3b82f6':'var(--bg)'; b.style.color=on?'#fff':'var(--muted)';}); statDrawTrend(); }

function statDrawTrend(){
    const cv=document.getElementById('statTrend'); if(!cv||!window.Chart) return;
    if(statTrendChart) statTrendChart.destroy();
    const p=estadoUnified.find(x=>x.nombre===statProfe); if(!p) return;
    const ys=statSerie(p); const n=ys.length;
    const {slope,intercept,r2}=statLinReg(ys);
    const labels=MESES.slice(0,n).concat(['→ '+(MESES[n]||'próx')]);
    const regLine=labels.map((_,i)=>+(intercept+slope*i).toFixed(1));
    const realData=ys.concat([null]);
    const proj=+(intercept+slope*n).toFixed(1);
    statTrendChart=new Chart(cv,{type:'line',
        data:{labels,datasets:[
            {label:statLabel()+' real',data:realData,borderColor:'#3b82f6',backgroundColor:'#3b82f6',borderWidth:3,pointRadius:4,tension:.3,spanGaps:false},
            {label:'Tendencia',data:regLine,borderColor:'#94a3b8',borderDash:[6,5],borderWidth:2,pointRadius:0},
            {label:'Proyección',data:labels.map((_,i)=>i===n?proj:null),borderColor:'#f59e0b',backgroundColor:'#f59e0b',pointRadius:6,pointStyle:'rectRot',showLine:false}
        ]},
        options:{responsive:true,maintainAspectRatio:false,
            plugins:{legend:{labels:{usePointStyle:true,boxWidth:8,font:{size:11}}},
                tooltip:{callbacks:{label:c=>c.parsed.y==null?'':`${c.dataset.label}: ${c.parsed.y}${statUnit()}`}}},
            scales:{y:{beginAtZero:true,ticks:{callback:v=>v+statUnit()},grid:{color:'rgba(120,130,150,.15)'}},x:{grid:{display:false}}}}});

    // Conclusión automática
    const dir = Math.abs(slope)<0.15 ? 'estable' : slope>0 ? 'en aumento' : 'a la baja';
    const bueno = statMetric==='deserc' ? slope<0 : slope>0;
    const col = Math.abs(slope)<0.15 ? 'var(--muted)' : bueno ? '#10b981' : '#ef4444';
    let txt = `<b>${statProfe}</b>: ${statLabel().toLowerCase()} <b style="color:${col}">${dir}</b> (${slope>0?'+':''}${slope.toFixed(2)} ${statUnit()||'altas'}/mes, R²=${r2.toFixed(2)}). Proyección ${MESES[n]||'próximo mes'}: <b style="color:${col}">${proj}${statUnit()}</b>.`;
    if(statMetric==='deserc'){
        const {m}=statMeanStd(ys.filter(v=>v>0));
        const anual=Math.round((1-Math.pow(1-m/100,12))*100);
        txt += ` Su deserción mensual promedio (${m.toFixed(1)}%) anualiza a <b style="color:${anual<=30?'#10b981':'#ef4444'}">${anual}%</b> (objetivo ≤30%).`;
    }
    if(r2<0.3 && Math.abs(slope)>=0.15) txt += ` <span style="color:var(--muted)">La tendencia es débil (mucha dispersión), tomala con pinzas.</span>`;
    document.getElementById('statTrendConc').innerHTML=txt;
}

function statRenderOutliers(){
    const el=document.getElementById('statOutliers'); if(!el) return;
    const vals=estadoUnified.map(p=>{ const s=statSerie(p); return {n:p.nombre, sede:p.sede, v:s[s.length-1]||0}; });
    const {m,sd}=statMeanStd(vals.map(v=>v.v));
    const worseHigh = statMetric!=='ret'; // deserción/altas: más alto = peor (para deserción). Para altas alto=mejor
    const rows=vals.map(v=>({...v, z: sd?(v.v-m)/sd:0})).sort((a,b)=> (statMetric==='deserc'? b.v-a.v : b.v-a.v));
    const html=rows.map(r=>{
        const out=Math.abs(r.z)>=1.5;
        let malo;
        if(statMetric==='deserc') malo=r.z>0; else malo=r.z<0; // deserción alta=malo; retención/altas baja=malo
        const col = !out ? 'var(--muted)' : malo ? '#ef4444' : '#10b981';
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-size:.82rem;">
            <span>${out?'<i class="fas fa-triangle-exclamation" style="color:'+col+';margin-right:5px;"></i>':'<span style="display:inline-block;width:19px"></span>'}${r.n} <span style="color:var(--muted);font-size:.7rem;">${r.sede}</span></span>
            <span><b>${r.v}${statUnit()}</b> <span style="color:${col};font-size:.74rem;font-weight:700;">z=${r.z>=0?'+':''}${r.z.toFixed(1)}</span></span></div>`;
    }).join('');
    // conclusión
    const outs=rows.filter(r=>Math.abs(r.z)>=1.5);
    let conc;
    if(!outs.length){ conc=`Equipo parejo: nadie se aparta más de 1.5σ de la media (${m.toFixed(1)}${statUnit()}). Buena señal de consistencia.`; }
    else{
        const peor = statMetric==='deserc' ? outs.filter(r=>r.z>0) : outs.filter(r=>r.z<0);
        const mejor = statMetric==='deserc' ? outs.filter(r=>r.z<0) : outs.filter(r=>r.z>0);
        const parts=[];
        if(peor.length) parts.push(`<b style="color:#ef4444">${peor.map(r=>r.n).join(', ')}</b> a acompañar (se despega negativamente)`);
        if(mejor.length) parts.push(`<b style="color:#10b981">${mejor.map(r=>r.n).join(', ')}</b> como referente`);
        conc=`Media del equipo ${m.toFixed(1)}${statUnit()}. ${parts.join(' · ')}.`;
    }
    el.innerHTML=`<div style="font-size:.68rem;color:var(--muted);margin-bottom:2px;">Zona sombreada = ±1σ (comportamiento típico del equipo) · fuera de ±1.5σ se considera outlier</div>`
        +`<div style="height:190px;position:relative;margin-bottom:10px;"><canvas id="statGauss"></canvas></div>`
        +html+`<div style="margin-top:10px;font-size:.8rem;line-height:1.4;">${conc}</div>`;
    statDrawGauss(rows, m, sd);
}

// Campana de Gauss: distribución del equipo con cada profe ubicado en su z-score
let statGaussChart=null;
function statDrawGauss(rows, m, sd){
    const cv=document.getElementById('statGauss'); if(!cv||!window.Chart) return;
    if(statGaussChart) statGaussChart.destroy();
    const dens=z=>Math.exp(-(z*z)/2);
    const curva=[], core=[];
    for(let z=-3.2; z<=3.2001; z+=0.1){
        const zz=Math.round(z*100)/100;
        curva.push({x:zz, y:+dens(zz).toFixed(4)});
        core.push({x:zz, y: Math.abs(zz)<=1 ? +dens(zz).toFixed(4) : null});
    }
    const pts=rows.map(r=>{
        const z=Math.max(-3.1,Math.min(3.1,r.z));
        const out=Math.abs(r.z)>=1.5;
        const malo = statMetric==='deserc' ? r.z>0 : r.z<0;
        return {x:+z.toFixed(2), y:+dens(z).toFixed(4), _n:r.n, _v:r.v, _z:r.z, _c: !out?'#94a3b8':(malo?'#ef4444':'#10b981'), _r: out?8:6};
    });
    statGaussChart=new Chart(cv,{
        type:'line',
        data:{datasets:[
            {label:'core', data:core, borderColor:'transparent', backgroundColor:'rgba(59,130,246,.13)', fill:'origin', pointRadius:0, tension:.4, spanGaps:false, order:3},
            {label:'Distribución', data:curva, borderColor:'#64748b', borderWidth:2, pointRadius:0, tension:.4, fill:false, order:2},
            {type:'scatter', label:'Profes', data:pts, pointRadius:c=>c.raw._r, pointHoverRadius:c=>c.raw._r+3,
             backgroundColor:c=>c.raw._c, borderColor:'#fff', borderWidth:2, order:1}
        ]},
        options:{responsive:true, maintainAspectRatio:false, parsing:false,
            plugins:{ legend:{display:false},
                tooltip:{ filter:c=>c.datasetIndex===2,
                    callbacks:{ title:()=>'', label:c=>{ const r=c.raw; return `${r._n}: ${r._v}${statUnit()}  (z=${r._z>=0?'+':''}${r._z.toFixed(2)})`; } } } },
            scales:{
                x:{ type:'linear', min:-3.2, max:3.2,
                    ticks:{ stepSize:1, font:{size:10},
                        callback:v=> v===0?`media ${m.toFixed(1)}${statUnit()}` : (Math.abs(v)<=2? (v>0?'+':'')+v+'σ' : '') },
                    grid:{color:'rgba(120,130,150,.15)'} },
                y:{ display:false, min:0, max:1.15 } } }
    });
}

function statRenderHomog(){
    const el=document.getElementById('statHomog'); if(!el) return;
    const vals=estadoUnified.map(p=>{ const s=statSerie(p); return s[s.length-1]||0; });
    const {m,sd}=statMeanStd(vals);
    const cv = m? sd/Math.abs(m)*100 : 0;
    const min=Math.min(...vals), max=Math.max(...vals);
    let nivel,col,msg;
    if(cv<15){ nivel='Alta homogeneidad'; col='#10b981'; msg='La calidad es muy pareja entre profes — el servicio está estandarizado.'; }
    else if(cv<30){ nivel='Homogeneidad media'; col='#f59e0b'; msg='Hay variación moderada entre profes; se puede emparejar.'; }
    else { nivel='Baja homogeneidad'; col='#ef4444'; msg='Mucha dispersión entre profes: la calidad todavía no es homogénea (objetivo institucional de MOVE).'; }
    el.innerHTML=`
        <div style="display:flex;align-items:baseline;gap:8px;margin:4px 0 10px;">
            <span style="font-size:2rem;font-weight:800;color:${col};font-family:monospace;">${cv.toFixed(0)}%</span>
            <span style="font-size:.8rem;color:${col};font-weight:700;">${nivel}</span>
        </div>
        <div style="font-size:.76rem;color:var(--muted);margin-bottom:10px;">Coeficiente de variación de ${statLabel().toLowerCase()} (${MESES[estadoMi]}). Media ${m.toFixed(1)}${statUnit()}, rango ${min}${statUnit()}–${max}${statUnit()}.</div>
        <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:10px;"><div style="height:100%;width:${Math.min(100,cv)}%;background:${col};"></div></div>
        <div style="font-size:.82rem;line-height:1.4;">${msg}</div>`;
}

// ── Análisis de retraso: re-evaluaciones vs deserción ──
function statPearson(xs,ys){
    const n=xs.length; if(n<3) return null;
    let sx=0,sy=0,sxy=0,sxx=0,syy=0;
    for(let i=0;i<n;i++){ sx+=xs[i]; sy+=ys[i]; sxy+=xs[i]*ys[i]; sxx+=xs[i]*xs[i]; syy+=ys[i]*ys[i]; }
    const d=Math.sqrt((n*sxx-sx*sx)*(n*syy-sy*sy));
    return d? (n*sxy-sx*sy)/d : null;
}
let statLagChart=null;
async function aeLagAnalysis(btn){
    const box=document.getElementById('lagBox');
    btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Cargando datos de los profes…';
    const ids=Object.keys(AE_FALLBACK);
    await Promise.all(ids.map(id=> (aeLiveCargado&&aeLiveCargado[id]) ? Promise.resolve() : aeLoadLive(id).catch(()=>{}) ));

    const lags=[0,1,2,3];
    const res=lags.map(lag=>{
        const X=[],Y=[];
        ids.forEach(id=>{
            const d=AE_DATA[id]; if(!d||!d.objetivos) return;
            const o=d.objetivos;
            for(let m=0;m+lag<o.length;m++){
                if(!o[m]||!o[m+lag]) continue;
                if((o[m].activos||0)>0 && (o[m+lag].activos||0)>0 && o[m].reeval!=null && o[m+lag].desercion!=null){
                    X.push(o[m].reeval); Y.push(o[m+lag].desercion);
                }
            }
        });
        return {lag, r:statPearson(X,Y), n:X.length};
    }).filter(r=>r.r!=null);

    if(!res.length){ box.innerHTML='<div style="font-size:.85rem;color:var(--muted)">No hay suficientes datos para el análisis todavía.</div>'; return; }

    // lag con r más negativo (mayor efecto de reducir deserción)
    const best=res.reduce((a,b)=> b.r<a.r?b:a);
    const lagTxt=l=> l===0?'mismo mes':l===1?'1 mes después':`${l} meses después`;
    let conc;
    if(best.r<=-0.3){
        const imm = best.lag===0;
        conc=`El efecto más fuerte aparece <b style="color:#8b5cf6">${lagTxt(best.lag)}</b> (r=${best.r.toFixed(2)}): a más re-evaluaciones, menos deserción ${imm?'ya en el mismo mes — impacto inmediato.':'con retraso — reevaluar hoy se nota en las bajas de '+(best.lag===1?'el mes siguiente.':'los meses siguientes.')} Conviene reevaluar de forma sostenida, no esperar a que suba la deserción.`;
    } else if(best.r<=-0.15){
        conc=`Se insinúa una relación (r=${best.r.toFixed(2)} ${lagTxt(best.lag)}): las re-evaluaciones tienden a bajar la deserción, pero el efecto es débil con los datos de hasta ahora.`;
    } else {
        conc=`Con los datos actuales no se ve una relación clara entre re-evaluaciones y deserción. Hacen falta más meses de historia para confirmarlo.`;
    }
    const nMin=Math.min(...res.map(r=>r.n));
    const caveat = nMin<15 ? `<div style="font-size:.7rem;color:var(--muted);margin-top:8px;"><i class="fas fa-triangle-exclamation"></i> Muestra chica (${nMin}–${Math.max(...res.map(r=>r.n))} pares por retraso, ~7 meses): tomalo como una señal, no como prueba definitiva.</div>` : '';

    box.innerHTML=`<div style="height:260px;position:relative;"><canvas id="statLag"></canvas></div>
        <div style="margin-top:12px;font-size:.85rem;line-height:1.45;">${conc}</div>${caveat}`;

    const cv=document.getElementById('statLag');
    if(statLagChart) statLagChart.destroy();
    const cols=res.map(r=> r.r<0?'#10b981':'#ef4444');
    statLagChart=new Chart(cv,{type:'bar',
        data:{labels:res.map(r=>r.lag===0?'Mismo mes':`+${r.lag} mes${r.lag>1?'es':''}`),
            datasets:[{data:res.map(r=>+r.r.toFixed(2)),backgroundColor:cols,borderRadius:6}]},
        options:{responsive:true,maintainAspectRatio:false,
            plugins:{legend:{display:false},
                title:{display:true,text:'Correlación re-evaluaciones vs deserción (negativo = reevaluar reduce bajas)',font:{size:11},color:'#94a3b8'},
                tooltip:{callbacks:{label:c=>{const r=res[c.dataIndex]; return `r=${c.parsed.y} (n=${r.n} pares)`;}}}},
            scales:{y:{min:-1,max:1,ticks:{stepSize:0.5},grid:{color:'rgba(120,130,150,.15)'},title:{display:true,text:'r de Pearson',font:{size:10}}},x:{grid:{display:false}}}}});
}

function estadoToggleProfe(n){ if(estadoSel.has(n)) estadoSel.delete(n); else estadoSel.add(n); estadoDrawLine(); }
function estadoSetMetric(m){ estadoMetric=m; document.querySelectorAll('[data-mk]').forEach(b=>{ const on=b.getAttribute('data-mk')===m; b.style.background=on?'var(--accent)':'var(--bg)'; b.style.color=on?'#fff':'var(--muted)'; }); estadoDrawLine(); }

function estadoGridColor(){ return getComputedStyle(document.body).getPropertyValue('--border')||'rgba(120,130,150,.2)'; }

function estadoDrawLine(){
    const cv=document.getElementById('egLine'); if(!cv||!window.Chart) return;
    if(egLineChart) egLineChart.destroy();
    const labels = MESES.slice(0, estadoMi+1);
    const isDes = estadoMetric==='deserc';
    const datasets = estadoUnified.filter(p=>estadoSel.has(p.nombre)).map(p=>{
        const idx = estadoUnified.indexOf(p), col = ESTADO_PAL[idx%8];
        const arr = (isDes?p.deserc:p.altas).slice(0, estadoMi+1);
        return { label:p.nombre, data:arr, borderColor:col, backgroundColor:col+'22', tension:.3, borderWidth:3, pointRadius:4, pointHoverRadius:6, fill:false };
    });
    egLineChart = new Chart(cv, { type:'line', data:{labels, datasets},
        options:{ responsive:true, maintainAspectRatio:false,
            plugins:{ legend:{labels:{usePointStyle:true, boxWidth:8, font:{size:12}}},
                tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.parsed.y}${isDes?'%':''}`}}},
            scales:{ y:{ beginAtZero:true, ticks:{callback:v=>isDes?v+'%':v}, grid:{color:'rgba(120,130,150,.15)'} },
                x:{ grid:{display:false} } } } });
}

function estadoDrawBar(){
    const cv=document.getElementById('egBar'); if(!cv||!window.Chart) return;
    if(egBarChart) egBarChart.destroy();
    const rows = estadoUnified.map(p=>({n:p.nombre, v:p.deserc[estadoMi]||0})).sort((a,b)=>a.v-b.v);
    const cols = rows.map(r=> r.v<15?'#10b981':r.v<25?'#f59e0b':'#ef4444');
    egBarChart = new Chart(cv, { type:'bar',
        data:{ labels:rows.map(r=>r.n), datasets:[{ data:rows.map(r=>r.v), backgroundColor:cols, borderRadius:6 }] },
        options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{callbacks:{label:c=>c.parsed.y+'% deserción'}}},
            scales:{ y:{beginAtZero:true, ticks:{callback:v=>v+'%'}, grid:{color:'rgba(120,130,150,.15)'}}, x:{grid:{display:false}} } } });
}

function estadoDrawPie(){
    const cv=document.getElementById('egPie'); if(!cv||!window.Chart) return;
    if(egPieChart) egPieChart.destroy();
    const rows = estadoUnified.map((p,i)=>({n:p.nombre, v:p.altas[estadoMi]||0, c:ESTADO_PAL[i%8]})).filter(r=>r.v>0);
    egPieChart = new Chart(cv, { type:'doughnut',
        data:{ labels:rows.map(r=>r.n), datasets:[{ data:rows.map(r=>r.v), backgroundColor:rows.map(r=>r.c), borderWidth:2, borderColor:getComputedStyle(document.body).getPropertyValue('--card')||'#fff' }] },
        options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{position:'right', labels:{usePointStyle:true, boxWidth:8, font:{size:11}}},
            tooltip:{callbacks:{label:c=>{ const t=c.dataset.data.reduce((a,b)=>a+b,0); return `${c.label}: ${c.parsed} altas (${Math.round(c.parsed/t*100)}%)`; }}} } } });
}
function renderVersus() {
    const el = document.getElementById('versusCards');
    if (!planData) { el.innerHTML = '<div class="alert">Sin datos disponibles</div>'; return; }

    // Auto-detect current month
    let curMes = 0;
    for (let i = MESES.length - 1; i >= 0; i--) {
        if (planData.profes.some(p => (p.histAltas26[i]||0) > 5)) { curMes = i; break; }
    }
    const mi = vsMonth >= 0 ? vsMonth : curMes;

    // Month selector
    let selHtml = '<div class="vs-month-selector">';
    MESES.forEach((m, i) => {
        const active  = i === mi ? ' active' : '';
        const hasDat  = planData.profes.some(p => (p.histAltas26[i]||0) + (p.histAltas25[i]||0) > 0);
        selHtml += `<button class="vs-mon-btn${active}${hasDat ? '' : ' vs-mon-dim'}" onclick="setVsMonth(${i})">${m}</button>`;
    });
    selHtml += '</div>';

    // Only active 2026 profes (exclude retired ones)
    const activeProfes = planData.profes.filter(p => {
        const ctx = PROFE_CONTEXT[p.nombre];
        return !ctx || !ctx.reemplazadoPor;
    });

    const SEDES = ['El Bolsón', 'Lago Puelo'];
    let html = selHtml;

    SEDES.forEach(sede => {
        const profes = activeProfes.filter(p => getSede(p.nombre) === sede);
        if (!profes.length) return;

        // Sede YTD totals
        const ytd26 = profes.reduce((s,p) => s + p.histAltas26.slice(0, mi+1).reduce((a,b)=>a+b,0), 0);
        const ytd25 = profes.reduce((s,p) => s + p.histAltas25.slice(0, mi+1).reduce((a,b)=>a+b,0), 0);
        const ytdD  = ytd26 - ytd25;
        const ytdPct = ytd25 > 0 ? Math.round(ytdD/ytd25*100) : 0;
        const ytdCol = ytdD >= 0 ? '#10b981' : '#ef4444';

        html += `<div class="vs-sede-block">
            <div class="vs-sede-header">
                <span class="vs-sede-title"><i class="fas fa-map-marker-alt"></i> ${sede}</span>
                <span class="vs-ytd-badge" style="color:${ytdCol};background:${ytdCol}14;border:1px solid ${ytdCol}33">
                    Acum. ENE–${MESES[mi]}: ${ytdD>=0?'+':''}${ytdD} altas (${ytdPct>=0?'+':''}${ytdPct}%)
                </span>
            </div>
            <div class="versus-grid">`;

        profes.forEach(p => {
            const a26 = p.histAltas26[mi] || 0;
            const a25 = p.histAltas25[mi] || 0;
            const diff = a26 - a25;
            const pct  = a25 > 0 ? Math.round(diff/a25*100) : (a26 > 0 ? 100 : 0);
            const col  = diff >= 0 ? '#10b981' : '#ef4444';
            const mx   = Math.max(a25, a26, 1);
            const w26  = Math.round(a26/mx*100);
            const w25  = Math.round(a25/mx*100);

            // Profe acumulado YTD
            const acc26 = p.histAltas26.slice(0, mi+1).reduce((a,b)=>a+b,0);
            const acc25 = p.histAltas25.slice(0, mi+1).reduce((a,b)=>a+b,0);
            const accD  = acc26 - acc25;
            const accPct = acc25 > 0 ? Math.round(accD/acc25*100) : 0;
            const accCol = accD >= 0 ? '#10b981' : '#ef4444';

            // Context label (replacement info)
            const ctx = PROFE_CONTEXT[p.nombre];
            const ctxNote = ctx && ctx.reemplazaA ? `<span class="vs-ctx">reemplaza a ${ctx.reemplazaA}</span>` : '';

            html += `<div class="vs-card">
                <div class="vs-card-header">
                    <span class="vs-nombre">${p.nombre} ${ctxNote}</span>
                    <span class="vs-sede-tag">${sede.replace('El ','').replace('Lago ','L.')}</span>
                </div>
                <div class="vs-mes-label">${MESES[mi]} — Altas 2025 vs 2026</div>
                <div class="vs-bars">
                    <div class="vs-bar-row">
                        <div class="vs-bar-yr">2026</div>
                        <div class="vs-bar-track"><div class="vs-bar-fill" style="width:${w26}%;background:#10b981"></div></div>
                        <div class="vs-bar-num" style="color:#10b981">${a26}</div>
                    </div>
                    <div class="vs-bar-row">
                        <div class="vs-bar-yr">2025</div>
                        <div class="vs-bar-track"><div class="vs-bar-fill" style="width:${w25}%;background:#94a3b8"></div></div>
                        <div class="vs-bar-num">${a25}</div>
                    </div>
                </div>
                <div class="vs-diff-pill" style="color:${col};border-color:${col}44;background:${col}12">
                    ${diff>=0?'↑':'↓'} ${diff>=0?'+':''}${diff} altas (${pct>=0?'+':''}${pct}%) vs 2025
                </div>
                <div class="vs-acum">Acum. ENE–${MESES[mi]}: <strong style="color:${accCol}">${accD>=0?'+':''}${accD} (${accPct>=0?'+':''}${accPct}%)</strong> &nbsp;·&nbsp; 2026: <strong>${acc26}</strong> &nbsp;|&nbsp; 2025: ${acc25}</div>
            </div>`;
        });
        html += '</div></div>';
    });

    el.innerHTML = html;
}

// ══ BAJAS PRECOCES · socios nuevos que se van en el primer ciclo ══
let precozDatos={};
function precozDetalle(nombre, mes){
    const M=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    const p=Object.values(precozDatos).find(x=>x.nombre===nombre); if(!p) return;
    const d=p.meses[mes]; if(!d) return;
    const base=mes>=1?p.meses[mes-1].altas:0;
    const vals=Object.entries((p.meses[mes-1]||{}).vals||{}).sort((a,b)=>b[1]-a[1]);
    const chips=vals.map(([k,v])=>`<span style="display:inline-block;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:2px 8px;margin:2px 3px 0 0;font-size:.7rem;">${k} <b>${v}</b></span>`).join('');
    if(!d.lista.length){
        const el2=document.getElementById('precozDetalleBox');
        if(el2) el2.innerHTML=`<div style="margin-top:14px;background:var(--bg);border-radius:10px;padding:12px;">
            <b style="font-size:.84rem;">${nombre} · ${M[mes]}: ninguna de las ${base} altas de ${M[mes-1]} se dio de baja</b>
            <div style="font-size:.76rem;color:var(--muted);margin:8px 0 4px;">Valores cargados en ${M[mes-1]}:</div>
            <div>${chips||'<i>columna vacía</i>'}</div></div>`;
        return;
    }
    const el=document.getElementById('precozDetalleBox'); if(!el) return;
    const filas=d.lista.map(s=>`<tr style="border-bottom:1px solid var(--border);">
        <td style="padding:5px 8px;">${s.n}</td>
        <td style="padding:5px 8px;color:var(--muted);">${M[s.mesAlta]}</td>
        <td style="padding:5px 8px;color:var(--muted);">${s.recep}</td>
        <td style="padding:5px 8px;text-align:center;"><b style="color:#ef4444;">BAJA en ${M[mes]}</b></td></tr>`).join('');
    el.innerHTML=`<div style="margin-top:14px;background:var(--bg);border-radius:10px;padding:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <b style="font-size:.84rem;">${nombre} · bajas precoces de ${M[mes]} (${d.precoz} de las ${base} altas de ${M[mes-1]})</b>
            <button onclick="document.getElementById('precozDetalleBox').innerHTML=''" style="border:none;background:none;color:var(--muted);cursor:pointer;font-size:1rem;">&times;</button>
        </div>
        <div style="font-size:.7rem;color:var(--muted);margin-bottom:6px;">Valores cargados en ${M[mes-1]}: ${chips}</div>
        <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:.78rem;">
            <thead><tr style="border-bottom:1px solid var(--border);color:var(--muted);font-size:.7rem;text-transform:uppercase;">
            <th style="text-align:left;padding:4px 8px;">Socio</th><th style="text-align:left;padding:4px 8px;">Mes de alta</th>
            <th style="text-align:left;padding:4px 8px;">Cargado por</th><th style="padding:4px 8px;">Resultado</th></tr></thead>
            <tbody>${filas}</tbody></table></div></div>`;
    el.scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function precozAnalisis(btn){
    const box=document.getElementById('precozBox');
    btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Leyendo planillas…';
    const ids=Object.keys(AE_SHEETS||{});
    const maxMes=estadoMi;
    const M=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    const datos={};   // profe -> {sede, meses:[{altas, precoz, evaluable}]}

    await Promise.all(ids.map(async id=>{
        try{
            const plan=await aeExportCSV(AE_SHEETS[id]);
            const sede=AE_SEDE[id];
            const RECEP=(typeof AE_RECEP_SEDE!=='undefined' && AE_RECEP_SEDE[sede]) || AE_RECEP;
            // Recepcionistas de OTRAS sedes: no cuentan (aparecen sueltos en algunas planillas)
            const OTRAS=new Set([...(typeof AE_RECEP!=='undefined'?AE_RECEP:[])].filter(x=>!RECEP.has(x)));
            // Estados que NO son un alta por recepción
            const ESTADOS=['RENUEVA','BAJA','NUEVO','LIBERADO','VACACIONES','DERIV','LIBRE','PAUSA','CONGEL'];
            // Es alta por recepción si es un recepcionista conocido de la sede,
            // o cualquier otro nombre cargado que no sea un estado (cubre recepcionistas nuevos: RAYU, etc.)
            const esRecep=v=>{
                if(!v) return false;
                if(RECEP.has(v)) return true;
                if(OTRAS.has(v)) return false;
                if(ESTADOS.some(e=>v.startsWith(e))) return false;
                if(/^[\d\s.,%$/-]+$/.test(v)) return false;   // números o fechas sueltas
                return true;
            };
            const reg={sede, nombre:AE_NOMBRE[id]||id, meses:Array.from({length:12},()=>({altas:0,precoz:0,lista:[],vals:{}}))};
            for(let i=6;i<plan.length;i++){
                const r=plan[i]; if(!r) continue;
                if(!/^\d/.test((r[2]||'').trim())) continue;
                if(!(r[4]||'').trim()) continue;
                const est=AE_MES_COLS.map(c=>(r[c]||'').trim().toUpperCase());
                // Regla: CUALQUIER mes con recepcionista cuenta como alta de ese mes.
                // Si el mes siguiente dice BAJA, es baja precoz.
                for(let alta=0; alta<=maxMes && alta<est.length; alta++){
                    if(est[alta]) reg.meses[alta].vals[est[alta]]=(reg.meses[alta].vals[est[alta]]||0)+1;
                    if(!esRecep(est[alta])) continue;
                    reg.meses[alta].altas++;                       // alta del mes en que la cargó recepción
                    if(alta+1>maxMes || alta+1>=est.length) continue;
                    if(est[alta+1]!=='BAJA') continue;
                    // La baja se atribuye al MES EN QUE OCURRIÓ (alta+1)
                    reg.meses[alta+1].precoz++;
                    reg.meses[alta+1].lista.push({n:(r[4]||'').trim(), recep:est[alta], mesAlta:alta});
                }
            }
            datos[id]=reg;
        }catch(e){}
    }));

    precozDatos=datos;
    const profes=Object.values(datos).filter(p=>p.meses.some(m=>m.altas>0));
    if(!profes.length){ box.innerHTML='<div style="font-size:.85rem;color:var(--muted)">No hay altas cargadas para analizar todavía.</div>'; return; }

    const evaluable=m=>m>=1 && m<=maxMes;           // hace falta el mes anterior (las altas) y este (las bajas)
    const col=p=>p==null?'#e2e8f0':p<15?'#10b981':p<30?'#f59e0b':'#ef4444';
    const txtCol=p=>p==null?'#94a3b8':'#fff';

    // Tabla heatmap
    let head='<th style="text-align:left;">Profesional</th>';
    for(let m=0;m<=maxMes;m++) head+=`<th style="text-align:center;font-size:.7rem;">${M[m]}</th>`;
    head+='<th style="text-align:center;">Total</th>';
    let filas='';
    const totMes=Array.from({length:12},()=>({altas:0,precoz:0}));
    profes.forEach(p=>{
        let ta=0,tp=0;
        let celdas='';
        for(let m=0;m<=maxMes;m++){
            const d=p.meses[m];
            const base=m>=1?p.meses[m-1].altas:0;      // altas del mes anterior
            if(!evaluable(m) || !base){ celdas+='<td style="text-align:center;color:#cbd5e1;">—</td>'; continue; }
            const pct=Math.round(d.precoz/base*100);
            ta+=base; tp+=d.precoz;
            totMes[m].altas+=base; totMes[m].precoz+=d.precoz;
            celdas+=`<td style="text-align:center;padding:3px;"><span onclick="precozDetalle('${p.nombre}',${m})" title="${d.precoz} bajas de las ${base} altas del mes anterior · tocá para ver el detalle" style="cursor:pointer;display:inline-block;min-width:42px;background:${col(pct)};color:${txtCol(pct)};font-weight:700;font-size:.72rem;border-radius:6px;padding:3px 6px;">${pct}%</span></td>`;
        }
        const tot=ta?Math.round(tp/ta*100):null;
        p._tot=tot; p._ta=ta; p._tp=tp;
        filas+=`<tr><td style="font-weight:700;">${p.nombre} <span style="color:var(--muted);font-size:.68rem;">${p.sede}</span></td>${celdas}
            <td style="text-align:center;"><b style="color:${col(tot)==='#e2e8f0'?'var(--muted)':col(tot)};">${tot==null?'—':tot+'%'}</b>
            <div style="font-size:.62rem;color:var(--muted);">${tp}/${ta}</div></td></tr>`;
    });
    let filaTot='<td style="font-weight:800;">TOTAL MOVE</td>';
    let gA=0,gP=0;
    for(let m=0;m<=maxMes;m++){
        const d=totMes[m];
        if(!evaluable(m)||!d.altas){ filaTot+='<td style="text-align:center;color:#cbd5e1;">—</td>'; continue; }
        const pct=Math.round(d.precoz/d.altas*100); gA+=d.altas; gP+=d.precoz;
        filaTot+=`<td style="text-align:center;"><b style="color:${col(pct)};">${pct}%</b></td>`;
    }
    const gTot=gA?Math.round(gP/gA*100):0;
    filaTot+=`<td style="text-align:center;"><b style="color:${col(gTot)};">${gTot}%</b><div style="font-size:.62rem;color:var(--muted);">${gP}/${gA}</div></td>`;

    // Conclusiones
    const conDato=profes.filter(p=>p._tot!=null && p._ta>=5).sort((a,b)=>b._tot-a._tot);
    const peorProfe=conDato[0], mejorProfe=conDato[conDato.length-1];
    let peorMes=null;
    for(let m=0;m<=maxMes;m++){
        if(!evaluable(m)||!totMes[m].altas) continue;
        const pct=totMes[m].precoz/totMes[m].altas*100;
        if(!peorMes||pct>peorMes.pct) peorMes={m,pct,d:totMes[m]};
    }
    let conc=`De <b>${gA} altas</b> evaluables, <b style="color:${col(gTot)}">${gP} se dieron de baja al mes siguiente (${gTot}%)</b>. `;
    if(gTot>=30) conc+='<b>Es alto:</b> uno de cada tres socios nuevos no llega al segundo mes. El problema está en la primera experiencia, no en la captación.';
    else if(gTot>=15) conc+='Está en una zona intermedia: hay margen claro de mejora en el onboarding.';
    else conc+='Es un buen número: los socios que entran se quedan.';
    if(peorMes) conc+=` El mes con más fuga temprana fue <b>${M[peorMes.m]}</b> (${Math.round(peorMes.pct)}%).`;
    if(peorProfe&&mejorProfe&&peorProfe!==mejorProfe) conc+=` Entre profesionales, <b style="color:#ef4444">${peorProfe.nombre}</b> concentra la mayor fuga precoz (${peorProfe._tot}%) y <b style="color:#10b981">${mejorProfe.nombre}</b> la menor (${mejorProfe._tot}%): vale mirar qué hace distinto en el primer mes.`;

    box.innerHTML=`
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
            <div style="flex:1;min-width:130px;background:var(--bg);border-radius:10px;padding:10px 14px;">
                <div style="font-size:.62rem;color:var(--muted);font-weight:700;text-transform:uppercase;">Altas evaluadas</div>
                <div style="font-size:1.5rem;font-weight:800;font-family:monospace;">${gA}</div></div>
            <div style="flex:1;min-width:130px;background:var(--bg);border-radius:10px;padding:10px 14px;">
                <div style="font-size:.62rem;color:var(--muted);font-weight:700;text-transform:uppercase;">Bajas precoces</div>
                <div style="font-size:1.5rem;font-weight:800;font-family:monospace;color:${col(gTot)};">${gP}</div></div>
            <div style="flex:1;min-width:130px;background:var(--bg);border-radius:10px;padding:10px 14px;">
                <div style="font-size:.62rem;color:var(--muted);font-weight:700;text-transform:uppercase;">% que no llega al mes 2</div>
                <div style="font-size:1.5rem;font-weight:800;font-family:monospace;color:${col(gTot)};">${gTot}%</div></div>
        </div>
        <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:.8rem;">
            <thead><tr style="border-bottom:1px solid var(--border);">${head}</tr></thead>
            <tbody>${filas}<tr style="border-top:2px solid var(--border);background:var(--bg);">${filaTot}</tr></tbody>
        </table></div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:10px;font-size:.68rem;color:var(--muted);">
            <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#10b981;"></span> &lt;15% bueno</span>
            <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#f59e0b;"></span> 15-30% a mejorar</span>
            <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#ef4444;"></span> &gt;30% crítico</span>
            <span>— = mes sin evaluar todavía</span>
        </div>
        <div style="margin-top:12px;font-size:.84rem;line-height:1.5;">${conc}</div>
        <div style="font-size:.7rem;color:var(--muted);margin-top:8px;"><i class="fas fa-hand-pointer"></i> Tocá cualquier celda para ver socio por socio qué se leyó de la planilla.</div>
        <div id="precozDetalleBox"></div>`;
}
