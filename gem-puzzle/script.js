const puzzle = {
    elements: {
        main: null,
        pzl: null,
        tiles: [],
        emptyTile: {
            top: null,
            left: null
        }
    },
    parameters:{
        puzzleSize: 4,
        puzzleBoxSize: 400,
    },

    init(){
        const body = document.querySelector(".body");
        this.elements.main = document.createElement("div");
        this.elements.main.classList.add("main");
        
        this.elements.pzl = document.createElement("div");
        this.elements.pzl.classList.add("puzzle");

        body.append(this.elements.main);
        this.elements.main.append(this.elements.pzl);

        this.createTiles();
        this.placeTiles();
        
        
    },

    createTiles(){
        const arr = this.createArr(this.parameters.puzzleSize);
        arr.forEach(el=>{
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.innerHTML = el;
            tile.left = 0;
            tile.top = 0;
            if(el == 0) {
                tile.style.display = "none";
                tile.empty = true;
            }
            this.elements.tiles.push(tile);
            // this.elements.pzl.append(tile);
        });

    },

    placeTiles(){
        tileSize = this.parameters.puzzleBoxSize / this.parameters.puzzleSize;

        this.elements.tiles.forEach((el, key)=>{
            el.top = Math.floor(key / this.parameters.puzzleSize)*tileSize;
            el.left = (key % this.parameters.puzzleSize)*tileSize;
            el.style.left = el.left + "px";
            el.style.top = el.top + "px";
            if(el.empty){
                this.elements.emptyTile.top = el.top;
                this.elements.emptyTile.left = el.left;
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
        tileSize = this.parameters.puzzleBoxSize / this.parameters.puzzleSize;

        if((Math.abs(x - this.elements.emptyTile.left) + Math.abs(y - this.elements.emptyTile.top)) == tileSize){
            this.elements.tiles[k].left = this.elements.emptyTile.left;
            this.elements.tiles[k].style.left = this.elements.emptyTile.left + "px";
            this.elements.tiles[k].top = this.elements.emptyTile.top;
            this.elements.tiles[k].style.top = this.elements.emptyTile.top + "px";

            this.elements.emptyTile.left = x;
            this.elements.emptyTile.top = y;
        }
    },

    
    createArr(size=4){ // массив с рандомными числами
        if(size < 3){
            size = 3;
        }else if(size > 8){
            size = 8;
        }
        
        let puzzle=[];
        for(let i=0;i<size**2;i++) puzzle.push(i);
        puzzle = puzzle.sort(()=>Math.random()-0.5);
        
        return puzzle;
        }
}



puzzle.init();

