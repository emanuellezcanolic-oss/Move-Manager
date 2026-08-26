// ══════════════════════════════════════════════════
// PANEL EJECUTIVO + GENERADOR DE MENSAJE (Groq)
// ══════════════════════════════════════════════════
const AE_GROQ_MODEL = 'openai/gpt-oss-120b';
const AE_NOMBRE = {belen:'Belén',fer:'Fer',enzo:'Enzo',javi:'Javi',agus:'Agus',camila:'Camila',carla:'Carla',estefania:'Estefanía'};
const AE_SEDE = {belen:'El Bolsón',fer:'El Bolsón',enzo:'El Bolsón',javi:'Lago Puelo',agus:'Lago Puelo',camila:'Bariloche',carla:'Bariloche',estefania:'Bariloche'};

// Padrón real del profe (misma fuente que Estado del Gym), no la celda manual de Objetivos
function aeActivosReales(){
    const mapBP={belen:'belu',fer:'fer',enzo:'enzo',javi:'javi',agus:'agus'};
    const t=mapBP[aeProfeActual];
    if(t && typeof planData!=='undefined' && planData && planData.profes){
        const p=planData.profes.find(x=>String(x.nombre||'').toLowerCase().startsWith(t));
        if(p && p.activos>0) return p.activos;
    }
    const mapB={camila:'camila',carla:'carla',estefania:'estef'};
    const tb=mapB[aeProfeActual];
    if(tb && typeof bariData!=='undefined' && bariData && bariData.length){
        const p=bariData.find(x=>String(x.nombre||'').toLowerCase().startsWith(tb));
        if(p && p.activos>0) return p.activos;
    }
    return null;
}
// % de tareas cumplidas del mes, calculado sobre las tareas reales de la planilla
function aeTareaPct(datos, mesIdx){
    const ts = (datos.tareas && datos.tareas[mesIdx]) || [];
    if(!ts.length) return null;
    return Math.round(ts.filter(t=>t.ok).length / ts.length * 100);
}
function aePanelDatos(mesIdx){
    const datos = AE_DATA[aeProfeActual] || AE_BELEN;
    const d = datos.objetivos[mesIdx] || {};
    const prev = mesIdx>0 ? datos.objetivos[mesIdx-1] : null;
    const mov = (datos.movimiento && datos.movimiento[mesIdx]) || {};
    const movPrev = (prev && datos.movimiento && datos.movimiento[mesIdx-1]) || {};
    const nuevos = mov.nuevos!=null ? mov.nuevos : (mov.luciaTani||0);
    const nuevosPrev = movPrev.nuevos!=null ? movPrev.nuevos : (movPrev.luciaTani||0);
    const adh = datos.adherencia ? datos.adherencia[mesIdx] : null;
    const adhPrev = (prev && datos.adherencia) ? datos.adherencia[mesIdx-1] : null;
    const tareaPct = aeTareaPct(datos, mesIdx);
    const tareaPctPrev = mesIdx>0 ? aeTareaPct(datos, mesIdx-1) : null;
    const activosReales = aeActivosReales();
    return {datos,d,prev,nuevos,nuevosPrev,adh,adhPrev,tareaPct,tareaPctPrev,activosReales,mesNombre:datos.mesesFull?datos.mesesFull[mesIdx]:datos.meses[mesIdx]};
}

function aeRenderPanel(mesIdx){
    const {datos,d,prev,nuevos,nuevosPrev,adh,adhPrev,tareaPct,tareaPctPrev,activosReales} = aePanelDatos(mesIdx);
    document.getElementById('aePanelProfe').textContent = `${AE_NOMBRE[aeProfeActual]||datos.nombre||aeProfeActual} · ${datos.meses[mesIdx]}`;

    // delta: valor actual - previo. mejorInv=true cuando menos es mejor (deserción)
    const delta = (cur,pv,mejorInv)=>{
        if(pv==null||cur==null) return '<span style="font-size:.66rem;color:var(--muted);">— sin mes previo</span>';
        const diff = Math.round((cur-pv)*10)/10;
        if(diff===0) return '<span style="font-size:.66rem;color:var(--muted);">= igual</span>';
        const bueno = mejorInv ? diff<0 : diff>0;
        const col = bueno?'#10b981':'#ef4444';
        const arr = diff>0?'▲':'▼';
        return `<span style="font-size:.66rem;color:${col};font-weight:700;">${arr} ${diff>0?'+':''}${diff} vs mes ant.</span>`;
    };
    const sc = p => p>=80?'#10b981':p>=50?'#f59e0b':'#ef4444';

    const kpis = [
        {l:'Socios Activos', v:(activosReales??d.activos), c:(activosReales??d.activos)>=95?'#10b981':(activosReales??d.activos)>=70?'#f59e0b':'#ef4444',
         dl: activosReales!=null ? '<span style="font-size:.66rem;color:var(--muted);">padrón real de hoy</span>' : delta(d.activos, prev?prev.activos:null,false)},
        {l:'% Deserción', v:(d.desercion??0)+'%', c:d.desercion<=10?'#10b981':d.desercion<=20?'#f59e0b':'#ef4444', dl:delta(d.desercion, prev?prev.desercion:null,true)},
        {l:'Retención Real', v:(d.retencion??0)+'%', c:d.retencion>=90?'#10b981':d.retencion>=75?'#f59e0b':'#ef4444', dl:delta(d.retencion, prev?prev.retencion:null,false)},
        {l:'Re-evaluaciones', v:d.reeval??0, c:d.reeval>=30?'#10b981':d.reeval>=15?'#f59e0b':'#ef4444', dl:delta(d.reeval, prev?prev.reeval:null,false)},
        {l:'Tarea Mensual', v:(tareaPct??d.tarea??0)+'%', c:sc(tareaPct??d.tarea), dl:delta(tareaPct??d.tarea, tareaPctPrev??(prev?prev.tarea:null),false)},
        {l:'Socios Nuevos', v:nuevos, c:nuevos>=70?'#10b981':nuevos>=35?'#f59e0b':'#ef4444', dl:delta(nuevos, prev?nuevosPrev:null,false)},
        {l:'Adherencia Prom.', v:adh!=null?adh+'%':'—', c:adh>=80?'#10b981':adh>=50?'#f59e0b':'#ef4444', dl:delta(adh, adhPrev,false)},
    ];
    document.getElementById('aeDeltaKpis').innerHTML = kpis.map(k=>`
        <div style="background:var(--card2,var(--card));border:1px solid var(--border);border-radius:10px;padding:12px;border-left:3px solid ${k.c};">
            <div style="font-size:1.4rem;font-weight:800;color:${k.c};font-family:monospace;letter-spacing:-1px;">${k.v}</div>
            <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-top:3px;">${k.l}</div>
            <div style="margin-top:3px;">${k.dl}</div>
        </div>`).join('');

    // Barras hacia metas anuales
    const bar = (label, val, cfg) => {
        if(val==null) return '';
        let pct, ok;
        if(cfg.dir==='down'){ // menos es mejor (deserción): lleno cuando val<=meta
            ok = val<=cfg.meta;
            pct = Math.max(0, Math.min(100, Math.round((1 - (val-cfg.meta)/(30-cfg.meta))*100)));
            if(val<=cfg.meta) pct=100;
        } else {
            ok = val>=cfg.meta;
            pct = Math.max(0, Math.min(100, Math.round(val/cfg.meta*100)));
        }
        const col = ok?'#10b981':pct>=60?'#f59e0b':'#ef4444';
        const valTxt = (cfg.dir==='down'||label==='% Deserción'||label==='Retención Real'||label==='Tarea Mensual')? val+'%' : val;
        return `<div style="padding:7px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;font-size:.77rem;margin-bottom:4px;">
                <span>${label} <span style="color:var(--muted);font-size:.66rem;">${cfg.sub}</span></span>
                <span style="font-weight:700;color:${col};">${valTxt} ${ok?'<i class="fas fa-check" style="font-size:.7rem;"></i>':`(${pct}%)`}</span>
            </div>
            <div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:${col};border-radius:3px;transition:width .5s;"></div>
            </div>
        </div>`;
    };
    document.getElementById('aeMetasAnuales').innerHTML =
        bar('Retención Real', d.retencion, AE_METAS_2026.retencion) +
        bar('% Deserción', d.desercion, AE_METAS_2026.desercion) +
        bar('Re-evaluaciones', d.reeval, AE_METAS_2026.reeval) +
        bar('Socios Nuevos', nuevos, AE_METAS_2026.nuevos) +
        bar('Tarea Mensual', tareaPct??d.tarea, AE_METAS_2026.tarea);
}

// ── API Key de Groq (localStorage) ──
const AE_GROQ_LS = 'move_groq_key';
function aeGetKey(){ return localStorage.getItem(AE_GROQ_LS) || ''; }
function aeGuardarKey(){
    const k = document.getElementById('aeGroqKey').value.trim();
    if(!k){ document.getElementById('aeKeyStatus').textContent='Pegá una key primero'; return; }
    localStorage.setItem(AE_GROQ_LS, k);
    document.getElementById('aeKeyStatus').innerHTML='<span style="color:#10b981;">✓ Guardada</span>';
}

function aeCerrarMsg(){ document.getElementById('aeMsgModal').classList.remove('open'); }

let aeMsgHist = null; // {trainerId:[{mes,fecha,texto}]}
async function aeCargarMsgHist(){
    if(aeMsgHist!==null) return aeMsgHist;
    try{
        const r=await fetch(`https://gist.githubusercontent.com/emanuellezcanolic-oss/0894016bb00afb2f7fd49964896ee0db/raw/mensajes_historial.json?t=${Date.now()}`);
        aeMsgHist=await r.json();
    }catch(e){ aeMsgHist={}; }
    return aeMsgHist;
}
async function aeGuardarMsgHist(btn){
    const txt=(document.getElementById('aeMsgTexto').value||'').trim();
    if(!txt){ return; }
    const datos=AE_DATA[aeProfeActual]||AE_BELEN;
    const mesAb=datos.meses[aeMesActual];
    await aeCargarMsgHist();
    if(!aeMsgHist[aeProfeActual]) aeMsgHist[aeProfeActual]=[];
    const arr=aeMsgHist[aeProfeActual];
    const rec={mes:mesAb, fecha:new Date().toISOString(), texto:txt};
    const idx=arr.findIndex(m=>m.mes===mesAb);
    if(idx>=0) arr[idx]=rec; else arr.push(rec);
    const orig=btn?btn.innerHTML:'';
    if(btn) btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando…';
    try{
        const body=JSON.stringify({files:{'mensajes_historial.json':{content:JSON.stringify(aeMsgHist,null,2)}}});
        const resp=await fetch('https://api.github.com/gists/0894016bb00afb2f7fd49964896ee0db',{method:'PATCH',headers:{'Authorization':`token ${AUD_TOKEN}`,'Content-Type':'application/json'},body});
        if(!resp.ok) throw new Error('HTTP '+resp.status);
        if(btn){ btn.innerHTML='<i class="fas fa-check"></i> ¡Guardado!'; setTimeout(()=>btn.innerHTML=orig,1800); }
    }catch(e){ if(btn){ btn.innerHTML='<i class="fas fa-triangle-exclamation"></i> Error al guardar'; setTimeout(()=>btn.innerHTML=orig,2200); } }
}

async function aeGenerarMensaje(regen){
    const modal = document.getElementById('aeMsgModal');
    const {datos,d,prev,nuevos,adh,mesNombre,tareaPct,tareaPctPrev,activosReales} = aePanelDatos(aeMesActual);
    const nombre = AE_NOMBRE[aeProfeActual]||datos.nombre||aeProfeActual;
    document.getElementById('aeMsgProfe').textContent = nombre;
    document.getElementById('aeMsgMes').textContent = mesNombre||'';
    const savedKey = aeGetKey();
    const keyInput = document.getElementById('aeGroqKey');
    if(savedKey && !keyInput.value) keyInput.value = savedKey;
    if(savedKey) document.getElementById('aeKeyStatus').innerHTML='<span style="color:#10b981;">✓ Key guardada</span>';
    modal.classList.add('open');

    if(!savedKey){
        document.getElementById('aeKeyBox').open = true;
        const st=document.getElementById('aeMsgStatus'); st.style.display='block';
        st.innerHTML='<span style="color:#f59e0b;"><i class="fas fa-key"></i> Configurá tu API Key de Groq arriba y volvé a tocar Generar.</span>';
        return;
    }

    const st=document.getElementById('aeMsgStatus'); st.style.display='block';
    st.innerHTML='<i class="fas fa-spinner fa-spin"></i> Redactando con IA…';
    const txt=document.getElementById('aeMsgTexto'); txt.value='';

    // ¿Números provisorios? Solo el último mes cargado y pasado el día 5 se considera "en curso".
    const esUltimoMes = aeMesActual === (datos.meses.length - 1);
    const provisional = esUltimoMes && (new Date().getDate() > 5);

    // Continuidad: mensajes anteriores guardados de este profe
    await aeCargarMsgHist();
    const hist = (aeMsgHist[aeProfeActual]||[]).filter(m=>m.mes!==datos.meses[aeMesActual]).slice(-2);
    const prevBloque = hist.length
        ? `\n\nMENSAJES QUE YA LE ENVIASTE A ${nombre.toUpperCase()} EN MESES ANTERIORES (usalos para dar CONTINUIDAD: si algo que le marcaste mejoró, celebralo; si sigue pendiente, retomalo con naturalidad; NUNCA repitas el mismo mensaje):\n${hist.map(m=>`— ${m.mes}: "${m.texto}"`).join('\n')}`
        : '';

    const cmp = (cur,pv)=> pv==null?'sin dato del mes anterior':(cur>pv?`viene mejor (venía de ${pv})`:cur<pv?`bajó respecto al mes anterior (venía de ${pv})`:'se mantuvo igual');
    const metricas =
`Entrenador: ${nombre} (sede ${AE_SEDE[aeProfeActual]||datos.sede||'—'})
Mes analizado: ${mesNombre}
👥 Socios activos: ${activosReales??d.activos} (padrón real de hoy) — cupo objetivo 110
📉 Deserción: ${d.desercion}% (${cmp(d.desercion, prev?prev.desercion:null)}) — objetivo ≤10%
🤝 Retención real: ${d.retencion}% (${cmp(d.retencion, prev?prev.retencion:null)}) — objetivo ≥90%
🔄 Re-evaluaciones: ${d.reeval}% (${cmp(d.reeval, prev?prev.reeval:null)}) — objetivo ≥30% de socios activos
📝 Tareas mensuales: ${tareaPct??d.tarea}% de cumplimiento (${(datos.tareas&&datos.tareas[aeMesActual]||[]).filter(t=>t.ok).length}/${(datos.tareas&&datos.tareas[aeMesActual]||[]).length} completadas)${tareaPctPrev!=null?` (${cmp(tareaPct??d.tarea, tareaPctPrev)})`:''} — objetivo 100%
📈 Socios nuevos del mes: ${nuevos} — objetivo ≥70
📊 Adherencia promedio de sus socios: ${adh!=null?adh+'%':'sin dato'}`;

    const estadoNumeros = provisional
        ? `IMPORTANTE — NÚMEROS EN CURSO: el mes de ${mesNombre} TODAVÍA NO cerró, los números son una tendencia y se van a seguir moviendo. Hablá siempre con expresiones como "hasta el momento", "por ahora", "todavía falta cerrar el mes", "seguramente esto se siga moviendo". NUNCA des un número como conclusión definitiva. NO menciones NADA administrativo (ni fechas de cierre, ni plazos de pago, ni liquidaciones): es una cuestión interna que no va en el mensaje.`
        : `Los números de ${mesNombre} ya están cerrados, podés hablar de ellos como definitivos, siempre desde el acompañamiento y nunca como un reto.`;

    const sys = `Actuás como Emanuel Lezcano, Coordinador Deportivo de MOVE, una cadena de gimnasios premium de entrenamiento personalizado, salud y rendimiento humano, con 3 sedes en la Patagonia argentina. Tenés formación en liderazgo de equipos, coaching, psicología del deporte, RRHH, gestión de gimnasios, customer experience y retención.

QUIÉN SOS: No sos un jefe, sos un líder que desarrolla personas. Trabajás muy cerca de cada profesor, los observás a diario, conocés sus fortalezas y debilidades, los acompañás, los escuchás y les das devoluciones constantes. Nunca señalás errores para criticar: detectás oportunidades de mejora. Tenés una relación cercana con cada uno y el mensaje tiene que transmitir esa cercanía.

QUÉ ES MOVE: MOVE no vende entrenamiento, vende calidad de vida. Cada socio, sin importar su edad o condición, es tratado como un atleta de alto rendimiento. Las evaluaciones, re-evaluaciones, seguimiento, objetivos y mensajes no son tareas administrativas: son herramientas para mejorar la experiencia del socio y, como consecuencia, la retención, la adherencia, la satisfacción y el crecimiento del entrenador.

CADA MENSAJE DEBE GENERAR TRES COSAS: orgullo por el trabajo hecho, reflexión, y motivación para seguir creciendo. Nunca puede sentirse como un reto ni una llamada de atención. Tiene que sentirse como una charla entre dos profesionales que quieren ser mejores.

FILOSOFÍA INNEGOCIABLE:
- SIEMPRE empezás reconociendo algo positivo, aunque los números vengan flojos. Siempre hay algo bueno para destacar. Nunca arrancás criticando.
- Los indicadores son una guía para abrir conversación, no para juzgar. Mostralos y después interpretalos (no los repitas sin más).
- Para corregir NUNCA decís "esto está mal". Usás: "creo que podemos poner un poco más de foco en...", "me gustaría que trabajemos...", "creo que acá hay una oportunidad...", "¿cómo te puedo ayudar?", "¿qué sentís que está pasando?".
- SIEMPRE acompañás, nunca imponés. Y SIEMPRE cerrás generando conversación con una pregunta genuina (¿cómo te sentís?, ¿en qué podemos ayudarte?, ¿qué necesitás de nosotros?, ¿qué creés que está pasando?).

${estadoNumeros}

ESTRUCTURA del mensaje (WhatsApp, en este orden):
1) Saludo cálido por su nombre de pila.
2) Un bloque corto con los indicadores, con emojis (📊 Indicadores${provisional?' hasta el momento':''}: 👥 activos, 📉 deserción, 🤝 retención, 🔄 reevaluaciones, 📝 tareas, 📈 adherencia, socios nuevos). Poné los números que te paso.
3) Destacá sus fortalezas con detalle concreto (nombrá la métrica puntual que mejoró).
4) Interpretá los datos (qué cuentan, no solo repetirlos).
5) Proponé uno o dos focos de mejora, con tacto y desde el acompañamiento.
6) Explicá por qué esos focos importan para el socio y para el crecimiento del profesional.
7) Preguntale cómo se siente o cómo lo podés ayudar (esto es lo más importante).
8) Cerrá con una frase inspiradora y motivadora.

ESTILO: español argentino (vos/tenés/sos) pero con registro FORMAL y profesional: redacción cuidada, prolija y respetuosa, como un coordinador serio que valora a su equipo. Cálido y cercano, pero sin caer en lo demasiado coloquial, sin jerga ni modismos excesivos ni lunfardo. Es un WhatsApp, pero bien escrito y formal. Emojis solo en el bloque de indicadores, nada más. Sin markdown ni asteriscos. Extensión aprox. 180-230 palabras. No inventes números: usá SOLO los que te paso.

OBJETIVO: que al terminar de leer, el profesional piense "mi coordinador conoce mi trabajo, reconoce mi esfuerzo, confía en mí y quiere ayudarme a crecer".${prevBloque}`;

    const usr = `Escribí el WhatsApp de seguimiento para ${nombre}, siguiendo la estructura y la filosofía.${(()=>{const foco=(document.getElementById('aeMsgFocus').value||'').trim(); return foco?`\n\nENFOQUE ESPECÍFICO QUE PIDIÓ EMANUEL PARA ESTE MENSAJE (es prioritario: tiene que ser el eje del mensaje, integralo con naturalidad sin dejar de seguir la estructura y la filosofía): "${foco}"`:'';})()}\n\nDatos del mes:\n\n${metricas}`;

    try{
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions',{
            method:'POST',
            headers:{'Authorization':`Bearer ${savedKey}`,'Content-Type':'application/json'},
            body: JSON.stringify({
                model: AE_GROQ_MODEL,
                messages:[{role:'system',content:sys},{role:'user',content:usr}],
                temperature: regen?1.05:0.9,
                max_tokens: 950
            })
        });
        if(!resp.ok){
            const e = await resp.text();
            throw new Error(`HTTP ${resp.status} — ${e.slice(0,180)}`);
        }
        const data = await resp.json();
        const msg = data.choices?.[0]?.message?.content?.trim() || '(respuesta vacía)';
        txt.value = msg;
        st.style.display='none';
    }catch(e){
        st.innerHTML=`<span style="color:#ef4444;"><i class="fas fa-triangle-exclamation"></i> ${e.message}</span>`;
    }
}

function aeCopiarMsg(btn){
    const txt=document.getElementById('aeMsgTexto');
    txt.select();
    navigator.clipboard.writeText(txt.value).then(()=>{
        const orig=btn.innerHTML;
        btn.innerHTML='<i class="fas fa-check"></i> ¡Copiado!';
        setTimeout(()=>btn.innerHTML=orig,1800);
    }).catch(()=>{ document.execCommand('copy'); });
}

// ── Descargar dashboard del entrenador en PDF ──
// PDF = MISMA imagen del dashboard, embebida en una página del tamaño exacto.
async function aeDescargarPDF(){
    if(!window.jspdf || !window.jspdf.jsPDF){ alert('No se pudo cargar el generador de PDF. Revisá la conexión y reintentá.'); return; }
    const cv = await aeBuildDashboardCanvas(aeMesActual);
    const datos = AE_DATA[aeProfeActual] || AE_BELEN;
    const nombre = AE_NOMBRE[aeProfeActual]||aeProfeActual;
    const {jsPDF} = window.jspdf;
    const pdf = new jsPDF({unit:'px', format:[cv.width, cv.height], hotfixes:['px_scaling']});
    pdf.addImage(cv.toDataURL('image/png'), 'PNG', 0, 0, cv.width, cv.height);
    pdf.save(`MOVE_${nombre}_${datos.meses[aeMesActual]}_2026.pdf`);
}

// Imagen = mismo dashboard, descargado como PNG.
async function aeDescargarImagen(){
    const cv = await aeBuildDashboardCanvas(aeMesActual);
    const datos = AE_DATA[aeProfeActual] || AE_BELEN;
    const nombre = AE_NOMBRE[aeProfeActual]||aeProfeActual;
    const a=document.createElement('a');
    a.download=`MOVE_${nombre}_${datos.meses[aeMesActual]}_2026.png`;
    a.href=cv.toDataURL('image/png'); a.click();
}

// Arma el dashboard del MES SELECCIONADO para el profe activo. Imagen y PDF usan esto → idénticos.
async function aeBuildDashboardCanvas(mesIdx){
    const datos = AE_DATA[aeProfeActual] || AE_BELEN;
    if(mesIdx==null || mesIdx<0 || mesIdx>=datos.objetivos.length) mesIdx = datos.objetivos.length-1;
    const {d,prev,nuevos,nuevosPrev,adh,adhPrev,mesNombre,tareaPct,activosReales} = aePanelDatos(mesIdx);
    const nombre = AE_NOMBRE[aeProfeActual]||aeProfeActual;
    const sede = AE_SEDE[aeProfeActual]||datos.sede||'';
    const mesPrevN = mesIdx>0 ? (datos.meses[mesIdx-1]||'mes ant.') : 'mes ant.';

    try { await document.fonts.load('700 60px Poppins'); await document.fonts.load('400 24px Poppins'); await document.fonts.ready; } catch(e){}

    // Datos históricos de la propia página (altas 2025 vs 2026) para el gráfico comparativo
    if(sede!=='Bariloche' && !planData){ try{ await cargarTodo(); }catch(e){} }
    if(sede==='Bariloche' && (!bariData || !bariData.length)){ try{ await loadBariloche(); }catch(e){} }
    const hist = (function(){
        const idBP={belen:'belu',fer:'fer',enzo:'enzo',javi:'javi',agus:'agus'};
        const t=idBP[aeProfeActual];
        if(t && planData && planData.profes){
            const p=planData.profes.find(pp=>String(pp.nombre||'').toLowerCase().startsWith(t));
            if(p) return {a25:p.histAltas25||[], a26:p.histAltas26||[], hay25:true};
        }
        const idB={camila:'camila',carla:'carla',estefania:'estef'};
        const tb=idB[aeProfeActual];
        if(tb && bariData && bariData.length){
            const p=bariData.find(pp=>String(pp.nombre||'').toLowerCase().startsWith(tb));
            if(p) return {a25:[], a26:p.histAltas||[], hay25:false};
        }
        return {a25:[], a26:[], hay25:false};
    })();

    const W=1080,H=2200, cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    const x=cv.getContext('2d');
    const BG='#0f1420',CARD='#1a2132',CARD2='#1f293d',ACC='#10b981',WHITE='#fff',MUT='#94a3b8',RED='#ef4444',AMB='#f59e0b';
    const font=(s)=>`${s}px Poppins, 'Segoe UI', system-ui, sans-serif`;
    function rr(a,b,c,dd,r,fill){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+c,b,a+c,b+dd,r); x.arcTo(a+c,b+dd,a,b+dd,r); x.arcTo(a,b+dd,a,b,r); x.arcTo(a,b,a+c,b,r); x.closePath(); x.fillStyle=fill; x.fill(); }
    function txt(t,px,py,wt,sz,c,al){ x.font=`${wt} ${font(sz)}`; x.fillStyle=c; x.textAlign=al||'left'; x.textBaseline='alphabetic'; x.fillText(t,px,py); }
    function triUp(px,py,s,c){ x.beginPath(); x.moveTo(px,py+s); x.lineTo(px+s,py+s); x.lineTo(px+s/2,py); x.closePath(); x.fillStyle=c; x.fill(); }
    function triDn(px,py,s,c){ x.beginPath(); x.moveTo(px,py); x.lineTo(px+s,py); x.lineTo(px+s/2,py+s); x.closePath(); x.fillStyle=c; x.fill(); }
    function check(px,py,s,c){ x.beginPath(); x.moveTo(px,py+s*0.55); x.lineTo(px+s*0.4,py+s); x.lineTo(px+s,py); x.strokeStyle=c; x.lineWidth=6; x.lineCap='round'; x.lineJoin='round'; x.stroke(); }
    const meas=(t,wt,sz)=>{ x.font=`${wt} ${font(sz)}`; return x.measureText(t).width; };

    x.fillStyle=BG; x.fillRect(0,0,W,H);
    // Header
    x.fillStyle='#0b0f19'; x.fillRect(0,0,W,230);
    rr(60,58,98,98,24,ACC); txt('M',109,128,'700',74,WHITE,'center');
    txt('MOVE',185,116,'700',60,WHITE);
    txt('DASHBOARD DE DESEMPEÑO',188,168,'500',23,MUT);
    txt(nombre,W-60,116,'700',52,WHITE,'right');
    txt(`${sede}  ·  ${mesNombre} 2026`,W-60,170,'400',27,ACC,'right');

    // KPIs
    let y0=284; txt('Métricas del mes',60,y0+34,'700',40,WHITE);
    function dinfo(cur,pv,inv){ if(pv==null||cur==null) return{t:'sin previo',c:MUT,d:0}; let df=Math.round((cur-pv)*10)/10; if(df===0)return{t:'igual',c:MUT,d:0}; const bu=inv?df<0:df>0; return{t:`${df>0?'+':''}${df} vs ${mesPrevN}`,c:bu?ACC:RED,d:df>0?1:-1}; }
    const kpis=[
        {l:'SOCIOS ACTIVOS',v:String(activosReales??d.activos),c:(activosReales??d.activos)>=95?ACC:(activosReales??d.activos)>=70?AMB:RED,dl:activosReales!=null?{t:'padrón real de hoy',c:MUT,d:0}:dinfo(d.activos,prev?prev.activos:null,false)},
        {l:'% DESERCIÓN',v:(d.desercion??0)+'%',c:d.desercion<=10?ACC:d.desercion<=20?AMB:RED,dl:dinfo(d.desercion,prev?prev.desercion:null,true)},
        {l:'RETENCIÓN REAL',v:(d.retencion??0)+'%',c:d.retencion>=90?ACC:AMB,dl:dinfo(d.retencion,prev?prev.retencion:null,false)},
        {l:'RE-EVALUACIONES',v:(d.reeval??0)+'%',c:d.reeval>=30?ACC:d.reeval>=15?AMB:RED,dl:dinfo(d.reeval,prev?prev.reeval:null,false)},
        {l:'SOCIOS NUEVOS',v:String(nuevos),c:nuevos>=70?ACC:nuevos>=35?AMB:RED,dl:dinfo(nuevos,prev?nuevosPrev:null,false)},
        {l:'ADHERENCIA PROM.',v:adh!=null?adh+'%':'—',c:adh>=80?ACC:adh>=50?AMB:RED,dl:dinfo(adh,adhPrev,false)},
    ];
    const cw=(W-120-30)/2, ch=150, gx=30, gy=24, yb=y0+62;
    kpis.forEach((k,i)=>{
        const cx=60+(i%2)*(cw+gx), cy=yb+Math.floor(i/2)*(ch+gy);
        rr(cx,cy,cw,ch,18,CARD); rr(cx,cy,8,ch,4,k.c);
        txt(k.v,cx+40,cy+82,'700',62,k.c);
        txt(k.l,cx+42,cy+124,'500',22,MUT);
        const rx=cx+cw-30, dw=meas(k.dl.t,'400',21);
        if(k.dl.d>0) triUp(rx-dw-26,cy+112,16,k.dl.c);
        else if(k.dl.d<0) triDn(rx-dw-26,cy+112,16,k.dl.c);
        txt(k.dl.t,rx,cy+128,'400',21,k.dl.c,'right');
    });

    // ── Acumulado del año (YTD hasta el mes seleccionado) ──
    let rS=0,dS=0,eS=0,alt=0,cN=0;
    for(let i=0;i<=mesIdx && i<datos.objetivos.length;i++){
        const o=datos.objetivos[i], mv=(datos.movimiento&&datos.movimiento[i])||{};
        alt += mv.nuevos!=null?mv.nuevos:(mv.luciaTani||0);
        if(o.activos>0){ rS+=o.retencion||0; dS+=o.desercion||0; eS+=o.reeval||0; cN++; }
    }
    const ytdRet=cN?Math.round(rS/cN):0, ytdDes=cN?Math.round(dS/cN*10)/10:0, ytdRee=cN?Math.round(eS/cN*10)/10:0;
    let yytd=yb+3*(ch+gy)+2;
    rr(60,yytd,W-120,86,16,CARD2);
    txt('ACUMULADO DEL AÑO  ·  ENE–'+datos.meses[mesIdx],86,yytd+30,'700',20,ACC);
    const chips=[['Retención prom.',ytdRet+'%',ytdRet>=90?ACC:AMB],['Deserción prom.',ytdDes+'%',ytdDes<=10?ACC:AMB],['Re-eval prom.',ytdRee+'%',ytdRee>=30?ACC:AMB],['Altas totales',String(alt),WHITE]];
    const chW=(W-120)/4;
    chips.forEach((c,i)=>{ const cx=86+i*chW; txt(c[1],cx,yytd+72,'700',34,c[2]); txt(c[0],cx,yytd+46,'500',18,MUT); });

    // Objetivos anuales
    let yb2=yytd+86+26; txt('Objetivos anuales 2026',60,yb2+30,'700',36,WHITE);
    const metas=[
        {l:'Retención Real',v:d.retencion,meta:90,dir:'up',suf:'%'},
        {l:'% Deserción',v:d.desercion,meta:10,dir:'down',suf:'%'},
        {l:'Re-evaluaciones',v:d.reeval,meta:30,dir:'up',suf:'%'},
        {l:'Socios Nuevos',v:nuevos,meta:70,dir:'up',suf:''},
    ];
    let yy=yb2+58; const barW=W-120;
    metas.forEach(mt=>{
        let pct,ok;
        if(mt.dir==='down'){ ok=mt.v<=mt.meta; pct=mt.v<=mt.meta?100:Math.max(0,Math.min(100,Math.round((1-(mt.v-mt.meta)/(30-mt.meta))*100))); }
        else { ok=mt.v>=mt.meta; pct=Math.max(0,Math.min(100,Math.round(mt.v/mt.meta*100))); }
        const c=ok?ACC:pct>=60?AMB:RED;
        txt(mt.l,60,yy+8,'500',28,WHITE);
        const vt=`${mt.v}${mt.suf}`;
        if(ok){ txt(vt,W-60,yy+8,'700',28,c,'right'); check(W-60-meas(vt,'700',28)-40,yy-14,26,c); }
        else txt(`${vt}  (${pct}%)`,W-60,yy+8,'700',28,c,'right');
        rr(60,yy+30,barW,16,8,CARD2); if(pct>0) rr(60,yy+30,Math.max(16,barW*pct/100),16,8,c);
        yy+=80;
    });

    // ── Gráfico evolución mensual (retención vs deserción + altas) ──
    // ══ GRÁFICO 1 — Evolución de retención y deserción ══
    const GRID='#2a344a';
    const mm = datos.meses;
    const retS = datos.objetivos.map(o=>o.retencion||0);
    const desS = datos.objetivos.map(o=>o.desercion||0);

    let ycg=yy+6;
    rr(60,ycg,W-120,382,18,'#151c2b');
    txt('Evolución de retención y deserción',86,ycg+42,'700',32,WHITE);
    let lx=86, ly=ycg+62;
    x.fillStyle=ACC; x.beginPath(); x.arc(lx+8,ly+12,8,0,7); x.fill(); txt('Retención',lx+24,ly+18,'500',20,MUT); lx+=180;
    x.fillStyle=RED; x.beginPath(); x.arc(lx+8,ly+12,8,0,7); x.fill(); txt('Deserción',lx+24,ly+18,'500',20,MUT); lx+=180;
    x.strokeStyle='#7891aa'; x.lineWidth=3; for(let g=lx;g<lx+30;g+=9){ x.beginPath(); x.moveTo(g,ly+12); x.lineTo(g+4,ly+12); x.stroke(); } txt('Meta ret. 90%',lx+40,ly+18,'500',20,MUT);

    const px0=136,px1=W-90,py0=ly+50,py1=py0+230;
    const n=mm.length, sx=i=> n>1? px0+(px1-px0)*i/(n-1) : (px0+px1)/2, sy=v=> py1-(py1-py0)*Math.max(0,Math.min(100,v))/100;
    if(mesIdx>=0 && mesIdx<n){ const gx2=sx(mesIdx); x.strokeStyle='rgba(16,185,129,.30)'; x.lineWidth=28; x.beginPath(); x.moveTo(gx2,py0-8); x.lineTo(gx2,py1); x.stroke(); }
    x.strokeStyle=GRID; x.lineWidth=2;
    [0,25,50,75,100].forEach(g=>{ const gy2=sy(g); x.beginPath(); x.moveTo(px0,gy2); x.lineTo(px1,gy2); x.stroke(); txt(g+'%',px0-14,gy2+6,'400',17,MUT,'right'); });
    const ym=sy(90); x.strokeStyle='#7891aa'; x.lineWidth=2; for(let xd=px0;xd<px1;xd+=18){ x.beginPath(); x.moveTo(xd,ym); x.lineTo(xd+9,ym); x.stroke(); }
    mm.forEach((m,i)=> txt(m,sx(i),py1+30,i===mesIdx?'700':'500',i===mesIdx?21:19,i===mesIdx?ACC:MUT,'center'));
    function plot(arr,c,fill){
        // área suave bajo la curva
        x.beginPath(); arr.forEach((v,i)=>{ const px=sx(i),py=sy(v); i?x.lineTo(px,py):x.moveTo(px,py); });
        x.lineTo(sx(arr.length-1),py1); x.lineTo(sx(0),py1); x.closePath(); x.fillStyle=fill; x.fill();
        x.strokeStyle=c; x.lineWidth=5; x.lineJoin='round'; x.beginPath();
        arr.forEach((v,i)=>{ const px=sx(i),py=sy(v); i?x.lineTo(px,py):x.moveTo(px,py); }); x.stroke();
        arr.forEach((v,i)=>{ const px=sx(i),py=sy(v), r=i===mesIdx?11:7; x.fillStyle=BG; x.beginPath(); x.arc(px,py,r,0,7); x.fill(); x.strokeStyle=c; x.lineWidth=i===mesIdx?5:4; x.beginPath(); x.arc(px,py,r,0,7); x.stroke(); });
    }
    plot(retS,ACC,'rgba(16,185,129,.10)'); plot(desS,RED,'rgba(239,68,68,.10)');
    // etiquetas: arriba del punto, salvo que se salga del área (ahí van abajo)
    function lbl(arr,c,prefUp){
        arr.forEach((v,i)=>{
            const py=sy(v); let ly2 = prefUp ? py-17 : py+28;
            if(prefUp && ly2 < py0+14) ly2 = py+28;
            if(!prefUp && ly2 > py1-2) ly2 = py-17;
            txt(String(Math.round(v)),sx(i),ly2,'700',i===mesIdx?20:18,c,'center');
        });
    }
    lbl(retS,ACC,true); lbl(desS,RED,false);

    // ══ GRÁFICO 2 — Ingresos históricos: 2025 vs 2026 ══
    const yh=ycg+382+22;
    rr(60,yh,W-120,352,18,'#151c2b');
    txt('Ingresos históricos  ·  altas por mes',86,yh+42,'700',32,WHITE);

    const a26=hist.a26||[], a25=hist.a25||[];
    const hasta = Math.min(mesIdx, 11);
    const t26 = a26.slice(0,hasta+1).reduce((s,v)=>s+(v||0),0);
    const t25 = a25.slice(0,hasta+1).reduce((s,v)=>s+(v||0),0);
    if(hist.hay25 && t25>0){
        const dif=t26-t25, pct=Math.round(dif/t25*100), cc=dif>=0?ACC:RED;
        const rt=`${t26} vs ${t25}`;
        txt(rt,W-86,yh+38,'700',26,WHITE,'right');
        txt(`acum. ENE–${mm[hasta]||''}   ${dif>=0?'+':''}${pct}%`,W-86,yh+64,'600',19,cc,'right');
    } else if(t26>0){
        txt(`${t26} altas`,W-86,yh+38,'700',26,WHITE,'right');
        txt(`acum. ENE–${mm[hasta]||''}`,W-86,yh+64,'600',19,MUT,'right');
    }

    let hx=86, hy=yh+72;
    if(hist.hay25){ rr(hx,hy+4,16,16,4,'#94a3b8'); txt('2025',hx+26,hy+18,'500',20,MUT); hx+=120; }
    rr(hx,hy+4,16,16,4,ACC); txt('2026',hx+26,hy+18,'500',20,MUT);
    if(!hist.hay25) txt('Sede nueva en 2026 — sin base de comparación 2025',hx+110,hy+18,'400',18,'#6b7c94');

    const hb0=hy+46, hb1=hb0+186;
    const serieMax=Math.max(1,...a26.slice(0,12).map(v=>v||0),...(hist.hay25?a25.slice(0,12).map(v=>v||0):[0]));
    const nb=Math.max(1,Math.min(12,Math.max(a26.length,a25.length,mm.length)));
    const slot=(px1-px0)/nb;
    x.strokeStyle=GRID; x.lineWidth=2; x.beginPath(); x.moveTo(px0,hb1); x.lineTo(px1,hb1); x.stroke();
    if(!a26.some(v=>v>0) && !a25.some(v=>v>0)){
        txt('Sin datos históricos disponibles',W/2,hb0+100,'500',24,MUT,'center');
    } else {
        for(let i=0;i<nb;i++){
            const cxm=px0+slot*(i+0.5);
            const v26=a26[i]||0, v25=hist.hay25?(a25[i]||0):0;
            const bw2 = hist.hay25 ? Math.min(26,slot*0.34) : Math.min(46,slot*0.6);
            const gap  = hist.hay25 ? 3 : 0;
            if(hist.hay25){
                const h25=(hb1-hb0)*v25/serieMax;
                if(v25>0){ rr(cxm-bw2-gap, hb1-h25, bw2, Math.max(3,h25), 5, '#5a6e8c'); txt(String(v25),cxm-bw2/2-gap,hb1-h25-9,'600',15,'#8b9cb5','center'); }
                const h26=(hb1-hb0)*v26/serieMax;
                if(v26>0){ rr(cxm+gap, hb1-h26, bw2, Math.max(3,h26), 5, i===mesIdx?ACC:'#0d9668'); txt(String(v26),cxm+bw2/2+gap,hb1-h26-9,'700',16,i===mesIdx?ACC:WHITE,'center'); }
            } else {
                const h26=(hb1-hb0)*v26/serieMax;
                if(v26>0){ rr(cxm-bw2/2, hb1-h26, bw2, Math.max(3,h26), 6, i===mesIdx?ACC:'#0d9668'); txt(String(v26),cxm,hb1-h26-9,'700',16,i===mesIdx?ACC:WHITE,'center'); }
            }
            const lb=(mm[i]||['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][i]||'');
            txt(lb,cxm,hb1+26,i===mesIdx?'700':'500',i===mesIdx?18:16,i===mesIdx?ACC:MUT,'center');
        }
    }

    // Footer
    const yf=H-58; x.fillStyle=CARD2; x.fillRect(60,yf,W-120,3);
    txt('Cada socio, un atleta. Cada mes, un paso hacia una mejor versión de MOVE.',60,yf+36,'300',23,MUT);
    txt(new Date().toLocaleDateString('es-AR'),W-60,yf+36,'400',22,MUT,'right');

    return cv;
}
