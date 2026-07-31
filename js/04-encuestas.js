// ══════════════════════════════════════════════════
// RENDER ENCUESTAS
// ══════════════════════════════════════════════════

// Convert categorical text (encuesta) → numeric 0-10
function textToScore(text) {
    if (!text) return null;
    const n = parseFloat(text);
    if (!isNaN(n)) {
        // Emoji-prefixed 1-5 options ("5️⃣ Excelente") → scale to 0-10
        if (Number.isInteger(n) && n >= 1 && n <= 5) return n * 2;
        return Math.min(10, Math.max(0, n));
    }
    const t = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
    if (/completamente|excelente|totalmente|muy alta|perfect|excellent|very high/.test(t)) return 10;
    if (/bastante|muy buen|muy bien|alta\b|good|high|bien/.test(t)) return 8;
    if (/algo|regular|moderada|neutral|media\b|normal|medium|fairly|suficiente/.test(t)) return 6;
    if (/poco|baja\b|malo|mala|insuficiente|low|poor|little/.test(t)) return 4;
    if (/nada|muy mal|muy baja|terrible|very low|very bad/.test(t)) return 2;
    return null;
}

// Horizontal bar chart for 0-10 scores (tooltip shows value not count)
function hbarScore(id, labels, data, colors) {
    if (CH[id]) CH[id].destroy();
    CH[id] = new Chart(document.getElementById(id), {
        type: 'bar',
        data: { labels, datasets: [{ data, backgroundColor: colors, borderRadius: 6, borderSkipped: false }] },
        options: {
            indexAxis: 'y', responsive: true,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw.toFixed(1)} / 10` } } },
            scales: {
                x: { min: 0, max: 10, grid: { color: '#f1f5f9' }, ticks: { stepSize: 2 } },
                y: { grid: { display: false }, ticks: { font: { size: 12 }, color: '#374151' } }
            }
        }
    });
}

// Classification of churn reasons
function classifyMotivo(m) {
    if(!m) return 'external';
    const l=m.toLowerCase();
    const internal=['equipamiento','calidad','servicio','atenci\u00f3n','atencion','profesional','no cumpl\u00f3','no cumplio','expectativa','no me gust\u00f3','no me gusto','mejorar','valor','precio','profe','cambio de profe','cambio de profesor'];
    return internal.some(k=>l.includes(k))?'internal':'external';
}
// Fuzzy-find a column containing keyword (case-insensitive)
function getCol(row, keyword) {
    const k = Object.keys(row).find(k => k.toLowerCase().includes(keyword.toLowerCase()));
    return k ? (row[k] || '') : '';
}

// Parse gviz Date object \u2192 "14 Abr 2026"
function fmtDate(v) {
    if (!v) return '';
    const d = (v instanceof Date) ? v : new Date(v);
    if (isNaN(d)) return '';
    const MS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${d.getDate()} ${MS[d.getMonth()]} ${d.getFullYear()}`;
}

// Renderiza una tarjeta de comentario
function renderQuoteCard(text, prof, type, date) {
    if(!text||text.trim()==='') return '';
    const initial = prof ? prof.trim()[0].toUpperCase() : '?';
    const shortProf = prof ? prof.split(' ').slice(0,2).join(' ') : 'An\u00f3nimo';
    const dateLbl = date ? `<span class="quote-date">${date}</span>` : '';
    return `<div class="quote-card ${type||''}">
        <div class="quote-text">"${text}"</div>
        <div class="quote-prof">
            <div class="quote-avatar">${initial}</div>
            <span class="quote-name">${shortProf}</span>
            ${dateLbl}
        </div>
    </div>`;
}

// Anillo circular — número en el centro, sin superposiciones
function svgGauge(containerId, value, min, max, color, badge, unit) {
    if(unit===undefined) unit='';
    const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const R = 70, SW = 14, S = 180, cx = 90, cy = 90;
    const circ = 2 * Math.PI * R;
    const dash = pct * circ;
    const gap  = circ - dash;
    // Rotación: empezar desde arriba (−90°)
    const rot = -90;
    document.getElementById(containerId).innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:12px 0;">
      <svg viewBox="0 0 ${S} ${S}" style="width:160px;height:160px;display:block;">
        <!-- Track -->
        <circle cx="${cx}" cy="${cy}" r="${R}"
          fill="none" stroke="#edf0f5" stroke-width="${SW}"/>
        <!-- Progreso -->
        <circle cx="${cx}" cy="${cy}" r="${R}"
          fill="none" stroke="${color}" stroke-width="${SW}"
          stroke-linecap="round"
          stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}"
          transform="rotate(${rot} ${cx} ${cy})"/>
        <!-- Valor -->
        <text x="${cx}" y="${cy - 8}" text-anchor="middle"
          font-size="28" font-weight="800" fill="#0f172a"
          font-family="Inter,system-ui,sans-serif">${value}${unit}</text>
        <!-- Badge -->
        <text x="${cx}" y="${cy + 16}" text-anchor="middle"
          font-size="9" font-weight="700" fill="${color}" letter-spacing="0.8"
          font-family="Inter,system-ui,sans-serif">${badge.toUpperCase()}</text>
      </svg>
    </div>`;
}

// Interpretation helpers
function npsInfo(v){
    const base=[{r:'+50',l:'Excelente'},{r:'30 a 50',l:'Muy bueno'},{r:'10 a 30',l:'Aceptable'},{r:'< 10',l:'Bajo'}];
    if(v>=50)return{color:'#10b981',badge:'Excelente',idx:0,ranges:base,obs:`\uD83D\uDD25 ${v} \u2192 EXCELENTE NIVEL DE RECOMENDACI\u00d3N. MOVE genera v\u00ednculo emocional fuerte y promotores activos. \u26A0\uFE0F No confundas NPS alto con baja deserci\u00f3n: pueden recomendar y aun as\u00ed irse por contexto externo.`};
    if(v>=30)return{color:'#3b82f6',badge:'Muy bueno',idx:1,ranges:base,obs:`\uD83D\uDC4D ${v} \u2192 MUY BUEN NPS. MOVE supera la media del sector fitness. Continuar construyendo sobre los puntos fuertes actuales.`};
    if(v>=10)return{color:'#f59e0b',badge:'Aceptable',idx:2,ranges:base,obs:`\u26A0\uFE0F ${v} \u2192 NPS ACEPTABLE. Hay margen de mejora. Identificar los pain points espec\u00edficos de la experiencia.`};
    return{color:'#ef4444',badge:'Bajo',idx:3,ranges:base,obs:`\uD83D\uDEA8 ${v} \u2192 NPS BAJO. Acci\u00f3n inmediata necesaria en experiencia del cliente.`};
}
function desercInfo(v){
    const base=[{r:'> 50%',l:'El problema es interno (mejorable)'},{r:'30\u201350%',l:'Mixto'},{r:'< 30%',l:'Mayor\u00eda contexto externo'}];
    if(v>=50)return{color:'#ef4444',badge:'Problema interno',idx:0,ranges:base,obs:`\uD83D\uDD34 ${v}% \u2192 ALTA RESPONSABILIDAD INTERNA. El foco debe estar en mejora del servicio y operaciones internas.`};
    if(v>=30)return{color:'#f59e0b',badge:'Mixto',idx:1,ranges:base,obs:`\uD83D\uDFE1 ${v}% \u2192 DESERCI\u00d3N MIXTA. Hay factores internos que atender junto con el contexto externo.`};
    return{color:'#10b981',badge:'Contexto externo',idx:2,ranges:base,obs:`\uD83C\uDF0E ${v}% \u2192 BAJA RESPONSABILIDAD INTERNA. La mayor\u00eda responde a contexto externo. El foco debe estar en captaci\u00f3n y adaptaci\u00f3n estrat\u00e9gica.`};
}
function servicioInfo(v){
    const base=[{r:'90\u2013100%',l:'Servicio premium consolidado'},{r:'80\u201390%',l:'Muy buen servicio'},{r:'70\u201380%',l:'Aceptable pero mejorable'},{r:'< 70%',l:'Problema estructural'}];
    if(v>=90)return{color:'#10b981',badge:'Premium consolidado',idx:0,ranges:base,obs:`\uD83C\uDFC6 ${v}% \u2192 SERVICIO PREMIUM CONSOLIDADO. La ejecuci\u00f3n del modelo MOVE es consistente y alineada con la propuesta de valor. \u26A0\uFE0F No confundir con marketing: esto mide cumplimiento operativo real del sistema.`};
    if(v>=80)return{color:'#3b82f6',badge:'Muy buen servicio',idx:1,ranges:base,obs:`\uD83D\uDCAA ${v}% \u2192 MUY BUEN SERVICIO. Alto nivel de ejecuci\u00f3n. Identificar el 10-20% de mejora disponible.`};
    if(v>=70)return{color:'#f59e0b',badge:'Aceptable',idx:2,ranges:base,obs:`\u26A0\uFE0F ${v}% \u2192 SERVICIO ACEPTABLE. Existen oportunidades claras de mejora en la entrega del servicio.`};
    return{color:'#ef4444',badge:'Problema estructural',idx:3,ranges:base,obs:`\uD83D\uDEA8 ${v}% \u2192 PROBLEMA ESTRUCTURAL. Revisi\u00f3n profunda del modelo de entrega necesaria.`};
}
function makeInterpCard(info){
    const rows=info.ranges.map((r,i)=>`<div class="ir ${i===info.idx?'ir-active':''}"><span class="irv">${r.r}</span><span class="irl">${r.l}</span></div>`).join('');
    return `<div class="iblock"><div class="ihead">\uD83C\uDFAF C\u00f3mo interpretar el resultado</div>${rows}</div><div class="obsblock" style="border-color:${info.color}">${info.obs}</div>`;
}

// ── BARILOCHE ENCUESTAS ──────────────────────────────────────
const SHEET_BARI_ENC_ID = '12lT64vo5ejA5fpLiUUHWsJccQN6fVkQF_lhHfeLuiCc';
const SHEET_BARI_BIENV_GID = '1297311567';
const SHEET_BARI_BAJAS_GID = '712013144';
let bwData=[], bbData=[];

function setBolsonTab(tab){
    ['Bienv','Bajas'].forEach(t=>{
        const panel=document.getElementById('bolsonPanel'+t); if(panel)panel.style.display=t===tab?'':'none';
        const btn=document.getElementById('bolsonTabBtn'+t); if(btn)btn.classList.toggle('active',t===tab);
    });
}

function setBariTab(tab){
    ['Bienv','Bajas'].forEach(t=>{
        const panel=document.getElementById('bariPanel'+t); if(panel)panel.style.display=t.toLowerCase()===tab?'':'none';
        const btn=document.getElementById('bariTabBtn'+t); if(btn)btn.classList.toggle('active',t.toLowerCase()===tab);
    });
}

function loadEncuestasBari(){
    const alert=document.getElementById('bariEncAlert');
    Promise.all([
        sheetLoad(SHEET_BARI_ENC_ID, SHEET_BARI_BIENV_GID, 'bari-bienv'),
        sheetLoad(SHEET_BARI_ENC_ID, SHEET_BARI_BAJAS_GID, 'bari-bajas')
    ]).then(([w,c])=>{
        bwData=w||[]; bbData=c||[];
        if(!bwData.length && !bbData.length){
            if(alert){ alert.style.display='';
                alert.innerHTML='<i class="fas fa-lock"></i> <span>La planilla de Bariloche está privada. Para ver los datos, hacé público el archivo en Google Sheets (Compartir → Cualquiera con el enlace puede ver). ID: <code>12lT64vo5ejA5fpLiUUHWsJccQN6fVkQF_lhHfeLuiCc</code></span>'; }
        } else {
            if(alert) alert.style.display='none';
            renderEncBariHero(bwData,'bw');
            renderEncBariCharts(bwData,'bw','Bw');
            renderEncBariBajas(bbData);
        }
    });
}

// Find NPS value in a row — keyword first, then positional fallback (last 4 numeric cols)
// NPS leído SOLO por nombre de columna (sin adivinar por posición).
// Se usa en encuestas de baja: si la planilla no tiene la pregunta, devuelve NaN y queda "—".
function getNPSValStrict(r){
    for(const k of ['probable','recomiendes','recomendar','recomendaria','recomendarías','recomiend','nps']){
        const raw = getCol(r,k);
        if(raw==='' || raw==null) continue;
        const n = parseFloat(String(raw).replace(',','.'));
        if(!isNaN(n) && n>=0 && n<=10) return n;
    }
    return NaN;
}
function getNPSVal(r){
    const byKey=parseFloat(getCol(r,'probable')||getCol(r,'recomiendes')||getCol(r,'recomendar'));
    if(!isNaN(byKey))return byKey;
    const vals=Object.values(r);
    for(let i=vals.length-1;i>=Math.max(0,vals.length-5);i--){
        const n=parseFloat(vals[i]);
        if(!isNaN(n)&&n>=0&&n<=10)return n;
    }
    return NaN;
}

// Reusable: render NPS hero for any dataset + prefix
function renderEncBariHero(W, px){
    const recs=W.map(r=>getNPSVal(r)).filter(n=>!isNaN(n));
    const nps=calcNPS(recs);
    const prom=recs.filter(n=>n>=9).length, pas=recs.filter(n=>n>=7&&n<=8).length, det=recs.filter(n=>n<=6).length;
    const T=recs.length||1;
    const pp=Math.round(prom/T*100), np=Math.round(pas/T*100), dp=Math.max(0,100-pp-np);
    let sS=0,cS=0,sE=0,cE=0;
    W.forEach(r=>{
        const e=parseFloat(getCol(r,'calific')); if(!isNaN(e)){sE+=e;cE++;}
        const a=parseFloat(getCol(r,'acompa')), cl=parseFloat(getCol(r,'plan')), ev=parseFloat(getCol(r,'escuchado')||getCol(r,'entrevista'));
        if(!isNaN(a)&&!isNaN(cl)&&!isNaN(ev)){sS+=((a+cl+ev)/3)*20;cS++;}
        else if(!isNaN(a)&&!isNaN(cl)){sS+=((a+cl)/2)*20;cS++;}
        else if(!isNaN(a)){sS+=a*20;cS++;}
    });
    const nbCls=nps>=50?'green':nps>=30?'blue':nps>=10?'amber':'red';
    const nbLbl=nps>=50?'🔥 Excelente':nps>=30?'👍 Muy bueno':nps>=10?'⚠️ Aceptable':'🚨 Bajo';
    set(px+'-nps',nps); set(px+'-total',W.length);
    set(px+'-serv', cS>0?Math.round(sS/cS):'--');
    set(px+'-exp',  cE>0?(sE/cE).toFixed(1):'--');
    set(px+'-nps-lbl', nbLbl);
    const badge=document.getElementById(px+'-nps-badge');
    if(badge){badge.className='enc-hero-badge '+nbCls;badge.textContent=nbLbl;}
    const ids={Promo:pp,Pasi:np,Detr:dp};
    Object.entries(ids).forEach(([k,v])=>{
        const el=document.getElementById(px+'Brk'+k);
        if(el)el.style.width=v+'%';
    });
    set(px+'-promo-pct',pp+'%'); set(px+'-promo-n',prom+' resp.');
    set(px+'-pasi-pct', np+'%'); set(px+'-pasi-n', pas+' resp.');
    set(px+'-detr-pct', dp+'%'); set(px+'-detr-n', det+' resp.');
}

function renderEncBariCharts(W, px, chartPfx){
    const byProf={}, expByProf={};
    W.forEach(r=>{
        const p=getCol(r,'profesor')||getCol(r,'profesional')||getCol(r,'profe');
        const rc=getNPSVal(r);
        const ex=parseFloat(getCol(r,'calific'));
        if(p&&!isNaN(rc)){byProf[p]=byProf[p]||[];byProf[p].push(rc);}
        if(p&&!isNaN(ex)){expByProf[p]=expByProf[p]||[];expByProf[p].push(ex);}
    });
    const profs=Object.keys(byProf);
    const npsV=profs.map(p=>calcNPS(byProf[p]));
    barNPSProfe('ch'+chartPfx+'NpsProf', profs.map(p=>p.split(' ')[0]), npsV, npsV.map(v=>v>=50?'#10b981cc':v>=30?'#3b82f6cc':v>=0?'#f59e0bcc':'#ef4444cc'));
    // Horario
    const horMap={};
    W.forEach(r=>{
        const h=(getCol(r,'horario')||'').trim(), e=parseFloat(getCol(r,'calific'));
        if(h&&!isNaN(e)){if(!horMap[h])horMap[h]=[];horMap[h].push(e);}
    });
    const hL=Object.keys(horMap), hV=hL.map(k=>+(horMap[k].reduce((a,b)=>a+b)/horMap[k].length).toFixed(2));
    if(hL.length>=3) radar('ch'+chartPfx+'Horario',hL,hV);
    else if(hL.length>0) bar('ch'+chartPfx+'Horario',hL,[{l:'Exp.',d:hV,c:'#6366f1'}]);
    else {const el=document.getElementById('ch'+chartPfx+'Horario'); if(el)el.style.display='none';}
    // 5-dim radar
    const dims=[
        {label:'Entrevista inicial', vals:W.map(r=>textToScore(getCol(r,'escuchado')||getCol(r,'entrevista'))).filter(v=>v!==null)},
        {label:'Claridad del plan',  vals:W.map(r=>textToScore(getCol(r,'plan'))).filter(v=>v!==null)},
        {label:'Acompañamiento',     vals:W.map(r=>textToScore(getCol(r,'acompa'))).filter(v=>v!==null)},
        {label:'Experiencia general',vals:W.map(r=>{const v=parseFloat(getCol(r,'calific'));return isNaN(v)?null:v;}).filter(v=>v!==null)},
        {label:'Confianza en proceso',vals:W.map(r=>textToScore(getCol(r,'confianza'))).filter(v=>v!==null)},
    ];
    const avgs=dims.map(d=>d.vals.length?+(d.vals.reduce((a,b)=>a+b)/d.vals.length).toFixed(2):0);
    if(avgs.some(v=>v>0)) radar('ch'+chartPfx+'Dims', dims.map(d=>d.label), avgs);
    // Table
    let tb='';
    profs.forEach((p,i)=>{
        const nv=npsV[i], ea=expByProf[p]||[];
        const ep=ea.length?(ea.reduce((a,b)=>a+b)/ea.length).toFixed(1):'--';
        const cls=nv>=50?'bg':nv>=30?'bb':nv>=10?'by':'br';
        tb+=`<tr><td><b>${p.split(' ')[0]}</b></td><td><span class="badge ${cls}">${nv}</span></td><td>${ep}/10</td><td>${nv>=50?'🏆 Excelente':nv>=30?'👍 Bueno':'⚠️ Mejorable'}</td></tr>`;
    });
    document.getElementById(chartPfx.toLowerCase()+'TabBody').innerHTML=tb||'<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:20px">Sin datos</td></tr>';
    // Sugerencias
    const sug=W.map(r=>{
        const txt=(getCol(r,'mejorar una')||getCol(r,'mejorar')||'').trim();
        const prof=(getCol(r,'profesor')||getCol(r,'profesional')||'').trim();
        const date=fmtDate(getCol(r,'temporal'));
        return txt?renderQuoteCard(txt,prof,'neg',date):'';
    }).filter(Boolean).join('');
    const sugEl=document.getElementById(chartPfx.toLowerCase()+'Sugerencias');
    if(sugEl) sugEl.innerHTML=sug||'<div class="quote-empty">Sin sugerencias registradas</div>';
}

function renderEncBariBajas(C){
    if(!C.length) return;
    const recsC=C.map(r=>parseFloat(getCol(r,'recomendar')||getCol(r,'recomendari'))).filter(n=>!isNaN(n));
    const npsC=calcNPS(recsC);
    const nProm=recsC.filter(n=>n>=9).length, totalNps=recsC.length||1;
    set('bb-total',C.length); set('bb-nps',npsC);
    set('bb-nps-lbl', npsC>=50?'🔥 Excelente':npsC>=30?'👍 Bueno':'⚠️ Regular');
    set('bb-prom', Math.round(nProm/totalNps*100)+'%');
    const recsExp=C.map(r=>parseFloat(getCol(r,'calific'))).filter(n=>!isNaN(n));
    set('bb-exp', recsExp.length?(recsExp.reduce((a,b)=>a+b)/recsExp.length).toFixed(1):'--');
    // NPS dist
    const nPas=recsC.filter(n=>n>=7&&n<=8).length, nDet=recsC.filter(n=>n<=6).length;
    const pPct=Math.round(nProm/totalNps*100), nPct=Math.round(nPas/totalNps*100), dPct=Math.max(0,100-pPct-nPct);
    if(document.getElementById('chBbNpsDist')) npsDistBar('chBbNpsDist',pPct,nPct,dPct);
    const detailEl=document.getElementById('bbNpsDistDetail');
    if(detailEl) detailEl.innerHTML=
        `<div class="nps-seg"><div class="nps-seg-dot" style="background:#10b981"></div><div class="nps-seg-label">Promotores (9–10)</div><div class="nps-seg-pct">${pPct}%</div><span class="nps-seg-n">${nProm}</span></div>`+
        `<div class="nps-seg"><div class="nps-seg-dot" style="background:#f59e0b"></div><div class="nps-seg-label">Pasivos (7–8)</div><div class="nps-seg-pct">${nPct}%</div><span class="nps-seg-n">${nPas}</span></div>`+
        `<div class="nps-seg"><div class="nps-seg-dot" style="background:#ef4444"></div><div class="nps-seg-label">Detractores (0–6)</div><div class="nps-seg-pct">${dPct}%</div><span class="nps-seg-n">${nDet}</span></div>`;
    // Motivos
    const motKey=Object.keys(C[0]||{}).find(k=>k.toLowerCase().includes('motivo'))||'';
    if(motKey){
        const motCount={};
        C.forEach(r=>{const m=r[motKey];if(m){motCount[m]=(motCount[m]||0)+1;}});
        const sorted=Object.entries(motCount).sort((a,b)=>b[1]-a[1]).slice(0,8);
        if(sorted.length) hbar('chBbMotivos',sorted.map(([m])=>m.length>35?m.slice(0,35)+'…':m),sorted.map(([,n])=>n),sorted.map((_,i)=>['#6366f1cc','#8b5cf6cc','#3b82f6cc','#10b981cc','#f59e0bcc','#ef4444cc'][i%6]));
    }
    // 5-dim servicio
    const sdDef=[{label:'Atención y trato',key:'atenci'},{label:'Profesionalismo',key:'profesionalismo'},{label:'Acompañamiento',key:'acompa'},{label:'Organización',key:'organiz'},{label:'Ambiente',key:'ambiente'}];
    const sdVals=sdDef.map(d=>{const vs=C.map(r=>parseFloat(getCol(r,d.key))).filter(n=>!isNaN(n));return vs.length?+(vs.reduce((a,b)=>a+b)/vs.length).toFixed(2):0;});
    const sdCols=['#10b981cc','#6366f1cc','#3b82f6cc','#f59e0bcc','#8b5cf6cc'];
    if(sdVals.some(v=>v>0)) hbarScore('chBbServDims',sdDef.map(d=>d.label),sdVals,sdCols);
    // Quotes
    const bienEl=document.getElementById('bbBien');
    if(bienEl){
        const bc=C.map(r=>{const t=(getCol(r,'hace muy bien')||getCol(r,'hace bien')||getCol(r,'muy bien')||'').trim();const p=(getCol(r,'profesor')||'').trim();const d=fmtDate(getCol(r,'temporal'));return t?renderQuoteCard(t,p,'pos',d):'';}).filter(Boolean).join('');
        bienEl.innerHTML=bc||'<div class="quote-empty">Sin respuestas</div>';
    }
    const mejEl=document.getElementById('bbMejorar');
    if(mejEl){
        const mc=C.map(r=>{const t=(getCol(r,'mejorar para')||getCol(r,'debería mejorar')||getCol(r,'mejorar')||'').trim();const p=(getCol(r,'profesor')||'').trim();const d=fmtDate(getCol(r,'temporal'));return t?renderQuoteCard(t,p,'neg',d):'';}).filter(Boolean).join('');
        mejEl.innerHTML=mc||'<div class="quote-empty">Sin respuestas</div>';
    }
}
// ── END BARILOCHE ───────────────────────────────────────────

function renderEnc(){
    const W=wData,C=cData;

    // === BIENVENIDA — usa getCol() para tolerar variaciones en nombres de columna ===
    // NPS: busca columna con "probable" o "recomiendes" o "recomendar"
    const recs = W.map(r => parseFloat(
        getCol(r,'probable') || getCol(r,'recomiendes') || getCol(r,'recomendar')
    )).filter(n=>!isNaN(n));
    const nps = calcNPS(recs);
    const lbl = nps>=50?'\uD83D\uDD25 Excelente':nps>=30?'\uD83D\uDC4D Bueno':'\u26A0\uFE0F Regular';
    set('e-total',W.length); set('e-nps',nps); set('e-nps-lbl',lbl);
    set('k-nps',nps); set('k-nps-sub',lbl);

    // Índice Servicio: acompañamiento + plan + entrevista
    let sS=0,cS=0,sE=0,cE=0;
    W.forEach(r=>{
        const e  = parseFloat(getCol(r,'calific'));   // col H: "¿Cómo calificarías tu experiencia general?"
        if(!isNaN(e)){sE+=e;cE++;}
        const a  = parseFloat(getCol(r,'acompa'));          // acompañamiento
        const cl = parseFloat(getCol(r,'plan'));             // claridad del plan
        const ev = parseFloat(getCol(r,'escuchado') || getCol(r,'entrevista')); // entrevista inicial
        if(!isNaN(a)&&!isNaN(cl)&&!isNaN(ev)){sS+=((a+cl+ev)/3)*20;cS++;}
        else if(!isNaN(a)&&!isNaN(cl)){sS+=((a+cl)/2)*20;cS++;}
        else if(!isNaN(a)){sS+=a*20;cS++;}
    });
    set('e-serv', cS>0 ? Math.round(sS/cS) : '--');
    set('e-exp',  cE>0 ? (sE/cE).toFixed(1) : '--');

    // NPS Hero — breakdown bar + segments
    const wProm=recs.filter(n=>n>=9).length, wPas=recs.filter(n=>n>=7&&n<=8).length, wDet=recs.filter(n=>n<=6).length;
    const wT=recs.length||1;
    const wPP=Math.round(wProm/wT*100), wNP=Math.round(wPas/wT*100), wDP=Math.max(0,100-wPP-wNP);
    const nbCls = nps>=50?'green':nps>=30?'blue':nps>=10?'amber':'red';
    const nbLbl = nps>=50?'🔥 Excelente':nps>=30?'👍 Muy bueno':nps>=10?'⚠️ Aceptable':'🚨 Bajo';
    const badgeEl=document.getElementById('e-nps-badge');
    if(badgeEl){badgeEl.className='enc-hero-badge '+nbCls;badgeEl.textContent=nbLbl;}
    const setW=id=>{ const el=document.getElementById(id); if(el) el.style.width=id.includes('Promo')?wPP+'%':id.includes('Pasi')?wNP+'%':wDP+'%'; };
    ['encBrkPromo','encBrkPasi','encBrkDetr'].forEach(setW);
    set('e-promo-pct',wPP+'%'); set('e-promo-n',wProm+' resp.');
    set('e-pasi-pct', wNP+'%'); set('e-pasi-n', wPas+' resp.');
    set('e-detr-pct', wDP+'%'); set('e-detr-n', wDet+' resp.');
    set('e-nps-lbl', nbLbl);

    // NPS por profesor (bienvenida)
    const byProf={},expByProf={};
    W.forEach(r=>{
        const p  = getCol(r,'profesor') || getCol(r,'profesional') || getCol(r,'profe');
        const rc = parseFloat(getCol(r,'probable') || getCol(r,'recomiendes') || getCol(r,'recomendar'));
        const ex = parseFloat(getCol(r,'calific'));
        if(p&&!isNaN(rc)){byProf[p]=byProf[p]||[];byProf[p].push(rc);}
        if(p&&!isNaN(ex)){expByProf[p]=expByProf[p]||[];expByProf[p].push(ex);}
    });
    const profs=Object.keys(byProf);
    const npsV=profs.map(p=>calcNPS(byProf[p]));
    barNPSProfe('chNpsProf',profs.map(p=>p.split(' ')[0]),npsV,npsV.map(v=>v>=50?'#10b981cc':v>=30?'#3b82f6cc':v>=0?'#f59e0bcc':'#ef4444cc'));

    // Experiencia por horario — descubrimiento dinámico de valores reales
    const horarioMap={};
    W.forEach(r=>{
        const h=(getCol(r,'horario')||'').trim();
        const e=parseFloat(getCol(r,'calific'));
        if(h&&!isNaN(e)){if(!horarioMap[h])horarioMap[h]=[];horarioMap[h].push(e);}
    });
    const horLabels=Object.keys(horarioMap);
    const horVals=horLabels.map(k=>+(horarioMap[k].reduce((a,b)=>a+b)/horarioMap[k].length).toFixed(2));
    if(horLabels.length>=3){radar('chHorario',horLabels,horVals);}
    else if(horLabels.length>0){bar('chHorario',horLabels,[{l:'Exp. promedio',d:horVals,c:'#6366f1'}]);}
    else{document.getElementById('chHorario').style.display='none';}

    // Tabla detalle por profesional
    let tb='';
    profs.forEach((p,i)=>{
        const nv=npsV[i],ea=expByProf[p]||[];
        const ep=ea.length?(ea.reduce((a,b)=>a+b)/ea.length).toFixed(1):'--';
        const sede=getSede(p);
        const cls=nv>=50?'bg':nv>=30?'bb':nv>=10?'by':'br';
        tb+=`<tr><td><b>${p}</b></td><td>${sede}</td><td><span class="badge ${cls}">${nv}</span></td><td>${ep}/10</td><td>${nv>=50?'\uD83C\uDFC6 Excelente':nv>=30?'\uD83D\uDC4D Bueno':'\u26A0\uFE0F Mejorable'}</td></tr>`;
    });
    document.getElementById('encTabBody').innerHTML=tb||`<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px">Sin datos por profesional</td></tr>`;

    // ── Bienvenida: 5-Dimensiones calidad onboarding ──
    const bienvDims = [
        { label:'Entrevista inicial',   vals: W.map(r=>textToScore(getCol(r,'escuchado')||getCol(r,'entrevista'))).filter(v=>v!==null) },
        { label:'Claridad del plan',    vals: W.map(r=>textToScore(getCol(r,'plan'))).filter(v=>v!==null) },
        { label:'Acompañamiento',       vals: W.map(r=>textToScore(getCol(r,'acompa'))).filter(v=>v!==null) },
        { label:'Experiencia general',  vals: W.map(r=>{ const v=parseFloat(getCol(r,'calific')); return isNaN(v)?null:v; }).filter(v=>v!==null) },
        { label:'Confianza en proceso', vals: W.map(r=>textToScore(getCol(r,'confianza'))).filter(v=>v!==null) },
    ];
    const bienvAvgs = bienvDims.map(d => d.vals.length ? +(d.vals.reduce((a,b)=>a+b)/d.vals.length).toFixed(2) : 0);
    if(document.getElementById('chBienvDims') && bienvAvgs.some(v=>v>0)) {
        radar('chBienvDims', bienvDims.map(d=>d.label), bienvAvgs);
    }

    // ── Bienvenida: insight estratégico ──
    const bienvIns = document.getElementById('bienvInsight');
    if(bienvIns && W.length >= 5) {
        const bestDim = bienvDims[bienvAvgs.indexOf(Math.max(...bienvAvgs))];
        const weakDim = bienvDims[bienvAvgs.indexOf(Math.min(...bienvAvgs.filter(v=>v>0)))];
        const npsLvl  = nps>=50 ? '🔥 Excelente' : nps>=30 ? '👍 Bueno' : '⚠️ A mejorar';
        bienvIns.style.display='';
        bienvIns.innerHTML=`
        <div class="expert-title"><i class="fas fa-brain"></i> Diagnóstico Onboarding &middot; ${W.length} nuevos socios encuestados</div>
        <div class="expert-cols">
          <div class="expert-col">
            <div class="expert-col-hd" style="color:#10b981">✅ Fortalezas</div>
            <ul class="expert-list">
              <li><strong>NPS ${nps} — ${npsLvl}</strong>: ${nps>=50?'Los nuevos socios se convierten en promotores activos desde el día 1.':'Nivel positivo de recomendación inicial.'}</li>
              <li>Dimensión más valorada: <strong>${bestDim.label}</strong> (${Math.max(...bienvAvgs).toFixed(1)}/10)</li>
              <li>${wPP}% son Promotores — base sólida para crecimiento orgánico por boca a boca.</li>
            </ul>
          </div>
          <div class="expert-col">
            <div class="expert-col-hd" style="color:#f59e0b">🎯 Oportunidades</div>
            <ul class="expert-list">
              <li>Dimensión con mayor margen de mejora: <strong>${weakDim ? weakDim.label : '—'}</strong>${weakDim ? ' ('+Math.min(...bienvAvgs.filter(v=>v>0)).toFixed(1)+'/10)' : ''}</li>
              <li>${wDP>0?`${wDP}% de detractores en esta etapa —  riesgo de abandono en primeros 30 días.`:'Sin detractores registrados hasta ahora — excelente señal.'}</li>
              <li>Capitalizar el alto NPS con un programa formal de referidos.</li>
            </ul>
          </div>
        </div>`;
    }

    // Sugerencias de bienvenida — "Si pudieras mejorar una sola cosa..."
    const sugCards=W.map(r=>{
        const txt=(getCol(r,'mejorar una')||getCol(r,'mejorar')||'').trim();
        const prof=(getCol(r,'profesor')||getCol(r,'profesional')||'').trim();
        const date=fmtDate(getCol(r,'temporal'));
        return txt?renderQuoteCard(txt,prof,'neg',date):'';
    }).filter(Boolean).join('');
    document.getElementById('encSugerencias').innerHTML=sugCards||'<div class="quote-empty">Sin sugerencias registradas</div>';

    // ═══ BAJAS ═══
    set('b-total', C.length);

    const recsC   = C.map(r=>parseFloat(getCol(r,'recomendar\u00edas') || getCol(r,'recomendar'))).filter(n=>!isNaN(n));
    const recsExp  = C.map(r=>parseFloat(getCol(r,'experiencia'))).filter(n=>!isNaN(n));
    const npsRecs  = recsC.length ? recsC : recsExp;
    const npsC     = npsRecs.length ? calcNPS(npsRecs) : 0;

    // NPS breakdown: promotores / pasivos / detractores
    const totalNps   = npsRecs.length || 1;
    const nProm      = npsRecs.filter(n=>n>=9).length;
    const nPas       = npsRecs.filter(n=>n>=7&&n<=8).length;
    const nDet       = npsRecs.filter(n=>n<=6).length;
    const pPct       = Math.round(nProm/totalNps*100);
    const nPct       = Math.round(nPas/totalNps*100);
    const dPct       = Math.max(0, 100 - pPct - nPct);
    const avgExpB    = recsExp.length ? (recsExp.reduce((a,b)=>a+b)/recsExp.length).toFixed(1) : '--';

    set('b-nps', npsC);
    set('b-nps-lbl', npsC>=50?'\uD83D\uDD25 Excelente \u00b7 Top 10% fitness mundial':npsC>=30?'\uD83D\uDC4D Muy bueno \u00b7 Sobre el benchmark':'\u26A0\uFE0F A mejorar \u00b7 Bajo el benchmark');
    set('b-prom', pPct+'%');
    set('b-exp', avgExpB+'/10');

    // \u00cdndice Deserci\u00f3n Controlable (usa getCol para encontrar la columna de motivo)
    const internals = C.filter(r=>classifyMotivo(getCol(r,'motivo'))==='internal').length;
    const externals = C.length - internals;
    const desCtrl   = C.length>0 ? Math.round(internals/C.length*100) : 0;

    // \u00cdndice Servicio MOVE
    let sumS=0, cntS=0;
    C.forEach(r=>{
        const exp =parseFloat(getCol(r,'experiencia'));
        const aten=parseFloat(getCol(r,'atenci\u00f3n') || getCol(r,'atencion') || getCol(r,'trato'));
        if(!isNaN(exp)&&!isNaN(aten)){sumS+=(exp+aten)/2*10;cntS++;}
        else if(!isNaN(exp)){sumS+=exp*10;cntS++;}
    });
    const servIdx = cntS>0 ? Math.round(sumS/cntS) : 0;

    // 3 gauges + interpretation
    const ni=npsInfo(npsC), di=desercInfo(desCtrl), si=servicioInfo(servIdx);
    svgGauge('gaugeNPS',     npsC,   -100, 100, ni.color, ni.badge);
    svgGauge('gaugeDeserc',  desCtrl, 0,   100, di.color, di.badge, '%');
    svgGauge('gaugeServicio',servIdx, 0,   100, si.color, si.badge, '%');
    document.getElementById('interpNPS').innerHTML     = makeInterpCard(ni);
    document.getElementById('interpDeserc').innerHTML  = makeInterpCard(di);
    document.getElementById('interpServicio').innerHTML= makeInterpCard(si);

    // NPS Distribution stacked bar
    npsDistBar('chNpsDist', pPct, nPct, dPct);
    document.getElementById('npsDistDetail').innerHTML =
        `<div class="nps-seg"><div class="nps-seg-dot" style="background:#10b981"></div><div class="nps-seg-label">Promotores (9\u201310)</div><div class="nps-seg-pct">${pPct}%</div><span class="nps-seg-n">${nProm} resp.</span></div>`+
        `<div class="nps-seg"><div class="nps-seg-dot" style="background:#f59e0b"></div><div class="nps-seg-label">Pasivos (7\u20138)</div><div class="nps-seg-pct">${nPct}%</div><span class="nps-seg-n">${nPas} resp.</span></div>`+
        `<div class="nps-seg"><div class="nps-seg-dot" style="background:#ef4444"></div><div class="nps-seg-label">Detractores (0\u20136)</div><div class="nps-seg-pct">${dPct}%</div><span class="nps-seg-n">${nDet} resp.</span></div>`;

    // Internal vs External donut + legend
    doughnut('chIntExt', [internals||1, externals||1], ['#ef4444cc','#10b981cc']);
    document.getElementById('intExtLegend').innerHTML =
        `<div class="ie-row"><div class="ie-dot" style="background:#ef4444"></div><div class="ie-label">Causas Internas</div><div style="text-align:right"><div class="ie-pct" style="color:#ef4444">${desCtrl}%</div><div class="ie-n">${internals} socios</div></div></div>`+
        `<div class="ie-row"><div class="ie-dot" style="background:#10b981"></div><div class="ie-label">Causas Externas</div><div style="text-align:right"><div class="ie-pct" style="color:#10b981">${100-desCtrl}%</div><div class="ie-n">${externals} socios</div></div></div>`;

    // Motivos horizontal bar — sorted, color-coded (rojo=interno, verde=externo)
    const mot={};
    C.forEach(r=>{const m=getCol(r,'motivo');if(m)mot[m]=(mot[m]||0)+1;});
    const motSorted = Object.entries(mot).sort((a,b)=>b[1]-a[1]);
    const motLabels = motSorted.map(([k])=>k.length>44?k.substring(0,44)+'\u2026':k);
    const motData   = motSorted.map(([,v])=>v);
    const motColors = motSorted.map(([k])=>classifyMotivo(k)==='internal'?'#ef4444bb':'#10b981bb');
    const motCount  = motSorted.length;
    set('motivosBadge', motCount+' razones \u00b7 \uD83D\uDD34 internas \u00b7 \uD83D\uDFE2 externas');
    const motCanvas = document.getElementById('chMotivos');
    if(motCanvas){ motCanvas.style.maxHeight='none'; motCanvas.style.height=Math.max(200,motCount*40)+'px'; }
    hbar('chMotivos', motLabels, motData, motColors);

    // ── Bajas: 5 Dimensiones de Servicio ──
    const servDimDef = [
        { label:'Atención y trato',     key:'atenci' },
        { label:'Profesionalismo',       key:'profesionalismo' },
        { label:'Acompañamiento',        key:'acompa' },
        { label:'Organización',          key:'organiz' },
        { label:'Ambiente',              key:'ambiente' },
    ];
    const servDimVals = servDimDef.map(d => {
        const vals = C.map(r => parseFloat(getCol(r, d.key))).filter(n=>!isNaN(n));
        return vals.length ? +(vals.reduce((a,b)=>a+b)/vals.length).toFixed(2) : 0;
    });
    if(document.getElementById('chServDims') && servDimVals.some(v=>v>0)) {
        const sdColors = servDimVals.map(v => v>=8?'#10b981cc':v>=7?'#3b82f6cc':v>=6?'#f59e0bcc':'#ef4444cc');
        hbarScore('chServDims', servDimDef.map(d=>d.label), servDimVals, sdColors);
    }

    // Per-professor ranking — fuzzy column detection + filter non-real names
    const PROFE_VALIDOS = ['belen','bel\u00e9n','juarez','ju\u00e1rez','fernando','sebrie','sebri\u00e9','enzo','lega','javier','larramendy','luz','nubile','facundo','soberon','sober\u00f3n','francisco','simcic','leonardo','alfaro','emanuel','lezcano','agustina','agus'];
    function esProfeReal(nombre){
        if(!nombre||nombre.trim()==='')return false;
        const n=nombre.toLowerCase().trim();
        // Filtra si tiene más de 4 palabras (no es nombre propio) o si no matchea ningún apellido/nombre conocido
        const palabras=n.split(/\s+/);
        if(palabras.length>4)return false;
        return PROFE_VALIDOS.some(v=>n.includes(v));
    }
    const bajaPorProf={};
    C.forEach(r=>{
        const p   = getCol(r,'profesor') || getCol(r,'profesional') || getCol(r,'profe');
        const exp = parseFloat(getCol(r,'experiencia'));
        const aten= parseFloat(getCol(r,'atenci\u00f3n') || getCol(r,'atencion') || getCol(r,'trato'));
        const rec = parseFloat(getCol(r,'recomendar\u00edas') || getCol(r,'recomendar'));
        if(!esProfeReal(p)) return;
        const nombre = p.trim();
        if(!bajaPorProf[nombre])bajaPorProf[nombre]={exp:[],aten:[],recom:[]};
        if(!isNaN(exp)) bajaPorProf[nombre].exp.push(exp);
        if(!isNaN(aten))bajaPorProf[nombre].aten.push(aten);
        if(!isNaN(rec)) bajaPorProf[nombre].recom.push(rec);
    });
    const profRanking = Object.entries(bajaPorProf)
        .map(([nombre,data])=>{
            const avgE=data.exp.length?data.exp.reduce((a,b)=>a+b)/data.exp.length:0;
            const avgA=data.aten.length?data.aten.reduce((a,b)=>a+b)/data.aten.length:avgE;
            const siP=Math.round((avgE+avgA)/2*10);
            const npsP=calcNPS(data.recom.length?data.recom:data.exp);
            // NPS normalizado a escala 0-10 para gráfico
            const npsNorm=Math.max(0,Math.min(10,((npsP+100)/200)*10));
            return{nombre,si:siP,nps:npsP,npsNorm,n:data.exp.length,avgExp:avgE,avgExpF:avgE.toFixed(1)};
        })
        .sort((a,b)=>b.si-a.si);

    let rankRows='';
    profRanking.forEach((p,i)=>{
        const siCls =p.si>=90?'bg':p.si>=80?'bb':p.si>=70?'by':'br';
        const npsCls=p.nps>=50?'bg':p.nps>=30?'bb':p.nps>=10?'by':'br';
        rankRows+=`<tr><td><span class="rank-num">${i+1}</span> <b>${p.nombre}</b></td><td>${p.avgExpF}/10</td><td><span class="badge ${npsCls}">${p.nps}</span></td><td><span class="badge ${siCls}">${p.si}%</span></td><td style="color:#94a3b8;font-size:.8rem">${p.n} resp.</td></tr>`;
    });
    document.getElementById('bajaProfTab').innerHTML=rankRows||'<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:24px">Sin datos suficientes por profesional</td></tr>';

    // Voz del Ex-Socio — textos libres de la encuesta de baja
    const mejCards=C.map(r=>{
        const txt=(getCol(r,'mejorar para')||getCol(r,'deber\u00eda mejorar')||getCol(r,'mejorar')||'').trim();
        const prof=(getCol(r,'profesor')||getCol(r,'profesional')||getCol(r,'profe')||'').trim();
        const p=esProfeReal(prof)?prof:'';
        const date=fmtDate(getCol(r,'temporal'));
        return txt?renderQuoteCard(txt,p,'neg',date):'';
    }).filter(Boolean).join('');
    document.getElementById('bajaMejorar').innerHTML=mejCards||'<div class="quote-empty">Sin respuestas registradas</div>';

    const bienCards=C.map(r=>{
        const txt=(getCol(r,'hace muy bien')||getCol(r,'hace bien')||getCol(r,'muy bien')||'').trim();
        const prof=(getCol(r,'profesor')||getCol(r,'profesional')||getCol(r,'profe')||'').trim();
        const p=esProfeReal(prof)?prof:'';
        const date=fmtDate(getCol(r,'temporal'));
        return txt?renderQuoteCard(txt,p,'pos',date):'';
    }).filter(Boolean).join('');
    document.getElementById('bajaBien').innerHTML=bienCards||'<div class="quote-empty">Sin respuestas registradas</div>';

    // Gráfico Experiencia vs NPS por Profe (escala 0-10)
    if(profRanking.length){
        const prLabels=profRanking.map(p=>p.nombre.split(' ')[0]+' '+( p.nombre.split(' ')[1]||''));
        groupedBar('chExpNpsProf', prLabels, [
            {label:'Experiencia General (0\u201310)',data:profRanking.map(p=>+p.avgExp.toFixed(2)),backgroundColor:'#6366f1cc',borderRadius:4},
            {label:'NPS (escalado 0\u201310)',data:profRanking.map(p=>+p.npsNorm.toFixed(2)),backgroundColor:'#10b981cc',borderRadius:4}
        ]);
    }

    // Gráfico Antigüedad vs Motivo (stacked bar)
    const ANTIGÜEDADES = ['Menos de 1 mes','1 a 3 meses','3 a 6 meses','M\u00e1s de 6 meses'];
    const motKey = Object.keys(C[0]||{}).find(k=>k.toLowerCase().includes('motivo'))||'';
    const antKey = Object.keys(C[0]||{}).find(k=>k.toLowerCase().includes('ant') || k.toLowerCase().includes('tiempo'))||'';
    const motivosUnicos=[...new Set(C.map(r=>r[motKey]).filter(Boolean))];
    const antColors=['#6366f1bb','#10b981bb','#f59e0bbb','#ef4444bb','#8b5cf6bb','#3b82f6bb'];
    const antDS = ANTIGÜEDADES.map((ant,i)=>({
        label:ant,
        data:motivosUnicos.map(m=>C.filter(r=>r[motKey]===m&&r[antKey]===ant).length),
        backgroundColor:antColors[i],
        borderRadius:3
    }));
    if(motKey&&antKey&&motivosUnicos.length){
        const shortMot=motivosUnicos.map(m=>m.length>28?m.substring(0,28)+'\u2026':m);
        stackedBar('chAntMotivo',shortMot,antDS);
    }

    // \u2500\u2500 Diagn\u00f3stico Estrat\u00e9gico din\u00e1mico \u2500\u2500
    const topMot    = motSorted.length ? motSorted[0][0] : '';
    const topMot2   = motSorted.length>1 ? motSorted[1][0] : '';
    const topMotInt = topMot && classifyMotivo(topMot)==='internal';
    const bestServDim = servDimDef[servDimVals.indexOf(Math.max(...servDimVals))];
    const weakServDim = servDimDef[servDimVals.indexOf(Math.min(...servDimVals.filter(v=>v>0)))];
    const avgServScore = servDimVals.filter(v=>v>0).length
        ? (servDimVals.filter(v=>v>0).reduce((a,b)=>a+b)/servDimVals.filter(v=>v>0).length).toFixed(1) : '--';
    const earlyChurn = C.filter(r=>{ const t=(getCol(r,'tiempo')||getCol(r,'ant')||'').toLowerCase(); return t.includes('1')&&t.includes('3'); }).length;
    const earlyPct = C.length>0 ? Math.round(earlyChurn/C.length*100) : 0;

    document.getElementById('expertAnalysis').innerHTML=`
    <div class="expert-col">
      <div class="expert-col-hd" style="color:#10b981">\u2705 Fortalezas Identificadas</div>
      <ul class="expert-list">
        <li><strong>NPS ex-socios: ${npsC}</strong> \u2014 ${npsC>=50?'Extraordinario: incluso quienes se van recomiendan MOVE. Activo de marca invaluable.':npsC>=30?'Nivel positivo entre ex-socios, marca bien valorada.':'Oportunidad de mejora en la experiencia general.'}</li>
        <li><strong>Servicio MOVE: ${servIdx}%</strong> \u2014 ${servIdx>=90?'Ejecuci\u00f3n premium consolidada. El modelo MOVE funciona.':'Alto nivel de servicio certificado por ex-socios.'}</li>
        <li>${(100-desCtrl)}% de las bajas son externas \u2014 el problema principal <strong>no es el servicio</strong>, es el contexto del socio.</li>
        ${bestServDim&&servDimVals.some(v=>v>0)?`<li>Dimensi\u00f3n mejor evaluada: <strong>${bestServDim.label} (${Math.max(...servDimVals).toFixed(1)}/10)</strong></li>`:''}
      </ul>
    </div>
    <div class="expert-col">
      <div class="expert-col-hd" style="color:#ef4444">\u26a0\ufe0f \u00c1reas Cr\u00edticas</div>
      <ul class="expert-list">
        ${topMot?`<li>Motivo #1 de baja: <strong>"${topMot.substring(0,55)}"</strong> \u2014 ${topMotInt?'causa interna, requiere acci\u00f3n inmediata':'causa predominantemente externa'}.</li>`:''}
        ${topMot2?`<li>Motivo #2: <strong>"${topMot2.substring(0,55)}"</strong> \u2014 ${classifyMotivo(topMot2)==='internal'?'\ud83d\udd34 controlable':'\ud83d\udfe2 externo'}.</li>`:''}
        <li><strong>${desCtrl}% deserci\u00f3n controlable</strong> \u2014 ${desCtrl>=40?'Porcentaje alto: revisar la entrega del servicio y comunicaci\u00f3n.':desCtrl>=25?'Escenario mixto: hay factores internos identificables y accionables.':'Bajo nivel de responsabilidad interna. Buen indicador.'}</li>
        ${weakServDim&&servDimVals.some(v=>v>0)?`<li>Dimensi\u00f3n m\u00e1s d\u00e9bil: <strong>${weakServDim.label} (${Math.min(...servDimVals.filter(v=>v>0)).toFixed(1)}/10)</strong> \u2014 foco prioritario de mejora.</li>`:''}
      </ul>
    </div>
    <div class="expert-col">
      <div class="expert-col-hd" style="color:#6366f1">\ud83c\udfaf Plan de Acci\u00f3n Estrat\u00e9gico</div>
      <ul class="expert-list">
        <li><strong>Protocolo 0-90 d\u00edas:</strong> intervenci\u00f3n proactiva en el primer trimestre \u2014 mayor concentraci\u00f3n de abandono identificada.</li>
        <li><strong>Programa de valor percibido:</strong> comunicar ROI del entrenamiento ante objeciones econ\u00f3micas. Planes flexibles o pausas activas.</li>
        <li><strong>Gesti\u00f3n de cambio de profe:</strong> onboarding emocional al nuevo profe para mitigar el impacto de la transici\u00f3n.</li>
        <li><strong>Referidos activos:</strong> capitalizar el NPS ${npsC>=50?'excepcional':''} lanzando un programa formal de referidos con incentivos.</li>
        ${weakServDim?`<li>Plan de mejora en <strong>${weakServDim.label}</strong>: training espec\u00edfico del equipo en esta dimensi\u00f3n.</li>`:''}
      </ul>
    </div>`;

    // Expert Strategic Analysis
    const fortalezas=[],oportunidades=[],recomendaciones=[];
    if(npsC>=50){fortalezas.push(`\uD83D\uDD25 NPS ${npsC} \u2014 Top 10% fitness mundial. Benchmark industria: 30\u201345.`);fortalezas.push(`\uD83D\uDC9A ${pPct}% de ex-socios siguen siendo promotores activos.`);}
    else if(npsC>=30)fortalezas.push(`\uD83D\uDC4D NPS ${npsC} \u2014 Por encima del promedio fitness global (30\u201345).`);
    else oportunidades.push(`\u26A0\uFE0F NPS ${npsC} \u2014 Bajo el benchmark. Revisar experiencia en primeros 60 d\u00edas.`);
    if(servIdx>=90)fortalezas.push(`\uD83C\uDFC6 Servicio ${servIdx}% \u2014 Ejecuci\u00f3n de clase mundial seg\u00fan ex-socios.`);
    else if(servIdx>=80)fortalezas.push(`\uD83D\uDCAA Servicio ${servIdx}% \u2014 Muy por encima del sector (benchmark 70\u201380%).`);
    else oportunidades.push(`\uD83D\uDD27 Servicio ${servIdx}% \u2014 Hay mejora disponible en la ejecuci\u00f3n operativa.`);
    if(desCtrl<30)fortalezas.push(`\uD83C\uDF0E Solo ${desCtrl}% causas internas \u2014 MOVE no es el problema; el contexto lo es.`);
    else if(desCtrl<50)oportunidades.push(`\uD83D\uDD36 ${desCtrl}% causas internas \u2014 Hay factores internos concretos a resolver.`);
    else oportunidades.push(`\uD83D\uDD34 ${desCtrl}% causas internas \u2014 Problema prioritario: revisar modelo de servicio.`);
    if(avgExpB!=='--'&&parseFloat(avgExpB)>=8)fortalezas.push(`\u2B50 Experiencia ${avgExpB}/10 \u2014 Alta incluso en ex-socios. Indicador de marca fuerte.`);
    else if(avgExpB!=='--')oportunidades.push(`\uD83D\uDCCA Experiencia ${avgExpB}/10 \u2014 Hay margen de mejora en la experiencia percibida.`);
    if(npsC>=50&&desCtrl<30)recomendaciones.push('\uD83C\uDFAF Activar programa de referidos: ex-socios recomiendan MOVE \u2014 monetiz\u00e1 esa energ\u00eda con incentivos concretos.');
    if(servIdx>=90)recomendaciones.push('\uD83D\uDCCB Documentar y certificar el protocolo de servicio actual como est\u00e1ndar de la marca MOVE.');
    recomendaciones.push('\uD83D\uDD0D Cruzar motivo de baja con tiempo de membres\u00eda para detectar el "punto de fuga" cr\u00edtico (mes 2\u20133?).');
    if(desCtrl<30)recomendaciones.push('\uD83D\uDCA1 El problema principal es econom\u00eda/contexto. Explorar planes flexibles, pausas y planes familia.');
    recomendaciones.push('\uD83D\uDCF1 Implementar NPS autom\u00e1tico en d\u00eda 30 y 60 para detecci\u00f3n temprana de detractores antes de que se den de baja.');
    document.getElementById('expertAnalysis').innerHTML=`
        <div class="expert-col col-green"><div class="expert-col-title">\u2705 Fortalezas</div><ul>${fortalezas.map(f=>`<li>${f}</li>`).join('')||'<li style="color:rgba(255,255,255,.3)">Sin datos suficientes</li>'}</ul></div>
        <div class="expert-col col-amber"><div class="expert-col-title">\uD83C\uDFAF Oportunidades</div><ul>${(oportunidades.length?oportunidades:['<span style="color:rgba(255,255,255,.35);font-size:.75rem">\u2714\uFE0F Sin alertas cr\u00edticas detectadas</span>']).map(f=>`<li>${f}</li>`).join('')}</ul></div>
        <div class="expert-col col-blue"><div class="expert-col-title">\uD83D\uDCA1 Recomendaciones</div><ul>${recomendaciones.map(f=>`<li>${f}</li>`).join('')}</ul></div>`;
}

// ══════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════
