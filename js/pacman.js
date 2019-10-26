// canvas dove disegno pacman e fantasmini
var canvas_pac; 
var ctx_pac;

var canvas_points; 
var ctx_points;

var sndrdy;
var sndgover = new Audio("sounds/gameover.mp3");
var snddie = new Audio("sounds/die.mp3");
var sndeat = new Audio("sounds/eating.mp3");
var sndlife = new Audio("sounds/life.mp3");

var labirinto;
var dimMatrixW;
var dimMatrixH;
var v = 3;

// array fantasmini
var ghosts;

// pacman
var pac;

var vite = 3;
var points = 0;
var pointsinlife = 0;
var pillole;
var started = false;
var play = false;
var img = new Image();
img.src = 'img/pacman.png';

function addpoints(x) {
    points += x;
    pointsinlife += x;
    if (vite < 5 && pointsinlife >= 5000) {
        sndlife.play();
        vite++;
        pointsinlife = 0;
    }
    ctx_points.clearRect(0, 0, canvas_w, 40);
    ctx_points.fillText("Score: " + points, 0, 30);
    for (var i=1; i<vite; i++) ctx_points.drawImage(img, canvas_w-dimpac*i, 0, dimpac, dimpac);
    if (x == 10) {
        pillole--;
        if (pillole == 0) {
            // superato un livello
            document.getElementById('pausa').style.display = 'none';
            console.log("livello superato");
            pillole = undefined;
            play = false;
        }
    }
}

function start() {
    if (labirinto != undefined && play == false) {
        document.getElementById('continua').style.display = 'none';
        var pausa = document.getElementById('pausa');
        pausa.style.left = canvas_lab.offsetLeft + 120 + "px";
        pausa.style.display = 'block';
        play = true;
        started = false;
        draw();
    }
}

function pause() {
    play = false;
    document.getElementById('pausa').style.display = 'none';
    var continua = document.getElementById('continua');
    continua.style.left = canvas_lab.offsetLeft + 120 + "px";
    continua.style.display = 'block';   
}

function openEditor() {
    sndrdy.pause();
    play = false;
    labirinto = undefined;
    document.getElementById('pausa').style.display = 'none';
    document.getElementById('continua').style.display = 'none';
    document.getElementById('openeditor').style.display = 'none';
    canvas_pac.style.display = 'none';
    canvas_points.style.display = 'none';
    vite = 3;
    points = 0;
    pointsinlife = 0;
    initEditor();
}

function initPacman() {
    if (select != -1) deselect();
    if (canvas_lab === undefined) initEditor();
    if (canvas_pac === undefined) {
        canvas_pac = document.getElementById('canvas_pac');
        canvas_pac.width = canvas_w;
        canvas_pac.height = canvas_h;
        document.getElementById('pausa').style.top = canvas_h + 50 + "px";
        document.getElementById('continua').style.top = canvas_h + 50 + "px";
        document.getElementById('openeditor').style.top = canvas_h + 50 + "px";
        ctx_pac = canvas_pac.getContext('2d');
        canvas_points = document.getElementById('canvas_points');
        canvas_points.width = canvas_w;
        canvas_points.height = canvas_h;
        ctx_points = canvas_points.getContext('2d');
        ctx_points.fillStyle = "white";
        ctx_points.font = '30px Arial';
    }
    
    if (labirinto == undefined || pillole == undefined) {
        // disegno pillole
        ctx_lab.fillStyle = 'white';
        for(var i = dimbordo + 1 + dimpac/2; i<canvas_w; i+=dimpac) {
            for(var j = dimbordo + 1 + dimpac/2; j<canvas_h; j+=dimpac) {
                ctx_lab.beginPath();
                ctx_lab.arc(i, j, 3, 0, Math.PI * 2, true);
                ctx_lab.fill();
            }
        }
		
		pillole = ((canvas_w - (dimbordo + 1) * 2) / dimpac) * ((canvas_h - (dimbordo + 1) * 2) / dimpac);
        labirinto = getMatrix();

        if (pillole <= 1) {
            walls = [];
            labirinto = undefined;
            alert("Spazio esaurito impossibile giocare!");
            ctx_lab.clearRect(0, 0, canvas_w, canvas_h);
            initEditor();
            return;
        }
    }

    ctx_pac.clearRect(0, 0, canvas_w, canvas_h);
    ctx_points.clearRect(0, 0, canvas_w, 40);

    document.getElementById('play').style.display = 'none';
    document.getElementById('bmw').style.display = 'none';
    document.getElementById('width').style.display = 'none';
    document.getElementById('bpw').style.display = 'none';
    document.getElementById('bmh').style.display = 'none';
    document.getElementById('height').style.display = 'none';
    document.getElementById('bph').style.display = 'none';
    canvas_pac.style.display = 'block';
    canvas_points.style.display = 'block';
    var editor = document.getElementById('openeditor');
    editor.style.left = canvas_lab.offsetLeft + "px";
    editor.style.display = 'block';

    pac = {}
    pac.pers = "pac";
    // cerco una posizione libera per inserire pacman
    var i = 1;
    while (i<dimMatrixH - 1) {
        var j = 1;
        var trovata = false;
        while (j < dimMatrixW - 1) {
            if (labirinto[i][j] <= 0) {
                trovata = true;
                pac.x = dimbordo + 1 + dimpac/2 + (j - 1) * dimpac;
                pac.y = dimbordo + 1 + dimpac/2 + (i - 1) * dimpac;;
                pac.a = i;
                pac.b = j;
                break;
            }
            j++;
        }
        if (trovata) break;
        i++;
    }
    pac.direction = 0;
    pac.changedir = undefined;
    pac.bocca = true;
    pac.count_bocca = 0;

    var centroa = Math.floor((dimMatrixH - 2) / 2);
    var centrob = Math.floor((dimMatrixW - 2) / 2);
    var cx = ghostWall.x + dimpac * 2 + dimpac/2;
    var cy = ghostWall.y + dimpac/2;

	ghosts = [];
	ghosts.push({pers:"ghost", x:cx, y:cy, a:centroa, b:centrob, color:'red', direction:2, dimlegs: 3, changelegs: 3, changedir: undefined, trovatomuro: false});
	ghosts.push({pers:"ghost", x:cx+dimpac, y:cy, a:centroa, b:centrob+1, color:'orange', direction:2, dimlegs: 3, changelegs: 3, changedir: undefined, trovatomuro: false});
    ghosts.push({pers:"ghost", x:cx+dimpac*2, y:cy, a:centroa, b:centrob+2, color:'pink', direction:2, dimlegs: 3, changelegs: 3, changedir: undefined, trovatomuro: false});
    ghosts.push({pers:"ghost", x:cx-dimpac, y:cy, a:centroa, b:centrob-1, color:'aqua', direction:2, dimlegs: 3, changelegs: 3, changedir: undefined, trovatomuro: false});

    addpoints(0);
    drawPac();
    for (var i=0; i<ghosts.length; i++) drawGhost(ghosts[i]);
    sndrdy = new Audio("sounds/ready.mp3");
    sndrdy.play();
    if (!started) {
        started = true;
        setTimeout(start, 4000);
    }
}

function getMatrix() {
    dimMatrixW = ((canvas_w - (dimbordo + 1) * 2) / dimpac) + 2;
    dimMatrixH = ((canvas_h - (dimbordo + 1) * 2) / dimpac) + 2;
    var labirinto = new Array(dimMatrixH);
    for (var i=0; i<dimMatrixH; i++) {
        labirinto[i] = new Array(dimMatrixW);
        for (var j=0; j<dimMatrixW; j++) {
            labirinto[i][j] = 0;
        }
    }

    for (var i=0; i<walls.length; i++) {
        var sx = (walls[i].x - (dimbordo + 1)) / dimpac + 1;
        var sy = (walls[i].y - (dimbordo + 1)) / dimpac + 1;
        var dx = walls[i].width / dimpac + sx;
        var dy = walls[i].height / dimpac + sy;

        if (sx < 1) sx = 1;
        if (sy < 1) sy = 1;
        if (dx > dimMatrixW - 1) dx = dimMatrixW - 1;
        if (dy > dimMatrixH - 1) dy = dimMatrixH - 1;

        for (var x=sx; x<dx; x++) {
            for (var y=sy; y<dy; y++) {
                if (labirinto[y][x] != 1) {
                    ctx_lab.clearRect((x-1) * dimpac + dimbordo + 1 + dimpac/2 - 3, (y-1) * dimpac + dimbordo + 1 + dimpac/2 - 3, 6, 6);
                    pillole--;
                    labirinto[y][x] = 1;
                }
            }
        }
    }
    
    var i;
    for (i=0; i<dimMatrixH; i++) {
        labirinto[i][0] = 1;
        labirinto[i][dimMatrixW - 1] = 1;
        labirinto[0][i] = 1;
        labirinto[dimMatrixH - 1][i] = 1;
    }

    for (var j=i; j < dimMatrixW; j++) {
        labirinto[0][j] = 1;
        labirinto[dimMatrixH - 1][j] = 1;
    }
    
    for (var i=0; i<borders.length; i++) {
        var x = 0;
        var sx;
        var y = 0;
        var sy;
        if (borders[i].x == 0) {
            y++;
            sx = dimMatrixW - 1;
        }
        else {
            x += (borders[i].x - (dimbordo + 1)) / dimpac;
            sx = x;
        }
        if (borders[i].y == 0) {
            x++;
            sx++;
            sy = dimMatrixH - 1;
        }
        else {
            y += (borders[i].y - (dimbordo + 1)) / dimpac;
            sy = y;
        }
        labirinto[y][x] = 0;
        labirinto[sy][sx] = 0;
    } 

    return labirinto;
}

document.onkeydown = function (event) {
    switch (event.keyCode) {
        case 37:
        case 100:
            // sinistra
            pac.changedir = -1;
            break;
        case 39:
        case 102:
            // destra
            pac.changedir = 1;
            break;
        case 40:
        case 98:
            // giu
            pac.changedir = 0;
            break;
        case 38:
        case 104:
            // su
            pac.changedir = 2;
            break;
        default:
    }
    if (pac.count_bocca > 10) pac.count_bocca = 0;
}

function contains(g, x, y) {
    if (x > g.x - dimpac/2 && x < g.x + dimpac/2 && y > g.y - dimpac/2 && y < g.y + dimpac/2) return true;
    return false;
}

function draw() {
    if (play == true) {
        ctx_pac.clearRect(0, 0, canvas_w, canvas_h);
        update(pac);
        var sx = pac.x - dimpac/2;
        var dx = pac.x + dimpac/2;
        var ya = pac.y - dimpac/2;
        var yb = pac.y + dimpac/2;

        for (var i=0; i<ghosts.length; i++) {
            update(ghosts[i]); 
            
            if (contains(ghosts[i], sx, pac.y) || contains(ghosts[i], pac.x, ya) || contains(ghosts[i], dx, pac.y) || contains(ghosts[i], pac.x, yb)) {
                snddie.play();
                document.getElementById('pausa').style.display = 'none';
                play = false;
                vite--;
            }
        }

        if (play == true) requestAnimationFrame(draw);
        else {
            if (vite == 0) { 
                document.getElementById('pausa').style.display = 'none';
				sndgover.play();
                play = false;
                vite = 3;
                points = 0;
                pointsinlife = 0;
                labirinto = undefined;
                alert("GAME OVER !!!");
            }
            initPacman();
        }
    }
}

function setRandomDir(pers) {
	var dir = [];
	if (labirinto[pers.a + 1][pers.b] <= 0) dir.push(0);
	if (labirinto[pers.a][pers.b + 1] <= 0) dir.push(1);
	if (labirinto[pers.a - 1][pers.b] <= 0) dir.push(2);
	if (labirinto[pers.a][pers.b - 1] <= 0) dir.push(-1);
	if (dir.length > 0) pers.direction = dir[Math.floor(Math.random() * dir.length)];
}	

function setMinDir(ghost, dir) {
    if (dir.length == 1) ghost.direction = dir[0];
    else {
        var i=0;
        while (i<dir.length) {
            var conflitto = dir[i] + ghost.direction;
            if (ghost.direction == dir[i] || (conflitto != 0 && conflitto != 2)) {
                ghost.direction = dir[i];
                break;
            }	
            i++;
        }
    }
}

function updateDirectionGhost(ghost) {
    var rand;
    if (Math.abs(ghost.a - pac.a) + Math.abs(ghost.b - pac.b) == 1) rand = 1;
    else {
        switch (ghost.color) {
            case 'red':
                rand = 0.1;
                break;
            case 'orange':
                rand = 0.05;
                break;
            case 'pink':
                rand = 0.02;
                break;
            case 'aqua':
                rand = 0.04;
                break;
            default:
        }
    }
    
    if (rand == 1 || Math.random() <= rand) {
        switch (ghost.direction) {
            case 0: 
                // giu 
                if (labirinto[ghost.a + 1][ghost.b] == 1 || (ghost.a + 1 == dimMatrixH - 1 && labirinto[1][ghost.b] == 1)) ghost.trovatomuro = true;
                break;
            case 2:
                // su
                if (labirinto[ghost.a - 1][ghost.b] == 1 || (ghost.a - 1 == 0 && labirinto[dimMatrixH-2][ghost.b] == 1)) ghost.trovatomuro = true;
                break;
            case 1: 
                // destra
                if (labirinto[ghost.a][ghost.b + 1] == 1 || (ghost.b + 1 == dimMatrixW - 1 && labirinto[ghost.a][1] == 1)) ghost.trovatomuro = true;
                break;
            case -1: 
                // sinistra
                if (labirinto[ghost.a][ghost.b - 1] == 1 || (ghost.b - 1 == 0 && labirinto[ghost.a][dimMatrixW-2] == 1)) ghost.trovatomuro = true;
                break;
            default:        
        }
        
        var dir = [];
        if (labirinto[ghost.a + 1][ghost.b] <= 0 && (ghost.a + 1 != dimMatrixH - 1 || (ghost.a + 1 == dimMatrixH - 1 && labirinto[1][ghost.b] <= 0))) dir.push(0);
        if (labirinto[ghost.a][ghost.b + 1] <= 0 && (ghost.b + 1 != dimMatrixW - 1 || (ghost.b + 1 == dimMatrixW - 1 && labirinto[ghost.a][1] <= 0))) dir.push(1);
        if (labirinto[ghost.a - 1][ghost.b] <= 0 && (ghost.a - 1 != 0 || (ghost.a - 1 == 0 && labirinto[dimMatrixH-2][ghost.b] <= 0))) dir.push(2);
        if (labirinto[ghost.a][ghost.b - 1] <= 0 && (ghost.b - 1 != 0 || (ghost.b - 1 == 0 && labirinto[ghost.a][dimMatrixW-2] <= 0))) dir.push(-1);
        
        var chdir = [];
        if (pac.x == ghost.x) {
            if (ghost.y > pac.y) chdir.push(2);
            else chdir.push(0);
        }
        else {
            if (pac.y == ghost.y) {
                if (ghost.x > pac.x) chdir.push(-1);
                else chdir.push(1);
            }
            else {
                if (ghost.y > pac.y) chdir.push(2);
                else chdir.push(0);
                if (ghost.x > pac.x) chdir.push(-1);
                else chdir.push(1);
            }
        }
        
        var trovato;
        var i = 0;
        while (trovato == undefined && i < chdir.length) {
            var j = 0;
            while (j < dir.length) {
                var conflitto = dir[j] + ghost.direction;
                if (chdir[i] == dir[j] && !(ghost.trovatomuro && (conflitto == 0 || conflitto == 2))) {
                    trovato = j;
                    break;
                }
                j++;
            }
            i++;
        }
        
        var d = ghost.direction;
    
        if (trovato == undefined) setMinDir(ghost, dir);
        else ghost.direction = dir[trovato];
        
        var conflitto = d + ghost.direction;
        if (d != ghost.direction && conflitto != 0 && conflitto != 2) ghost.trovatomuro = false;
    }
}

function update(pers) {
    if ((pers.y - dimbordo - 1 - dimpac/2) % dimpac == 0 && (pers.x - dimbordo - 1 - dimpac/2) % dimpac == 0) {
		if (pers.pers == "pac" && pers.changedir != undefined) changedirection(pers);
		else if (pers.pers == "ghost") updateDirectionGhost(pers);
	}
    switch (pers.direction) {
        case 0: 
            // giu 
            if ((pers.y - dimbordo - 1 - dimpac/2) % dimpac == 0) {
                if (pers.pers === "pac" && labirinto[pers.a][pers.b] == 0) {
                    sndeat.play();
                    labirinto[pers.a][pers.b] = -1;
                    ctx_lab.clearRect(pers.x - 3, pers.y - 3, 6, 6);
                    addpoints(10);
                }
                if (pers.a + 1 == dimMatrixH - 1 && labirinto[pers.a + 1][pers.b] <= 0 && labirinto[1][pers.b] != 1) {
                    pers.y = dimbordo + 1 + dimpac/2;
                    pers.a = 1;
                }
                else {
                    if (labirinto[pers.a + 1][pers.b] != 1 && pers.a + 1 != dimMatrixH - 1) {
                        pers.y += v; 
                        pers.a = (pers.y - dimbordo - 1 - dimpac/2) / dimpac + 1; 
                    }
                    else {
                        if (pers.pers === "pac") pac.count_bocca = 11;
                        else setRandomDir(pers);
                    }
                }
            }
            else {
                pers.y += v;
                pers.a = (pers.y - dimbordo - 1 - dimpac/2) / dimpac + 1;
            }
            break;
        case 1: 
            // destra
            if ((pers.x - dimbordo - 1 - dimpac/2) % dimpac == 0) {  
                if (pers.pers === "pac" && labirinto[pers.a][pers.b] == 0) {
                    sndeat.play();
                    labirinto[pers.a][pers.b] = -1;
                    ctx_lab.clearRect(pers.x - 3, pers.y - 3, 6, 6);
                    addpoints(10);
                }
                if (pers.b + 1 == dimMatrixW - 1 && labirinto[pers.a][pers.b + 1] <= 0 && labirinto[pers.a][1] != 1) {
                    pers.x = dimbordo + 1 + dimpac/2;
                    pers.b = 1;
                }
                else {
                    if (labirinto[pers.a][pers.b + 1] != 1 && pers.b + 1 != dimMatrixW - 1) {
                        pers.x += v;
                        pers.b = (pers.x - dimbordo - 1 - dimpac/2) / dimpac + 1;
                    }
                    else {
                        if (pers.pers === "pac") pac.count_bocca = 11;
                        else setRandomDir(pers);
                    }
                }
            }
            else {
                pers.x += v;
                pers.b = (pers.x - dimbordo - 1 - dimpac/2) / dimpac + 1;
            }
            break;
        case 2: 
            // su
            if ((pers.y - dimbordo - 1 - dimpac/2) % dimpac == 0) {  
                if (pers.pers === "pac" && labirinto[pers.a][pers.b] == 0) {
                    sndeat.play();
                    labirinto[pers.a][pers.b] = -1;
                    ctx_lab.clearRect(pers.x - 3, pers.y - 3, 6, 6);
                    addpoints(10);
                }
                if (pers.a - 1 == 0 && labirinto[pers.a - 1][pers.b] <= 0 && labirinto[dimMatrixH-2][pers.b] != 1) { 
                    pers.y = canvas_h - dimbordo - 1 - dimpac/2;
                    pers.a = dimMatrixH - 2;
                }
                else {
                    if (labirinto[pers.a - 1][pers.b] != 1 && pers.a - 1 != 0) {
                        pers.y -= v;
                        pers.a = (pers.y - dimbordo - 1 - dimpac/2) / dimpac + 1;
                    }
                    else {
                        if (pers.pers === "pac") pac.count_bocca = 11;
                        else setRandomDir(pers);
                    }
                }
            }
            else {
                pers.y -= v;
                pers.a = (pers.y - dimbordo - 1 - dimpac/2) / dimpac + 1;
            }
            break;
        case -1: 
            // sinistra
            if ((pers.x - dimbordo - 1 - dimpac/2) % dimpac == 0) {  
                if (pers.pers === "pac" && labirinto[pers.a][pers.b] == 0) {
                    sndeat.play();
                    labirinto[pers.a][pers.b] = -1;
                    ctx_lab.clearRect(pers.x - 3, pers.y - 3, 6, 6);
                    addpoints(10);
                }
                if (pers.b - 1 == 0 && labirinto[pers.a][pers.b - 1] <= 0 && labirinto[pers.a][dimMatrixW-2] != 1) {
                    pers.x = canvas_w - dimbordo - 1 - dimpac/2;
                    pers.b = dimMatrixW - 2;
                }
                else {
                    if (labirinto[pers.a][pers.b - 1] != 1 && pers.b - 1 != 0) {
                        pers.x -= v;
                        pers.b = (pers.x - dimbordo - 1 - dimpac/2) / dimpac + 1;
                    }
                    else {
                        if (pers.pers === "pac") pac.count_bocca = 11;
                        else setRandomDir(pers);
                    }
                }
            }
            else {
                pers.x -= v;
                pers.b = (pers.x - dimbordo - 1 - dimpac/2) / dimpac + 1;
            }
            break;
        default:
    }
    
    if (pers.pers === "pac") {
        drawPac();
        if (pac.count_bocca == 10) {
            pac.bocca = !pac.bocca;
            pac.count_bocca = 0;
        }
        if (pac.count_bocca < 10 ) pac.count_bocca++;
    }
    else drawGhost(pers);   
}

function changedirection(pers) {
    var altrotentativo;
    if (pers.changedir > 5) {
        pers.changedir -= 10;
        altrotentativo = false;
    } 
    else altrotentativo = true;
    switch (pers.changedir) {
        case 0:
            // giu
            if (labirinto[pers.a + 1][pers.b] != 1) pers.direction = pers.changedir;
            else if (pers.pers === "pac" && altrotentativo) pers.changedir += 10;
            break;
        case 1:
            // destra
            if (labirinto[pers.a][pers.b + 1] != 1) pers.direction = pers.changedir;
            else if (pers.pers === "pac" && altrotentativo) pers.changedir += 10;
            break;
        case 2: 
            // su
            if (labirinto[pers.a - 1][pers.b] != 1) pers.direction = pers.changedir;
            else if (pers.pers === "pac" && altrotentativo) pers.changedir += 10;
            break;
        case -1:
            // sinistra
            if (labirinto[pers.a][pers.b - 1] != 1) pers.direction = pers.changedir;
            else if (pers.pers === "pac" && altrotentativo) pers.changedir += 10;
            break;
        default:
    }
    if (pers.changedir <= 2) pers.changedir = undefined;
}

document.onkeydown = function (event) {
    if (pac != undefined) {
        switch (event.keyCode) {
            case 37:
            case 100:
                // sinistra
                pac.changedir = -1;
                break;
            case 39:
            case 102:
                // destra
                pac.changedir = 1;
                break;
            case 40:
            case 98:
                // giu
                pac.changedir = 0;
                break;
            case 38:
            case 104:
                // su
                pac.changedir = 2;
                break;
            default:
        }
        if (pac.count_bocca > 10) pac.count_bocca = 0;
    }
}

function drawPac() {    
    ctx_pac.save();
    ctx_pac.translate(pac.x, pac.y);
    switch (pac.direction) {
        case 0:
            // giu
            ctx_pac.rotate(Math.PI / 180 * 90);
            break;
        case -1:
            // sinistra
            ctx_pac.scale(-1, 1);
            break;
        case 2: 
            // su
            ctx_pac.rotate(-Math.PI / 180 * 90);
            break;
        default:
    }

    var r = dimpac / 2;
    var abocca = 0;
    if (pac.bocca == true) {
        abocca = Math.PI/6;
        ctx_pac.lineTo(r*Math.cos(abocca), r*Math.sin(abocca));
    }

    // Pacman
    ctx_pac.beginPath();
    ctx_pac.moveTo(0, 0);
    ctx_pac.arc(0, 0, r, abocca, Math.PI*2 - abocca, false);
    ctx_pac.fillStyle = 'yellow';
    ctx_pac.fill();

    // bocca
    ctx_pac.beginPath();
    ctx_pac.moveTo(0, 0);
    if (pac.bocca == true) ctx_pac.strokeStyle = 'yellow';
    else ctx_pac.strokeStyle = 'black';
    ctx_pac.lineTo(r*Math.cos(-abocca), r*Math.sin(-abocca));
    ctx_pac.stroke();

    // occhio
    ctx_pac.beginPath();
    var posocchio = -Math.PI/4;
    if (pac.bocca == true) posocchio = -Math.PI/2;
    var cxo = (r/2)*Math.cos(posocchio);
    var cyo = (r/2)*Math.sin(posocchio);
    var rocchio = r*12/100;
    ctx_pac.moveTo(cxo + rocchio, cyo);
    ctx_pac.arc(cxo, cyo, rocchio, 0, Math.PI*2, false);
    ctx_pac.fillStyle = 'black';
    ctx_pac.fill();

    ctx_pac.restore();
}

function drawGhost(ghost) {
    var x = ghost.x - dimpac/2;
    var y = ghost.y - dimpac/2;
    ctx_pac.fillStyle = ghost.color;
    ctx_pac.beginPath();
    ctx_pac.moveTo(x, y + dimpac);
    ctx_pac.lineTo(x, y + dimpac/2);
    ctx_pac.bezierCurveTo(x, y + dimpac/5, x + dimpac/5, y, x + dimpac/2, y);
    ctx_pac.bezierCurveTo(x + dimpac/2 + dimpac/5, y, x + dimpac, y + dimpac/5, x + dimpac, y + dimpac/2);
    ctx_pac.lineTo(x + dimpac, y + dimpac);
    var dx = x + dimpac;
    var dy = y + dimpac;
    var di = dimpac / ghost.dimlegs / 2;
    var dj = Math.floor(dimpac/5);
    for (var i=0; i<ghost.dimlegs; i++) {
        dx -= di;
        ctx_pac.lineTo(dx, dy - dj);
        dx -= di;
        ctx_pac.lineTo(dx, dy);
    }
    ctx_pac.fill();

    if (ghost.changelegs == 7) {
        if (ghost.dimlegs == 3) ghost.dimlegs = 4;
        else ghost.dimlegs = 3;
        ghost.changelegs = 0;
    }
    ghost.changelegs += 1;

    ctx_pac.fillStyle = 'white';
    ctx_pac.beginPath();
    ctx_pac.arc(x + dimpac/4 + 1, y + dimpac/4 + 2, 3, 0, Math.PI * 2, true);
    ctx_pac.arc(x + dimpac/2 + dimpac/4 - 1, y + dimpac/4 + 2, 3, 0, Math.PI * 2, true);
    ctx_pac.fill();
}
