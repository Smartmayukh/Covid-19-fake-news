import { COLORS as colors } from './constants';

export function weightedRandom(spec) {
  const random = Math.random();
  let sum = .0; 

  for (var i in spec) {
    const [prob, value] = spec[i];
    sum += prob;
    if (random <= sum) {
      return value;
    };
  }
};

export function rangeBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export function shade(value) {
  let sum = 0;

  for (var i in colors) {
    const color = colors[i];
    if (value <= sum) {
      return color;
    };

    sum += 1 / colors.length;
  }

  return colors[colors.length - 1];
}

export function padding(value, max, padded) {
  return Math.min(Math.max(padded, value), max - 50);
}
