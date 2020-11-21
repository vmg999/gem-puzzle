/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
/* eslint-disable no-lonely-if */
/* eslint-disable new-cap */
/* eslint-disable no-else-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable eqeqeq */
/* eslint-disable no-use-before-define */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-template */
/* eslint-disable no-param-reassign */
/* eslint-disable space-before-blocks */
/* eslint-disable indent */
import { countWay } from './autoresolve.js';

class gemPuzzle {
    constructor() {
    this.elements = {
        randomArray: [],
        main: null,
        puzzle: null,
        tiles: [],
        savedTiles: null,
        emptyTile: {
            top: null,
            left: null,
            position: null,
        },
        savedEmptyTile: null,
        counter: {
            counter: {},
            timer: {},
            moves: {},
        },
        menu: {
            menu: null,
            newGame: null,
            newGamePic: null,
            newGameSize: null,
            table: null,
            finish: null,
            volume: null,
            hideDig: null,
        },
        modal: {
            modal: null,
            text: null,
            ok: null,
            newGame: null,
        },
        table: {
            modal: null,
            table: null,
            ok: null,
        },
        audio: null,
    };
    this.parameters = {
        puzzleSize: 4,
        puzzleBoxSize: 400,
        tileSize: null,
        isNewGame: true,
        isEndGame: false,
        retoredGame: false,
        drag: {
            X: null,
            Y: null,
        },
        volume: false,
    };
    this.counter = {
        moves: 0,
        time: 0,
        startTime: null,
        endTime: null,
        timeoutID: null,
    };
    this.results = {
        date: null,
        puzzleSize: null,
        time: null,
        moves: null,
    };
    this.picture = {
        link: null,
        isPicture: false,
        digits: true,
    };
}

    init(puzzleSize = 4){
        const body = document.querySelector('.body');
        this.elements.main = document.createElement('div');
        this.elements.main.classList.add('main');

        this.elements.puzzle = document.createElement('div');
        this.elements.puzzle.classList.add('puzzle');

        body.append(this.elements.main);
        if (localStorage.moves != null) this.counter.moves = localStorage.moves;
        this.createCounter();
        this.elements.main.append(this.elements.puzzle);

        // ----------размер поля-----------
        if (localStorage.puzzleSize != null && localStorage.puzzleSize != 0){
            this.parameters.puzzleSize = localStorage.puzzleSize;
        } else {
            if (puzzleSize < 3){
                this.parameters.puzzleSize = 3;
            } else if (puzzleSize > 8){
                this.parameters.puzzleSize = 8;
            } else {
                this.parameters.puzzleSize = puzzleSize;
            }
        }

        if (localStorage.puzzle == null){
            localStorage.setItem('puzzleSize', '');
            localStorage.setItem('puzzle', '');
            localStorage.setItem('emptyTile', '');
            localStorage.setItem('moves', '');
            localStorage.setItem('time', '');
            localStorage.setItem('picture', '');
            this.createTiles();
            this.placeTiles();
            this.saveGame();
        } else {
           this.getSavedGame();
           this.reCreateAndPlaceTiles();
        }

        this.createMenu();
        this.createModal();
        this.createTable();
    }

    createTiles(){
        this.elements.randomArray = this.createArr();
        this.elements.randomArray.forEach((el) => {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.classList.add(`tilesize${this.parameters.puzzleSize}`);
            tile.setAttribute('draggable', 'true');
            tile.innerHTML = el;
            tile.numValue = el;
            tile.left = 0;
            tile.top = 0;
            if (el == 0) {
                tile.style.display = 'none';
                tile.empty = true;
            }
            this.elements.tiles.push(tile);
        });
    }

    placeTiles(){
        this.parameters.tileSize = Math.floor(this.parameters.puzzleBoxSize / this.parameters.puzzleSize);

        this.elements.tiles.forEach((el, key) => {
            el.top = Math.floor(key / this.parameters.puzzleSize) * this.parameters.tileSize;
            el.left = Math.floor(key % this.parameters.puzzleSize) * this.parameters.tileSize;
            el.position = key + 1;
            el.key = key;
            el.style.left = el.left + 'px';
            el.style.top = el.top + 'px';
            if (el.empty){
                this.elements.emptyTile.top = el.top;
                this.elements.emptyTile.left = el.left;
                this.elements.emptyTile.position = key + 1;
                el.position = 0;
            }
            el.addEventListener('click', () => {
                this.moveTile(key);
            });

            el.addEventListener('dragstart', (e) => {
                this.dragStart(e);
            });
            el.addEventListener('dragend', (e) => {
                this.dragEnd(e);
            });

            this.elements.puzzle.append(el);
        });
    }

    reCreateAndPlaceTiles(){
        this.elements.savedTiles.forEach((el) => {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.classList.add(`tilesize${this.parameters.puzzleSize}`);
            tile.setAttribute('draggable', 'true');
            tile.innerHTML = el.numValue;
            tile.numValue = el.numValue;
            tile.left = el.left;
            tile.top = el.top;
            tile.position = el.position;
            tile.key = el.key;
            if (el.numValue == 0) {
                tile.style.display = 'none';
                tile.empty = true;
                this.elements.emptyTile.top = this.elements.savedEmptyTile.top;
                this.elements.emptyTile.left = this.elements.savedEmptyTile.left;
                this.elements.emptyTile.position = this.elements.savedEmptyTile.position;
            }
            this.elements.tiles.push(tile);
        });

        this.parameters.tileSize = Math.floor(this.parameters.puzzleBoxSize / this.parameters.puzzleSize);

        this.elements.tiles.forEach((el) => {
            el.style.left = el.left + 'px';
            el.style.top = el.top + 'px';

            el.addEventListener('click', () => {
                this.moveTile(el.key);
            });

            el.addEventListener('dragstart', (e) => {
                this.dragStart(e);
            });
            el.addEventListener('dragend', (e) => {
                this.dragEnd(e);
            });

            this.elements.puzzle.append(el);
        });
        if (this.picture.isPicture){
            this.addPicture();
        }
    }

    addPicture(){
        this.picture.isPicture = true;
        if (this.parameters.isNewGame){
            this.picture.link = `assets/img/box/${(Math.floor(Math.random() * 1000)) % 150}.jpg`;
        }

        this.elements.tiles.forEach((el) => {
            el.classList.add('picDigits');
            el.style.background = `url("${this.picture.link}")`;
            el.style.backgroundSize = `${this.parameters.puzzleSize * 100}%`;

            const offsetX = ((el.numValue % this.parameters.puzzleSize) - 1) * (-100);
            const offsetY = Math.floor((el.numValue - 1) / this.parameters.puzzleSize) * (-100);

            el.style.backgroundPosition = `${offsetX}% ${offsetY}%`;
        });
    }

    moveTile(k){
        if (this.elements.tiles[k].numValue == 0){
            this.elements.tiles.forEach((el, key) => {
                if (k == el.position - 1){
                    k = key;
                }
            });
        }
        const x = this.elements.tiles[k].left;
        const y = this.elements.tiles[k].top;
        const p = this.elements.tiles[k].position;

        if (Math.floor(Math.abs(x - this.elements.emptyTile.left) + Math.abs(y - this.elements.emptyTile.top)) == Math.floor(this.parameters.tileSize)){
            this.elements.tiles[k].left = this.elements.emptyTile.left;
            this.elements.tiles[k].style.left = this.elements.emptyTile.left + 'px';
            this.elements.tiles[k].top = this.elements.emptyTile.top;
            this.elements.tiles[k].style.top = this.elements.emptyTile.top + 'px';
            this.elements.tiles[k].position = this.elements.emptyTile.position;

            this.elements.emptyTile.left = x;
            this.elements.emptyTile.top = y;
            this.elements.emptyTile.position = p;

            this.counter.moves++;

            this.elements.counter.moves.textContent = this.counter.moves; // счет хода
            if (this.parameters.isNewGame || this.parameters.retoredGame){
                startTimer();
                this.parameters.isNewGame = false;
            }
            this.checkWin();
            this.playSound();
            this.saveGame();
        }
    }

    //---------------------------------
    saveGame(){
        localStorage.puzzleSize = this.parameters.puzzleSize;
        localStorage.puzzle = JSON.stringify(this.elements.tiles);
        localStorage.emptyTile = JSON.stringify(this.elements.emptyTile);
        localStorage.moves = this.counter.moves;
        if (this.picture.isPicture){
            localStorage.picture = this.picture.link;
        }
    }

    getSavedGame(){
        this.parameters.puzzleSize = localStorage.puzzleSize;
        this.elements.savedTiles = JSON.parse(localStorage.puzzle);
        this.elements.savedEmptyTile = JSON.parse(localStorage.emptyTile);
        this.counter.moves = localStorage.moves;
        this.counter.time = localStorage.time;
        if (localStorage.picture != ''){
            this.picture.link = localStorage.picture;
            this.picture.isPicture = true;
            localStorage.picture = '';
        }
        this.parameters.isNewGame = false;
        this.parameters.retoredGame = true;
    }

    // --------------drag&drop-----------------
    dragStart(e){
        const k = e.target.key;
        if ((Math.abs(this.elements.tiles[k].left - this.elements.emptyTile.left) + Math.abs(this.elements.tiles[k].top - this.elements.emptyTile.top)) == this.parameters.tileSize){
            this.parameters.drag.X = e.clientX;
            this.parameters.drag.Y = e.clientY;

            setTimeout(() => {
                this.elements.tiles[k].classList.add('hide');
            }, 0);
        }
    }

    dragEnd(e){
        const offsetX = Math.abs(this.parameters.drag.X - e.clientX);
        const offsetY = Math.abs(this.parameters.drag.Y - e.clientY);
        this.parameters.drag.X = null;
        this.parameters.drag.Y = null;

        if (offsetX > this.parameters.tileSize / 4 || offsetY > this.parameters.tileSize / 4){
            this.moveTile(e.target.key);
        }

        this.elements.tiles[e.target.key].classList.remove('hide');
    }

    // ----------------------------------------
    checkWin(){
        if (this.elements.tiles.every((el) => el.innerHTML == el.position)){
            stopTimer();
            this.elements.modal.text.innerHTML = `<p>Ура! Вы решили головоломку</p><p>за ${this.elements.counter.timer.innerHTML} и ${this.counter.moves} ход${this.grammaticalCase(this.counter.moves)}</p>`;
            this.showModal();
            this.parameters.isEndGame = true;
            this.saveResult();

            if (this.picture.isPicture){
                this.elements.puzzle.style.background = `url("${this.picture.link}")`;
                this.elements.puzzle.style.backgroundSize = '100%';
            }
        }
    }

    saveResult(){
        if (localStorage.bestResult == null){
            localStorage.setItem('bestResult', '');
        }
        const date = new Date();
        this.results.date = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
        this.results.puzzleSize = `${this.parameters.puzzleSize} x ${this.parameters.puzzleSize}`;
        this.results.moves = this.counter.moves;
        this.results.time = this.elements.counter.timer.innerHTML;

        let table = [];
        if (localStorage.bestResult != ''){
            table = JSON.parse(localStorage.bestResult);
            for (let i = 0; i < table.length; i++){
                if (this.results.moves < table[i].moves){
                    table.splice(i, 0, this.results);
                    break;
                }
            }
            if (this.results.moves > table[table.length - 1].moves){
                table.push(this.results);
            }
            if (table.length > 10) table.length = 10;
            localStorage.bestResult = JSON.stringify(table);
        } else {
            table.push(this.results);
            localStorage.bestResult = JSON.stringify(table);
        }
    }

    createArr(){ // массив с рандомными числами
        const size = this.parameters.puzzleSize;
        let puzzle = [];
        for (let i = 0; i < size ** 2; i++) puzzle.push(i);

        function mix() {
            puzzle = puzzle.sort(() => Math.random() - 0.5);
        }
        mix();

        while (!checkEven()){
            mix();
        }

        // проверка четности расклада
        function checkEven() {
            let sum = 0;
            const l = puzzle.length;
            for (let i = 0; i < l; i++){
                let k = 0;
                for (let j = 0; j < l; j++){
                    if (i < j && puzzle[i] > puzzle[j] && puzzle[j] != 0){
                        k++;
                    }
                }
                sum += k;
            }

            if (size % 2 == 0){
                sum += Math.ceil((puzzle.indexOf(0) + 1) / size);
            }

            if (sum % 2 == 0){
                return true;
            } else {
                return false;
            }
        }

        return puzzle;
        }

    createCounter(){
        this.elements.counter.counter = document.createElement('div');
        this.elements.counter.counter.classList.add('counter');

        this.elements.counter.moves = document.createElement('div');
        this.elements.counter.moves.classList.add('moves');
        this.elements.counter.moves.textContent = this.counter.moves;

        this.elements.counter.timer = document.createElement('div');
        this.elements.counter.timer.classList.add('timer');
        if (localStorage.time != null && localStorage.time != 0){
            const t = localStorage.time;
            const s = t % 60;
            const m = Math.floor(t / 60) % 3600;
            this.elements.counter.timer.textContent = `${addZero(m)}:${addZero(s)}`;
        } else {
            this.elements.counter.timer.textContent = '00:00';
        }

        this.elements.counter.counter.append(this.elements.counter.moves);
        this.elements.counter.counter.append(this.elements.counter.timer);
        this.elements.main.append(this.elements.counter.counter);
    }

    createMenu(){
        this.elements.menu.menu = document.createElement('div');
        this.elements.menu.menu.classList.add('menu');

        this.elements.menu.newGame = document.createElement('button');
        this.elements.menu.newGame.classList.add('button');
        this.elements.menu.newGame.textContent = 'Начать новый пазл';
        this.elements.menu.newGame.addEventListener('click', () => {
            this.newGame();
        });

        this.elements.menu.newGamePic = document.createElement('button');
        this.elements.menu.newGamePic.classList.add('button');
        this.elements.menu.newGamePic.textContent = 'Новый пазл с картинкой';
        this.elements.menu.newGamePic.addEventListener('click', () => {
            this.newGame();
            this.addPicture();
        });

        this.elements.menu.newGameSize = document.createElement('select');
        this.elements.menu.newGameSize.setAttribute('name', 'select');
        this.elements.menu.newGameSize.classList.add('input');

        for (let i = 3; i < 9; i++){
            const option = document.createElement('option');
            option.setAttribute('value', i);
            if (i == 4) option.setAttribute('selected', 'selected');
            option.textContent = `Размер поля ${i}х${i}`;
            this.elements.menu.newGameSize.append(option);
        }

        this.elements.menu.table = document.createElement('button');
        this.elements.menu.table.classList.add('button');
        this.elements.menu.table.textContent = 'Таблица лучших результатов';
        this.elements.menu.table.addEventListener('click', () => {
            this.createResultTable();
            this.showTable();
        });

        this.elements.menu.finish = document.createElement('button');
        this.elements.menu.finish.classList.add('button');
        this.elements.menu.finish.textContent = 'Завершить автоматически';
        this.elements.menu.finish.addEventListener('click', () => {
            const moves = countWay(this.elements.randomArray);
            let i = 0;
            const moving = setInterval(() => {
                this.moveTile(moves[i]);
                i++;
            }, 20);
            setTimeout(() => { clearInterval(moving); }, 600000);
        });

        this.elements.menu.volume = document.createElement('button');
        this.elements.menu.volume.setAttribute('type', 'button');
        this.elements.menu.volume.classList.add('volume');
        this.elements.menu.volume.innerHTML = '<i class="material-icons">volume_off</i>';
        this.elements.menu.volume.addEventListener('click', () => {
            this.parameters.volume = !this.parameters.volume;
            if (this.parameters.volume){
                this.elements.menu.volume.innerHTML = '<i class="material-icons">volume_up</i>';
            } else {
                this.elements.menu.volume.innerHTML = '<i class="material-icons">volume_off</i>';
            }
        });
        this.elements.audio = document.createElement('audio');
        this.elements.audio.setAttribute('src', 'assets/tink.wav');

        this.elements.menu.hideDig = document.createElement('button');
        this.elements.menu.hideDig.setAttribute('type', 'button');
        this.elements.menu.hideDig.classList.add('volume');
        this.elements.menu.hideDig.innerHTML = '<i class="material-icons">visibility</i>';
        this.elements.menu.hideDig.addEventListener('click', () => {
            if (this.picture.isPicture){
                this.picture.digits = !this.picture.digits;
                this.elements.tiles.forEach((el) => {
                    el.classList.toggle('hideDigigts');
                });

                if (this.picture.digits){
                    this.elements.menu.hideDig.innerHTML = '<i class="material-icons">visibility</i>';
                } else {
                    this.elements.menu.hideDig.innerHTML = '<i class="material-icons">visibility_off</i>';
                }
        }
        });

        const settings = document.createElement('div');
        settings.classList.add('settings');
        settings.append(this.elements.menu.hideDig);
        settings.append(this.elements.menu.volume);

        this.elements.menu.menu.append(this.elements.menu.newGame);
        this.elements.menu.menu.append(this.elements.menu.newGamePic);
        this.elements.menu.menu.append(this.elements.menu.newGameSize);
        this.elements.menu.menu.append(this.elements.menu.table);
        this.elements.menu.menu.append(this.elements.menu.finish);
        this.elements.menu.menu.append(settings);
        this.elements.menu.menu.append(this.elements.audio);

        this.elements.main.append(this.elements.menu.menu);
    }

    playSound(){
        if (this.parameters.volume){
        const audio = document.querySelector('audio');
        audio.currentTime = 0;
        audio.play();
        }
    }

    // ------------модальное окно-------------------------
    createModal(){
        const body = document.querySelector('.body');
        this.elements.modal.modal = document.createElement('div');
        this.elements.modal.modal.classList.add('modal');

        this.elements.modal.text = document.createElement('div');
        this.elements.modal.text.classList.add('modaltext');

        const buttons = document.createElement('div');
        buttons.classList.add('btns');
        this.elements.modal.ok = document.createElement('button');
        this.elements.modal.ok.classList.add('modalbutton');
        this.elements.modal.ok.textContent = 'Ok';
        this.elements.modal.ok.addEventListener('click', () => {
            this.hideModal();
        });

        this.elements.modal.newGame = document.createElement('button');
        this.elements.modal.newGame.classList.add('modalbutton');
        this.elements.modal.newGame.textContent = 'Начать новый пазл';
        this.elements.modal.newGame.addEventListener('click', () => {
            this.hideModal();
            this.newGame();
        });

        buttons.append(this.elements.modal.ok);
        buttons.append(this.elements.modal.newGame);

        this.elements.modal.modal.append(this.elements.modal.text);
        this.elements.modal.modal.append(buttons);

        body.append(this.elements.modal.modal);
    }

    showModal(){
        this.elements.modal.modal.classList.toggle('modal-active');
    }

    hideModal(){
        this.elements.modal.modal.classList.toggle('modal-active');
    }

    // -------------------таблица результатов----------------------------
    createTable(){
        const body = document.querySelector('.body');
        this.elements.table.modal = document.createElement('div');
        this.elements.table.modal.classList.add('table');

        this.elements.table.table = document.createElement('table');
        this.elements.table.table.classList.add('table-item');

        this.elements.table.ok = document.createElement('button');
        this.elements.table.ok.classList.add('modalbutton');
        this.elements.table.ok.textContent = 'Ok';
        this.elements.table.ok.addEventListener('click', () => {
            this.hideTable();
        });

        this.elements.table.modal.append(this.elements.table.table);
        this.elements.table.modal.append(this.elements.table.ok);

        body.append(this.elements.table.modal);
    }

    createResultTable(){
        let table;
        if (localStorage.bestResult != null && localStorage.bestResult != ''){
            table = JSON.parse(localStorage.bestResult);

            const thead = '<thead><th>Дата</th><th>Поле</th><th>Время</th><th>Ходов</th></thead>';
            let tr = '';
            table.forEach((el) => {
                tr += '<tr>';
                tr += `<td>${el.date}</td>`;
                tr += `<td>${el.puzzleSize}</td>`;
                tr += `<td>${el.time}</td>`;
                tr += `<td>${el.moves}</td>`;
                tr += '</tr>';
            });
            this.elements.table.table.innerHTML += thead;
            this.elements.table.table.innerHTML += tr;
        } else {
            this.elements.table.table.innerHTML = 'Результатов еще нет';
        }
    }

    showTable(){
        this.elements.table.modal.classList.toggle('table-active');
    }

    hideTable(){
        this.elements.table.modal.classList.toggle('table-active');
        this.elements.table.table.innerHTML = '';
    }

    //---------------------------------------------------------
    grammaticalCase(n){
        if (n % 10 == 1){
            return '';
        } else if (n % 10 > 1 && n % 10 < 5){
            return 'a';
        } else {
            return 'ов';
        }
    }

    newGame(){
        this.parameters.isNewGame = true;
        this.parameters.puzzleSize = +this.elements.menu.newGameSize.value;
        stopTimer();
        this.elements.tiles = [];
        this.elements.puzzle.innerHTML = '';
        this.counter.moves = 0;
        this.elements.counter.moves.textContent = 0;
        this.counter.time = 0;
        this.elements.counter.timer.textContent = '00:00';
        this.counter.startTime = null;
        this.counter.endTime = null;
        this.elements.puzzle.classList.add('newpzl');
        clearTimeout(this.counter.timeoutID);

        this.createTiles();
        this.placeTiles();

        setTimeout(() => {
            this.elements.puzzle.classList.remove('newpzl');
        }, 1100);

        localStorage.time = 0;
        localStorage.moves = 0;

        if (this.picture.isPicture){
            this.picture.isPicture = false;
            this.elements.puzzle.style.background = '';
        }
        this.saveGame();
    }
}

const puzzle = new gemPuzzle();
puzzle.init();

function startTimer() {
    if (puzzle.counter.startTime == null && puzzle.counter.time != null && puzzle.counter.time != 0){
        puzzle.counter.startTime = Date.now() - puzzle.counter.time * 1000;
    } else if (puzzle.counter.startTime == null){
        puzzle.counter.startTime = Date.now();
    }

    const t = Math.floor((Date.now() - puzzle.counter.startTime) / 1000);
    localStorage.time = t;
    const s = t % 60;
    const m = Math.floor(t / 60) % 3600;
    puzzle.elements.counter.timer.textContent = `${addZero(m)}:${addZero(s)}`;

    if (puzzle.counter.endTime == null){
        puzzle.counter.timeoutID = setTimeout(startTimer, 1000);
    }
}

function stopTimer() {
    puzzle.counter.endTime = Date.now();
}

function addZero(n) {
    return (parseInt(n, 10) < 10 ? '0' : '') + n;
}
