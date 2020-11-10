const puzzle = {
    elements: {
        main: null,
        pzl: null,
        tiles: [],
        emptyTile: {
            top: null,
            left: null,
            position: null,
        }
    },
    parameters:{
        puzzleSize: 4,
        puzzleBoxSize: 400,
    },
    counter:{
        moves: 0,
        time: 0,
    },

    init(s=4){
        const body = document.querySelector(".body");
        this.elements.main = document.createElement("div");
        this.elements.main.classList.add("main");
        
        this.elements.pzl = document.createElement("div");
        this.elements.pzl.classList.add("puzzle");

        body.append(this.elements.main);
        this.elements.main.append(this.elements.pzl);

        //----------размер поля-----------
        if(s < 3){
            this.parameters.puzzleSize = 3;
        }else if(s > 8){
            this.parameters.puzzleSize = 8;
        }else{
            this.parameters.puzzleSize = s;
        }
        this.parameters.puzzleBoxSize = this.parameters.puzzleSize * 100;
        document.styleSheets[0].cssRules[1].style.cssText=`--size: ${this.parameters.puzzleBoxSize}px;`;

        this.createTiles();
        this.placeTiles();

        
        
    },

    createTiles(){
        const arr = this.createArr();
        arr.forEach(el=>{
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.classList.add(`tilesize${this.parameters.puzzleSize}`);
            tile.innerHTML = el;
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
        tileSize = this.parameters.puzzleBoxSize / this.parameters.puzzleSize;

        this.elements.tiles.forEach((el, key)=>{
            el.top = Math.floor(key / this.parameters.puzzleSize)*tileSize;
            el.left = (key % this.parameters.puzzleSize)*tileSize;
            el.position = key + 1;
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

            this.elements.pzl.append(el);
        })
    },

    moveTile(k){
        x = this.elements.tiles[k].left;
        y = this.elements.tiles[k].top;
        p = this.elements.tiles[k].position;

        tileSize = this.parameters.puzzleBoxSize / this.parameters.puzzleSize;

        if((Math.abs(x - this.elements.emptyTile.left) + Math.abs(y - this.elements.emptyTile.top)) == tileSize){
            this.elements.tiles[k].left = this.elements.emptyTile.left;
            this.elements.tiles[k].style.left = this.elements.emptyTile.left + "px";
            this.elements.tiles[k].top = this.elements.emptyTile.top;
            this.elements.tiles[k].style.top = this.elements.emptyTile.top + "px";
            this.elements.tiles[k].position = this.elements.emptyTile.position;

            this.elements.emptyTile.left = x;
            this.elements.emptyTile.top = y;
            this.elements.emptyTile.position = p;

            this.counter.moves++;
            this.checkWin();
        }
    },

    checkWin(){
        if(this.elements.tiles.every(el=>el.innerHTML == el.position)){
            setTimeout(()=>alert("win"), 300);
        }
    },
    
    createArr(){ // массив с рандомными числами
        let puzzle=[];
        for(let i=0;i<this.parameters.puzzleSize**2;i++) puzzle.push(i);
        puzzle = puzzle.sort(()=>Math.random()-0.5);
        
        return puzzle;
        }
}



puzzle.init(4);

