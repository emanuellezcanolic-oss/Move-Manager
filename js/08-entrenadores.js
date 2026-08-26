// ══════════════════════════════════════════════════════════
// ANÁLISIS ENTRENADORES — Datos reales planilla
// ══════════════════════════════════════════════════════════
const AE_BELEN = {
    meses:['ENE','FEB','MAR','ABR','MAY','JUN'],
    mesesFull:['Enero','Febrero','Marzo','Abril','Mayo','Junio'],
    objetivos:[
        {activos:84,  desercion:25.0, tarea:0,   reeval:23.81, puntaje:70,  retencion:75.0},
        {activos:89,  desercion:22.5, tarea:100,  reeval:20.22, puntaje:90,  retencion:77.5},
        {activos:105, desercion:7.6,  tarea:83,   reeval:25.71, puntaje:105, retencion:92.4},
        {activos:104, desercion:6.7,  tarea:67,   reeval:33.65, puntaje:153, retencion:93.3},
        {activos:95,  desercion:4.2,  tarea:100,  reeval:35.79, puntaje:161, retencion:95.8},
        {activos:6,   desercion:0.0,  tarea:0,    reeval:16.67, puntaje:50,  retencion:100},
    ],
    movimiento:[
        {renueva:79, luciaTani:19, liberado:5, vacaciones:2, deriv:8,  baja:21},
        {renueva:84, luciaTani:9,  liberado:5, vacaciones:4, deriv:14, baja:20},
        {renueva:100,luciaTani:13, liberado:5, vacaciones:2, deriv:5,  baja:8},
        {renueva:100,luciaTani:9,  liberado:4, vacaciones:5, deriv:3,  baja:7},
        {renueva:90, luciaTani:2,  liberado:5, vacaciones:3, deriv:2,  baja:4},
        {renueva:4,  luciaTani:2,  liberado:2, vacaciones:1, deriv:0,  baja:0},
    ],
    tareas:[
        [], // ENE — sin datos
        [
            {desc:'Completar el perfil de los Socios en la APP en un 50%', obs:'—', ok:true},
            {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'Espinosa Ana, Espinosa Luis, Falca Alicia, Ayala Héctor, Bronzi Valentín, Silvina Rodríguez, López Verónica, Axel Meier, Luján Wagner, Perontto Martha', ok:true},
            {desc:'Agendar 10 evaluaciones con 10 socios en el futuro', obs:'Sabrina Rubín, Miriam Garavaglia, Virginia López, Cristina Rimoldi, Emiliano Rearte, Héctor Ayala, Abril Zasgame, Oscar Panomarenko, Gustavo Guffanti', ok:true},
            {desc:'Tener el 70% de los socios con alguna evaluación cargada en la APP', obs:'listo', ok:true},
            {desc:'Que asistan al menos 5 socios de tu turno a "Iluminemos al piltri"', obs:'Verua Antonella, Sofía Doffman, Borghi Facundo', ok:true},
            {desc:'Subir una Foto entrenando y etiquetar a MOVE', obs:'listo', ok:true},
        ],
        [
            {desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'—', ok:false},
            {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'Salamida Lia, Lewin Mariana, Reyes Claudia, Crovetto Carla, Juárez Rosario, Baschfischer Ernesto, Santiago Niño, Flavio Tuvo, Verónica Mendieta, Guzmán Mari', ok:true},
            {desc:'Agendar 10 evaluaciones con 10 socios en el futuro', obs:'Bruno Bedetti, Cachi Vera, Buzzo Claudia, Buzzo Francisco, Nicolás Morelli, Mónica Rodríguez, Salinas César, Máximo Frusteri, Verua Anto, Maggio Oscar', ok:true},
            {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'Oscar Maggio, Susana Lorusso, Julia Magdalena, Ernesto Baschfischer, Gelinger Antonio, Jambrina Norma, Graciela Giulianeli', ok:true},
            {desc:'Asistir a la capacitación interna', obs:'29/04/2026', ok:true},
            {desc:'Subir una Foto entrenando y etiquetar a MOVE', obs:'—', ok:true},
        ],
        [
            {desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'—', ok:false},
            {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'Bernardo, Luis Espinosa, Anto Verua, Chávez Patricia, Tuvo Flavio, Virginia López, Sergio Rojo', ok:true},
            {desc:'Evaluar con el encoder a 5 socios como mínimo', obs:'Luis Espinosa, Antonela Verua, Emiliano Criado, Romina Mollo, Oscar Panomarenko', ok:true},
            {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'—', ok:false},
            {desc:'Asistir a una capacitación interna', obs:'26/04/2026', ok:true},
            {desc:'Que 10 socios como mínimo tengan cargadas rutinas fuera del gimnasio', obs:'Ayala Héctor, Claudia Aguilar, Luna Zeid, Fernanda Horiszny, Abraham Javier, Eva Zapata, Patricia Chaves', ok:true},
        ],
        [
            {desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'completado', ok:true},
            {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'completado', ok:true},
            {desc:'Asistir a una capacitación interna', obs:'10/05/2026', ok:true},
            {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'completado', ok:true},
            {desc:'Que 10 socios como mínimo tengan cargadas rutinas fuera del gimnasio', obs:'Mora Baby, Claudia Reyes, Magdalena Julia, Falca Alicia, Guilaneli Graciela, Zasgame Abril, Silva Stella, Turco Haydee, Lorusso Susana, Repezza Rocío', ok:true},
            {desc:'¿Qué aspecto del trabajo en equipo te gustaría mejorar en Move?', obs:'—', ok:true},
        ],
        [], // JUN — sin datos cargados
    ],
};

const AE_FER = {
    nombre:'Fer', sede:'El Bolsón',
    meses:['ENE','FEB','MAR','ABR','MAY','JUN'],
    mesesFull:['Enero','Febrero','Marzo','Abril','Mayo','Junio'],
    objetivos:[
        {activos:54, desercion:24.1, tarea:0,   reeval:3.70,  puntaje:60,  retencion:75.9},
        {activos:61, desercion:41.0, tarea:33,  reeval:8.20,  puntaje:65,  retencion:59.0},
        {activos:75, desercion:16.0, tarea:33,  reeval:22.67, puntaje:80,  retencion:84.0},
        {activos:76, desercion:26.3, tarea:33,  reeval:25.00, puntaje:60,  retencion:73.7},
        {activos:70, desercion:20.0, tarea:50,  reeval:38.57, puntaje:121, retencion:80.0},
        {activos:4,  desercion:0.0,  tarea:0,   reeval:50.00, puntaje:53,  retencion:100},
    ],
    movimiento:[
        {renueva:53, luciaTani:29, liberado:1, vacaciones:3, deriv:13, baja:13},
        {renueva:59, luciaTani:16, liberado:2, vacaciones:2, deriv: 9, baja:25},
        {renueva:72, luciaTani:26, liberado:3, vacaciones:0, deriv: 6, baja:12},
        {renueva:73, luciaTani:17, liberado:3, vacaciones:1, deriv:11, baja:20},
        {renueva:68, luciaTani:19, liberado:2, vacaciones:3, deriv: 2, baja:14},
        {renueva: 4, luciaTani: 0, liberado:0, vacaciones:0, deriv: 0, baja: 0},
    ],
    tareas:[
        [], // ENE — sin datos
        [ // FEB — 33%
            {desc:'Completar el perfil de los Socios en la APP en un 50%', obs:'—', ok:false},
            {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'—', ok:false},
            {desc:'Agendar 10 evaluaciones con 10 socios en el futuro', obs:'Martin Lopez, Maca Dominguez, Inti Fernandez, David (holandés), Vivas Juan Manuel', ok:true},
            {desc:'Tener el 70% de los socios con alguna evaluación cargada en la APP', obs:'—', ok:false},
            {desc:'Que asistan al menos 5 socios a "Iluminemos al piltri"', obs:'—', ok:false},
            {desc:'Subir una Foto entrenando y etiquetar a MOVE', obs:'—', ok:true},
        ],
        [ // MAR — 33%
            {desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'—', ok:false},
            {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'—', ok:false},
            {desc:'Agendar 10 evaluaciones con 10 socios en el futuro', obs:'Mateo López, Enzo Braccamonte, Carolina Hernández, Mora Della Torre, Constanza Dangelo, Marcelo Perdomo, Gaia Bruno, Patricia Pérez, Paula Gagliardo, Irma Cuiza, Tony Britez', ok:true},
            {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'—', ok:false},
            {desc:'Asistir a la capacitación interna', obs:'—', ok:false},
            {desc:'Subir una Foto entrenando y etiquetar a MOVE', obs:'—', ok:true},
        ],
        [ // ABR — 33%
            {desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'—', ok:false},
            {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'—', ok:false},
            {desc:'Evaluar con el encoder a 5 socios como mínimo', obs:'Fede Peña, Britez Tony, Lucas Porro, Marina Vidiella, Maria Jose Ponce', ok:true},
            {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'—', ok:false},
            {desc:'Asistir a una capacitación interna', obs:'—', ok:false},
            {desc:'Que 10 socios tengan rutinas cargadas fuera del gym', obs:'Nelli Trujillos, Luis Depiñeau, Nohiem Campanari, Eluen Campanari, Bianca Tarantini, Patricia Perez, Rusterholz Ayelen, Enzo Bracamonte, Rosales Norberto, Silvina Fernandez', ok:true},
        ],
        [ // MAY — 50%
            {desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'—', ok:false},
            {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'—', ok:false},
            {desc:'Asistir a una capacitación interna', obs:'—', ok:true},
            {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'—', ok:false},
            {desc:'Que 10 socios tengan rutinas cargadas fuera del gym', obs:'Constanza Dangelo, Marina Vidiella, Lucas Porro, Andrea Guerrero, Candela Sosa, Alvaro Leibrecht, Marina Bastiani, Lorena Bastiani, Castañeda Carla, Luis Depiñeau, Nelli Trujillo, Kiara Bastiani, Paula Gagliardo, Santiago Hernandez, Lilia Morinigo, Patricia Perez', ok:true},
            {desc:'¿Qué aspecto del trabajo en equipo te gustaría mejorar en Move?', obs:'Ninguno, están por buen camino', ok:true},
        ],
        [], // JUN
    ],
};

const AE_ENZO = {
    nombre:'Enzo', sede:'El Bolsón',
    meses:['ENE','FEB','MAR','ABR','MAY','JUN'],
    mesesFull:['Enero','Febrero','Marzo','Abril','Mayo','Junio'],
    objetivos:[
        {activos:67, desercion:23.9, tarea:0,   reeval:26.87, puntaje:70,  retencion:76.1},
        {activos:79, desercion:25.3, tarea:100, reeval:15.19, puntaje:80,  retencion:74.7},
        {activos:87, desercion:6.9,  tarea:100, reeval:34.48, puntaje:155, retencion:93.1},
        {activos:94, desercion:23.4, tarea:100, reeval:31.91, puntaje:135, retencion:76.6},
        {activos:93, desercion:16.1, tarea:100, reeval:32.26, puntaje:145, retencion:83.9},
        {activos:0,  desercion:0.0,  tarea:0,   reeval:0.00,  puntaje:0,   retencion:0},
    ],
    movimiento:[
        {renueva:62, luciaTani:18, liberado:5, vacaciones:4, deriv:2,  baja:16},
        {renueva:74, luciaTani: 7, liberado:5, vacaciones:0, deriv:2,  baja:20},
        {renueva:82, luciaTani:22, liberado:5, vacaciones:0, deriv:4,  baja: 6},
        {renueva:88, luciaTani:12, liberado:4, vacaciones:0, deriv:2,  baja:22},
        {renueva:89, luciaTani:15, liberado:4, vacaciones:1, deriv:1,  baja:15},
        {renueva: 0, luciaTani: 1, liberado:0, vacaciones:0, deriv:0,  baja: 0},
    ],
    tareas:[
        [], // ENE — sin datos
        [ // FEB — 100%
            {desc:'Completar el perfil de los Socios en la APP en un 50%', obs:'Agregados', ok:true},
            {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'Carballo Nicolas, Claudia Aguilar, Flor Maggio, Ron Bianco, Thiago Passegi, Andrade Giuliano, Silvana Gerez, Juan Figueroa, Tomas Ramos, Lautaro Fernandez', ok:true},
            {desc:'Agendar 10 evaluaciones con 10 socios en el futuro', obs:'Silvana Gerez, Debora Barrionuevo, Alicia Hernandez, Juan Figueroa, Flor Maggio, Abril Barrionuevo, Carballo Nicolas, Octavio Leiva, Nahim Zarate', ok:true},
            {desc:'Tener el 70% de los socios con alguna evaluación cargada en la APP', obs:'Agregados', ok:true},
            {desc:'Que asistan al menos 5 socios a "Iluminemos al piltri"', obs:'Debora Barrionuevo, Abril Barrionuevo, Rocio Parezza, Gloria Gomez, Marcelo Cerieldin', ok:true},
            {desc:'Subir una Foto entrenando y etiquetar a MOVE', obs:'—', ok:true},
        ],
        [ // MAR — 100%
            {desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'Completado', ok:true},
            {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'Nicolas Carballo, Ulises Fernandez, Mariano Macazaga, Dion Sotto, Debora Barrionuevo, Martin Garrido, Matias Thorman, Theo Tissato, Amaranto Tognetti, Cristina Serrantes', ok:true},
            {desc:'Agendar 10 evaluaciones con 10 socios en el futuro', obs:'Kathie, Joaquín Condori, Alejo Mendez, Cristina Serrantes, Nicolas Vivani, Gloria Gomez, Juan Paiva, Elena Morera, Mariano Bombera, Cristian Leiva', ok:true},
            {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'Completado', ok:true},
            {desc:'Asistir a la capacitación interna', obs:'29 marzo - RRR', ok:true},
            {desc:'Subir una Foto entrenando y etiquetar a MOVE', obs:'—', ok:true},
        ],
        [ // ABR — 100%
            {desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'Completado', ok:true},
            {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'Completado', ok:true},
            {desc:'Evaluar con el encoder a 5 socios como mínimo', obs:'Carballo Nicolas, Juliano Andrade, Ornella Bellone, Cristian Vera, Guadalupe Salinas', ok:true},
            {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'Completado', ok:true},
            {desc:'Asistir a una capacitación interna', obs:'Ejercicios Bariloche', ok:true},
            {desc:'Que 10 socios tengan rutinas cargadas fuera del gym', obs:'Erazo Francisco, Pablo Vazquez, Caro Shiro, Santiago Carregado, Santi Arza, Vivani Nicolas, Marmissole Nahuel, Joaquin Bustigorry, Lucas Aguilera, Nahim Zarate', ok:true},
        ],
        [ // MAY — 100%
            {desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'Completado', ok:true},
            {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'Completado', ok:true},
            {desc:'Asistir a una capacitación interna', obs:'RRR - Lago Puelo', ok:true},
            {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'Completado', ok:true},
            {desc:'Que 10 socios tengan rutinas cargadas fuera del gym', obs:'Aisha Aldea, Luca Aguilera, Pablo Vazquez, Flor Rodriguez, Carballo Nicolas, Nahuel Marmissole, Debo Barrionuevo, Gallego Nicolas, Eiros Monica, Arza Santiago', ok:true},
            {desc:'¿Qué aspecto del trabajo en equipo te gustaría mejorar en Move?', obs:'Comunicación (saber cuál es mi cantidad de alumnos) y ser más protagonistas en las capacitaciones', ok:true},
        ],
        [], // JUN
    ],
};

const AE_JAVI = {
    nombre:'Javi', sede:'Lago Puelo',
    meses:['ENE','FEB','MAR','ABR','MAY','JUN'],
    mesesFull:['Enero','Febrero','Marzo','Abril','Mayo','Junio'],
    objetivos:[
        {activos:75, desercion:22.7, tarea:0,   reeval:6.67,  puntaje:70,  retencion:77.3},
        {activos:64, desercion:29.7, tarea:100, reeval:7.81,  puntaje:80,  retencion:70.3},
        {activos:78, desercion:9.2,  tarea:83,  reeval:26.92, puntaje:105, retencion:90.8},
        {activos:85, desercion:19.3, tarea:100, reeval:37.65, puntaje:148, retencion:80.7},
        {activos:79, desercion:5.1,  tarea:100, reeval:26.58, puntaje:142, retencion:94.9},
        {activos:5,  desercion:0.0,  tarea:0,   reeval:20.00, puntaje:50,  retencion:100},
    ],
    movimiento:[
        {renueva:75, luciaTani:6,  liberado:0, vacaciones:3, deriv:1, baja:17},
        {renueva:62, luciaTani:10, liberado:2, vacaciones:8, deriv:4, baja:19},
        {renueva:76, luciaTani:11, liberado:0, vacaciones:11,deriv:5, baja:7},
        {renueva:81, luciaTani:13, liberado:2, vacaciones:4, deriv:5, baja:16},
        {renueva:77, luciaTani:5,  liberado:2, vacaciones:7, deriv:3, baja:4},
        {renueva:3,  luciaTani:0,  liberado:2, vacaciones:0, deriv:0, baja:0},
    ],
    tareas:[
        [],
        [{desc:'Completar el perfil de los Socios en la APP en un 50%', obs:'Listo', ok:true},
         {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'Listo', ok:true},
         {desc:'Agendar 10 evaluaciones con 10 socios en el futuro', obs:'10 de 10', ok:true},
         {desc:'Tener el 70% de los socios con alguna evaluación cargada en la APP', obs:'—', ok:true},
         {desc:'Que asistan al menos 5 socios a "Iluminemos al piltri"', obs:'5 de 5', ok:true},
         {desc:'Subir una Foto entrenando y etiquetar a MOVE', obs:'Listo', ok:true}],
        [{desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'—', ok:true},
         {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'Listo', ok:true},
         {desc:'Agendar 10 evaluaciones con 10 socios en el futuro', obs:'Listo', ok:true},
         {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'—', ok:false},
         {desc:'Que asistan al menos 5 socios a "Iluminemos al piltri"', obs:'Listo', ok:true},
         {desc:'Subir una Foto entrenando y etiquetar a MOVE', obs:'Listo', ok:true}],
        [{desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'—', ok:true},
         {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'—', ok:true},
         {desc:'Evaluar con el encoder a 5 socios como mínimo', obs:'Nahuel Gomez, Actis Daniel, Cristian Vazquez, Deipenau Pipo, Joaquin Faillace, Ciro Castellano, Nestor, Butler Francisco', ok:true},
         {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'—', ok:true},
         {desc:'Asistir a una capacitación interna', obs:'—', ok:true},
         {desc:'Que 10 socios tengan rutinas cargadas fuera del gym', obs:'Juan Locuratolo, Daniel Riquelme, Gabriela Ribaditi, Mussi Alejandro, Lucas Lobera, Delgadin Jorge, Trucco Lucas, De Luca Gisela, Ayelen Mendoza, Julia Gomez', ok:true}],
        [{desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'—', ok:true},
         {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'—', ok:true},
         {desc:'Asistir a una capacitación interna', obs:'—', ok:true},
         {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'—', ok:true},
         {desc:'Que 10 socios tengan rutinas cargadas fuera del gym', obs:'Rossana Parra, Landesa Graciela, Ribaditi Gabriela, Lucas Trucco, Daniel Riquelme, Palazuelos Patri, Paredes Patri, Alejandra Cecchini, Ariel Puyelli, Nestor Jaureguiberry', ok:true},
         {desc:'¿Qué aspecto del trabajo en equipo te gustaría mejorar en Move?', obs:'Siempre se puede pulir más la comunicación', ok:true}],
        [],
    ],
};

const AE_AGUS = {
    nombre:'Agus', sede:'Lago Puelo',
    meses:['ENE','FEB','MAR','ABR','MAY','JUN'],
    mesesFull:['Enero','Febrero','Marzo','Abril','Mayo','Junio'],
    objetivos:[
        {activos:51, desercion:43.1, tarea:0,  reeval:0.00,  puntaje:55,  retencion:56.9},
        {activos:62, desercion:16.1, tarea:17, reeval:0.00,  puntaje:80,  retencion:83.9},
        {activos:66, desercion:31.2, tarea:67, reeval:33.33, puntaje:108, retencion:68.9},
        {activos:86, desercion:24.4, tarea:67, reeval:46.51, puntaje:140, retencion:75.6},
        {activos:79, desercion:24.4, tarea:80, reeval:37.97, puntaje:130, retencion:75.6},
        {activos:1,  desercion:0.0,  tarea:0,  reeval:0.00,  puntaje:0,   retencion:0},
    ],
    movimiento:[
        {renueva:51, luciaTani:17, liberado:0, vacaciones:4, deriv:3, baja:22},
        {renueva:62, luciaTani:4,  liberado:0, vacaciones:0, deriv:6, baja:10},
        {renueva:58, luciaTani:24, liberado:3, vacaciones:1, deriv:4, baja:19},
        {renueva:76, luciaTani:14, liberado:4, vacaciones:0, deriv:1, baja:20},
        {renueva:72, luciaTani:9,  liberado:3, vacaciones:4, deriv:3, baja:16},
        {renueva:1,  luciaTani:0,  liberado:0, vacaciones:2, deriv:0, baja:1},
    ],
    tareas:[
        [],
        [{desc:'Completar el perfil de los Socios en la APP en un 50%', obs:'—', ok:false},
         {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'—', ok:false},
         {desc:'Agendar 10 evaluaciones con 10 socios en el futuro', obs:'—', ok:false},
         {desc:'Tener el 70% de los socios con alguna evaluación cargada en la APP', obs:'—', ok:false},
         {desc:'Que asistan al menos 5 socios a "Iluminemos al piltri"', obs:'—', ok:false},
         {desc:'Subir una Foto entrenando y etiquetar a MOVE', obs:'—', ok:true}],
        [{desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'—', ok:false},
         {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'—', ok:true},
         {desc:'Agendar 10 evaluaciones con 10 socios en el futuro', obs:'—', ok:true},
         {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'—', ok:false},
         {desc:'Asistir a la capacitación interna', obs:'—', ok:true},
         {desc:'Que 10 socios tengan rutinas cargadas fuera del gym', obs:'Victoria Masi, Paula Mendez, Eduardo Arroyo, Lidia Rios, Angela Quinteros, Soledad Grinspan, Guillermo Martinez, Ximena Pulpeiro, Alejandra Fiorotto, Federico Iturmenti', ok:true}],
        [{desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'completado', ok:true},
         {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'Rojas Silvana, Martinez Lazaro, Cleri Ana Paula, Burton Clarita, Roccella Ana Laura, Araneda Kiara, Marquez Agustin, Saez Leonardo, Amigo Leia, Lema Noelia', ok:true},
         {desc:'Asistir a una capacitación interna', obs:'completado', ok:true},
         {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'—', ok:false},
         {desc:'Que 10 socios tengan rutinas cargadas fuera del gym', obs:'Martinez Lazaro, Locuratolo Juan, Compagnucci German, Cristiani Liliana, Grinspan Soledad, Vila Daniela, Mendez Paula, Ariet Celeste, Pulpeiro Ximena, Masi Victoria', ok:false},
         {desc:'¿Qué aspecto del trabajo en equipo te gustaría mejorar en Move?', obs:'La comunicación', ok:true}],
        [{desc:'Completar el perfil de los Socios en la APP en un 100%', obs:'completado', ok:true},
         {desc:'Agregar un objetivo concreto en la APP y medible con 10 socios', obs:'completado', ok:true},
         {desc:'Asistir a una capacitación interna', obs:'—', ok:true},
         {desc:'Tener el 100% de los socios con alguna evaluación cargada en la APP', obs:'—', ok:false},
         {desc:'Que 10 socios tengan rutinas cargadas fuera del gym', obs:'—', ok:false},
         {desc:'¿Qué aspecto del trabajo en equipo te gustaría mejorar en Move?', obs:'—', ok:true}],
        [],
    ],
};

const AE_CAMILA = {
    nombre:'Camila', sede:'Bariloche',
    meses:['ENE','FEB','MAR','ABR','MAY','JUN'],
    mesesFull:['Enero','Febrero','Marzo','Abril','Mayo','Junio'],
    objetivos:[
        {activos:0,  desercion:0.0, tarea:0,  reeval:0.00,  puntaje:0,   retencion:0},
        {activos:0,  desercion:0.0, tarea:50, reeval:0.00,  puntaje:0,   retencion:0},
        {activos:0,  desercion:0.0, tarea:0,  reeval:0.00,  puntaje:30,  retencion:100},
        {activos:54, desercion:6.7, tarea:0,  reeval:46.30, puntaje:118, retencion:93.3},
        {activos:56, desercion:9.9, tarea:0,  reeval:23.21, puntaje:110, retencion:90.1},
        {activos:3,  desercion:100, tarea:0,  reeval:66.67, puntaje:28,  retencion:0},
    ],
    movimiento:[
        {renueva:0, luciaTani:0, liberado:0, vacaciones:0, deriv:0, baja:0},
        {renueva:0, luciaTani:0, liberado:0, vacaciones:0, deriv:0, baja:0},
        {renueva:0, luciaTani:64,liberado:0, vacaciones:0, deriv:0, baja:0},
        {renueva:54,luciaTani:18,liberado:0, vacaciones:0, deriv:0, baja:5},
        {renueva:56,luciaTani:22,liberado:0, vacaciones:0, deriv:0, baja:8},
        {renueva:3, luciaTani:0, liberado:0, vacaciones:0, deriv:0, baja:3},
    ],
    tareas:[
        [],
        [{desc:'Tareas del período de apertura de sede', obs:'50% cumplimiento', ok:true},{desc:'Pendiente: completar tareas restantes', obs:'—', ok:false}],
        [],
        [],
        [],
        [],
    ],
};

const AE_CARLA = {
    nombre:'Carla', sede:'Bariloche',
    meses:['ENE','FEB','MAR','ABR','MAY','JUN'],
    mesesFull:['Enero','Febrero','Marzo','Abril','Mayo','Junio'],
    objetivos:[
        {activos:0,  desercion:0.0,  tarea:0,  reeval:0.00, puntaje:0,  retencion:0},
        {activos:0,  desercion:0.0,  tarea:50, reeval:0.00, puntaje:0,  retencion:0},
        {activos:0,  desercion:0.0,  tarea:0,  reeval:0.00, puntaje:30, retencion:100},
        {activos:35, desercion:17.5, tarea:0,  reeval:0.00, puntaje:40, retencion:82.5},
        {activos:50, desercion:9.9,  tarea:0,  reeval:0.00, puntaje:80, retencion:90.1},
        {activos:2,  desercion:0.0,  tarea:0,  reeval:0.00, puntaje:50, retencion:100},
    ],
    movimiento:[
        {renueva:0, luciaTani:0, liberado:0, vacaciones:0, deriv:0, baja:0},
        {renueva:0, luciaTani:0, liberado:0, vacaciones:0, deriv:0, baja:0},
        {renueva:0, luciaTani:48,liberado:0, vacaciones:0, deriv:0, baja:0},
        {renueva:35,luciaTani:28,liberado:0, vacaciones:0, deriv:0, baja:11},
        {renueva:50,luciaTani:21,liberado:0, vacaciones:0, deriv:0, baja:7},
        {renueva:2, luciaTani:0, liberado:0, vacaciones:0, deriv:0, baja:0},
    ],
    tareas:[
        [],
        [{desc:'Tareas del período de apertura de sede', obs:'50% cumplimiento', ok:true},{desc:'Pendiente: completar tareas restantes', obs:'—', ok:false}],
        [],
        [],
        [],
        [],
    ],
};

const AE_ESTEFANIA = {
    nombre:'Giuliano', sede:'Bariloche',
    meses:['ENE','FEB','MAR','ABR','MAY','JUN'],
    mesesFull:['Enero','Febrero','Marzo','Abril','Mayo','Junio'],
    objetivos:[
        {activos:0,  desercion:0.0, tarea:0,  reeval:0.00,  puntaje:0,   retencion:0},
        {activos:0,  desercion:0.0, tarea:50, reeval:0.00,  puntaje:0,   retencion:0},
        {activos:0,  desercion:0.0, tarea:0,  reeval:0.00,  puntaje:30,  retencion:100},
        {activos:50, desercion:6.0, tarea:0,  reeval:66.00, puntaje:130, retencion:94.0},
        {activos:72, desercion:16.7,tarea:0,  reeval:19.44, puntaje:101, retencion:83.3},
        {activos:5,  desercion:0.0, tarea:0,  reeval:0.00,  puntaje:50,  retencion:100},
    ],
    movimiento:[
        {renueva:0,  luciaTani:0,  liberado:0, vacaciones:0, deriv:0, baja:0},
        {renueva:0,  luciaTani:0,  liberado:0, vacaciones:0, deriv:0, baja:0},
        {renueva:0,  luciaTani:60, liberado:0, vacaciones:0, deriv:0, baja:0},
        {renueva:50, luciaTani:42, liberado:0, vacaciones:4, deriv:0, baja:3},
        {renueva:72, luciaTani:7,  liberado:0, vacaciones:5, deriv:0, baja:12},
        {renueva:5,  luciaTani:0,  liberado:0, vacaciones:0, deriv:0, baja:0},
    ],
    tareas:[
        [],
        [{desc:'Tareas del período de apertura de sede', obs:'50% cumplimiento', ok:true},{desc:'Pendiente: completar tareas restantes', obs:'—', ok:false}],
        [],
        [],
        [],
        [],
    ],
};

// Datos hardcodeados = SOLO fallback si falla la red. Lo real se lee vivo de la planilla.
const AE_FALLBACK = {belen: AE_BELEN, fer: AE_FER, enzo: AE_ENZO, javi: AE_JAVI, agus: AE_AGUS, camila: AE_CAMILA, carla: AE_CARLA, estefania: AE_ESTEFANIA};
const AE_DATA = {...AE_FALLBACK};   // se va pisando con datos vivos
let aeProfeActual = 'belen';
let aeLiveCargado = {};   // {id: true} para no refetchear

// sheetId de cada planilla
const AE_SHEETS = {
    belen:'1_sQLCugQmvqxpL7LdfQ0UyWqwQfpsDfR', fer:'1clVzTQMCSt48xRpHTzxnfUl1kCuoSQhS',
    enzo:'1WiQnNgDvC8K7FWCIh0xDDrPiPy7IRkO-', javi:'1vtE6cjgvHxJwWpvw89ynoadcZbyTNHpx',
    agus:'1XCjiaBOYOWVaPLPtI9kCRYdqJAySSIeQ', camila:'1n8n7z1RgJlvyvdzvc8DGqI4e-64bStI1',
    carla:'19zuljlNy--GZPm9Sdf2xwlACHmTsrsHZ', estefania:'1bOyKt3MJ180nv6pPxCJOutBDlSAP22nt'
};
// Columnas de meses en pestaña "Planilla 2026" (export). Hay huecos: col15 (ABR→MAY) y col20 (AGO→SEP).
// ENE11 FEB12 MAR13 ABR14 [15] MAY16 JUN17 JUL18 AGO19 [20] SEP21 OCT22 NOV23 DIC24
const AE_MES_COLS = [11,12,13,14,16,17,18,19,21,22,23,24];

// Recepcionistas (socios nuevos): Bariloche KEILA/RUBEN · Puelo ARA/AZUL · Bolsón LUCIA/TANI
const AE_RECEP = new Set(['LUCIA','TANI','RUBEN','KEILA','ARA','AZUL']);
// Cada sede cuenta SOLO sus propios recepcionistas (evita contar, ej., KEILA de Bari en planillas de Puelo)
const AE_RECEP_SEDE = {
    'El Bolsón':  new Set(['LUCIA','TANI']),
    'Lago Puelo': new Set(['ARA','AZUL']),
    'Bariloche':  new Set(['KEILA','RUBEN']),
};
const AE_RECEP_LABEL = {'El Bolsón':'Lucía/Tani', 'Lago Puelo':'Ara/Azul', 'Bariloche':'Keila/Rubén'};

// Metas anuales MOVE 2026 (para barras de progreso del panel ejecutivo)
const AE_METAS_2026 = {
    activos:    {meta:110, dir:'up',   sub:'cupo por profe'},
    retencion:  {meta:90,  dir:'up',   sub:'obj ≥90%'},
    desercion:  {meta:10,  dir:'down', sub:'obj ≤10%'},
    reeval:     {meta:30,  dir:'up',   sub:'obj ≥30% socios activos'},
    nuevos:     {meta:70,  dir:'up',   sub:'obj ≥70 liquidados/mes'},
    tarea:      {meta:100, dir:'up',   sub:'obj 100%'},
};

// Contexto institucional MOVE (del "Camino del Socio 2026") para el generador de mensajes
const MOVE_CONTEXT = `MOVE es un servicio de entrenamiento y recuperación integral con 3 sedes (El Bolsón, Lago Puelo, Bariloche). Cada socio es tratado como un atleta de alto rendimiento; el acompañamiento es integral (gimnasio, casa y aire libre), no solo alquiler de espacio.
MISIÓN: servicio homogéneo y de calidad; que los socios elijan MOVE por profesionalismo, conocimiento y calidad humana; construir una comunidad orgánica que sea el principal promotor de imagen, para lograr retención y ventas más orgánicas.
VISIÓN: ser referente reconocido en entrenamiento y recuperación integral, modelo de estilo de vida saludable.
OBJETIVOS 2026: homogeneizar la calidad del servicio en las 3 sedes, mejorar la experiencia y retención del socio, fortalecer y profesionalizar el equipo, consolidar reputación y posicionamiento, expandir impacto social e innovación, con crecimiento ordenado y coherente.
VALORES: calidez y atención personalizada, presencia y compromiso, soporte y corrección constante, compañerismo, responsabilidad, ética, conocimiento profesional, capacitación continua, sostenibilidad.
METAS NUMÉRICAS 2026: deserción bajando escalonada (30%→25%→20%→10%), retención ≥90%, re-evaluaciones en más del 30% de los socios liquidados activos, más de 70 socios nuevos liquidados por mes.`;

// Parser CSV robusto (maneja comas dentro de comillas)
function aeParseCSV(txt){
    const rows=[]; let row=[], cur='', q=false;
    for(let i=0;i<txt.length;i++){
        const c=txt[i];
        if(q){
            if(c==='"'){ if(txt[i+1]==='"'){cur+='"';i++;} else q=false; }
            else cur+=c;
        } else {
            if(c==='"') q=true;
            else if(c===','){ row.push(cur); cur=''; }
            else if(c==='\n'){ row.push(cur); rows.push(row); row=[]; cur=''; }
            else if(c==='\r'){}
            else cur+=c;
        }
    }
    if(cur!==''||row.length){ row.push(cur); rows.push(row); }
    return rows;
}
function aeGvizCSV(sid, hoja){
    const url=`https://docs.google.com/spreadsheets/d/${sid}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(hoja)}&t=${Date.now()}`;
    return fetch(url,{cache:'no-store'}).then(r=>r.text()).then(aeParseCSV);
}
// Export CSV de la pestaña "Planilla 2026" (gid 24691950) — layout estable: header fila5, socios fila6+
function aeExportCSV(sid){
    const url=`https://docs.google.com/spreadsheets/d/${sid}/export?format=csv&gid=24691950&t=${Date.now()}`;
    return fetch(url,{cache:'no-store'}).then(r=>r.text()).then(aeParseCSV);
}
function aeNum(s){
    if(s==null) return null;
    s=String(s).replace('%','').replace(/\./g,'').replace(',','.').trim();
    const n=parseFloat(s);
    return isNaN(n)?null:n;
}

// Parsea la fila "Activos al cierre de mes" (padrón real) de la pestaña Resumen Anual.
// Búsqueda por etiqueta → robusto ante cambios de layout. Devuelve 12 valores (o null).
function aeParseActivosCierre(res){
    const out=new Array(12).fill(null);
    if(!res||!res.length) return out;
    const MES=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    // Candidatos: filas cuyo label ES "Activos al cierre de mes" (corto). Excluye el glosario (texto largo con ':').
    const cand=[];
    for(let i=0;i<res.length;i++){
        const r=res[i]||[];
        for(let ci=0;ci<r.length;ci++){
            const t=(r[ci]||'').toString().trim().toLowerCase();
            if(t.startsWith('activos al cierre') && t.length<35){ cand.push(i); break; }
        }
    }
    if(!cand.length) return out;
    // Para cada candidato: buscar el header de meses más cercano por arriba y parsear; quedarse con el que más valores da.
    let best=out, bestCount=-1;
    cand.forEach(dataRow=>{
        let colMes=null;
        for(let i=dataRow;i>=0 && i>dataRow-60;i--){
            const r=res[i]||[]; const idx={};
            r.forEach((c,ci)=>{ const mi=MES.indexOf((c||'').toString().trim().toUpperCase()); if(mi>=0 && idx[mi]==null) idx[mi]=ci; });
            if(Object.keys(idx).length>=6){ colMes=idx; break; }
        }
        if(!colMes) return;
        const r=res[dataRow]; const vals=new Array(12).fill(null); let cnt=0;
        for(let m=0;m<12;m++){ if(colMes[m]!=null){ const n=aeNum(r[colMes[m]]); vals[m]=n; if(n!=null) cnt++; } }
        if(cnt>bestCount){ bestCount=cnt; best=vals; }
    });
    return best;
}

// Construye el objeto datos (mismo shape que el hardcodeado) leyendo las pestañas
async function aeLoadLive(id){
    const sid=AE_SHEETS[id];
    if(!sid) throw new Error('sin sheetId');
    const base=AE_FALLBACK[id];
    const [obj, plan, tar] = await Promise.all([
        aeGvizCSV(sid,'Objetivos'),
        aeExportCSV(sid),                 // Planilla 2026 vía export (layout estable, socios fila6+)
        aeGvizCSV(sid,'Tareas Mensuales')
    ]);

    // ── Objetivos: fila datos = 13 + m*6, puntos en fila+4 col10 ──
    const objetivos=[], movimiento=[], tareas=[];
    const RECEP = AE_RECEP_SEDE[AE_SEDE[id]] || AE_RECEP;   // solo los recepcionistas de la sede de este profe
    for(let m=0;m<12;m++){
        const dr=13+m*6, pr=dr+4;
        const drow=obj[dr]||[], prow=obj[pr]||[];
        const activos = aeNum(drow[5])||0;
        let des = aeNum(drow[6]); if(des==null) des=0;
        const tarea = aeNum(drow[7])||0;
        const reeval = aeNum(drow[8])||0;
        const puntaje = aeNum(prow[10])||0;
        const retencion = activos>0 && aeNum(drow[6])!=null ? Math.round((100-des)*10)/10 : 0;
        objetivos.push({activos, desercion:Math.round(des*10)/10, tarea:Math.round(tarea), reeval:Math.round(reeval*100)/100, puntaje, retencion});

        // ── Movimiento: contar condiciones en la columna del mes ──
        const col=AE_MES_COLS[m];
        const cnt={renueva:0,luciaTani:0,liberado:0,vacaciones:0,deriv:0,baja:0,nuevos:0};
        for(let i=6;i<plan.length;i++){
            const r=plan[i]; if(!r||r.length<=col) continue;
            const nombre=(r[4]||'').trim(); if(!nombre) continue;
            if(!/^\d/.test((r[2]||'').trim())) continue;
            const v=(r[col]||'').trim().toUpperCase();
            if(!v) continue;
            if(v==='NUEVO'){ cnt.renueva++; }
            else if(v.startsWith('RENUEVA')) cnt.renueva++;
            else if(RECEP.has(v)){ cnt.luciaTani++; cnt.nuevos++; }
            else if(v==='LIBERADO') cnt.liberado++;
            else if(v==='VACACIONES') cnt.vacaciones++;
            else if(v.startsWith('DERIV')) cnt.deriv++;
            else if(v==='BAJA') cnt.baja++;
        }
        movimiento.push(cnt);

        // ── Tareas: banda=m//4, grupo=m%4. Header banda en fila banda*8, tareas debajo ──
        const banda=Math.floor(m/4), grupo=m%4;
        const cT=grupo*4+1, cC=grupo*4+3;
        const ts=[];
        const fIni=banda*8+1;
        for(let f=fIni; f<fIni+6 && f<tar.length; f++){
            const row=tar[f]||[];
            const desc=(row[cT]||'').trim();
            let obs=(row[cT+1]||'').trim();
            if(obs==='Observaciones') obs='';   // placeholder vacío de la planilla
            const cond=(row[cC]||'').trim();
            if(!desc || desc.toLowerCase().includes('descripción de tarea') || desc==='Tarea') continue;
            // La planilla usa distintas formas para marcar una tarea cumplida
            const c = cond.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
            const ok = ['✔','✓','x','si','ok','listo','hecho','cumplido','cumplida','completado','completada','completo','terminado','realizado','realizada','100%'].includes(c)
                       || c.startsWith('complet') || c.startsWith('cumpl') || c.startsWith('realiz') || c.startsWith('hech');
            ts.push({desc, obs:obs||'—', ok});
        }
        tareas.push(ts);
    }

    // ── Adherencia: % de meses transcurridos que cada socio se mantuvo activo ──
    const memPres={};
    for(let i=6;i<plan.length;i++){
        const r=plan[i]; if(!r) continue;
        const nombre=(r[4]||'').trim(); if(!nombre) continue;
        if(!/^\d/.test((r[2]||'').trim())) continue;
        const flags=[];
        for(let m=0;m<12;m++){
            const v=(r[AE_MES_COLS[m]]||'').trim().toUpperCase();
            flags.push(v.startsWith('RENUEVA')||v==='NUEVO'||AE_RECEP.has(v));
        }
        memPres[nombre]=flags;
    }
    const adherencia=[];
    for(let m=0;m<12;m++){
        let sum=0,c=0;
        Object.values(memPres).forEach(flags=>{
            if(!flags[m]) return;
            let pres=0; for(let k=0;k<=m;k++) if(flags[k]) pres++;
            sum += pres/(m+1); c++;
        });
        adherencia.push(c? Math.round(sum/c*100) : 0);
    }

    // Mostrar meses ENE hasta el último con socios activos (evita meses futuros vacíos)
    let ultimo=0;
    objetivos.forEach((o,i)=>{ if(o.activos>0) ultimo=i; });
    const n=ultimo+1;
    const MNOMBRE=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    const MFULL=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    const datos={
        nombre: base?base.nombre:id, sede: base?base.sede:'',
        meses: MNOMBRE.slice(0,n),
        mesesFull: MFULL.slice(0,n),
        objetivos: objetivos.slice(0,n),
        movimiento: movimiento.slice(0,n),
        adherencia: adherencia.slice(0,n),
        tareas: tareas.slice(0,n)
    };
    AE_DATA[id]=datos;
    aeLiveCargado[id]=true;
    return datos;
}

async function aeSelProfe(id, btn){
    aeProfeActual = id;
    document.querySelectorAll('#section-analisis-entrenadores .tab').forEach(b=>b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    // Padrón real: hace falta para el KPI de Socios Activos (misma fuente que Estado del Gym)
    const esBari = AE_SEDE[id]==='Bariloche';
    try{
        if(!esBari && (typeof planData==='undefined' || !planData)) await cargarTodo();
        if(esBari && (typeof bariData==='undefined' || !bariData || !bariData.length)) await loadBariloche();
    }catch(e){}
    // Cargar datos vivos (si no están cacheados). Fallback al hardcodeado si falla.
    if(!aeLiveCargado[id]){
        try { await aeLoadLive(id); }
        catch(e){ console.warn('AE live fallo, uso fallback', id, e); AE_DATA[id]=AE_FALLBACK[id]; }
    }
    const datos = AE_DATA[id] || AE_FALLBACK[id];
    const mesConDatos = datos.objetivos.map((o,i)=>o.activos>0?i:-1).filter(i=>i>=0);
    aeMesActual = mesConDatos.length ? mesConDatos[mesConDatos.length-1] : 4;
    aeRender(aeMesActual);
    aeActualizarSelector();
}

// Los "N socios" de los botones vienen fijos del HTML: los pasamos al padrón real
function aeActualizarSelector(){
    document.querySelectorAll('#section-analisis-entrenadores .tab').forEach(b=>{
        const m = /aeSelProfe\('([a-z]+)'/.exec(b.getAttribute('onclick')||'');
        if(!m) return;
        const prev = aeProfeActual; aeProfeActual = m[1];
        const n = (typeof aeActivosReales==='function') ? aeActivosReales() : null;
        aeProfeActual = prev;
        if(n==null) return;
        const sp = b.querySelector('span');
        if(sp) sp.textContent = n + ' socios';
    });
}

function aeRender(mesIdx){
    aeMesActual = mesIdx;
    const datos = AE_DATA[aeProfeActual] || AE_BELEN;
    const d = datos.objetivos[mesIdx];
    const mov = datos.movimiento[mesIdx];
    const tareas = datos.tareas[mesIdx]||[];
    const sc = p => p>=80?'#10b981':p>=50?'#f59e0b':'#ef4444';

    // Tabs mes
    document.getElementById('aeMesTabs').innerHTML = datos.meses.map((m,i)=>
        `<button class="tab ${i===mesIdx?'active':''}" onclick="aeRender(${i})" style="font-size:.7rem;padding:4px 10px;">${m}</button>`).join('');

    // KPIs
    document.getElementById('aeKpis').innerHTML = [
        {l:'Socios Activos',  v:d.activos,        c:d.activos>=95?'#10b981':d.activos>=70?'#f59e0b':'#ef4444', sub:'cupo 110'},
        {l:'% Deserción',     v:d.desercion+'%',   c:d.desercion<=10?'#10b981':d.desercion<=20?'#f59e0b':'#ef4444', sub:'obj: <10%'},
        {l:'Tarea mensual',   v:d.tarea+'%',       c:sc(d.tarea), sub:'cumplimiento'},
        {l:'Re-evaluaciones', v:d.reeval,           c:'var(--accent)', sub:'prom. por socio'},
        {l:'Retención real',  v:d.retencion+'%',   c:d.retencion>=90?'#10b981':d.retencion>=75?'#f59e0b':'#ef4444', sub:'obj: >90%'},
        {l:'Puntaje total',   v:d.puntaje,          c:sc(d.puntaje/160*100), sub:'de 160 máx'},
    ].map(k=>`<div class="stat-card" style="background:var(--card2,var(--card));border:1px solid var(--border);border-radius:10px;padding:14px;border-left:3px solid ${k.c};">
        <div style="font-size:1.5rem;font-weight:800;color:${k.c};font-family:monospace;letter-spacing:-1px;">${k.v}</div>
        <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-top:4px;">${k.l}</div>
        <div style="font-size:.68rem;color:var(--muted);margin-top:2px;">${k.sub}</div>
    </div>`).join('');

    // Objetivos con barras
    document.getElementById('aeObjs').innerHTML = [
        {l:'Socios Activos',    v:d.activos,        mx:110},
        {l:'Tareas completadas',v:(tareas.length?Math.round(tareas.filter(t=>t.ok).length/tareas.length*100):d.tarea), mx:100},
        {l:'Re-evaluaciones',   v:Math.min(d.reeval,40), mx:40},
        {l:'Retención real',    v:d.retencion,      mx:100},
        {l:'Puntaje total',     v:d.puntaje,        mx:160},
    ].map(o=>{
        const pct=Math.min(Math.round(o.v/o.mx*100),100);
        const c=sc(pct);
        return `<div style="padding:7px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;font-size:.77rem;margin-bottom:4px;">
                <span>${o.l}</span><span style="font-weight:700;color:${c};">${o.v} (${pct}%)</span>
            </div>
            <div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:${c};border-radius:2px;transition:width .5s;"></div>
            </div>
        </div>`;
    }).join('');

    // Tareas
    const tEl = document.getElementById('aeTareas');
    if(!tareas.length){
        tEl.innerHTML=`<div style="text-align:center;padding:20px;color:var(--muted);font-size:.78rem;"><i class="fas fa-clock" style="display:block;font-size:1.3rem;opacity:.25;margin-bottom:8px;"></i>Sin tareas registradas</div>`;
    } else {
        const ok=tareas.filter(t=>t.ok).length;
        tEl.innerHTML=`
            <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:.75rem;">
                <span style="color:var(--muted);">${ok}/${tareas.length} completadas</span>
                <span style="font-weight:700;color:${sc(ok/tareas.length*100)}">${Math.round(ok/tareas.length*100)}%</span>
            </div>
            ${tareas.map(t=>`<div style="display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);">
                <div style="width:20px;height:20px;border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.7rem;font-weight:700;background:${t.ok?'rgba(16,185,129,.15)':'rgba(239,68,68,.1)'};color:${t.ok?'#10b981':'#ef4444'};">${t.ok?'✓':'✗'}</div>
                <div>
                    <div style="font-size:.78rem;font-weight:500;line-height:1.4;">${t.desc}</div>
                    ${t.obs&&t.obs!=='—'?`<div style="font-size:.68rem;color:var(--muted);margin-top:2px;">${t.obs}</div>`:''}
                </div>
            </div>`).join('')}`;
    }

    // Tabla resumen anual
    document.getElementById('aeTabla').innerHTML = datos.objetivos.map((o,i)=>{
        const act=i===mesIdx;
        return `<tr style="${act?'background:rgba(16,185,129,.06);':''}">
            <td style="font-weight:${act?700:400}">${datos.meses[i]}</td>
            <td style="font-family:monospace;">${o.activos}</td>
            <td style="font-family:monospace;color:${o.desercion<=10?'var(--accent)':o.desercion<=20?'#f59e0b':'#ef4444'};">${o.desercion}%</td>
            <td style="font-family:monospace;color:${o.retencion>=90?'var(--accent)':'#f59e0b'};">${o.retencion}%</td>
            <td style="font-family:monospace;font-weight:700;color:${sc(o.puntaje/160*100)};">${o.puntaje}</td>
        </tr>`;
    }).join('');

    // Tabla movimiento
    const _recepHead = document.getElementById('aeMovRecepHead');
    if(_recepHead) _recepHead.textContent = AE_RECEP_LABEL[AE_SEDE[aeProfeActual]] || 'Recep.';
    document.getElementById('aeMovimiento').innerHTML = datos.movimiento.map((m,i)=>
        `<tr style="${i===mesIdx?'background:rgba(16,185,129,.06);':''}">
            <td style="font-weight:${i===mesIdx?700:400}">${datos.meses[i]}</td>
            <td style="font-family:monospace;color:var(--accent);">${m.renueva}</td>
            <td style="font-family:monospace;">${m.luciaTani}</td>
            <td style="font-family:monospace;">${m.liberado}</td>
            <td style="font-family:monospace;">${m.vacaciones}</td>
            <td style="font-family:monospace;">${m.deriv}</td>
            <td style="font-family:monospace;color:${m.baja>10?'#ef4444':m.baja>5?'#f59e0b':'var(--accent)'};">${m.baja}</td>
        </tr>`).join('');

    aeRenderPanel(mesIdx);
}
