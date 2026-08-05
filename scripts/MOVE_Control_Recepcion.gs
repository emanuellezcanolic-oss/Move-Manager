/**
 * MOVE · Control de carga diaria — Recepción
 * Se pega en CADA planilla de recepcionista (Extensiones → Apps Script).
 * No modifica ni borra nada existente: solo agrega 2 columnas al final y 2 hojas nuevas.
 */

// ═══════════════ CONFIG ═══════════════
// El mail y el estado (activo / vacaciones) se cargan desde la hoja "Config MOVE",
// que el script crea solo la primera vez. No hace falta tocar código para eso.
var CFG = {
  HOJA: 'Objetivos',              // hoja principal donde cargan (si se llama distinto, cambiar acá)
  HOJA_LOG: 'Auditoría',
  HOJA_RESUMEN: 'Resumen cumplimiento',
  HOJA_CFG: 'Config MOVE',
  HORA_ALERTA: 19,
  // Solo se usa para prellenar la hoja Config la primera vez
  PERSONAS: {
    '1fxCZ01-4qmKUt27GvLUBk_vIRR4Jym3W': {nombre:'Ara',   sede:'Lago Puelo'},
    '1XpEKL2YvVTfI0YzrWrTii8ZeuTbCTQcW': {nombre:'Azul',  sede:'Lago Puelo'},
    '1fxFcaVDcwyeJP01zuF9ngD7e_Il9b8KZ': {nombre:'Keila', sede:'Bariloche'},
    '1vjxGOb549gQV12gD3_oPZytimSsPTJEl': {nombre:'Rubén', sede:'Bariloche'},
    '1olzZWq8VgdUo63M6P6_U8Br8l-SPw_PO': {nombre:'Tani',  sede:'El Bolsón'},
    '1LTKqNKK9emHZ6GjH6Db80H_T96NUqFxc': {nombre:'Lucía', sede:'El Bolsón'}
  }
};

// Crea (si no existe) y lee la hoja de configuración editable
function _hojaConfig() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(CFG.HOJA_CFG);
  if (sh) return sh;

  var base = CFG.PERSONAS[ss.getId()] || {nombre: ss.getName(), sede: '—'};
  sh = ss.insertSheet(CFG.HOJA_CFG);
  sh.getRange('A1:B1').setValues([['CONFIGURACIÓN — MOVE','']])
    .setFontWeight('bold').setBackground('#1a2132').setFontColor('#ffffff');
  sh.getRange('A2:B9').setValues([
    ['Recepcionista', base.nombre],
    ['Sede', base.sede],
    ['Mail de la recepcionista', ''],
    ['Mail del coordinador', ''],
    ['Estado', 'Activo'],
    ['Vacaciones desde', ''],
    ['Vacaciones hasta', ''],
    ['Enviar aviso diario', 'SÍ']
  ]);
  sh.getRange('A2:A9').setFontWeight('bold');
  sh.getRange('B6').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Activo','Vacaciones','Licencia'], true).build());
  sh.getRange('B9').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['SÍ','NO'], true).build());
  sh.getRange('B7:B8').setNumberFormat('dd/MM/yyyy');
  sh.getRange('A11').setValue(
    'Si "Estado" es Vacaciones o Licencia, o la fecha de hoy cae entre "desde" y "hasta", no se envía el aviso diario.')
    .setFontSize(9).setFontColor('#64748b');
  sh.setColumnWidth(1, 200); sh.setColumnWidth(2, 240);
  return sh;
}

function _yo() {
  var sh = _hojaConfig();
  var v = sh.getRange('B2:B9').getValues();
  return {
    nombre: String(v[0][0] || '').trim(),
    sede:   String(v[1][0] || '').trim(),
    mail:   String(v[2][0] || '').trim(),
    coord:  String(v[3][0] || '').trim(),
    estado: String(v[4][0] || 'Activo').trim(),
    desde:  v[5][0] instanceof Date ? v[5][0] : null,
    hasta:  v[6][0] instanceof Date ? v[6][0] : null,
    avisar: String(v[7][0] || 'SÍ').trim().toUpperCase() !== 'NO'
  };
}

// ¿Está de licencia hoy? (por estado o por rango de fechas)
function _deVacaciones(yo) {
  var e = (yo.estado || '').toLowerCase();
  if (e.indexOf('vacacion') >= 0 || e.indexOf('licencia') >= 0) return true;
  if (yo.desde || yo.hasta) {
    var hoy = new Date(); hoy.setHours(12,0,0,0);
    var d = yo.desde ? new Date(yo.desde) : null; if (d) d.setHours(0,0,0,0);
    var h = yo.hasta ? new Date(yo.hasta) : null; if (h) h.setHours(23,59,59,0);
    if (d && h) return hoy >= d && hoy <= h;
    if (d && !h) return hoy >= d;
    if (!d && h) return hoy <= h;
  }
  return false;
}

function _tz(){ return SpreadsheetApp.getActive().getSpreadsheetTimeZone(); }
function _hoyStr(){ return Utilities.formatDate(new Date(), _tz(), 'yyyy-MM-dd'); }

// ═══════════════ 1 · TIMESTAMP POR FILA ═══════════════
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    var sh = e.range.getSheet();
    if (sh.getName() !== CFG.HOJA) return;

    var cols = _asegurarColumnas(sh);
    var fila = e.range.getRow();
    var col  = e.range.getColumn();
    if (fila < 2) return;
    if (col === cols.edit || col === cols.hoy) return;   // no loguear las propias columnas de control

    var ahora = new Date();
    sh.getRange(fila, cols.edit).setValue(ahora);
    sh.getRange(fila, cols.hoy).setValue('✅');

    _log(e, sh, fila, col, ahora);
  } catch (err) {
    console.error('onEdit: ' + err);
  }
}

function _asegurarColumnas(sh) {
  var ultima = sh.getLastColumn();
  var enc = sh.getRange(1, 1, 1, Math.max(ultima, 1)).getValues()[0];
  var cEdit = 0, cHoy = 0;
  for (var i = 0; i < enc.length; i++) {
    var t = String(enc[i]).trim().toLowerCase();
    if (t === 'última edición') cEdit = i + 1;
    if (t === 'cargó hoy') cHoy = i + 1;
  }
  if (!cEdit) {
    cEdit = sh.getLastColumn() + 1;
    sh.getRange(1, cEdit).setValue('Última edición');
    sh.getRange(2, cEdit, Math.max(sh.getMaxRows() - 1, 1), 1).setNumberFormat('dd/MM/yyyy HH:mm');
    sh.hideColumns(cEdit);
  }
  if (!cHoy) {
    cHoy = sh.getLastColumn() + 1;
    sh.getRange(1, cHoy).setValue('Cargó hoy');
  }
  return {edit: cEdit, hoy: cHoy};
}

// ═══════════════ 2 · LOG DE AUDITORÍA ═══════════════
function _log(e, sh, fila, col, ahora) {
  var ss = SpreadsheetApp.getActive();
  var log = ss.getSheetByName(CFG.HOJA_LOG);
  if (!log) {
    log = ss.insertSheet(CFG.HOJA_LOG);
    log.appendRow(['Fecha y hora','Usuario','Métrica','Celda','Valor anterior','Valor nuevo','Diferencia','Observación']);
    log.getRange(1,1,1,8).setFontWeight('bold').setBackground('#1a2132').setFontColor('#ffffff');
    log.setFrozenRows(1);
    log.setColumnWidth(1,140); log.setColumnWidth(3,190); log.setColumnWidth(8,220);
  }

  var metrica = String(sh.getRange(fila, 1).getValue() || '').trim() || ('fila ' + fila);
  var anterior = (e.oldValue === undefined) ? '' : e.oldValue;
  var nuevo = e.range.getValue();

  // La diferencia es lo que importa: distingue "cargó 1 mensaje" de "cargó 100".
  var nA = parseFloat(String(anterior).replace(',', '.'));
  var nN = parseFloat(String(nuevo).replace(',', '.'));
  var dif = '', obs = '';
  if (!isNaN(nN)) {
    var base = isNaN(nA) ? 0 : nA;
    dif = nN - base;
    if (dif > 0) obs = 'Sumó ' + dif;
    else if (dif < 0) obs = 'RESTÓ ' + Math.abs(dif) + ' — revisar';
    else obs = 'Sin cambio de valor';
  } else if (e.oldValue === undefined) {
    obs = 'Edición múltiple o pegado (sin valor anterior)';
  }

  log.appendRow([
    ahora,
    (e.user && e.user.getEmail()) ? e.user.getEmail() : 'desconocido',
    metrica,
    e.range.getA1Notation(),
    anterior,
    nuevo,
    dif,
    obs
  ]);
  log.getRange(log.getLastRow(), 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
}

// ═══════════════ 3 · ESTADO DIARIO ═══════════════
function actualizarCargoHoy() {
  var sh = SpreadsheetApp.getActive().getSheetByName(CFG.HOJA);
  if (!sh) return;
  var cols = _asegurarColumnas(sh);
  var n = sh.getLastRow() - 1;
  if (n < 1) return;

  var fechas = sh.getRange(2, cols.edit, n, 1).getValues();
  var hoy = _hoyStr();
  var out = fechas.map(function (f) {
    var v = f[0];
    if (!v || !(v instanceof Date)) return [''];
    return [Utilities.formatDate(v, _tz(), 'yyyy-MM-dd') === hoy ? '✅' : '❌'];
  });
  sh.getRange(2, cols.hoy, n, 1).setValues(out);
}

// ═══════════════ 4 · ALERTA DIARIA ═══════════════
function alertaDiaria() {
  actualizarCargoHoy();
  var yo = _yo();
  if (new Date().getDay() === 0) return;     // domingo no
  if (!yo.avisar) return;                    // aviso desactivado en la hoja Config
  if (_deVacaciones(yo)) return;             // de vacaciones o licencia
  if (_cargoAlgoHoy()) return;               // ya cargó, no molestar

  var asunto = 'MOVE · Falta cargar la planilla de hoy';
  var cuerpo =
    'Hola ' + yo.nombre + ',\n\n' +
    'Todavía no figura carga en tu planilla de hoy (' +
    Utilities.formatDate(new Date(), _tz(), 'dd/MM/yyyy') + ').\n\n' +
    'Acordate de completar antes de terminar el turno: ventas, planes de 3 meses, indumentaria, ' +
    'mensajes enviados y clases de prueba.\n\n' +
    'Planilla: ' + SpreadsheetApp.getActive().getUrl() + '\n\n' +
    'Gracias!\nEmanuel · Coordinación MOVE';

  var dest = [];
  if (yo.mail) dest.push(yo.mail);
  if (yo.coord) dest.push(yo.coord);
  if (!dest.length) return;                  // sin mails cargados en la hoja Config
  MailApp.sendEmail(dest.join(','), asunto, cuerpo);
}

function _cargoAlgoHoy() {
  var sh = SpreadsheetApp.getActive().getSheetByName(CFG.HOJA);
  if (!sh) return true;
  var cols = _asegurarColumnas(sh);
  var n = sh.getLastRow() - 1;
  if (n < 1) return true;
  var fechas = sh.getRange(2, cols.edit, n, 1).getValues();
  var hoy = _hoyStr();
  for (var i = 0; i < fechas.length; i++) {
    var v = fechas[i][0];
    if (v instanceof Date && Utilities.formatDate(v, _tz(), 'yyyy-MM-dd') === hoy) return true;
  }
  return false;
}

// ═══════════════ 5 · RESUMEN SEMANAL ═══════════════
function resumenSemanal() {
  var ss = SpreadsheetApp.getActive();
  var log = ss.getSheetByName(CFG.HOJA_LOG);
  var yo = _yo();
  var res = ss.getSheetByName(CFG.HOJA_RESUMEN);
  if (!res) {
    res = ss.insertSheet(CFG.HOJA_RESUMEN);
    res.appendRow(['Semana','Recepcionista','Sede','Días hábiles','Días cargados','% cumplimiento','Detalle']);
    res.getRange(1,1,1,7).setFontWeight('bold').setBackground('#1a2132').setFontColor('#ffffff');
    res.setFrozenRows(1); res.setColumnWidth(7, 260);
  }

  // lunes a sábado de la semana en curso
  var hoy = new Date();
  var lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  lunes.setHours(0,0,0,0);

  var dias = [], cargados = {};
  for (var i = 0; i < 6; i++) {
    var d = new Date(lunes); d.setDate(lunes.getDate() + i);
    if (d > hoy) break;
    dias.push(Utilities.formatDate(d, _tz(), 'yyyy-MM-dd'));
  }

  if (log && log.getLastRow() > 1) {
    var datos = log.getRange(2, 1, log.getLastRow() - 1, 1).getValues();
    datos.forEach(function (r) {
      var v = r[0];
      if (v instanceof Date) cargados[Utilities.formatDate(v, _tz(), 'yyyy-MM-dd')] = true;
    });
  }

  var hechos = dias.filter(function (d) { return cargados[d]; });
  var pct = dias.length ? Math.round(hechos.length / dias.length * 100) : 0;
  var detalle = dias.map(function (d) {
    return Utilities.formatDate(new Date(d + 'T12:00:00'), _tz(), 'EEE') + (cargados[d] ? ' ✅' : ' ❌');
  }).join('  ');

  var semana = Utilities.formatDate(lunes, _tz(), 'dd/MM') + ' al ' +
               Utilities.formatDate(new Date(lunes.getTime() + 5*86400000), _tz(), 'dd/MM/yyyy');

  res.appendRow([semana, yo.nombre, yo.sede, dias.length, hechos.length, pct + '%', detalle]);
  var f = res.getLastRow();
  res.getRange(f, 6).setFontWeight('bold')
     .setFontColor(pct >= 90 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444');

  SpreadsheetApp.getUi().alert('Resumen de la semana\n\n' + yo.nombre + ': ' + hechos.length +
    ' de ' + dias.length + ' días cargados (' + pct + '%).\n\n' + detalle);
}

// ═══════════════ MENÚ E INSTALACIÓN ═══════════════
function onOpen() {
  SpreadsheetApp.getUi().createMenu('MOVE')
        .addItem('Abrir configuración', 'abrirConfig')
    .addItem('Actualizar "Cargó hoy"', 'actualizarCargoHoy')
    .addItem('Resumen semanal', 'resumenSemanal')
    .addSeparator()
    .addItem('Instalar automatismos', 'instalarTriggers')
    .addToUi();
}

function abrirConfig() {
  var sh = _hojaConfig();
  SpreadsheetApp.getActive().setActiveSheet(sh);
  SpreadsheetApp.getUi().alert('Completá el mail de la recepcionista y el tuyo.\n\n' +
    'Si se toma vacaciones, poné Estado = Vacaciones (o cargá el rango de fechas) y no le van a llegar avisos.');
}

function instalarTriggers() {
  var ss = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    var f = t.getHandlerFunction();
    if (f === 'onEdit' || f === 'alertaDiaria' || f === 'actualizarCargoHoy') ScriptApp.deleteTrigger(t);
  });

  ScriptApp.newTrigger('onEdit').forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger('alertaDiaria').timeBased().atHour(CFG.HORA_ALERTA).everyDays(1).create();
  ScriptApp.newTrigger('actualizarCargoHoy').timeBased().atHour(6).everyDays(1).create();

  _hojaConfig();
  _asegurarColumnas(ss.getSheetByName(CFG.HOJA));
  actualizarCargoHoy();
  SpreadsheetApp.getUi().alert('Listo.\n\nSe instalaron:\n· Registro de ediciones (en vivo)\n· Aviso diario a las ' +
    CFG.HORA_ALERTA + ':00 si no cargó\n· Actualización de "Cargó hoy" a las 6:00');
}
