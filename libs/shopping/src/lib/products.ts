import { Product } from './product.interface';

export const products: Product[] = [
  {
    name: 'Apples',
    img: 'apple.svg',
    price: 1.32,
  },
  {
    name: 'Bananas',
    img: 'bananas.svg',
    price: 0.57,
  },
  {
    name: 'Cherries',
    img: 'cherries.svg',
    price: 7.55,
  },
  {
    name: 'Grapes',
    img: 'grapes.svg',
    price: 2.09,
  },
  {
    name: 'Green Apples',
    img: 'green-apple.svg',
    price: 1.22,
  },
  {
    name: 'Kiwis',
    img: 'kiwi.svg',
    price: 2.17,
  },
  {
    name: 'Lemons',
    img: 'lemon.svg',
    price: 2.6,
  },
  {
    name: 'Oranges',
    img: 'orange.svg',
    price: 1.33,
  },
  {
    name: 'Peaches',
    img: 'peach.svg',
    price: 0.6,
  },
  {
    name: 'Pears',
    img: 'pear.svg',
    price: 1.94,
  },
  {
    name: 'Pineapples',
    img: 'pineapple.svg',
    price: 2.75,
  },
  // {
  //   name: 'Pomegranates',
  //   img: 'pomegranate.svg',
  //   price: 3.4,
  // },
  {
    name: 'Strawberries',
    img: 'strawberries.svg',
    price: 3.46,
  },
].map(product => ({ ...product, quantity: 1 }));
