const puzzle = {
    elements: {
        main: null,
        pzl: null,
        tiles: [],
        emptyTile: {
            top: null,
            left: null,
            position: null,
        },
        counter:{
            counter: {},
            timer: {},
            moves: {},
        }
    },
    parameters:{
        puzzleSize: 4,
        puzzleBoxSize: 400,
    },
    counter:{
        moves: 0,
        time: 0,
        startTime: null,
        endTime: null,
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

        this.createCounter();
        
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
            
            this.elements.counter.moves.innerHTML = this.counter.moves; // счет хода
            startTimer();
            this.checkWin();
        }
    },

    checkWin(){
        if(this.elements.tiles.every(el=>el.innerHTML == el.position)){
            setTimeout(()=>alert("win"), 300);
            stopTimer();
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
            if(sum%2 == 0){
                return true;
            }else{
                return false;
            }       
        }
        
        return puzzle;
        },
    
    createCounter(){
        this.elements.counter.counter = document.createElement("div");
        this.elements.counter.counter.classList.add("counter");

        this.elements.counter.moves = document.createElement("div");
        this.elements.counter.moves.classList.add("moves");
        this.elements.counter.moves.innerHTML = 0;

        this.elements.counter.timer = document.createElement("div");
        this.elements.counter.timer.classList.add("timer");
        this.elements.counter.timer.innerHTML = "00:00:00";

        this.elements.counter.counter.append(this.elements.counter.moves);
        this.elements.counter.counter.append(this.elements.counter.timer);
        this.elements.main.append(this.elements.counter.counter);

    },

}



puzzle.init(4);




function startTimer() {
    if(puzzle.counter.startTime == null){
        puzzle.counter.startTime = Date.now();
    }

    t = Math.floor((Date.now() - puzzle.counter.startTime)/1000);
    s = t % 60;
    m = Math.floor(t/60)%3600;
    h = Math.floor(t/3600)%24;
    puzzle.elements.counter.timer.innerHTML = `${addZero(h)}:${addZero(m)}:${addZero(s)}`;

    if(puzzle.counter.endTime == null){
        setTimeout(startTimer, 1000);
    }
}

function stopTimer() {
    puzzle.counter.endTime = Date.now();
}

function addZero(n) {
    return (parseInt(n, 10) < 10 ? '0' : '') + n;
}