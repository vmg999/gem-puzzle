/* eslint-disable linebreak-style */
/* eslint-disable no-shadow */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-loop-func */
/* eslint-disable camelcase */
/* eslint-disable no-else-return */
/* eslint-disable no-use-before-define */
/* eslint-disable no-plusplus */
/* eslint-disable eqeqeq */
/* eslint-disable import/prefer-default-export */

// let a = [15, 3, 2, 5, 4, 7, 11, 8, 10, 9, 14, 0, 12, 1, 13, 6];
// let a =[14, 6, 10, 12, 8, 0, 15, 13, 1, 11, 7, 4, 3, 5, 2, 9];
// let a =[5, 13, 2, 4, 6, 12, 11, 15, 8, 1, 9, 14, 0, 7, 10, 3]
// let a = [15, 3, 2, 5, 4, 7, 11, 8, 10, 9, 14, 0, 12, 1, 13, 6]

// let a = [2, 5, 0, 3, 1, 7, 8, 6, 4];
// let a = [8, 2, 3, 0, 4, 7, 6, 5, 1];
// let a = [0, 6, 1, 2, 5, 8, 4, 7, 3];
// let a = [7, 5, 0, 2, 6, 4, 3, 8, 1];
// let a = [5, 0, 7, 1, 6, 2, 4, 8, 3];

export function countWay(randomArray) {
  const closeList = [];

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
    const length = array.length;
    const size = Math.sqrt(length);
    const zero = array.indexOf(0);
    const neigbors = [];

    const top = zero - size;
    if (top >= 0) neigbors.push(top);
    const bottom = zero + size;
    if (bottom <= length - 1) neigbors.push(bottom);
    const left = zero - 1;
    if ((zero + 1) % size != 1) neigbors.push(left);
    const right = zero + 1;
    if ((zero + 1) % size != 0) neigbors.push(right);

    return neigbors;
  }

  function countMisplacedItems(array) { // кол-во элементов не на правильной позиции
    let sum = 0;
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i] != i + 1) {
        sum++;
      }
    }
    if (array[array.length - 1] != 0) sum++;
    return sum;
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
    if (array1.length == array2.length) {
      let tmp = 0;
      for (let i = 0; i < array1.length; i++) {
        if (array1[i] != array2[i]) tmp++;
      }

      if (tmp == 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  function count(arrow) {
    initClose(arrow);
    let G = 0;
    let H = 0;
    let F = 0;
    let M = 0;

    for (let G = 1; G < 20000; G++) {
      const tmpNodes = getChildNodes(closeList[closeList.length - 1][2]); // дочерние узлы для последнего в закрытом

      tmpNodes.forEach((el) => {
        el.push(G);
        H = countMisplacedItems(el[2]);
        el.push(H);
        el.push(G + H);
      });

      tmpNodes.forEach((el, key) => { // исключить обратный ход
        if (el[1] == closeList[closeList.length - 1][0]) {
          tmpNodes.splice(key, 1);
        }
      });

      tmpNodes.forEach((el, key) => { // исключить повторяющиеся узлы
        closeList.forEach((c_el) => {
          if (compareArrays(el[2], c_el[2]) && tmpNodes.length > 1) {
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
        tmpNodes.forEach((i_el, i_key) => {
          if (key != i_key) {
            if (el[5] == i_el[5] && el[5] <= min[5]) {
              if (!tmpSameWeight.includes(el)) {
                tmpSameWeight.push(el);
              }
            }
          }
        });
      });

      if (tmpSameWeight.length == 0) { // проверить субузлы
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
        // console.log(tmpSameWeight);

        const tmpminw = tmpSubNodes[0][0][5];
        let k = 0;

        tmpSubNodes.forEach((el) => {
          el.forEach((elem) => {
            if (elem[5] < tmpminw) {
              k = elem[0];
            }
          });
        });
        tmpSameWeight.forEach((el) => {
          if (el[1] == k) {
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

      if (countMisplacedItems(min[2]) == 0) {
        break;
      }
    }

    return closeList;
  }

  function translateToMoves(array) {
    const moves = [];

    for (let i = 1; i < array.length - 1; i++) {
      moves.push(array[i][1]);
    }
    return moves;
  }

  return translateToMoves(count(randomArray));
}
