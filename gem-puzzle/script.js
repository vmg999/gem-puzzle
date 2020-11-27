import countWay from './autoresolve.js';
import {
  SECOND, mix, checkEven, addZero, grammaticalCase,
} from './functions.js';

class GemPuzzle {
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

  init(puzzleSize = 4) {
    const body = document.querySelector('.body');
    this.elements.main = document.createElement('div');
    this.elements.main.classList.add('main');

    this.elements.puzzle = document.createElement('div');
    this.elements.puzzle.classList.add('puzzle');

    body.append(this.elements.main);
    if (localStorage.moves != null) { this.counter.moves = +localStorage.moves; }
    this.createCounter();
    this.elements.main.append(this.elements.puzzle);

    this.setPuzzleSize(puzzleSize);

    if (localStorage.puzzle == null) {
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

  setPuzzleSize(puzzleSize) {
    if (localStorage.puzzleSize != null && localStorage.puzzleSize !== 0) {
      this.parameters.puzzleSize = localStorage.puzzleSize;
    } else if (puzzleSize < 3) {
      this.parameters.puzzleSize = 3;
    } else if (puzzleSize > 8) {
      this.parameters.puzzleSize = 8;
    } else {
      this.parameters.puzzleSize = puzzleSize;
    }
  }

  createTiles() {
    this.elements.randomArray = this.createArr();
    this.elements.randomArray.forEach((el) => {
      const tile = document.createElement('div');
      tile.classList.add('tile', `tilesize${this.parameters.puzzleSize}`);
      tile.setAttribute('draggable', 'true');
      tile.innerHTML = el;
      tile.numValue = el;
      tile.left = 0;
      tile.top = 0;
      if (el === 0) {
        tile.style.display = 'none';
        tile.empty = true;
      }
      this.elements.tiles.push(tile);
    });
  }

  placeTiles() {
    this.parameters.tileSize = Math.floor(this.parameters.puzzleBoxSize
         / this.parameters.puzzleSize);

    this.elements.tiles.forEach((element, key) => {
      const el = element;
      el.top = Math.floor(key / this.parameters.puzzleSize) * this.parameters.tileSize;
      el.left = Math.floor(key % this.parameters.puzzleSize) * this.parameters.tileSize;
      el.position = key + 1;
      el.key = key;
      el.style.left = `${el.left}px`;
      el.style.top = `${el.top}px`;
      if (el.empty) {
        this.elements.emptyTile.top = el.top;
        this.elements.emptyTile.left = el.left;
        this.elements.emptyTile.position = key + 1;
        el.position = 0;
      }

      this.addListeners(el, key);
      this.elements.puzzle.append(el);
    });
  }

  reCreateAndPlaceTiles() {
    this.elements.savedTiles.forEach((el) => {
      const tile = document.createElement('div');
      tile.classList.add('tile', `tilesize${this.parameters.puzzleSize}`);
      tile.setAttribute('draggable', 'true');
      tile.innerHTML = el.numValue;
      tile.numValue = el.numValue;
      tile.left = el.left;
      tile.top = el.top;
      tile.position = el.position;
      tile.key = el.key;
      if (el.numValue === 0) {
        tile.style.display = 'none';
        tile.empty = true;
        this.elements.emptyTile.top = this.elements.savedEmptyTile.top;
        this.elements.emptyTile.left = this.elements.savedEmptyTile.left;
        this.elements.emptyTile.position = this.elements.savedEmptyTile.position;
      }
      this.elements.tiles.push(tile);
    });

    this.parameters.tileSize = Math.floor(this.parameters.puzzleBoxSize
        / this.parameters.puzzleSize);

    this.elements.tiles.forEach((element) => {
      const el = element;
      el.style.left = `${el.left}px`;
      el.style.top = `${el.top}px`;

      this.addListeners(el, el.key);
      this.elements.puzzle.append(el);
    });
    if (this.picture.isPicture) {
      this.addPicture();
    }
  }

  addListeners(element, key) {
    element.addEventListener('click', () => {
      this.moveTile(key);
    });

    element.addEventListener('dragstart', (e) => {
      this.dragStart(e);
    });
    element.addEventListener('dragend', (e) => {
      this.dragEnd(e);
    });
  }

  addPicture() {
    if (this.parameters.isNewGame) {
      this.picture.link = `assets/img/box/${(Math.ceil(Math.random() * SECOND)) % 150}.jpg`;
    }

    this.elements.tiles.forEach((element) => {
      const el = element;
      el.classList.add('picDigits');
      el.style.background = `url("${this.picture.link}")`;
      el.style.backgroundSize = `${this.parameters.puzzleSize * 100}%`;

      const offsetX = ((el.numValue % this.parameters.puzzleSize) - 1) * (-100);
      const offsetY = Math.floor((el.numValue - 1) / this.parameters.puzzleSize) * (-100);

      el.style.backgroundPosition = `${offsetX}% ${offsetY}%`;
    });
  }

  moveTile(key) {
    let k = key;
    if (this.elements.tiles[k].numValue === 0) {
      this.elements.tiles.forEach((el, keys) => {
        if (k === el.position - 1) {
          k = keys;
        }
      });
    }
    const x = this.elements.tiles[k].left;
    const y = this.elements.tiles[k].top;
    const p = this.elements.tiles[k].position;

    if (Math.floor(Math.abs(x - this.elements.emptyTile.left)
    + Math.abs(y - this.elements.emptyTile.top)) === Math.floor(this.parameters.tileSize)) {
      this.elements.tiles[k].left = this.elements.emptyTile.left;
      this.elements.tiles[k].style.left = `${this.elements.emptyTile.left}px`;
      this.elements.tiles[k].top = this.elements.emptyTile.top;
      this.elements.tiles[k].style.top = `${this.elements.emptyTile.top}px`;
      this.elements.tiles[k].position = this.elements.emptyTile.position;

      this.elements.emptyTile.left = x;
      this.elements.emptyTile.top = y;
      this.elements.emptyTile.position = p;

      this.counter.moves += 1;

      this.elements.counter.moves.textContent = this.counter.moves;
      if (this.parameters.isNewGame || this.parameters.retoredGame) {
        this.startTimer();
        this.parameters.isNewGame = false;
      }
      this.checkWin();
      this.playSound();
      this.saveGame();
    }
  }

  getTileNumByPosition(p) {
    let k = 0;
    this.elements.tiles.forEach((el, key) => {
      if (+el.position === p) {
        k = key;
      }
    });
    return k;
  }

  saveGame() {
    if (localStorage.puzzle == null) {
      localStorage.setItem('puzzleSize', '');
      localStorage.setItem('puzzle', '');
      localStorage.setItem('emptyTile', '');
      localStorage.setItem('moves', '');
      localStorage.setItem('time', '');
      localStorage.setItem('picture', '');
    }
    localStorage.puzzleSize = this.parameters.puzzleSize;
    localStorage.puzzle = JSON.stringify(this.elements.tiles);
    localStorage.emptyTile = JSON.stringify(this.elements.emptyTile);
    localStorage.moves = this.counter.moves;
    if (this.picture.isPicture) {
      localStorage.picture = this.picture.link;
    }
  }

  getSavedGame() {
    this.parameters.puzzleSize = localStorage.puzzleSize;
    this.elements.savedTiles = JSON.parse(localStorage.puzzle);
    this.elements.savedEmptyTile = JSON.parse(localStorage.emptyTile);
    this.counter.moves = +localStorage.moves;
    this.counter.time = localStorage.time;
    if (localStorage.picture !== '') {
      this.picture.link = localStorage.picture;
      this.picture.isPicture = true;
      localStorage.picture = '';
    }
    this.parameters.isNewGame = false;
    this.parameters.retoredGame = true;
  }

  // --------------drag&drop-----------------
  dragStart(e) {
    const { key } = e.target;
    if ((Math.abs(this.elements.tiles[key].left - this.elements.emptyTile.left)
    + Math.abs(this.elements.tiles[key].top - this.elements.emptyTile.top))
    === this.parameters.tileSize) {
      this.parameters.drag.X = e.clientX;
      this.parameters.drag.Y = e.clientY;

      setTimeout(() => {
        this.elements.tiles[key].classList.add('hide');
      }, 0);
    }
  }

  dragEnd(e) {
    const offsetX = Math.abs(this.parameters.drag.X - e.clientX);
    const offsetY = Math.abs(this.parameters.drag.Y - e.clientY);
    this.parameters.drag.X = null;
    this.parameters.drag.Y = null;

    if (offsetX > this.parameters.tileSize / 4 || offsetY > this.parameters.tileSize / 4) {
      this.moveTile(e.target.key);
    }

    this.elements.tiles[e.target.key].classList.remove('hide');
  }

  checkWin() {
    if (this.elements.tiles.every((el) => +el.innerHTML === el.position)) {
      this.stopTimer();
      this.createWinMessage();
      this.showModal();
      this.parameters.isEndGame = true;
      this.saveResult();

      if (this.picture.isPicture) {
        this.elements.puzzle.style.background = `url("${this.picture.link}")`;
        this.elements.puzzle.style.backgroundSize = '100%';
      }
    }
  }

  createWinMessage() {
    const text1 = document.createElement('p');
    const text2 = document.createElement('p');
    text1.textContent = 'Ура! Вы решили головоломку';
    text2.textContent = `за ${this.elements.counter.timer.innerHTML} и ${this.counter.moves} ход${grammaticalCase(this.counter.moves)}`;
    this.elements.modal.text.innerHTML = '';
    this.elements.modal.text.append(text1);
    this.elements.modal.text.append(text2);
  }

  saveResult() {
    if (localStorage.bestResult == null) {
      localStorage.setItem('bestResult', '');
    }
    const date = new Date();
    this.results.date = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    this.results.puzzleSize = `${this.parameters.puzzleSize} x ${this.parameters.puzzleSize}`;
    this.results.moves = this.counter.moves;
    this.results.time = this.elements.counter.timer.innerHTML;

    let table = [];
    if (localStorage.bestResult !== '') {
      table = JSON.parse(localStorage.bestResult);
      for (let i = 0; i < table.length; i += 1) {
        if (this.results.moves < table[i].moves) {
          table.splice(i, 0, this.results);
          break;
        }
      }
      if (this.results.moves > table[table.length - 1].moves) {
        table.push(this.results);
      }
      if (table.length > 10) table.length = 10;
      localStorage.bestResult = JSON.stringify(table);
    } else {
      table.push(this.results);
      localStorage.bestResult = JSON.stringify(table);
    }
  }

  createArr() { // array with random numbers
    const size = this.parameters.puzzleSize;
    let puzzle = [];
    for (let i = 0; i < size ** 2; i += 1) { puzzle.push(i); }

    puzzle = mix(puzzle);

    while (!checkEven(puzzle, size)) {
      puzzle = mix(puzzle);
    }
    return puzzle;
  }

  createCounter() {
    const { counter } = this.elements;
    counter.counter = document.createElement('div');
    counter.counter.classList.add('counter');

    counter.moves = document.createElement('div');
    counter.moves.classList.add('moves');
    counter.moves.textContent = this.counter.moves;

    counter.timer = document.createElement('div');
    counter.timer.classList.add('timer');
    if (localStorage.time) {
      const { time } = localStorage;
      const seconds = time % 60;
      const minutes = Math.floor(time / 60) % 3600;
      counter.timer.textContent = `${addZero(minutes)}:${addZero(seconds)}`;
    } else {
      counter.timer.textContent = '00:00';
    }

    counter.counter.append(counter.moves);
    counter.counter.append(counter.timer);
    this.elements.main.append(counter.counter);
  }

  createMenu() {
    const { menu } = this.elements;
    menu.menu = document.createElement('div');
    menu.menu.classList.add('menu');

    menu.newGame = document.createElement('button');
    menu.newGame.classList.add('button');
    menu.newGame.textContent = 'Начать новый пазл';
    menu.newGame.addEventListener('click', () => {
      this.newGame();
    });

    menu.newGamePic = document.createElement('button');
    menu.newGamePic.classList.add('button');
    menu.newGamePic.textContent = 'Новый пазл с картинкой';
    menu.newGamePic.addEventListener('click', () => {
      this.newGame();
      this.picture.isPicture = true;
      this.addPicture();
    });

    menu.newGameSize = document.createElement('select');
    menu.newGameSize.setAttribute('name', 'select');
    menu.newGameSize.classList.add('input');

    for (let i = 3; i < 9; i += 1) {
      const option = document.createElement('option');
      option.setAttribute('value', i);
      if (i === 4) option.setAttribute('selected', 'selected');
      option.textContent = `Размер поля ${i}х${i}`;
      menu.newGameSize.append(option);
    }

    menu.table = document.createElement('button');
    menu.table.classList.add('button');
    menu.table.textContent = 'Таблица лучших результатов';
    menu.table.addEventListener('click', () => {
      this.createResultTable();
      this.showTable();
    });

    menu.finish = document.createElement('button');
    menu.finish.classList.add('button');
    menu.finish.textContent = 'Завершить автоматически (3x3)';
    menu.finish.addEventListener('click', () => {
      this.autoResolve();
    });

    menu.volume = document.createElement('button');
    menu.volume.setAttribute('type', 'button');
    menu.volume.classList.add('volume');
    menu.volume.innerHTML = '<i class="material-icons">volume_off</i>';
    menu.volume.addEventListener('click', () => {
      this.handleVolumeButtonClick();
    });
    this.elements.audio = document.createElement('audio');
    this.elements.audio.setAttribute('src', 'assets/tink.wav');

    menu.hideDig = document.createElement('button');
    menu.hideDig.setAttribute('type', 'button');
    menu.hideDig.classList.add('volume');
    menu.hideDig.innerHTML = '<i class="material-icons">visibility</i>';
    menu.hideDig.addEventListener('click', () => {
      this.handleDigitsView();
    });

    const settings = document.createElement('div');
    settings.classList.add('settings');
    settings.append(menu.hideDig);
    settings.append(menu.volume);

    menu.menu.append(menu.newGame);
    menu.menu.append(menu.newGamePic);
    menu.menu.append(menu.newGameSize);
    menu.menu.append(menu.table);
    menu.menu.append(menu.finish);
    menu.menu.append(settings);
    menu.menu.append(this.elements.audio);

    this.elements.main.append(menu.menu);
  }

  playSound() {
    if (this.parameters.volume) {
      const audio = document.querySelector('audio');
      audio.currentTime = 0;
      audio.play();
    }
  }

  autoResolve() {
    if (this.parameters.puzzleSize === 3) {
      const moves = countWay(this.elements.randomArray);
      const accept = confirm(`Решение займет ${moves.length} ходов, ${moves.length / 100} секунд. Согласны ?`);
      if (accept) {
        for (let i = 0; i < moves.length; i += 1) {
          setTimeout(() => {
            const key = this.getTileNumByPosition(moves[i] + 1);
            this.moveTile(key);
          }, (20 + i * 10));
        }
      }
    }
  }

  handleVolumeButtonClick() {
    this.parameters.volume = !this.parameters.volume;
    if (this.parameters.volume) {
      this.elements.menu.volume.innerHTML = '<i class="material-icons">volume_up</i>';
    } else {
      this.elements.menu.volume.innerHTML = '<i class="material-icons">volume_off</i>';
    }
  }

  handleDigitsView() {
    if (this.picture.isPicture) {
      this.picture.digits = !this.picture.digits;
      this.elements.tiles.forEach((el) => {
        el.classList.toggle('hideDigits');
      });

      if (this.picture.digits) {
        this.elements.menu.hideDig.innerHTML = '<i class="material-icons">visibility</i>';
      } else {
        this.elements.menu.hideDig.innerHTML = '<i class="material-icons">visibility_off</i>';
      }
    }
  }

  // ------------modal window-------------------------
  createModal() {
    const body = document.querySelector('.body');
    const { modal } = this.elements;
    modal.modal = document.createElement('div');
    modal.modal.classList.add('modal');

    modal.text = document.createElement('div');
    modal.text.classList.add('modaltext');

    const buttons = document.createElement('div');
    buttons.classList.add('btns');
    modal.ok = document.createElement('button');
    modal.ok.classList.add('modalbutton');
    modal.ok.textContent = 'Ok';
    modal.ok.addEventListener('click', () => {
      this.hideModal();
    });

    modal.newGame = document.createElement('button');
    modal.newGame.classList.add('modalbutton');
    modal.newGame.textContent = 'Начать новый пазл';
    modal.newGame.addEventListener('click', () => {
      this.hideModal();
      this.newGame();
    });

    buttons.append(modal.ok);
    buttons.append(modal.newGame);

    modal.modal.append(modal.text);
    modal.modal.append(buttons);

    body.append(modal.modal);
  }

  showModal() {
    this.elements.modal.modal.classList.toggle('modal-active');
  }

  hideModal() {
    this.elements.modal.modal.classList.toggle('modal-active');
  }

  // -------------------table of results----------------------------
  createTable() {
    const body = document.querySelector('.body');
    const { table } = this.elements;
    table.modal = document.createElement('div');
    table.modal.classList.add('table');

    table.table = document.createElement('table');
    table.table.classList.add('table-item');

    table.ok = document.createElement('button');
    table.ok.classList.add('modalbutton');
    table.ok.textContent = 'Ok';
    table.ok.addEventListener('click', () => {
      this.hideTable();
    });

    table.modal.append(table.table);
    table.modal.append(table.ok);

    body.append(table.modal);
  }

  createResultTable() {
    let results;
    const { table } = this.elements;
    if (localStorage.bestResult) {
      results = JSON.parse(localStorage.bestResult);

      const thead = document.createElement('thead');
      const th1 = document.createElement('th');
      const th2 = document.createElement('th');
      const th3 = document.createElement('th');
      const th4 = document.createElement('th');
      th1.textContent = 'Дата';
      th2.textContent = 'Поле';
      th3.textContent = 'Время';
      th4.textContent = 'Ходов';
      thead.append(th1);
      thead.append(th2);
      thead.append(th3);
      thead.append(th4);

      table.table.append(thead);

      results.forEach((el) => {
        const row = table.table.insertRow(-1);

        const date = row.insertCell(0);
        const field = row.insertCell(1);
        const time = row.insertCell(2);
        const move = row.insertCell(3);

        date.textContent = el.date;
        field.textContent = el.puzzleSize;
        time.textContent = el.time;
        move.textContent = el.moves;
      });
    } else {
      table.table.innerHTML = 'Результатов еще нет';
    }
  }

  showTable() {
    this.elements.table.modal.classList.toggle('table-active');
  }

  hideTable() {
    this.elements.table.modal.classList.toggle('table-active');
    this.elements.table.table.innerHTML = '';
  }

  newGame() {
    this.parameters.isNewGame = true;
    this.parameters.puzzleSize = +this.elements.menu.newGameSize.value;
    this.stopTimer();
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

    if (this.picture.isPicture) {
      this.picture.isPicture = false;
      this.elements.puzzle.style.background = '';
    }
    this.saveGame();
  }

  startTimer() {
    if (this.counter.startTime == null
            && this.counter.time != null
            && this.counter.time !== 0) {
      this.counter.startTime = Date.now() - this.counter.time * SECOND;
    } else if (this.counter.startTime == null) {
      this.counter.startTime = Date.now();
    }

    const time = Math.floor((Date.now() - this.counter.startTime) / SECOND);
    localStorage.time = time;
    const seconds = time % 60;
    const minutes = Math.floor(time / 60) % 3600;
    this.elements.counter.timer.textContent = `${addZero(minutes)}:${addZero(seconds)}`;

    if (this.counter.endTime == null) {
      this.counter.timeoutID = setTimeout(() => { this.startTimer(); }, SECOND);
    }
  }

  stopTimer() {
    this.counter.endTime = Date.now();
  }
}

const puzzle = new GemPuzzle();
puzzle.init();
