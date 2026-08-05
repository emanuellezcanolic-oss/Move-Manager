# Scripts de Google Apps Script — MOVE

## MOVE_Control_Recepcion.gs
Control de carga diaria de las planillas de recepción.

**Instalación** (una vez por cada una de las 6 planillas):
1. Abrir la planilla de la recepcionista → **Extensiones → Apps Script**
2. Borrar el contenido y pegar `MOVE_Control_Recepcion.gs`
3. Guardar y recargar la planilla
4. Menú **MOVE → Instalar automatismos** (autorizar permisos la primera vez)
5. Menú **MOVE → Abrir configuración** y completar los mails

**Hoja "Config MOVE"** (se crea sola): mail de la recepcionista, mail del coordinador,
estado (Activo / Vacaciones / Licencia), rango de fechas de vacaciones y si se envía el aviso diario.

**Qué hace**
- Columna oculta `Última edición` con fecha y hora por fila
- Hoja `Auditoría`: fecha, usuario, métrica, celda, valor anterior, valor nuevo y **diferencia**
- Columna `Cargó hoy` (✅/❌), se refresca a las 6:00 y en cada edición
- Aviso por mail a las 19:00 si no cargó (no envía domingos ni durante vacaciones)
- `Resumen semanal` desde el menú: % de días cargados sobre los hábiles

**Importante**: si la hoja donde cargan no se llama `Objetivos`, cambiar `CFG.HOJA` al inicio del script.
No modifica columnas ni fórmulas existentes: solo agrega 2 columnas al final y hojas nuevas.
