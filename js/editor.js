var canvas_w = 616;
var canvas_h = 616;

function changedim() {
    ctx_lab = undefined;
    canvas_pac = undefined;
    var w = search(walls, ghostWall.x, ghostWall.y);
    var cx = Math.floor((canvas_w - (dimbordo + 1) * 2) / dimpac / 2) - 3;
    var cy = Math.floor((canvas_h - (dimbordo + 1) * 2) / dimpac / 2) - 1;
    var x = cx * dimpac + dimbordo + 1;
    var y = cy * dimpac + dimbordo + 1;
    walls[w].x = x;
    walls[w].y = y;
}

function increaseWidth() {
    if (canvas_w == 616) {
        var bmw = document.getElementById('bmw');
        bmw.style.left = canvas_lab.offsetLeft + 280 + "px";
        bmw.style.display = 'block';
    }
    canvas_w += dimpac;
    changedim();
    initEditor();
}

function decreaseWidth() {
    canvas_w -= dimpac;
    if (canvas_w == 616) document.getElementById('bmw').style.display = 'none';
    changedim();
    initEditor();
}

function increaseHeight() {
    if (canvas_h == 616) {
        var bmh = document.getElementById('bmh');
        bmh.style.left = canvas_lab.offsetLeft + 430 + "px";
        bmh.style.display = 'block';
    }
    canvas_h += dimpac;
    changedim();
    initEditor();
}

function decreaseHeight() {
    canvas_h -= dimpac;
    if (canvas_h == 616) document.getElementById('bmh').style.display = 'none';
    changedim();
    initEditor();   
}

var canvas_lab; // canvas del labirinto
var ctx_lab;

var dimpac = 30;   // dimensione pacman
var dimbordo = 7;  // dimensione bordo del labirinto

var ghostWall = {};
var borders = [];
var walls = [];

var sx;
var sy;
var fx;
var fy;

var new_wall = -1;
var resize = -1;
var latoresize;
var drag = -1;
var select = -1;

function initEditor() {
	if (ctx_lab === undefined) {
        var container = document.getElementById('container');
        var home = document.getElementById('home');
        if (home != null) container.removeChild(home);
        canvas_lab = document.getElementById('canvas_lab');
        canvas_lab.width = canvas_w;
        canvas_lab.height = canvas_h;
        ctx_lab = canvas_lab.getContext('2d');

        var cx = Math.floor((canvas_w - (dimbordo + 1) * 2) / dimpac / 2) - 3;
        var cy = Math.floor((canvas_h - (dimbordo + 1) * 2) / dimpac / 2) - 1;
        var x = cx * dimpac + dimbordo + 1;
        var y = cy * dimpac + dimbordo + 1;
        ghostWall.x = x;
        ghostWall.y = y;

        canvas_lab.addEventListener('mousedown', mousedown, false);
        canvas_lab.addEventListener('mousemove', mousemove, false);
    }
    
    if (walls.length == 0) {
        var wall = {
            type: "blocked",
            x: ghostWall.x,
            y: ghostWall.y,
            width: dimpac*6,
            height: dimpac,
            contains: function(x, y) {
                if (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height) return true;
                return false;
            },
        }
        walls.push(wall);
	}

    canvas_lab.style.display = 'block';
    var play = document.getElementById('play');
    play.style.left = canvas_lab.offsetLeft + "px";
    play.style.display = 'block';
    if (canvas_w > 616) {
        var bmw = document.getElementById('bmw');
        bmw.style.left = canvas_lab.offsetLeft + 280 + "px";
        bmw.style.display = 'block';
    }
    var w = document.getElementById('width');
    w.style.left = canvas_lab.offsetLeft + 310 + "px";
    w.style.display = 'block';
    var bpw = document.getElementById('bpw');
    bpw.style.left = canvas_lab.offsetLeft + 365 + "px";
    bpw.style.display = 'block';
    if (canvas_h > 616) {
        var bmh = document.getElementById('bmh');
        bmh.style.left = canvas_lab.offsetLeft + 430 + "px";
        bmh.style.display = 'block';
    }
    var h = document.getElementById('height');
    h.style.left = canvas_lab.offsetLeft + 460 + "px";
    h.style.display = 'block';
    var bph = document.getElementById('bph');
    bph.style.left = canvas_lab.offsetLeft + 515 + "px";
    bph.style.display = 'block';

    ctx_lab.lineWidth = 2;
    ctx_lab.strokeStyle = 'blue';
    ctx_lab.fillStyle = 'blue';

    drawLab(false);
}

function search(array, x, y) { 
    var i = array.length - 1;
    while (i >= 0) {
        if (array[i].contains(x,y)) return i;
        i--;
    }
    return -1;
}

// inBorder restituisce true se è stato fatto un click sul bordo del labirinto, false altrimenti
function inBorder(x, y) {
    if ((x >= 0 && x <= dimbordo) || (x >= canvas_w - dimbordo - 1)) return true;
    if (x > dimbordo && x < canvas_w - dimbordo - 1 && ((y >= 0 && y <= dimbordo) || y >= canvas_h - dimbordo - 1)) return true;
    return false;
}

// cancella bordo 
function draw_cancel_Border(x, y) { 
    if (x <= dimbordo || x >= canvas_w - dimbordo - 1) {
        x = 0;
        y = Math.floor((y - dimbordo - 1) / dimpac) * dimpac + dimbordo + 1;
    }
    else {
        x = Math.floor((x - dimbordo - 1) / dimpac) * dimpac + dimbordo + 1;
        y = 0;
    }

    var b = search(borders, x, y);
    if (b == -1) {
        if (x == 0) {
            ctx_lab.clearRect(x, y, dimbordo + 2, dimpac);
            ctx_lab.clearRect(canvas_w - dimbordo - 2, y, dimbordo + 2, dimpac);
        }
        else {
            ctx_lab.clearRect(x, y, dimpac, dimbordo + 2);
            ctx_lab.clearRect(x, canvas_h - dimbordo - 2, dimpac, dimbordo + 2);
        }
        var border = {
            x: x,
            y: y,
            contains: function(x, y) {
                if (x == this.x && y == this.y) return true;
                return false;
            },
        }
        borders.push(border);
    }
    else {
        if (x == 0) {
            ctx_lab.beginPath();
            ctx_lab.moveTo(1, y);
            ctx_lab.lineTo(1, y + dimpac);
            ctx_lab.moveTo(dimbordo, y);
            ctx_lab.lineTo(dimbordo, y + dimpac);
            ctx_lab.moveTo(canvas_w - dimbordo, y);
            ctx_lab.lineTo(canvas_w - dimbordo, y + dimpac);
            ctx_lab.moveTo(canvas_w - 1, y);
            ctx_lab.lineTo(canvas_w - 1, y + dimpac);
            ctx_lab.stroke();
        }
        else {
            ctx_lab.beginPath();
            ctx_lab.moveTo(x, 1);
            ctx_lab.lineTo(x + dimpac, 1);
            ctx_lab.moveTo(x, dimbordo);
            ctx_lab.lineTo(x + dimpac, dimbordo);
            ctx_lab.moveTo(x, canvas_h - dimbordo);
            ctx_lab.lineTo(x + dimpac, canvas_h - dimbordo);
            ctx_lab.moveTo(x, canvas_h - 1);
            ctx_lab.lineTo(x + dimpac, canvas_h - 1);
            ctx_lab.stroke();
        } 
        borders.splice(b, 1);  
    } 
}

function deselect() {
    document.getElementById('elimina').style.display = 'none';
    select = -1;
    drawLab();
}

function mousedown(e) {
    if (select != -1) deselect();
    var x = e.x - canvas_lab.offsetLeft + window.scrollX;
    var y = e.y - canvas_lab.offsetTop + window.scrollY;
    // controllo che non ho cliccato negli angoli del canvas_lab
    if (!(x <= dimbordo && y <= dimbordo) && !(x <= dimbordo && y >= canvas_h - dimbordo - 1) && !(x >= canvas_w - dimbordo - 1 && y <= dimbordo) && !(x >= canvas_w - dimbordo - 1 && y >= canvas_h - dimbordo - 1)) {
        var w = search(walls, x, y);
        if (w == -1) {
            if (inBorder(x, y)) draw_cancel_Border(x, y);
            else {
                sx = Math.floor((x - dimbordo - 1) / dimpac) * dimpac + dimbordo + 1;
                sy = Math.floor((y - dimbordo - 1) / dimpac) * dimpac + dimbordo + 1;
                fx = sx + dimpac;
                fy = sy + dimpac;
                new_wall = 1;
                strokeRoundRect(sx, sy, fx - sx, fy - sy);
            }
        }
        else {
            if (walls[w].type != "blocked") {
                var removed = walls.splice(w, 1);
                walls.push(removed[0]);
                w = walls.length - 1;
                select = w;
                if (walls[w].inBorder(x, y)) resize = w; 
                else drag = w;
                sx = Math.floor((x - dimbordo - 1) / dimpac) * dimpac + dimbordo + 1;
                sy = Math.floor((y - dimbordo - 1) / dimpac) * dimpac + dimbordo + 1;
                fx = sx + dimpac;
                fy = sy + dimpac;
            }
        }
    }
}

function drawable(a, b) {
    var x;
    if (fx > sx) x = fx - dimpac;
    else x = fx;
    var y;
    if (fy > sy) y = fy - dimpac;
    else y = fy;
    if (a >= x && a <= x + dimpac && b >= y && b <= y + dimpac) return false;
    return true;
}

function inGhostWall(sx, sy, fx, fy) {
    var wx = ghostWall.x + dimpac/2;
    var wy = ghostWall.y + dimpac/2;

    var x = Math.min(sx, fx);
    var dx;
    if (x == fx) dx = sx + dimpac - x;
    else dx = fx - x;
    var y = Math.min(sy, fy);
    var dy;
    if (y == fy) dy = sy + dimpac - y;
    else dy = fy - y;

    i = 0;
    while (i < 6) {
        if (wx >= x && wx <= x + dx && wy >= y && wy <= y + dy) return true;
        wx += dimpac;  
        i++;
    }

    return false;
}

function mousemove(e) {
    var x = e.x - canvas_lab.offsetLeft + window.scrollX;
    var y = e.y - canvas_lab.offsetTop + window.scrollY;
    if (new_wall != -1) {
        if (drawable(x, y)) {
            var ffx = Math.floor((x - dimbordo - 1) / dimpac) * dimpac + dimbordo + 1;
            if (x > sx) ffx += dimpac;
            var ffy = Math.floor((y - dimbordo - 1) / dimpac) * dimpac + dimbordo + 1;
            if (y > sy) ffy += dimpac;

            if (!inGhostWall(sx, sy, ffx, ffy)) {
                fx = ffx;
                fy = ffy;
                drawLab(true);
            }
        }
    }
    else {
        if (drag != -1) {
            if (drawable(x, y)) {
                if (x > sx + dimpac) {
                    if (!inGhostWall(walls[drag].x + dimpac, walls[drag].y, walls[drag].x + dimpac + walls[drag].width, walls[drag].y + walls[drag].height)) {
                        sx += dimpac;
                        walls[drag].x += dimpac;
                    }
                } 
                else if (x < sx) {
                    if (!inGhostWall(walls[drag].x - dimpac, walls[drag].y, walls[drag].x  - dimpac + walls[drag].width, walls[drag].y + walls[drag].height)) {
                        sx -= dimpac;
                        walls[drag].x -= dimpac;
                    }
                }
                if (y > sy + dimpac) {
                    if (!inGhostWall(walls[drag].x, walls[drag].y + dimpac, walls[drag].x + walls[drag].width, walls[drag].y + dimpac + walls[drag].height)) {
                        sy += dimpac;
                        walls[drag].y += dimpac;
                    }
                }
                else if (y < sy) {
                    if (!inGhostWall(walls[drag].x, walls[drag].y - dimpac, walls[drag].x + walls[drag].width, walls[drag].y - dimpac + walls[drag].height)) {
                        sy -= dimpac;
                        walls[drag].y -= dimpac;
                    }
                }

                drawLab(true);
            } 
        }
        else {
            if (resize != -1) {
                if (!(x >= sx && x <= fx && y >= sy && y <= fy)) {
                    var ssx = walls[resize].x;
                    var ssy = walls[resize].y;
                    var ffx = ssx + walls[resize].width;
                    var ffy = ssy + walls[resize].height;

                    switch (latoresize) {
                        case -1:
                            if (x < ssx) ssx -= dimpac;
                            else if (x > ssx && Math.abs(ssx - ffx) > dimpac) ssx += dimpac;
                            break;
                        case 2:
                            if (y < ssy) ssy -= dimpac;
                            else if (y > ssy && Math.abs(ssy - ffy) > dimpac) ssy += dimpac;
                            break;
                        case 1:
                            if (x < ffx - 2 && Math.abs(ssx - ffx) > dimpac) ffx -= dimpac;
                            else if (x > ffx) ffx += dimpac;
                            break;
                        case 0:
                            if (y < ffy - 2 && Math.abs(ssy - ffy) > dimpac) ffy -= dimpac;
                            else if (y > ffy) ffy += dimpac;
                            break;
                        default:
                    }
                    
                    if (!inGhostWall(ssx, ssy, ffx, ffy)) {
                        walls[resize].x = ssx;
                        walls[resize].y = ssy;
                        walls[resize].width = Math.abs(ssx - ffx);
                        walls[resize].height = Math.abs(ssy - ffy);
                    
                        drawLab(true);

                        sx = Math.floor((x - dimbordo - 1) / dimpac) * dimpac + dimbordo + 1;
                        sy = Math.floor((y - dimbordo - 1) / dimpac) * dimpac + dimbordo + 1;
                        fx = sx + dimpac;
                        fy = sy + dimpac;
                    }
                }
            }
            else {
                if (select != -1) {
                    if (!walls[select].inBorder(x, y)) canvas_lab.style.cursor = 'default';
                }
            }
        }
    }
}

function mouseup() {
    if (new_wall != -1) {
        addWall();
        drawLab(false);
        new_wall = -1;
    }
    else {
        if (drag != -1) {
            drawLab(false);
            drag = -1;
        }
        else { 
            if (resize != -1) {
                canvas_lab.style.cursor = 'default';
                drawLab(false);
                resize = -1;
            }
        }
    }
}

function addWall() {
    var x = Math.min(sx, fx);
    var dx;
    if (x == fx) dx = sx + dimpac - x;
    else dx = fx - x;
    var y = Math.min(sy, fy);
    var dy;
    if (y == fy) dy = sy + dimpac - y;
    else dy = fy - y;

    var wall = {
        type: "open",
        x: x,
        y: y,
        width: dx,
        height: dy,
        contains: function(x, y) {
            if (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height) return true;
            return false;
        },
        inBorder: function(x, y) {
            if (x >= this.x && x <= this.x + 2 && y >= this.y && y <= this.y + this.height) {
                latoresize = -1;
                canvas_lab.style.cursor = 'e-resize';
                return true;
            }
            if (x >= this.x + this.width - 2 && x <= this.x + this.width && y >= this.y && y <= this.y + this.height) {
                latoresize = 1;
                canvas_lab.style.cursor = 'e-resize';
                return true;
            }
            if (y >= this.y && y <= this.y + 2 && x >= this.x && x <= this.x + this.width) {
                latoresize = 2;
                canvas_lab.style.cursor = 's-resize';
                return true;
            }
            if (y >= this.y + this.height - 2 && y <= this.y + this.height) {
                latoresize = 0;
                canvas_lab.style.cursor = 's-resize';
                return true;
            }
            return false;
        }
    }
    walls.push(wall);
}

function drawLab(grid) {
    ctx_lab.clearRect(0, 0, canvas_w, canvas_h);

    if (grid) drawGrid();

    // disegno bordo interno
    ctx_lab.strokeRect(dimbordo, dimbordo, canvas_w - dimbordo*2, canvas_h - dimbordo*2);

    for (var i=0; i<walls.length; i++) {
        if (walls[i].type != "blocked" && i != select && walls[i].x + walls[i].width > dimbordo + 1 && walls[i].x < canvas_w - dimbordo - 1
            && walls[i].y + walls[i].height > dimbordo + 1 && walls[i].y < canvas_h - dimbordo - 1) {

                if (!inGhostWall(walls[i].x, walls[i].y, walls[i].x + walls[i].width, walls[i].y + walls[i].height)) {
                    ctx_lab.clearRect(walls[i].x, walls[i].y, walls[i].width, walls[i].height);     
                    strokeRoundRect(walls[i].x, walls[i].y, walls[i].width, walls[i].height);   
                }  
                else walls.splice(i, 1);
        } 
        else if (walls[i].type != "blocked" && i != select) {
            walls.splice(select, 1);
            deselect();
            return;
        }
    } 
    
    if (select != -1) {
        if (walls[select].x + walls[select].width > dimbordo + 1 && walls[select].x < canvas_w - dimbordo - 1 && walls[select].y + walls[select].height > dimbordo + 1 
                && walls[select].y < canvas_h - dimbordo - 1 &&
            !inGhostWall(walls[select].x, walls[select].y, walls[select].x + walls[select].width, walls[select].y + walls[select].height)) {

                ctx_lab.clearRect(walls[select].x, walls[select].y, walls[select].width, walls[select].height);
                ctx_lab.setLineDash([4, 2]);
                strokeRoundRect(walls[select].x, walls[select].y, walls[select].width, walls[select].height);
                ctx_lab.setLineDash([]);
                var elimina = document.getElementById('elimina');
                elimina.style.left = canvas_lab.offsetLeft + 120 + "px";
                elimina.style.display = 'block';
        }
        else {
            walls.splice(select, 1);
            deselect();
            return;
        }
    }

    if (new_wall != -1) {
        var x = Math.min(sx, fx);
        var dx;
        if (x == fx) dx = sx + dimpac - x;
        else dx = fx - x;
        var y = Math.min(sy, fy);
        var dy;
        if (y == fy) dy = sy + dimpac - y;
        else dy = fy - y;

        ctx_lab.clearRect(x, y, dx, dy);
        strokeRoundRect(x, y, dx, dy);
    }

    // disegno blocco centrale dei fantasmini
    ctx_lab.fillRect(ghostWall.x, ghostWall.y, dimpac, dimpac);
    ctx_lab.fillRect(ghostWall.x + dimpac * 5, ghostWall.y, dimpac, dimpac);
    ctx_lab.clearRect(ghostWall.x + 10, ghostWall.y + 10, dimpac - 20, dimpac - 20);
    ctx_lab.clearRect(ghostWall.x + dimpac * 5 + 10, ghostWall.y + 10, dimpac - 20, dimpac - 20);
    ctx_lab.strokeStyle = 'white';
    ctx_lab.beginPath();
    ctx_lab.moveTo(ghostWall.x, ghostWall.y + 1);
    ctx_lab.lineTo(ghostWall.x + dimpac * 6, ghostWall.y + 1);
    ctx_lab.stroke();
    ctx_lab.beginPath();    
    ctx_lab.moveTo(ghostWall.x, ghostWall.y + dimpac - 1);
    ctx_lab.lineTo(ghostWall.x + dimpac * 6, ghostWall.y + dimpac - 1);
    ctx_lab.stroke();
    ctx_lab.strokeStyle = 'blue';

    // disegno bordo più esterno
    ctx_lab.strokeRect(1, 1, canvas_w - 2, canvas_h - 2);

    if (borders.length != 0) {
        for (var i=0; i<borders.length; i++) {
            if (borders[i].x == 0) {
                ctx_lab.clearRect(borders[i].x, borders[i].y, dimbordo + 1, dimpac);  
                ctx_lab.clearRect(canvas_w - dimbordo - 2, borders[i].y, dimbordo + 2, dimpac); 
            }
            else {
                ctx_lab.clearRect(borders[i].x, borders[i].y, dimpac, dimbordo + 1);  
                ctx_lab.clearRect(borders[i].x, canvas_h - dimbordo - 2, dimpac, dimbordo + 2); 
            }
        }
    }

    ctx_lab.clearRect(2, 2, dimbordo - 3, canvas_h - 4);
    ctx_lab.clearRect(2, 2, canvas_w - 4, dimbordo - 3);
    ctx_lab.clearRect(canvas_w - dimbordo + 1, 2, dimbordo - 3, canvas_h - 4);
    ctx_lab.clearRect(2, canvas_h - dimbordo + 1, canvas_w - 4, dimbordo - 3);  
}

function drawGrid() {
    ctx_lab.beginPath();
    for (var x = dimbordo + dimpac + 1; x < canvas_w - dimbordo - dimpac; x+=dimpac) {
        ctx_lab.moveTo(x, dimbordo);
        ctx_lab.lineTo(x, canvas_h - dimbordo);
    }
    for (var y = dimbordo + dimpac + 1; y < canvas_h - dimbordo - dimpac; y+=dimpac) {
        ctx_lab.moveTo(dimbordo, y);
        ctx_lab.lineTo(canvas_w - dimbordo, y);
    }

    ctx_lab.lineWidth = 0.1;
    ctx_lab.strokeStyle = 'white';
    ctx_lab.stroke();
    ctx_lab.lineWidth = 2;
    ctx_lab.strokeStyle = 'blue';
}

function deleteWall() {
    var elimina = document.getElementById('elimina');
    elimina.style.display = 'none';
    walls.splice(select, 1);
    select = -1;
    drawLab();
}

function strokeRoundRect(x, y, w, h) {   
    var radius = 5;
    var x = x + 1;
    var y = y + 1;
    var width = w - 2;
    var height = h - 2;
    ctx_lab.beginPath();
    ctx_lab.moveTo(x, y + radius);
    ctx_lab.lineTo(x, y + height - radius);
    ctx_lab.arcTo(x, y + height, x + radius, y + height, radius);
    ctx_lab.lineTo(x + width - radius, y + height);
    ctx_lab.arcTo(x + width, y + height, x + width, y + height-radius, radius);
    ctx_lab.lineTo(x + width, y + radius);
    ctx_lab.arcTo(x + width, y, x + width - radius, y, radius);
    ctx_lab.lineTo(x + radius, y);
    ctx_lab.arcTo(x, y, x, y + radius, radius);
    ctx_lab.stroke();
}

window.onresize = function() {
    if (canvas_lab === undefined) canvas_lab = document.getElementById('canvas_lab');
    document.getElementById('play').style.left = canvas_lab.offsetLeft + "px";
    document.getElementById('elimina').style.left = canvas_lab.offsetLeft + 120 + "px";
    document.getElementById('pausa').style.left = canvas_lab.offsetLeft + "px";
    document.getElementById('continua').style.left = canvas_lab.offsetLeft + "px";
    document.getElementById('openeditor').style.left = canvas_lab.offsetLeft + 120 + "px";
    document.getElementById('bmw').style.left = canvas_lab.offsetLeft + 280 + "px";
    document.getElementById('width').style.left = canvas_lab.offsetLeft + 310 + "px";
    document.getElementById('bpw').style.left = canvas_lab.offsetLeft + 365 + "px";
    document.getElementById('bmh').style.left = canvas_lab.offsetLeft + 430 + "px";
    document.getElementById('height').style.left = canvas_lab.offsetLeft + 460 + "px";
    document.getElementById('bph').style.left = canvas_lab.offsetLeft + 515 + "px";
};

window.onmouseup = function() {
    mouseup();
}