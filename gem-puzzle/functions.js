export const SECOND = 1000;

export function mix(arr) {
  let array = [];
  [...array] = [...arr];
  array = array.sort(() => Math.random() - 0.5);
  return array;
}

export function checkEven(array, size) {
  let sum = 0;
  const l = array.length;
  for (let i = 0; i < l; i += 1) {
    let k = 0;
    for (let j = 0; j < l; j += 1) {
      if (i < j && array[i] > array[j] && array[j] !== 0) {
        k += 1;
      }
    }
    sum += k;
  }

  if (size % 2 === 0) {
    sum += Math.ceil((array.indexOf(0) + 1) / size);
  }

  if (sum % 2 === 0) {
    return true;
  }
  return false;
}

export function addZero(n) {
  return (parseInt(n, 10) < 10 ? '0' : '') + n;
}

export function grammaticalCase(n) {
  if (n % 10 === 1) {
    return '';
  } if (n % 10 > 1 && n % 10 < 5) {
    return 'a';
  }
  return 'ов';
}
