function datosPartida(){
    //Al cargar la página
    sessionStorage.setItem('gameStarted', JSON.stringify(false));
    divisiones(5);

}

function prepararCanvas() {
    let ANCHO_CANVAS = 360;
    let ALTO_CANVAS = 360;

    let cvs  = document.querySelectorAll('canvas');

    cvs.forEach( function (cv ) {
        cv.width = ANCHO_CANVAS;
        cv.height = ALTO_CANVAS;
    });

}

//ELEGIR PUZZLE O IMAGEN
function verPuzzle(canvas) {
    const cv1 = document.getElementById('cv1');
    const cv2 = document.getElementById('cv2');
    const imagen = document.getElementById('type-image');
    const puzzle = document.getElementById('type-puzzle');
    let gameStarted = JSON.parse(sessionStorage.getItem('gameStarted'));
        

    if(gameStarted === false){
        if (canvas === 'imagen') {
            cv2.style.display = 'none';
            cv1.style.display = 'block';
            imagen.checked = true;
            puzzle.checked = false;

        } else {
            cv2.style.display = 'block';
            cv1.style.display = 'none';
            imagen.checked = false;
            puzzle.checked = true;
        }
    }else{
        if(canvas === 'imagen'){
            // Guardar el estado actual de cv2
            const cv2State = cv2.toDataURL();
            sessionStorage.setItem('cv2State', cv2State);

            // Copiar la imagen de cv1 a cv2
            const cv1Context = cv1.getContext('2d');
            const cv2Context = cv2.getContext('2d');
            const imgData = cv1Context.getImageData(0, 0, cv1.width, cv1.height);
            cv2Context.putImageData(imgData, 0, 0);

            // Mostrar cv1 y ocultar cv2
            cv2.style.display = 'none';
            cv1.style.display = 'block';
            imagen.checked = true;
            puzzle.checked = false;
        }else{
            // Recuperar el estado de cv2
            const cv2State = sessionStorage.getItem('cv2State');
            if (cv2State) {
                const img = new Image();
                img.onload = function() {
                    const cv2Context = cv2.getContext('2d');
                    cv2Context.clearRect(0, 0, cv2.width, cv2.height);
                    cv2Context.drawImage(img, 0, 0);
                };
                img.src = cv2State;
            }

            // Mostrar cv2 y ocultar cv1
            cv2.style.display = 'block';
            cv1.style.display = 'none';
            imagen.checked = false;
            puzzle.checked = true;
        }
    }
        
}

//CARGA DE IMAGENES
function cargarImagen() {
    let inp = document.createElement('input');
    let num_dificultad = parseInt(sessionStorage.getItem('difficulty'));

    inp.setAttribute('type', 'file');
    inp.onchange = function( evt ) {
        let fichero = inp.files[0];

        if( fichero ) {
            let img = document.createElement('img');
            img.onload = function(){
                let cv = document.querySelector('#cv1'),
                    ctx = cv.getContext('2d'),
                    ancho, alto,
                    posX, posY,
                    factor;

                if( img.naturalWidth > img.naturalHeight ) {
                    posX = 0;
                    ancho = cv.width;
                    factor = cv.width / img.naturalWidth;
                    alto = img.naturalHeight * factor;
                    posY = (cv.height - alto) / 2;
                }
                else {
                    posY = 0;
                    alto = cv.height;
                    factor = cv.height / img.naturalHeight;
                    ancho = img.naturalWidth * factor;
                    posX = (cv.width - ancho) / 2;
                }

                cv.width = cv.width;
                ctx.drawImage(img, posX, posY, ancho, alto);

                //Cargamos imagen en cv2 y cv3
                let cv2 = document.querySelector('#cv2'),
                    ctx2 = cv2.getContext('2d');
                ctx2.clearRect(0, 0, cv.width, cv.height);
                ctx2.drawImage(cv, 0, 0);

                /*let cv3 = document.querySelector('#cv3'),
                    ctx3 = cv3.getContext('2d');
                ctx3.clearRect(0, 0, cv.width, cv.height);
                ctx3.drawImage(cv, 0, 0);*/

                divisiones(num_dificultad);
            }

            guardarImagen();
            img.src = URL.createObjectURL( fichero );
        }
    };

    prepararJuego();
    inp.click();
}
function prepararDnD() {
    let cv = document.querySelector('#cv1');
    let gameStarted = JSON.parse(sessionStorage.getItem('gameStarted'));

    //cv.width = ANCHO_CANVAS;
    //cv.height = cv.width;

    // DnD: Origen
    let imgs = document.querySelectorAll('#sec1 > footer > img');

    imgs.forEach( function( img, idx ) {
        img.setAttribute('draggable', 'true');
        img.setAttribute('data-idx', idx);
        img.ondragstart = function( evt ) {
            evt.dataTransfer.setData('text/plain', idx);
        }
    });
    // DnD: Destino
    cv.ondragover = function( evt ) {
        evt.preventDefault();
    }

    cv.ondrop = function( evt ) {
        evt.preventDefault();

        // if( evt.dataTransfer.files.length > 0 ) {
        if( evt.dataTransfer.getData('text/plain') == '' ) {
            console.log("FICHERO EXTERNO");
            let fichero = evt.dataTransfer.files[0];

            mostrarImagenEnCanvas( fichero );
        }
        else {
            let idx = evt.dataTransfer.getData('text/plain'),
                ctx = cv.getContext('2d'),
                img;
            img = document.querySelector('[data-idx="' + idx + '"]');

            // Pintar la imagen
            let ancho, alto,
                posX, posY;

            if( img.naturalWidth > img.naturalHeight ) {
                ancho = cv.width;
                posX = 0;
                alto = img.naturalHeight * (cv.width / img.naturalWidth);
                posY = (cv.height - alto) / 2;
            }
            else {
                alto = cv.height;
                posY = 0;
                ancho = img.naturalWidth * (cv.height / img.naturalHeight);
                posX = (cv.width - ancho) / 2;
            }
            cv.width = cv.width;
            ctx.beginPath();
            ctx.fillStyle ='#fff';
            ctx.fillRect(0,0,cv.width, cv.height);
            ctx.drawImage( img, posX, posY, ancho, alto);
        }
    }

}
// Función para cargar una imagen al hacer clic 
function cargarImagenAlClick() {
    let cv = document.querySelector('#cv1');
    let inp = document.createElement('input');
    let num_dificultad = parseInt(sessionStorage.getItem('difficulty'));

    inp.setAttribute('type', 'file');
    inp.setAttribute('accept', 'image/*');

    inp.onchange = function(evt) {
        let fichero = inp.files[0];

        if (fichero) {
            let img = new Image();
            img.onload = function() {
                let ctx = cv.getContext('2d');
                let ancho, alto, posX, posY, factor;

                if (img.naturalWidth > img.naturalHeight) {
                    ancho = cv.width;
                    factor = cv.width / img.naturalWidth;
                    alto = img.naturalHeight * factor;
                    posX = 0;
                    posY = (cv.height - alto) / 2;
                } else {
                    alto = cv.height;
                    factor = cv.height / img.naturalHeight;
                    ancho = img.naturalWidth * factor;
                    posY = 0;
                    posX = (cv.width - ancho) / 2;
                }

                ctx.clearRect(0, 0, cv.width, cv.height);
                ctx.drawImage(img, posX, posY, ancho, alto);

                // Cargar la imagen en cv2
                let cv2 = document.querySelector('#cv2');
                let ctx2 = cv2.getContext('2d');
                ctx2.clearRect(0, 0, cv.width, cv.height);
                ctx2.drawImage(cv, 0, 0);

                divisiones(num_dificultad);
            };

            guardarImagen();
            img.src = URL.createObjectURL(fichero);
            prepararJuego();
        }
    };

    cv.addEventListener('click', function() {
        let gameStarted = JSON.parse(sessionStorage.getItem('gameStarted'));
        if(gameStarted === true){
            return;
        }
        inp.click();
    });
}
//Mostrar imagen en Canvas arrastrando
function mostrarImagenEnCanvas ( fichero ) {
    let cv = document.querySelector( '#cv1' ),
        ctx = cv.getContext('2d'),
        img = new Image();
    
    //Comprobamos que el juego no haya empezado
    let gameStarted = JSON.parse(sessionStorage.getItem('gameStarted'));
    let num_dificultad = parseInt(sessionStorage.getItem('difficulty'));
    console.log(num_dificultad);
    if(gameStarted === true){
        return;
    }

        img.onload = function() {ctx.beginPath();
            ctx.fillStyle ='#fff';
            ctx.fillRect(0,0,cv.width, cv.height);
            let ancho, alto,
                posX, posY;

            if( img.naturalWidth > img.naturalHeight ) {
                ancho = cv.width;
                posX = 0;
                alto = img.naturalHeight * (cv.width / img.naturalWidth);
                posY = (cv.height - alto) / 2;
            }
            else {
                alto = cv.height;
                posY = 0;
                ancho = img.naturalWidth * (cv.height / img.naturalHeight);
                posX = (cv.width - ancho) / 2;
            }
            cv.width = cv.width;
            ctx.beginPath();
            ctx.fillStyle ='#fff';
            ctx.fillRect(0,0,cv.width, cv.height);
            ctx.drawImage( img, posX, posY, ancho, alto);

            divisiones(num_dificultad);
        }

        guardarImagen();
        img.src = URL.createObjectURL( fichero );

        prepararJuego();
}


//COMIENZO DE JUEGO
function prepararJuego(){
    //Activamos y desactivamos los botones necesarios
    document.getElementById('comenzar').disabled = false;
    document.getElementById('type-puzzle').disabled = false;
}

function comenzarJuego(){
    //Activamos y desactivamos los botones necesarios
    document.getElementById('comenzar').disabled = true;
    document.getElementById('cargar').disabled = true;
    document.getElementById('difi1').disabled = true;
    document.getElementById('difi2').disabled = true;
    document.getElementById('difi3').disabled = true;
    document.getElementById('terminar').disabled = false;
    
    sessionStorage.setItem('gameStarted', true);
    prepararPuzzle();
    dividir();
    mezclarPiezas();
    piezasDesordenadas();
    
    let tiempoInicio = new Date(); // Obtiene el tiempo de inicio de la partida
    sessionStorage.setItem('tiempoInicio', tiempoInicio);

    if (sessionStorage.getItem('tiempoInicio')) {
        tiempoInicio = new Date(sessionStorage.getItem('tiempoInicio'));
    }

    let tiempoTranscurrido = 0; // Inicializa el tiempo transcurrido
    // Actualiza el tiempo transcurrido cada segundo
    let temporizador = setInterval(function() {
        tiempoTranscurrido = Math.floor((new Date() - tiempoInicio) / 1000); // Calcula el tiempo transcurrido en segundos
        let minutos = Math.floor(tiempoTranscurrido / 60); // Calcula los minutos
        let segundos = tiempoTranscurrido % 60; // Calcula los segundos restantes
        document.getElementById('tiempo').textContent = minutos + 'm ' + segundos + 's'; // Actualiza el tiempo en la interfaz
    }, 1000);

}

function terminarJuego(){
    let tiempoTardado = new Date() - new Date(sessionStorage.getItem('tiempoInicio'));
    let minutosTardados = Math.floor(tiempoTardado / (1000 * 60)); // Calcular minutos
    let segundosTardados = Math.floor((tiempoTardado / 1000) % 60); // Calcular segundos restantes

    showModalRedirigir('Partida finalizada: Has tardado ' + minutosTardados + ' minutos y ' + segundosTardados + ' segundos. Has realizado '  + sessionStorage.getItem('jugadas') +  ' jugadas');
    sessionStorage.clear();

}

//DIFICULTAD
function divisiones(num) {
    sessionStorage.setItem('difficulty', num);
    let cv = document.querySelector('#cv1'),
        ctx = cv.getContext('2d'),
        tam = cv.width / num,
        i;

    let cv2 = document.querySelector('#cv2'),
        ctx2 = cv2.getContext('2d');

   
    ctx2.clearRect(0, 0, cv.width, cv.height);
    ctx2.drawImage(cv, 0, 0);

    ctx2.beginPath();
    ctx2.strokeStyle = '#a00';
    ctx2.lineWidth = 2;

    for( i = 1; i < num; i++ ) {
        // verticales
        ctx2.moveTo( i * tam, 0);
        ctx2.lineTo( i * tam, cv.height);
        // horizontales
        ctx2.moveTo( 0, i * tam);
        ctx2.lineTo( cv.width, i * tam);
    }

    ctx2.stroke();
}

function dividir(){
    let num = parseInt(sessionStorage.getItem('difficulty'));
    let cv = document.querySelector('#cv2'),
    ctx = cv.getContext('2d'),
    tam = cv.width / num,
    i;

    // ************************************
    if( !document.querySelector('#cv3') ) {
        // Hacer copia de imagen cargada
        let cvCopia = cv.cloneNode();

        cvCopia.setAttribute('id', 'cv3');
        cvCopia.getContext('2d').drawImage( cv, 0, 0);
        document.body.appendChild(cvCopia);
    }
    // ************************************

    ctx.beginPath();
    ctx.strokeStyle = '#a00';
    ctx.lineWidth = 2;

    for( i = 1; i < num; i++ ) {
        // verticales
        ctx.moveTo( i * tam, 0);
        ctx.lineTo( i * tam, cv.height);
        // horizontales
        ctx.moveTo( 0, i * tam);
        ctx.lineTo( cv.width, i * tam);
    }

    ctx.stroke();
}

//GUARDAR Y RECUPERAR EN EL SESSIONSTORAGE
function guardarImagen() {
    // Se selecciona el canvas con la imagen a guardar
    let cv = document.querySelector('#cv1');
    // Se guarda el canvas utilizando la función toDataURL()
    sessionStorage['imagen'] = cv.toDataURL('image/png');
}
function recuperarImagen() {
    if( sessionStorage['imagen'] ) {
        // Se selecciona un elemento HTML img donde mostrar la imagen
        let img = document.querySelector('#elemIMG');
        img.src = sessionStorage['imagen'];
    }
}

//PREPARAR CANVAS PARA EL PUZZLE
function prepararPuzzle() {
    let cv = document.querySelector('#cv2');
    let ctx = cv.getContext('2d');
    let num = parseInt(sessionStorage.getItem('difficulty'));
    let jugadas = 0;
    guardarImagen();

        cv.onclick = function( evt ) {
            let x = evt.offsetX,
                y = evt.offsetY,
                tam = cv.width / num,
                fila, col;

            fila = Math.min( Math.max( Math.floor(y / tam), 0 ), num - 1);
            col = Math.min( Math.max( Math.floor(x / tam), 0 ), num - 1);

            console.log( `(${fila}, ${col})`);

            if( !sessionStorage['seleccionada'] ) {
                sessionStorage['seleccionada'] = JSON.stringify( {"fila":fila,"col":col} );

            }
            else { // Intercambio
                let sel = JSON.parse( sessionStorage['seleccionada']);

                let cv2 = cv.cloneNode();
                    cv2.getContext('2d').drawImage(cv, 0, 0),
                    ctx2 = cv.getContext('2d');

                ctx2.drawImage( cv2, col * tam, fila * tam, tam, tam, sel.col * tam, sel.fila * tam, tam, tam);
                ctx2.drawImage( cv2, sel.col * tam, sel.fila * tam, tam, tam, col * tam, fila * tam, tam, tam);

                sessionStorage.removeItem('seleccionada');
                jugadas++;
                dividir();
                
                //Guardamos los datos del puzzle
                sessionStorage.setItem('jugadas', JSON.stringify(jugadas));
                document.getElementById('jugadas').textContent = parseInt(sessionStorage.getItem('jugadas'));;
                const cv2State = cv2.toDataURL();
                sessionStorage.setItem('cv2State', cv2State);
                
            }
        }
}

//MEZCLAR PIEZAS
function mezclarPiezas() {
    let num = parseInt(sessionStorage.getItem('difficulty'));
    let piezas = [],
        i, j, aux;

    for( i = 0; i < num * num; i++)
        piezas.push( i );

    // mezclar piezas
    piezas.forEach( function(pieza, idx) {
        j = Math.floor( Math.random() * (num * num) );
        aux = pieza;
        piezas[ idx ] = piezas[ j ];
        piezas[j] = aux;
    });

    console.log( piezas );

    sessionStorage['piezas'] = JSON.stringify( piezas );
}

//MOSTRAR LAS PIEZAS DESORDENADAS
function piezasDesordenadas() {
    let num = parseInt(sessionStorage.getItem('difficulty'));
    let piezas = JSON.parse( sessionStorage['piezas'] ),
    cv = document.querySelector('#cv2'),
    ctx = cv.getContext('2d'),
    cv3 = document.querySelector('#cv3'),
    tam = cv.width / num;

    cv.width = cv.width;
    piezas.forEach(function( pieza, idx) {
        let fila, col, // posición en el vector de piezas
            fila2, col2;

            fila = Math.floor(idx / num);
            col = idx % num;

            fila2 = Math.floor(pieza / num);
            col2 = pieza % num;

            ctx.drawImage(cv3, col2 * tam, fila2 * tam, tam, tam, col * tam, fila * tam, tam, tam);

        dividir();
    });

}


//CARGA DE PAGINA INICIAL
function loadPage(){
    if(sessionStorage['imagen'] || sessionStorage['jugadas'] || sessionStorage['cv2State'] || sessionStorage['tiempoInicio']){

    }else{
        showModal("Elige la imagen que quieras e intenta montar el puzzle en el menor tiempo posible. Tienes 3 niveles de dificultad en los que intentarlo.");
    }
    
}

//Función para MODALES
function showModal(message) {
    //Accedemos a los elementos del HTML modal
    const modal = document.getElementById('errorModal');
    const span = document.getElementsByClassName("close")[0];
    document.getElementById('errorMessage').textContent = message;

    modal.style.display = "block";
    span.onclick = function() {
        modal.style.display = "none";
        
    }
    //Si clicamos fuera del cuadro se cierra el modal
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function showModalRedirigir(message) {
    //Accedemos a los elementos del HTML modal
    const modal = document.getElementById('errorModal');
    const span = document.getElementsByClassName("close")[0];
    document.getElementById('errorMessage').textContent = message;

    modal.style.display = "block";
    span.onclick = function() {
        modal.style.display = "none";
        window.location.href = "index.html";
        
    }
    //Si clicamos fuera del cuadro se cierra el modal
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            window.location.href = "index.html";
        }
    }
}



