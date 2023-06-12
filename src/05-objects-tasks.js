/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

const Utils = {
  capitalize: (str) => str[0].toUpperCase() + str.slice(1),
  joinColon: (list) => list.join(', '),
  joinStart: (list) => {
    const first = list[0];
    const rest = list.slice(1, -2);
    const lastTwo = list.slice(-2);
    return [Utils.capitalize(first), ...rest, lastTwo.join(' and ')].join(', ');
  },
};


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  const object = { width, height };
  Object.setPrototypeOf(object, {
    getArea() {
      return { ...this }.width * this.height;
    },
  });
  return object;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const object = JSON.parse(json);
  Object.setPrototypeOf(object, proto);
  return object;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

/**
 * @typedef {'element' | 'id' | 'class' | 'attr' | 'pseudoClass' | 'pseudoElement'} Selectors
 */

/**
 * @typedef {{[K in Selectors]: (value: string) => SelectorBuilder}} SelectorMethods
 */

/**
 * @typedef {{
 *  name: Selectors, unique: boolean, toString: (v: string) => string, errorName: string
 * }} SelectorConfig
 */


function SelectorBuilder({ order = -1, selector = '' } = {}) {
  this.selector = selector;
  this.order = order;
}

/** @type {SelectorConfig[]} */
SelectorBuilder.ORDERED_SELECTORS = [
  {
    name: 'element',
    unique: true,
    toString: (s) => s,
    errorName: 'element',
  },
  {
    name: 'id',
    unique: true,
    toString: (s) => `#${s}`,
    errorName: 'id',
  },
  {
    name: 'class',
    unique: false,
    toString: (s) => `.${s}`,
    errorName: 'class',
  },
  {
    name: 'attr',
    unique: false,
    toString: (s) => `[${s}]`,
    errorName: 'attribute',
  },
  {
    name: 'pseudoClass',
    unique: false,
    toString: (s) => `:${s}`,
    errorName: 'pseudo-class',
  },
  {
    name: 'pseudoElement',
    unique: true,
    toString: (s) => `::${s}`,
    errorName: 'pseudo-element',
  },
];

function check(order, isUnique = false) {
  const SELECTORS = this.constructor.ORDERED_SELECTORS;

  if (this.order > order) {
    const orders = SELECTORS.map((o) => o.errorName);
    const WRONG_ORDER = `Selector parts should be arranged in the following order: ${Utils.joinColon(orders)}`;
    throw new Error(WRONG_ORDER);
  }
  /*
   * The selectors are called in the correct order,
   * which means that repeated calls can only be placed next to each other
   */
  if (isUnique && this.order === order) {
    const uniques = SELECTORS.filter(({ unique }) => unique).map((o) => o.errorName);
    const UNIQUES_REPEAT = `${Utils.joinStart(uniques)} should not occur more then one time inside the selector`;
    throw new Error(UNIQUES_REPEAT);
  }
}

function stringify() {
  return this.selector;
}

function combine(selector1, combinator, selector2) {
  return new this.constructor({
    selector: `${selector1.selector} ${combinator} ${selector2.selector}`,
  });
}

function selectorMaker({ order, unique, toString }) {
  return function selectorHandler(value) {
    this.check(order, unique);
    return new this.constructor({
      order,
      selector: this.selector + toString(value),
    });
  };
}

SelectorBuilder.prototype.stringify = stringify;
SelectorBuilder.prototype.check = check;
SelectorBuilder.prototype.combine = combine;

SelectorBuilder.ORDERED_SELECTORS.forEach(({ name, unique, toString }, order) => {
  SelectorBuilder.prototype[name] = selectorMaker({ unique, toString, order });
}, {});

/** @type {SelectorBuilder & SelectorMethods} */
const cssSelectorBuilder = new SelectorBuilder();


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
