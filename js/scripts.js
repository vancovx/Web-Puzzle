const _WIDTH  = 360,
	  _HEIGHT = 240;

var cv01, ctx01;
var cv02, ctx02;
var dificultad;
var imagenCargada;
var ancho, alto, dim;
var matriz, puzzle, piezas, ayuda;
var movs, tiempo, fallos;
var mousePos, selected, game;

setInterval(function(){
	if(game){
		tiempo+= .1;
		tiempo = Math.round(tiempo * 10) / 10;
		showScore();
	}
}, 100);

var mouseListener = function(e)
	{
		mousePos = getMousePos(cv02, e);
		mousePos.x = parseInt(parseInt(mousePos.x) / dim);
		mousePos.y = parseInt(parseInt(mousePos.y) / dim);

		let fc = cv02.getAttribute('data-fc');
		if (fc)
		{
			fc = JSON.parse(fc);
			if(fc.fila == mousePos.x && fc.col == mousePos.y)
			{
				return;
			}
		}

		drawPuzzle();
		ctx02.fillStyle = 'rgba(255,255,255,.5)';
		ctx02.fillRect(mousePos.y * dim, mousePos.x * dim, dim, dim);		
		
		fc = {'fila':mousePos.x,'col':mousePos.y};
		cv02.setAttribute('data-FC',JSON.stringify(fc));
	};

var mouseOut = function()
	{
		ayuda = false;
		drawPuzzle();
		cv02.removeAttribute('data-fc');
	};

function loadCanvas()
{
	let cvs = document.querySelectorAll('canvas');
	cvs.forEach(function(e){
		e.width  = _WIDTH;
		e.height = _HEIGHT;
	});

	cv01 = document.getElementById('cv01');
	ctx01 = cv01.getContext('2d');
	cv02 = document.getElementById('cv02');
	ctx02 = cv02.getContext('2d');

	ctx02.lineWidth = 2;
	ctx02.strokeStyle = '#aa0000';
	dificultad = 2;
	imagenCargada = false;
	ayuda = false;
	selected = -1;
	game = false;

	loadDragnDrop();
	loadText();
}

function loadDragnDrop()
{
	cv01.ondragenter = function(e){
		cv01.style.boxShadow = '0 0 16px rgb(82, 200, 238)';
	};

	cv01.ondragleave = function(e){
		cv01.style.boxShadow = 'none';
	};

	cv01.ondragover = function(e){
		e.stopPropagation();
		e.preventDefault();
	};

	cv01.ondrop = function(e){
		e.preventDefault();
		cv01.style.boxShadow = 'none';
		let fichero = e.dataTransfer.files[0];
		let fr = new FileReader();

		if(fichero.type.match(/image.*/)){
			fr.onload = function(){
				let img = new Image();
				img.onload = function()
				{
					ctx01.clearRect(0, 0, _WIDTH, _HEIGHT);
					ctx01.drawImage(img, 0, 0, _WIDTH, _HEIGHT);
					imageLoaded();
				};
				img.src = fr.result;
			};
			fr.readAsDataURL(fichero);
		}
	}
}

function loadText()
{
	let texto1 = 'Haz click o arrastra';
	let texto2 = 'una imagen aquí';

	ctx01.font = '32px Arial bold';
	ctx01.textBaseline = 'top';
	ctx01.textAlign = 'center';
	ctx01.strokeText(texto1, _WIDTH/2, _HEIGHT/2 - 40);
	ctx01.strokeText(texto2, _WIDTH/2, _HEIGHT/2 - 8);
}

function loadImage()
{
	let inputFile = document.getElementById('input-file');
	let img = new Image();

	img.onload = function()
	{
		ctx01.clearRect(0, 0, _WIDTH, _HEIGHT);
		ctx01.drawImage(img, 0, 0, _WIDTH, _HEIGHT);
		imageLoaded();
	}
	img.src = URL.createObjectURL(inputFile.files[0]);
}

function changeStrokeColor(num)
{
	ctx02.strokeStyle = num;
	if(imagenCargada)
	{
		ctx02.clearRect(0, 0, _WIDTH, _HEIGHT);
		ctx02.drawImage(cv01, 0, 0);
		drawGrid();
	}
}

function changeDifficulty(num)
{
	dificultad = num;
	if(imagenCargada)
	{
		ctx02.clearRect(0, 0, _WIDTH, _HEIGHT);
		ctx02.drawImage(cv01, 0, 0);
		drawGrid();
	}
}

function imageLoaded()
{
	ctx02.clearRect(0, 0, _WIDTH, _HEIGHT);
	ctx02.drawImage(cv01, 0, 0);

	drawGrid();
	imagenCargada = true;
	document.getElementById('begin-button').disabled = false;
}

function drawGrid()
{	
	ancho = dificultad * 3;
	alto  = dificultad * 2;
	dim   = _WIDTH / ancho

	ctx02.beginPath();
	for(let i = 0; i <= ancho; i++)
	{
		ctx02.moveTo(i * dim, 0);
		ctx02.lineTo(i * dim, _HEIGHT);
	}
	for(let j = 0; j <= alto; j++)
	{
		ctx02.moveTo(0, j * dim);
		ctx02.lineTo(_WIDTH, j * dim);
	}
	ctx02.stroke();
}

function beginGame()
{
	createPuzzle();
	shufflePuzzle();
	drawPuzzle();

	game = true;
	fallos = calcularFallos();
	movs = 0;
	tiempo = 0;

	document.getElementById('div-score').style = 'display:flex';
	showScore();
	resetDragnDrop();
	toggleButtons(true);

	cv02.setAttribute('onclick','selectPiece();');
	cv02.addEventListener('mousemove', mouseListener);
	cv02.addEventListener('mouseout', mouseOut);
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		y: evt.clientX - rect.left,
		x: evt.clientY - rect.top
	};
}

function createPuzzle()
{
	let k = 0;
	piezas = [];

	matriz = new Array(alto);
	for(let i = 0; i < alto; i++)
	{
		matriz[i] = new Array(ancho);

		for(let j = 0; j < ancho; j++)
		{
			piezas.push(k);
			matriz[i][j] = k;
			k++;
		}
	}	
}

function shufflePuzzle()
{
	let k = 0;
	shuffle(piezas);

	puzzle = new Array(alto);
	for(let i = 0; i < alto; i++)
	{
		puzzle[i] = new Array(ancho);
		for(let j = 0; j < ancho; j++)
		{
			puzzle[i][j] = piezas[k];
			k++;
		}
	}	
}

function shuffle(array) {
	var ctr = array.length, temp, index;

	while (ctr > 0) {
		index = Math.floor(Math.random() * ctr);
		ctr--;
		temp = array[ctr];
		array[ctr] = array[index];
		array[index] = temp;
	}
}

function drawPuzzle()
{
	ctx02.clearRect(0, 0, _WIDTH, _HEIGHT);
	let imgData;
	let i = 0, j= 0;
	let flag = false;
	for(let k = 0; k < piezas.length; k++)
	{
		for(let x = 0; x < alto && !flag; x++)
		{
			for(let y = 0; y < ancho && !flag; y++)
			{
				if (puzzle[x][y] == k)
				{
					imgData = ctx01.getImageData(j*dim, i*dim, dim, dim);
					ctx02.putImageData(imgData, y*dim, x*dim);
					flag = true;
				
					if (selected == k)
					{	
						ctx02.fillStyle = 'rgba(255,255,0,.5)';
						ctx02.fillRect(y * dim, x * dim, dim, dim);	
					}
				}
			}
		}
		flag = false;
		if (j < ancho - 1){
			j++;
		}else{
			j = 0;
			i++;
		}
	}
	drawGrid();
}

function helpButton()
{
	if (!ayuda){
		ayuda = true;
		ctx02.fillStyle = 'rgba(255,0,0,.5)';

		for(let x = 0; x < alto; x++)
		{
			for(let y = 0; y < ancho; y++)
			{
				if (puzzle[x][y] != matriz[x][y])
				{
					ctx02.fillRect(y * dim, x * dim, dim, dim);
				}
			}
		}
	}
}

function calcularFallos()
{
	let fallos = 0;

	for(let x = 0; x < alto; x++)
	{
		for(let y = 0; y < ancho; y++)
		{
			if (matriz[x][y] != puzzle[x][y])
			{
				fallos++;
			}
		}
	}

	return fallos;
}

function showScore()
{	
	document.getElementById('score-pieces').innerHTML = fallos;
	document.getElementById('score-movs').innerHTML = movs;
	document.getElementById('score-time').innerHTML = tiempo;
}

function toggleButtons(bool)
{
	document.getElementById('input-file').disabled = bool;
	document.getElementById('stk-color').disabled = bool;
	document.getElementById('difficulty').disabled = bool;
	document.getElementById('begin-button').disabled = bool;
	document.getElementById('end-button').disabled = !bool;
	document.getElementById('help-button').disabled = !bool;
}

function resetDragnDrop()
{
	cv01.ondragenter = function(e){
		e.stopPropagation();
		e.preventDefault();
	};

	cv01.ondragleave = function(e){
		e.stopPropagation();
		e.preventDefault();
	};

	cv01.ondragover = function(e){
		e.stopPropagation();
		e.preventDefault();
	};

	cv01.ondrop = function(e){
		e.stopPropagation();
		e.preventDefault();
	}	

}

function endGame()
{	
	let mensaje = 'Has dejado '+ fallos +' piezas por colocar bien después de '+ movs +' movimientos y has empleado '+ tiempo +' segundos';
	mensajeModal(mensaje);
}

function mensajeModal(string)
{
	let div1 = document.createElement('div');
	let div2 = document.createElement('div');
	let p1 = document.createElement('p');
	let button = document.createElement('button');
	let div = document.createElement('div');

	div1.setAttribute('id','modal');
	div2.setAttribute('id','modal2');
	button.setAttribute('onclick','borrarModal();');
	button.textContent = "OK";
	div.innerHTML = string;

	let header = document.querySelector('header');
	header.appendChild(div1).appendChild(div2);
	div2.appendChild(p1).appendChild(div);
	div2.appendChild(button);

	button.focus();
}

function borrarModal(){
	let modal = document.getElementById('modal');
	modal.parentNode.removeChild(modal);
	restartGame();
}

function restartGame()
{
	loadCanvas();
	toggleButtons(false);
	document.getElementById('begin-button').disabled = true;
	document.getElementById('div-score').style = 'display:none';
	document.getElementById('input-file').value = '';
	document.getElementById('difficulty').selectedIndex = 0;
	document.getElementById('stk-color').value = '#aa0000';

	cv02.setAttribute('onclick','');
	cv02.removeEventListener('mousemove',  mouseListener);
	cv02.removeEventListener('mouseout', mouseOut);
}

function selectPiece()
{
	let current = puzzle[mousePos.x][mousePos.y];
	if (selected != -1)
	{
		if(selected == current)
		{
			selected = -1;
		}
		else
		{
			for(let x = 0; x < alto; x++)
			{
				for(let y = 0; y < ancho; y++)
				{
					if (puzzle[x][y] == selected)
					{
						puzzle[mousePos.x][mousePos.y] = selected;
						puzzle[x][y] = current;
						selected = -1;
					}
				}
			}

			fallos = calcularFallos();
			movs++;

			showScore();
			winCondition();
		}
	}
	else
	{
		selected = current;
	}

	drawPuzzle();
}

function winCondition()
{
	if(!calcularFallos())
	{	
		game = false;
		let mensaje = '¡¡Enhorabuena!! <br> Has montado el puzzle en '+ tiempo +' segundos y '+ movs +' movimientos';
		mensajeModal(mensaje);
	}
}