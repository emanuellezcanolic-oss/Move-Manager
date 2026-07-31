// ══════════════════════════════════════════════════
// CHART HELPERS — keep exactly
// ══════════════════════════════════════════════════
// Etiquetas de datos sutiles — plugin propio, se aplica solo a los gráficos que lo piden
const SUBTLE_LABELS = {
    id:'subtleLabels',
    afterDatasetsDraw(chart){
        const ctx=chart.ctx, esBar=chart.config.type==='bar', multi=chart.data.datasets.length>1;
        ctx.save();
        ctx.font='600 10px Inter, system-ui, sans-serif';
        ctx.textAlign='center';
        chart.data.datasets.forEach((ds,di)=>{
            const meta=chart.getDatasetMeta(di);
            if(meta.hidden) return;
            const col = esBar ? ds.backgroundColor : ds.borderColor;
            ctx.fillStyle = (typeof col==='string') ? col : '#64748b';
            ctx.globalAlpha = .7;
            meta.data.forEach((pt,i)=>{
                const v=ds.data[i];
                if(v==null||v===0||isNaN(v)) return;
                const abajo = !esBar && multi && di===0;   // 1ra serie abajo, resto arriba → evita choques
                ctx.textBaseline = abajo?'top':'bottom';
                ctx.fillText(Math.round(v), pt.x, abajo? pt.y+7 : pt.y-7);
            });
        });
        ctx.restore();
    }
};
function line(id,labels,sets){if(CH[id])CH[id].destroy();CH[id]=new Chart(document.getElementById(id),{type:'line',data:{labels,datasets:sets.map(s=>({label:s.l,data:s.d,borderColor:s.c,backgroundColor:s.c+'22',borderWidth:2.5,pointRadius:4,tension:.3,fill:false}))},plugins:[SUBTLE_LABELS],options:{responsive:true,interaction:{mode:'index',intersect:false},layout:{padding:{top:14}},plugins:{legend:{position:'bottom',labels:{boxWidth:11}}},scales:{y:{beginAtZero:true,grid:{color:'#f1f5f9'}},x:{grid:{display:false}}}}});}
function bar(id,labels,sets){if(CH[id])CH[id].destroy();CH[id]=new Chart(document.getElementById(id),{type:'bar',data:{labels,datasets:sets.map(s=>({label:s.l,data:s.d,backgroundColor:s.c+'cc',borderRadius:5,borderSkipped:false}))},plugins:[SUBTLE_LABELS],options:{responsive:true,layout:{padding:{top:14}},plugins:{legend:{position:'bottom',labels:{boxWidth:11}}},scales:{y:{beginAtZero:true,grid:{color:'#f1f5f9'}},x:{grid:{display:false}}}}});}
function barSimple(id,labels,data,colors){if(CH[id])CH[id].destroy();CH[id]=new Chart(document.getElementById(id),{type:'bar',data:{labels,datasets:[{data,backgroundColor:colors,borderRadius:7}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{min:-100,max:100,grid:{color:'#f1f5f9'}},x:{grid:{display:false}}}}});}
function doughnut(id,data,colors){if(CH[id])CH[id].destroy();CH[id]=new Chart(document.getElementById(id),{type:'doughnut',data:{datasets:[{data,backgroundColor:colors,borderWidth:0}]},options:{cutout:'72%',responsive:true,plugins:{legend:{display:false},tooltip:{enabled:false}}}});}
function pie(id,labels,data){if(CH[id])CH[id].destroy();const pal=['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#3b82f6','#f97316','#06b6d4'];CH[id]=new Chart(document.getElementById(id),{type:'pie',data:{labels,datasets:[{data,backgroundColor:pal.slice(0,labels.length)}]},options:{responsive:true,plugins:{legend:{position:'right',labels:{boxWidth:11,font:{size:11}}}}}});}
function radar(id,labels,data){if(CH[id])CH[id].destroy();CH[id]=new Chart(document.getElementById(id),{type:'radar',data:{labels,datasets:[{label:'Experiencia (1-10)',data,backgroundColor:'rgba(99,102,241,.15)',borderColor:'#6366f1',pointBackgroundColor:'#6366f1'}]},options:{responsive:true,scales:{r:{min:0,max:10,ticks:{stepSize:2}}}}});}
function hbar(id,labels,data,colors){if(CH[id])CH[id].destroy();CH[id]=new Chart(document.getElementById(id),{type:'bar',data:{labels,datasets:[{data,backgroundColor:colors,borderRadius:5,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>` ${ctx.raw} resp.`}}},scales:{x:{beginAtZero:true,grid:{color:'#f1f5f9'},ticks:{font:{size:11}}},y:{grid:{display:false},ticks:{font:{size:11},color:'#374151'}}}}});}
function npsDistBar(id,pPct,nPct,dPct){if(CH[id])CH[id].destroy();CH[id]=new Chart(document.getElementById(id),{type:'bar',data:{labels:[''],datasets:[{label:'Promotores (9-10)',data:[pPct],backgroundColor:'#10b981'},{label:'Pasivos (7-8)',data:[nPct],backgroundColor:'#f59e0b'},{label:'Detractores (0-6)',data:[dPct],backgroundColor:'#ef4444'}]},options:{indexAxis:'y',responsive:true,plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}},tooltip:{callbacks:{label:ctx=>` ${ctx.raw}%`}}},scales:{x:{stacked:true,min:0,max:100,grid:{color:'#f1f5f9'},ticks:{callback:v=>v+'%',font:{size:11}}},y:{stacked:true,display:false}}}});}
function groupedBar(id,labels,ds){if(CH[id])CH[id].destroy();CH[id]=new Chart(document.getElementById(id),{type:'bar',data:{labels,datasets:ds},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{boxWidth:11,font:{size:11}}}},scales:{y:{min:0,max:10,grid:{color:'#f1f5f9'},ticks:{stepSize:2}},x:{grid:{display:false},ticks:{font:{size:10},maxRotation:30}}}}});}
function stackedBar(id,labels,ds){if(CH[id])CH[id].destroy();CH[id]=new Chart(document.getElementById(id),{type:'bar',data:{labels,datasets:ds},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{boxWidth:11,font:{size:11}}}},scales:{x:{stacked:true,grid:{display:false},ticks:{font:{size:10},maxRotation:30}},y:{stacked:true,beginAtZero:true,grid:{color:'#f1f5f9'}}}}});}

// ══════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════
function calcNPS(arr){if(!arr.length)return 0;return Math.round(((arr.filter(n=>n>=9).length-arr.filter(n=>n<=6).length)/arr.length)*100);}
function getSede(prof){for(const[k,v]of Object.entries(SEDE_MAP)){if(prof.includes(k))return v;}return '\u2014';}
function set(id,val){const el=document.getElementById(id);if(el)el.textContent=val;}

// NPS per-profe bar with always-visible value labels (handles 0 and negatives)
function barNPSProfe(id,labels,data,colors){
    if(CH[id])CH[id].destroy();
    CH[id]=new Chart(document.getElementById(id),{
        type:'bar',
        data:{labels,datasets:[{data,backgroundColor:colors,borderRadius:7}]},
        options:{
            responsive:true,
            plugins:{
                legend:{display:false},
                tooltip:{callbacks:{label:ctx=>` NPS: ${ctx.raw}`}}
            },
            scales:{y:{min:-100,max:100,grid:{color:'#f1f5f9'}},x:{grid:{display:false}}}
        },
        plugins:[{
            id:'npsLabels',
            afterDatasetsDraw(chart){
                const {ctx,data:d,scales:{y}}=chart;
                ctx.save();
                d.datasets[0].data.forEach((val,i)=>{
                    const bar=chart.getDatasetMeta(0).data[i];
                    const yPos = val>=0 ? bar.y-6 : bar.y+14;
                    ctx.fillStyle='#1e293b';
                    ctx.font='bold 12px system-ui,sans-serif';
                    ctx.textAlign='center';
                    ctx.fillText(val,bar.x,yPos);
                });
                ctx.restore();
            }
        }]
    });
}

// ══════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════
const META = {
    overview:  {title:'Overview',            sub:'Visi\u00f3n general de MOVE'},
    bolson:    {title:'El Bols\u00f3n',        sub:'Planilla y profesionales'},
    puelo:     {title:'Lago Puelo',            sub:'Planilla y profesionales'},
    bariloche: {title:'Bariloche',             sub:'Planilla y profesionales'},
    estado:    {title:'Estado del Gym',        sub:'Sem\u00e1foro de deserci\u00f3n por profesional'},
    versus:    {title:'2025 vs 2026',          sub:'Comparaci\u00f3n de altas \u2014 Bols\u00f3n y Lago Puelo'},
    encuestas: {title:'Encuestas de Bienvenida', sub:'NPS & satisfacci\u00f3n de nuevos socios'},
    bajas:     {title:'An\u00e1lisis de Bajas',  sub:'Encuestas de ex-socios'},
    'bari-enc':  {title:'Bariloche \u2014 Encuestas', sub:'Bienvenida & An\u00e1lisis de Bajas sede Bariloche'},
    'bolson-enc':{title:'Bols\u00f3n & Lago Puelo \u2014 Encuestas', sub:'Bienvenida & An\u00e1lisis de Bajas'},
    'auditoria': {title:'Auditor\u00eda', sub:'Supervisi\u00f3n de entrenadores \u00b7 Metodolog\u00eda MOVE'},
    'recepcion': {title:'Ventas Recepci\u00f3n', sub:'Performance de ventas y avance de carga \u00b7 Equipo de recepci\u00f3n MOVE'},
    'analisis-entrenadores': {title:'An\u00e1lisis Entrenadores', sub:'Objetivos, tareas y retenci\u00f3n \u00b7 Datos reales 2026'},
    'informe':   {title:'Resumen General', sub:'Informe consolidado \u00b7 Bols\u00f3n, Lago Puelo y Bariloche \u00b7 Editable + PDF'},
    'enc-mensual':{title:'Encuestas \u2014 An\u00e1lisis Mensual', sub:'NPS y respuestas por mes \u00b7 Filtr\u00e1 y compar\u00e1 por sede, profesional o mes'},
};
function go(sec){
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    const el=document.getElementById('section-'+sec);
    if(el)el.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n=>{
        const oc=n.getAttribute('onclick')||'';
        if(oc.includes("'"+sec+"'"))n.classList.add('active');
    });
    if(META[sec]){set('topTitle',META[sec].title);set('topSub',META[sec].sub);}
    if(sec==='encuestas'||sec==='bajas'||sec==='bolson-enc') loadEncuestas();
    if(sec==='bari-enc') loadEncuestasBari();
    if(sec==='auditoria'){ audInitSelector(); }
    if(sec==='recepcion'){ recepInit(); }
    if(sec==='analisis-entrenadores'){ aeSelProfe(aeProfeActual); }
    if(sec==='informe'){ informeInit(); }
    if(sec==='enc-mensual'){ encMInit(); }
    closeSb();
}
function toggleSb(){
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sbOverlay').classList.toggle('open');
}
function closeSb(){
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sbOverlay').classList.remove('open');
}
