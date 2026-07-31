# MOVE Manager — Manual de arquitectura

App de una sola página servida por GitHub Pages. **Sin build ni dependencias**: `index.html` carga el CSS y los módulos JS en orden con `<script src>` clásicos.

> **Regla de oro:** los scripts son clásicos (no ES modules) a propósito, para que todas las funciones sigan siendo globales y los `onclick` del HTML funcionen. **No agregar `type="module"`** ni cambiar el orden de carga.

## Estructura

```
index.html            marcado HTML + carga de css/js
css/styles.css        todos los estilos
js/01..11             módulos en orden de carga
docs/MANUAL.md        este archivo
```

## Módulos

### `js/01-config-datos.js` · Config y carga de datos

IDs de planillas, constantes globales, carga JSONP/gviz de Bolsón, Puelo y Bariloche.  
_267 líneas · 13 KB · 13 funciones_

<details><summary>Funciones</summary>

`setVsMonth`, `cargarTodo`, `loadPlanillas`, `loadBariloche`, `loadBariActivos`, `loadBariProfe`, `parseBariData`, `loadMetrics`, `parseMetrics`, `demoData`, `loadEncuestas`, `sheetLoad`, `parseSheet`

</details>

### `js/02-utils-nav.js` · Utilidades y navegación

Helpers de Chart.js (line/bar/pie/doughnut), formateo y cambio de sección del menú.  
_102 líneas · 9 KB · 17 funciones_

<details><summary>Funciones</summary>

`line`, `bar`, `barSimple`, `doughnut`, `pie`, `radar`, `hbar`, `npsDistBar`, `groupedBar`, `stackedBar`, `calcNPS`, `getSede`, `set`, `barNPSProfe`, `go`, `toggleSb`, `closeSb`

</details>

### `js/03-planillas-estado.js` · Sedes y Estado del Gym

Render de las 3 sedes, semáforo de deserción, gráficos comparativos y análisis estadístico (tendencia, campana de Gauss, homogeneidad, lag).  
_781 líneas · 46 KB · 36 funciones_

<details><summary>Funciones</summary>

`renderPlanillas`, `integrarBariEnOverview`, `profePorSede`, `renderBolson`, `renderPuelo`, `kpiCard`, `renderSedeTabs`, `renderProfeEnSede`, `renderBariloche`, `renderBariTabs`, `renderBariProfe`, `renderBariMesesTabs`, `renderBariMesKpis`, `renderEstado`, `renderEstadoCharts`, `statLabel`, `statUnit`, `statSerie`, `statLinReg`, `statMeanStd`, `renderEstadoStats`, `statSetMetric`, `statSetProfe`, `statDrawTrend`, `statRenderOutliers`, `statDrawGauss`, `statRenderHomog`, `statPearson`, `aeLagAnalysis`, `estadoToggleProfe`, `estadoSetMetric`, `estadoGridColor`, `estadoDrawLine`, `estadoDrawBar`, `estadoDrawPie`, `renderVersus`

</details>

### `js/04-encuestas.js` · Encuestas por sede

Encuestas de bienvenida y baja de Bolsón/Puelo y Bariloche.  
_708 líneas · 46 KB · 20 funciones_

<details><summary>Funciones</summary>

`textToScore`, `hbarScore`, `classifyMotivo`, `getCol`, `fmtDate`, `renderQuoteCard`, `svgGauge`, `npsInfo`, `desercInfo`, `servicioInfo`, `makeInterpCard`, `setBolsonTab`, `setBariTab`, `loadEncuestasBari`, `getNPSValStrict`, `getNPSVal`, `renderEncBariHero`, `renderEncBariCharts`, `renderEncBariBajas`, `renderEnc`

</details>

### `js/05-auditoria.js` · Auditoría de planes

Lectura de planillas, semáforos, hallazgos y generación del informe de auditorías.  
_1207 líneas · 80 KB · 38 funciones_

<details><summary>Funciones</summary>

`audSetSyncUI`, `audCargarHistorial`, `audGuardarAuditados`, `audGuardarHistorial`, `audExportar`, `audImportar`, `audS2C`, `audEvalLabel`, `audInitSelector`, `audSelProfe`, `audSetCant`, `audCargarAuditados`, `audCargarPlanilla`, `audParsearCSV`, `audProcesarSocios`, `audRenderTablaHoy`, `audAbrirSocio`, `audCloseFormModal`, `audSaveAudit`, `audFinalizarDia`, `audEstadoMeta`, `audEstadoSelect`, `audSetEstado`, `audAnotacion`, `audRenderHistorial`, `audSwitchTab`, `audInformeRenderCharts`, `audInformeInit`, `audInfTodos`, `audInfParse`, `audInfChip`, `audInformeGenerar`, `audInformePDF`, `audBorrar`, `audEditarAuditoria`, `audCerrarEdicion`, `audGuardarEdicion`, `audToggle`

</details>

### `js/06-dashboard-profesional.js` · Dashboard por profesional

Vista individual con métricas del profe.  
_113 líneas · 7 KB · 1 funciones_

<details><summary>Funciones</summary>

`audRenderDashboard`

</details>

### `js/07-recepcion.js` · Ventas Recepción

Control de ventas, panel de equipo, registro automático cada 5 días y gráficos de tendencia.  
_585 líneas · 37 KB · 29 funciones_

<details><summary>Funciones</summary>

`recepInit`, `recepSeleccionar`, `recepCargarDatos`, `recepParsear`, `recepRenderizar`, `recepCambiarMes`, `recepRenderMes`, `recepCargarServerLog`, `recepTeamLoad`, `recepTeamVentasMes`, `recepTeamMesIdx`, `recepPerRecep`, `recepRenderTeam`, `recepCheckDuplicados`, `recepLeerLog`, `recepGuardarLog`, `recepSnapshotCheck`, `recepRenderLog`, `recepLogCombinado`, `recepDiaDeMes`, `recepRenderCharts`, `recepSetTrend`, `recepSetComp`, `recepToggleComp`, `recepMetricVal`, `recepDrawTrend`, `recepCompMonthsAll`, `recepDrawComp`, `recepDrawAporte`

</details>

### `js/08-entrenadores.js` · Análisis Entrenadores

Lectura de las 8 planillas (objetivos, movimiento, tareas) y render de tablas.  
_696 líneas · 45 KB · 8 funciones_

<details><summary>Funciones</summary>

`aeParseCSV`, `aeGvizCSV`, `aeExportCSV`, `aeNum`, `aeParseActivosCierre`, `aeLoadLive`, `aeSelProfe`, `aeRender`

</details>

### `js/09-panel-mensaje-ia.js` · Panel ejecutivo + IA

Imagen/PDF del profe (canvas) y generador de mensajes con Groq.  
_476 líneas · 31 KB · 12 funciones_

<details><summary>Funciones</summary>

`aePanelDatos`, `aeRenderPanel`, `aeGetKey`, `aeGuardarKey`, `aeCerrarMsg`, `aeCargarMsgHist`, `aeGuardarMsgHist`, `aeGenerarMensaje`, `aeCopiarMsg`, `aeDescargarPDF`, `aeDescargarImagen`, `aeBuildDashboardCanvas`

</details>

### `js/10-informe.js` · Informe Consolidado

Resumen General editable + exportación a PDF.  
_371 líneas · 23 KB · 8 funciones_

<details><summary>Funciones</summary>

`informeInit`, `infSet`, `infEsc`, `infNum`, `infNormSede`, `informeGenerar`, `informeDescargarPDF`, `informeDescargarHTML`

</details>

### `js/11-encuestas-mensual.js` · Encuestas Análisis Mensual

Filtros por sede/profesional/tipo, NPS, motivos y arranque de la app.  
_262 líneas · 18 KB · 14 funciones_

<details><summary>Funciones</summary>

`encMatchProfe`, `encProfeMeta`, `encProfeLabel`, `encParseFecha`, `encMBuild`, `encMInit`, `encMScopeRows`, `encMBtn`, `encMRenderTipoBtns`, `encMRebuildControls`, `encMSetSede`, `encMSetProfe`, `encMSetTipo`, `encMRender`

</details>

## Dónde tocar cada cosa

| Si querés cambiar… | Archivo |
|---|---|
| Colores, tipografías, tarjetas, tablas | `css/styles.css` |
| Menú lateral, secciones, marcado de una pantalla | `index.html` |
| IDs de planillas, recepcionistas por sede, nombres de profes | `js/01-config-datos.js` |
| Semáforo de deserción, gráficos comparativos, campana de Gauss | `js/03-planillas-estado.js` |
| NPS, motivos de baja, cálculo de promotores/detractores | `js/04-encuestas.js` y `js/11-encuestas-mensual.js` |
| Auditorías y sus informes | `js/05-auditoria.js` |
| Ventas de recepción y proyección de cierre | `js/07-recepcion.js` |
| Métricas del profe leídas de la planilla | `js/08-entrenadores.js` |
| **Imagen/PDF del profe** y **prompt de la IA** | `js/09-panel-mensaje-ia.js` |
| Resumen General (informe consolidado) | `js/10-informe.js` |

## Datos clave

- **Planillas por profe**: `AE_SHEETS` (8 IDs) · sede en `AE_SEDE` · nombre en `AE_NOMBRE`
- **Recepcionistas por sede** (= socios nuevos): `AE_RECEP_SEDE`
  - El Bolsón: LUCIA / TANI · Lago Puelo: ARA / AZUL · Bariloche: KEILA / RUBEN
- **Pestaña Resumen Anual**: gid `328722414` en todas las planillas (mismo template)
- **Encuestas**: Bolsón/Puelo `SHEET_ENC_ID` · Bariloche `SHEET_BARI_ENC_ID` (hojas Bienvenida y Baja)
- **Persistencia** (auditorías e historial de mensajes): Gist `0894016bb00afb2f7fd49964896ee0db`
- **IA**: Groq, modelo `openai/gpt-oss-120b`, API key en `localStorage` (`move_groq_key`)

## Cómo trabajar sin romper nada

1. Editar **solo** el módulo que corresponde (ver tabla de arriba).
2. Validar sintaxis antes de subir: `node --check js/<archivo>.js`
3. Cambios quirúrgicos: no reescribir archivos enteros, reemplazar solo el bloque necesario.
4. Después de subir, esperar 2-3 min (GitHub Pages) y refrescar con **Ctrl+Shift+R**.

## Volver atrás

`index-monolito-backup.html` es la versión anterior en un solo archivo, funcionando.
Si algo falla, renombrarlo a `index.html` y todo vuelve a como estaba.
