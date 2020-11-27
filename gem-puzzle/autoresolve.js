export default function countWay(randomArray) {
  const closeList = [];

  function countMisplacedItems(array) { // кол-во элементов не на правильной позиции
    let sum = 0;
    for (let i = 0; i < array.length - 1; i += 1) {
      if (array[i] !== i + 1) {
        sum += 1;
      }
    }
    if (array[array.length - 1] !== 0) {
      sum += 1;
    }
    return sum;
  }

  function initClose(array) {
    const tmp = [];
    tmp.push(-1);
    tmp.push(-1);
    tmp.push(array);
    tmp.push(0);
    tmp.push(countMisplacedItems(array));
    tmp.push(countMisplacedItems(array));
    closeList.push(tmp);
  }

  function reversItems(array, i1, i2) { // поменять местами элементы массива
    const a = array[i1];
    const b = array[i2];
    array.splice(i1, 1, b);
    array.splice(i2, 1, a);
    return array;
  }

  function getZeroNeigbors(array) { // получить массив индексов соседей нуля
    const { length } = array;
    const size = Math.sqrt(length);
    const zero = array.indexOf(0);
    const neigbors = [];

    const top = zero - size;
    if (top >= 0) {
      neigbors.push(top);
    }
    const bottom = zero + size;
    if (bottom <= length - 1) {
      neigbors.push(bottom);
    }
    const left = zero - 1;
    if ((zero + 1) % size !== 1) {
      neigbors.push(left);
    }
    const right = zero + 1;
    if ((zero + 1) % size !== 0) {
      neigbors.push(right);
    }

    return neigbors;
  }

  function getChildNodes(array) {
    const nodes = [];
    let tmp = [];
    const zero = array.indexOf(0);
    const sites = getZeroNeigbors(array);
    sites.forEach((el) => {
      const [...tmparr] = [...array];
      tmp.push(zero);
      tmp.push(el);
      tmp.push(reversItems(tmparr, el, zero));
      nodes.push(tmp);
      tmp = [];
    });

    return nodes;
  }

  function compareArrays(array1, array2) {
    if (array1.length !== array2.length) {
      return false;
    }
    let tmp = 0;
    for (let i = 0; i < array1.length; i += 1) {
      if (array1[i] !== array2[i]) {
        tmp += 1;
      }
    }

    if (tmp === 0) {
      return true;
    }

    return false;
  }

  function count(arrow) {
    initClose(arrow);
    let G = 0;
    let H = 0;
    let F = 0;

    for (G = 1; G < 20000; G += 1) {
      const tmpNodes = getChildNodes(closeList[closeList.length - 1][2]); // дочерние узлы

      tmpNodes.forEach((el) => {
        el.push(G);
        H = countMisplacedItems(el[2]);
        el.push(H);
        F = G + H;
        el.push(F);
      });

      tmpNodes.forEach((el, key) => { // исключить обратный ход
        if (el[1] === closeList[closeList.length - 1][0]) {
          tmpNodes.splice(key, 1);
        }
      });

      tmpNodes.forEach((el, key) => { // исключить повторяющиеся узлы
        closeList.forEach((cEl) => {
          if (compareArrays(el[2], cEl[2]) && tmpNodes.length > 1) {
            tmpNodes.splice(key, 1);
            // closeList.splice(c_key);
          }
        });
      });

      let [...min] = [...tmpNodes[0]]; // найти минимальное F
      tmpNodes.forEach((el) => {
        if (el[5] < min[5]) {
          [...min] = [...el];
        }
      });

      const tmpSameWeight = []; // узлы с одинаковыми F
      tmpNodes.forEach((el, key) => {
        tmpNodes.forEach((iEl, iKey) => {
          if (key !== iKey) {
            if (el[5] === iEl[5] && el[5] <= min[5]) {
              if (!tmpSameWeight.includes(el)) {
                tmpSameWeight.push(el);
              }
            }
          }
        });
      });

      if (tmpSameWeight.length === 0) { // проверить субузлы
        closeList.push(min);
      } else {
        const tmpSubNodes = [];

        tmpSameWeight.forEach((el) => {
          const tmp = getChildNodes(el[2]);
          tmp.forEach((elem) => {
            elem.push(G + 1);
            H = countMisplacedItems(elem[2]);
            elem.push(H);
            elem.push(G + H + 1);
          });
          tmpSubNodes.push(tmp);
        });

        const tmpminw = tmpSubNodes[0][0][5];
        let k = 0;

        tmpSubNodes.forEach((el) => {
          el.forEach((elem) => {
            if (elem[5] < tmpminw) {
              [k] = elem;
            }
          });
        });
        tmpSameWeight.forEach((el) => {
          if (el[1] === k) {
            min = el;
          }
        });

        // tmpSubNodes.forEach((el, key)=>{ // исключить повторяющиеся узлы
        //     closeList.forEach((c_el, c_key)=>{
        //         if(compareArrays(el[2], c_el[2]) && tmpSubNodes.length >1){
        //             tmpSubNodes.splice(key, 1);
        //             // closeList.splice(c_key);
        //         }
        //     });
        // });

        closeList.push(min);
      }

      if (countMisplacedItems(min[2]) === 0) {
        break;
      }
    }

    return closeList;
  }

  function translateToMoves(array) {
    const moves = [];

    for (let i = 1; i < array.length - 1; i += 1) {
      moves.push(array[i][1]);
    }
    return moves;
  }

  return translateToMoves(count(randomArray));
}
