const puzzle = {
    elements: {
        main: null,
        pzl: null,
        tiles: [],
        savedTiles: null,
        emptyTile: {
            top: null,
            left: null,
            position: null,
        },
        savedEmptyTile: null,
        counter:{
            counter: {},
            timer: {},
            moves: {},
        },
        menu:{
            menu: null,
            newGame: null,
            newGameSize: null,
            table: null,
            finish: null,
        },
        modal:{
            modal: null,
            text: null,
            ok: null,
            newGame: null
        }
    },
    parameters:{
        puzzleSize: 4,
        puzzleBoxSize: 400,
        tileSize: null,
        isNewGame: true,
        isEndGame: false,
        drag: {
            X: null,
            Y: null
        }
    },
    counter:{
        moves: 0,
        time: 0,
        startTime: null,
        endTime: null,
        timeoutID: null,
    },

    init(s=4){
        const body = document.querySelector(".body");
        this.elements.main = document.createElement("div");
        this.elements.main.classList.add("main");
        
        this.elements.pzl = document.createElement("div");
        this.elements.pzl.classList.add("puzzle");

        body.append(this.elements.main);
        if(localStorage['moves'] != null) this.counter.moves = localStorage['moves'];
        this.createCounter();
        this.elements.main.append(this.elements.pzl);

        //----------размер поля-----------
        if(s < 3){
            this.parameters.puzzleSize = 3;
        }else if(s > 8){
            this.parameters.puzzleSize = 8;
        }else{
            this.parameters.puzzleSize = s;
        }
        this.parameters.puzzleBoxSize = this.parameters.puzzleSize * 100; // - убрать
        document.styleSheets[0].cssRules[1].style.cssText=`--size: ${this.parameters.puzzleBoxSize}px;`;// - убрать

        if(localStorage['puzzle'] == null){
            localStorage.setItem("puzzle", "");
            localStorage.setItem("emptyTile", "");
            localStorage.setItem("moves", "");
            localStorage.setItem("time", "");
            this.createTiles();
            this.placeTiles();
            this.saveGame();
        }else{
           this.getSavedGame();
           this.reCreateAndPlaceTiles();
        }
        

        this.createMenu();
        this.createModal();
    },

    createTiles(){
        const arr = this.createArr();
        arr.forEach(el=>{
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.classList.add(`tilesize${this.parameters.puzzleSize}`);
            tile.setAttribute("draggable", "true");
            tile.innerHTML = el;
            tile.numValue = el;
            tile.left = 0;
            tile.top = 0;
            if(el == 0) {
                tile.style.display = "none";
                tile.empty = true;
            }
            this.elements.tiles.push(tile);
        });

    },

    placeTiles(){
        this.parameters.tileSize = this.parameters.puzzleBoxSize / this.parameters.puzzleSize;

        this.elements.tiles.forEach((el, key)=>{
            el.top = Math.floor(key / this.parameters.puzzleSize) * this.parameters.tileSize;
            el.left = (key % this.parameters.puzzleSize) * this.parameters.tileSize;
            el.position = key + 1;
            el.key = key;
            el.style.left = el.left + "px";
            el.style.top = el.top + "px";
            if(el.empty){
                this.elements.emptyTile.top = el.top;
                this.elements.emptyTile.left = el.left;
                this.elements.emptyTile.position = key + 1;
                el.position = 0;
            }
            el.addEventListener("click", ()=>{
                this.moveTile(key);
            });

            el.addEventListener("dragstart", (e)=>{
                this.dragStart(e);
            });
            el.addEventListener("dragend", (e)=>{
                this.dragEnd(e);
            });

            this.elements.pzl.append(el);
        })
    },

    reCreateAndPlaceTiles(){
        this.elements.savedTiles.forEach((el)=>{    
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.classList.add(`tilesize${this.parameters.puzzleSize}`);
            tile.setAttribute("draggable", "true");
            tile.innerHTML = el.numValue;
            tile.numValue = el.numValue;
            tile.left = el.left;
            tile.top = el.top;
            tile.position = el.position;
            tile.key = el.key;
            if(el.numValue == 0) {
                tile.style.display = "none";
                tile.empty = true;
                this.elements.emptyTile.top = this.elements.savedEmptyTile.top;
                this.elements.emptyTile.left = this.elements.savedEmptyTile.left;
                this.elements.emptyTile.position = this.elements.savedEmptyTile.position;
            }
            this.elements.tiles.push(tile);
        });

        this.parameters.tileSize = this.parameters.puzzleBoxSize / this.parameters.puzzleSize;

        this.elements.tiles.forEach((el)=>{
            el.style.left = el.left + "px";
            el.style.top = el.top + "px";

            el.addEventListener("click", ()=>{
                this.moveTile(el.key);
            });

            el.addEventListener("dragstart", (e)=>{
                this.dragStart(e);
            });
            el.addEventListener("dragend", (e)=>{
                this.dragEnd(e);
            });

            this.elements.pzl.append(el);
        })

    },

    moveTile(k){
        x = this.elements.tiles[k].left;
        y = this.elements.tiles[k].top;
        p = this.elements.tiles[k].position;

        if((Math.abs(x - this.elements.emptyTile.left) + Math.abs(y - this.elements.emptyTile.top)) == this.parameters.tileSize){
            this.elements.tiles[k].left = this.elements.emptyTile.left;
            this.elements.tiles[k].style.left = this.elements.emptyTile.left + "px";
            this.elements.tiles[k].top = this.elements.emptyTile.top;
            this.elements.tiles[k].style.top = this.elements.emptyTile.top + "px";
            this.elements.tiles[k].position = this.elements.emptyTile.position;

            this.elements.emptyTile.left = x;
            this.elements.emptyTile.top = y;
            this.elements.emptyTile.position = p;

            this.counter.moves++;
            
            this.elements.counter.moves.innerHTML = this.counter.moves; // счет хода
            if(this.parameters.isNewGame){
                startTimer();
                this.parameters.isNewGame = false;
            }
            this.checkWin();

            this.saveGame();
        }
    },

    //---------------------------------
    saveGame(){
        localStorage['puzzle'] = JSON.stringify(this.elements.tiles);
        localStorage['emptyTile'] = JSON.stringify(this.elements.emptyTile);
        localStorage['moves'] = this.counter.moves;

    },
    getSavedGame(){
        this.elements.savedTiles = JSON.parse(localStorage["puzzle"]);
        this.elements.savedEmptyTile = JSON.parse(localStorage['emptyTile']);
        this.counter.moves = localStorage['moves'];
        this.counter.time = localStorage['time'];
    },
    // --------------drag&drop-----------------
    dragStart(e){
        k = e.target.key;
        if((Math.abs(this.elements.tiles[k].left - this.elements.emptyTile.left) + Math.abs(this.elements.tiles[k].top - this.elements.emptyTile.top)) == this.parameters.tileSize){
            this.parameters.drag.X = e.clientX;
            this.parameters.drag.Y = e.clientY;

            setTimeout(()=>{
                this.elements.tiles[k].classList.add("hide");
            }, 0);
        }
    },

    dragEnd(e){
        let offsetX = Math.abs(this.parameters.drag.X - e.clientX);
        let offsetY = Math.abs(this.parameters.drag.Y - e.clientY);
        this.parameters.drag.X = null;
        this.parameters.drag.Y = null;

        if(offsetX > this.parameters.tileSize/4 || offsetY > this.parameters.tileSize/4 ){
            this.moveTile(e.target.key);
        }
        
        this.elements.tiles[e.target.key].classList.remove("hide");
    },
    // ----------------------------------------
    checkWin(){
        if(this.elements.tiles.every(el=>el.innerHTML == el.position)){
            stopTimer();
            this.elements.modal.text.innerHTML = `<p>Ура! Вы решили головоломку</p><p>за ${this.elements.counter.timer.innerHTML} и ${this.counter.moves} ход${this.padeg(this.counter.moves)}</p>`;
            this.showModal();
        }
    },
    
    createArr(){ // массив с рандомными числами
        size =this.parameters.puzzleSize;
        let puzzle=[];
        for(let i=0;i<size**2;i++) puzzle.push(i);

        function mix() {
            puzzle = puzzle.sort(()=>Math.random()-0.5);
        }
        mix();

        while(!checkEven()){
            mix();
        }
        
        // проверка четности расклада
        function checkEven() {
            sum = Math.ceil((puzzle.indexOf(0)+1)/size);
            l=puzzle.length;
            for(let i=0;i<l;i++){
                k=0;
                for(let j=0;j<l;j++){
                    if(i<j && puzzle[i]>puzzle[j] && puzzle[j]!=0){
                        k++;
                    }
                }
                sum+=k;
            }
            if(size%2 == 0){
                if(sum%2 == 0){
                    return true;
                }else{
                    return false;
                }       
            }else if(size%2 != 0){
                if(sum%2 == 0){
                    return false;
                }else{
                    return true;
                }       
            }
        }
        
        return puzzle;
        },
    
    createCounter(){
        this.elements.counter.counter = document.createElement("div");
        this.elements.counter.counter.classList.add("counter");

        this.elements.counter.moves = document.createElement("div");
        this.elements.counter.moves.classList.add("moves");
        this.elements.counter.moves.innerHTML = this.counter.moves;

        this.elements.counter.timer = document.createElement("div");
        this.elements.counter.timer.classList.add("timer");
        if(localStorage["time"] != null && localStorage["time"] != 0){
            t=localStorage["time"];
            s = t % 60;
            m = Math.floor(t/60)%3600;
            this.elements.counter.timer.innerHTML = `${addZero(m)}:${addZero(s)}`;
        }else{
            this.elements.counter.timer.innerHTML = "00:00";
        }
        

        this.elements.counter.counter.append(this.elements.counter.moves);
        this.elements.counter.counter.append(this.elements.counter.timer);
        this.elements.main.append(this.elements.counter.counter);

    },

    createMenu(){
        this.elements.menu.menu = document.createElement("div");
        this.elements.menu.menu.classList.add("menu");

        this.elements.menu.newGame = document.createElement("button");
        this.elements.menu.newGame.classList.add("button");
        this.elements.menu.newGame.innerHTML = "Начать новый пазл";
        this.elements.menu.newGame.addEventListener('click', ()=>{
            this.newGame();
        });

        this.elements.menu.newGameSize = document.createElement("select");
        this.elements.menu.newGameSize.setAttribute("name", "select");
        this.elements.menu.newGameSize.classList.add("input");
        this.elements.menu.newGameSize.innerHTML = "<option value='3'>Размер поля 3x3</option>\
                                            <option value='4' selected>Размер поля 4x4</option>\
                                            <option value='5'>Размер поля 5x5</option>\
                                            <option value='6'>Размер поля 6x6</option>\
                                            <option value='7'>Размер поля 7x7</option>\
                                            <option value='8'>Размер поля 8x8</option>";

        this.elements.menu.table = document.createElement("button");
        this.elements.menu.table.classList.add("button");
        this.elements.menu.table.innerHTML = "Таблица лучших результатов";

        this.elements.menu.finish = document.createElement("button");
        this.elements.menu.finish.classList.add("button");
        this.elements.menu.finish.innerHTML = "Завершить автоматически";

        this.elements.menu.menu.append(this.elements.menu.newGame);
        this.elements.menu.menu.append(this.elements.menu.newGameSize);
        this.elements.menu.menu.append(this.elements.menu.table);
        this.elements.menu.menu.append(this.elements.menu.finish);

        this.elements.main.append(this.elements.menu.menu);
    },

    createModal(){
        const body = document.querySelector(".body");
        this.elements.modal.modal = document.createElement("div");
        this.elements.modal.modal.classList.add("modal");

        this.elements.modal.text = document.createElement("div");
        this.elements.modal.text.classList.add("modaltext");

        buttons = document.createElement("div");
        buttons.classList.add("btns");
        this.elements.modal.ok = document.createElement("button")
        this.elements.modal.ok.classList.add("modalbutton");
        this.elements.modal.ok.innerHTML = "Ok";
        this.elements.modal.ok.addEventListener("click", this.hideModal);

        this.elements.modal.newGame = document.createElement("button");
        this.elements.modal.newGame.classList.add("modalbutton");
        this.elements.modal.newGame.innerHTML = "Начать новый пазл";
        this.elements.modal.newGame.addEventListener("click", ()=>{
            this.hideModal();
            this.newGame();
        })

        buttons.append(this.elements.modal.ok);
        buttons.append(this.elements.modal.newGame);

        this.elements.modal.modal.append(this.elements.modal.text);
        this.elements.modal.modal.append(buttons);

        
        body.append(this.elements.modal.modal);
    },
    showModal(){
        this.elements.modal.modal.classList.toggle("modal-active");
    },
    hideModal(){
        puzzle.elements.modal.modal.classList.toggle("modal-active");
    },

    padeg(n){
        if(n%10 == 1){
            return "";
        }else if(n%10 >1 && n%10 <5){
            return "a";
        }else{
            return "ов";
        }
    },

    newGame(){
        this.parameters.isNewGame = true;
        this.parameters.puzzleSize = +this.elements.menu.newGameSize.value;
        this.parameters.puzzleBoxSize = this.parameters.puzzleSize * 100;// - убрать
        document.styleSheets[0].cssRules[1].style.cssText=`--size: ${this.parameters.puzzleBoxSize}px;`;// - убрать
        stopTimer();
        this.elements.tiles = [];
        this.elements.pzl.innerHTML = "";
        this.counter.moves = 0;
        this.elements.counter.moves.innerHTML = 0;
        this.counter.time = 0;
        this.elements.counter.timer.innerHTML = "00:00";
        this.counter.startTime = null;
        this.counter.endTime = null;
        this.elements.pzl.classList.add("newpzl");
        clearTimeout(this.counter.timeoutID);

        this.createTiles();
        this.placeTiles();

        setTimeout(()=>{
            this.elements.pzl.classList.remove("newpzl");
        }, 1100);

        localStorage["time"] = 0;
        localStorage["moves"] = 0;
        this.saveGame();
    }
}



puzzle.init(4);




function startTimer() {
    if(puzzle.counter.startTime == null && puzzle.counter.time != null && puzzle.counter.time !=0){
        puzzle.counter.startTime = Date.now() - puzzle.counter.time * 1000;
    }else if(puzzle.counter.startTime == null){
        puzzle.counter.startTime = Date.now();
    }

    t = Math.floor((Date.now() - puzzle.counter.startTime)/1000);
    localStorage["time"] = t;
    s = t % 60;
    m = Math.floor(t/60)%3600;
    // h = Math.floor(t/3600)%24;
    puzzle.elements.counter.timer.innerHTML = `${addZero(m)}:${addZero(s)}`;

    if(puzzle.counter.endTime == null){
        puzzle.counter.timeoutID = setTimeout(startTimer, 1000);
    }
}

function stopTimer() {
    puzzle.counter.endTime = Date.now();
}

function addZero(n) {
    return (parseInt(n, 10) < 10 ? '0' : '') + n;
}