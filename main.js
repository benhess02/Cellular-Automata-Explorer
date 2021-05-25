var getPalette = function() { };
var getNextColor = function(x, y) { };

function Automata(){
    this.loadBtn = document.getElementById("loadBtn");
    this.startBtn = document.getElementById("startBtn");
    this.stepBtn = document.getElementById("stepBtn");
    this.clearBtn = document.getElementById("clearBtn");

    this.editorBox = document.getElementById("editorBox");
    this.examplesList = document.getElementById("examplesList");
    this.paletteBox = document.getElementById("paletteBox");

    this.cvs = document.getElementById("cvs");
    this.ctx = cvs.getContext("2d");

    this.gridCellSize = 10;
    this.gridWidth = 100;
    this.gridHeight = 100;

    this.frontBuffer = [];
    this.backBuffer = [];
    this.palette = [];
    this.selectedPaletteIndex = -1;

    this.cameraX = this.gridWidth / 2;
    this.cameraY = this.gridHeight / 2;
    this.zoom = 0;

    this.isDragging = false;
    this.isPainting = false;
    this.mouseX = 0;
    this.mouseY = 0;

    this.isLoaded = false;
    this.isRunning = false;
    this.interval = -1;

    this.editor = new Editor(this.editorBox);
    this.examples = new Examples(this.examplesList, this.editorBox, this.loadBtn);

    for(var y = 0; y < this.gridHeight; y++){
        var frontRow = [];
        var backRow = [];
        for(var x = 0; x < this.gridWidth; x++){
            frontRow.push(null);
            backRow.push(null);
        }
        this.frontBuffer.push(frontRow);
        this.backBuffer.push(backRow);
    }

    var _this = this;

    this.stepBtn.addEventListener("click", function(ev){
        _this.step();
    });

    this.cvs.addEventListener("mousedown", function(ev){
        if(ev.button == 0){
            _this.isPainting = true;
        }
        else if(ev.button == 2){
            _this.isDragging = true;
        }
    });
    
    document.addEventListener("mouseup", function(ev){
        _this.isDragging = false;
        _this.isPainting = false;
    });

    this.cvs.oncontextmenu = function(ev){
        ev.preventDefault();
    };

    this.cvs.addEventListener("wheel", function(ev){
        _this.zoom -= ev.deltaY / 1000;
        _this.gridCellSize = Math.pow(2, _this.zoom) * 10;
    });

    this.cvs.addEventListener("mousemove", function(ev){
        _this.mouseX = ev.clientX;
        _this.mouseY = ev.clientY;
        if(_this.isDragging){
            _this.cameraX -= ev.movementX / _this.gridCellSize;
            _this.cameraY -= ev.movementY / _this.gridCellSize;
        }
    });
    
    this.startBtn.addEventListener("click", function(ev){
        if(_this.isRunning){
            _this.stopRunning();
        }
        else{
            _this.startRunning();
        }
    });
    
    this.loadBtn.addEventListener("click", function(ev){
        _this.load();
    });

    this.clearBtn.addEventListener("click", function(ev){
        _this.clearColor(_this.palette[0]);
    });

    this.editorBox.addEventListener("input", function(ev){
        _this.loadBtn.disabled = false;
    });

    _this.load();
    this.render();
}

Automata.prototype.selectPaletteItem = function(index){
    if(this.selectedPaletteIndex >= 0){
        this.paletteBox.children[this.selectedPaletteIndex].classList.remove("selected");
    }
    this.paletteBox.children[index].classList.add("selected");
    this.selectedPaletteIndex = index;
};

Automata.prototype.load = function(){
    this.stopRunning();
    
    var func = new Function(this.editorBox.value);
    func();

    this.palette = getPalette();

    if(!this.isLoaded){
        this.clearColor(this.palette[0]);
    }

    this.paletteBox.innerHTML = "";
    for(var i = 0; i < this.palette.length; i++){
        var paletteItem = document.createElement("div");
        paletteItem.classList.add("paletteItem");
        paletteItem.style.backgroundColor = this.palette[i];
        paletteItem.addEventListener("click", this.selectPaletteItem.bind(this, i));
        this.paletteBox.appendChild(paletteItem);
    }

    if(this.palette.length > 1){
        this.selectPaletteItem(1);
    }
    else if(this.palette.length > 0){
        this.selectPaletteItem(0);
    }

    this.isLoaded = true;
    this.loadBtn.disabled = true;
    this.startBtn.disabled = false;
    this.stepBtn.disabled = false;
    this.clearBtn.disabled = false;
};

Automata.prototype.swapBuffers = function(){
    var tmp = this.frontBuffer;
    this.frontBuffer = this.backBuffer;
    this.backBuffer = tmp;
};

Automata.prototype.setColor = function(x, y, color){
    if(x >= 0 && y >= 0 && x < this.gridWidth && y < this.gridHeight){
        this.backBuffer[y][x] = color;
    }
};

Automata.prototype.getColor = function(x, y){
    if(x >= 0 && y >= 0 && x < this.gridWidth && y < this.gridHeight){
        return this.frontBuffer[y][x];
    }
    else{
        return this.palette[0];
    }
};

Automata.prototype.clearColor = function(color){
    for(var y = 0; y < this.gridHeight; y++){
        for(var x = 0; x < this.gridWidth; x++){
            this.frontBuffer[y][x] = color;
            this.backBuffer[y][x] = color;
        }
    }
};

Automata.prototype.step = function(){
    for(var y = 0; y < this.gridHeight; y++){
        for(var x = 0; x < this.gridWidth; x++){
            this.backBuffer[y][x] = getNextColor(x, y);
        }
    }
    this.swapBuffers();
};

Automata.prototype.getDrawPoint = function(x, y){
    return {
        x: this.cvs.width / 2 + (x - this.cameraX) * this.gridCellSize,
        y: this.cvs.height / 2 + (y - this.cameraY) * this.gridCellSize,
    };
};

Automata.prototype.render = function(){
    requestAnimationFrame(this.render.bind(this));

    this.cvs.width = this.cvs.clientWidth;
    this.cvs.height = this.cvs.clientHeight;

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);

    for(var y = 0; y < this.gridHeight; y++){
        for(var x = 0; x < this.gridWidth; x++){
            var nextPoint = this.getDrawPoint(x, y);
            this.ctx.fillStyle = this.frontBuffer[y][x];
            this.ctx.fillRect(nextPoint.x, nextPoint.y, this.gridCellSize, this.gridCellSize);
        }
    }

    if(this.isLoaded){
        var tileMouseX = Math.floor((this.mouseX - this.cvs.width / 2) / this.gridCellSize + this.cameraX);
        var tileMouseY = Math.floor((this.mouseY - this.cvs.height / 2) / this.gridCellSize + this.cameraY);
    
        if(tileMouseX >= 0 && tileMouseY >= 0 && tileMouseX < this.gridWidth && tileMouseY < this.gridHeight){
            if(this.isPainting){
                this.frontBuffer[tileMouseY][tileMouseX] = this.palette[this.selectedPaletteIndex];
            }
    
            var mousePoint = this.getDrawPoint(tileMouseX, tileMouseY);
            this.ctx.fillStyle = "rgba(128, 128, 128, 0.5)";
            this.ctx.fillRect(mousePoint.x, mousePoint.y, this.gridCellSize, this.gridCellSize);
        }
    }
 
    var topPoint = this.getDrawPoint(0, 0);
    this.ctx.strokeStyle = "red";
    this.ctx.strokeRect(topPoint.x, topPoint.y, this.gridWidth * this.gridCellSize, this.gridHeight * this.gridCellSize);
};

Automata.prototype.startRunning = function(){
    if(!this.isRunning){
        this.startBtn.innerText = "Stop";
        this.startBtn.classList.add("red");
        this.startBtn.disabled = false;
        this.stepBtn.disabled = true;
        this.isRunning = true;

        this.interval = setInterval(this.step.bind(this), 1000 / 10);
    }
};

Automata.prototype.stopRunning = function(){
    if(this.isRunning){
        clearInterval(this.interval);
        this.interval = -1;

        this.startBtn.innerText = "Start";
        this.startBtn.classList.remove("red");
        this.startBtn.disabled = false;
        this.stepBtn.disabled = false;
        this.isRunning = false;
    }
};

var automata = new Automata();

function getColor(x, y){
    return automata.getColor(x, y);
}

function rectNeighborCount(x, y, dx, dy, color, countSelf = false){
    var count = 0;
    for(var _y = y - dy; _y <= y + dx; _y++){
        for(var _x = x - dx; _x <= x + dx; _x++){
            if(!(_x == x && _y == y) || countSelf){
                count += automata.getColor(_x, _y) == color ? 1 : 0;
            }
        }
    }
    return count;
}

function isInEllipse(x, y, cx, cy, rx, ry){
    return Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2) <= 1;
}

function ellipseNeighborCount(x, y, dx, dy, color, countSelf = false){
    var count = 0;
    for(var _y = y - dy; _y <= y + dx; _y++){
        for(var _x = x - dx; _x <= x + dx; _x++){
            if(!(_x == x && _y == y) || countSelf){
                count += automata.getColor(_x, _y) == color ? 1 : 0;
            }
        }
    }
    return count;
}