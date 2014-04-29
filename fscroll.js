
;(function(){

/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("component~event@0.1.3", function (exports, module) {
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
});

require.register("component~domify@1.2.2", function (exports, module) {

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.text =
map.circle =
map.ellipse =
map.line =
map.path =
map.polygon =
map.polyline =
map.rect = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');
  
  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return document.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = document.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

});

require.register("component~props@1.1.2", function (exports, module) {
/**
 * Global Names
 */

var globals = /\b(this|Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[$a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

});

require.register("component~to-function@2.0.3", function (exports, module) {
/**
 * Module Dependencies
 */
try {
  var expr = require("component~props@1.1.2");
} catch(e) {
  var expr = require("component~props@1.1.2");
}

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  }
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  }
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {}
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key])
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  }
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val;
  for(var i = 0, prop; prop = props[i]; i++) {
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";
    str = str.replace(new RegExp(prop, 'g'), val);
  }

  return str;
}

});

require.register("component~sum@0.1.1", function (exports, module) {

/**
 * Module dependencies.
 */

var toFunction = require("component~to-function@2.0.3");

/**
 * Sum the given `arr` with callback `fn(val, i)`.
 *
 * @param {Array|Object} arr
 * @param {Function} fn
 * @return {Number}
 * @api public
 */

module.exports = function(arr, fn){
  var sum = 0;
  if (fn) {
    fn = toFunction(fn);
    if (Array.isArray(arr)) {
      for (var i = 0; i < arr.length; ++i) {
        sum += fn(arr[i], i);
      }
    } else {
      for (var key in arr) {
        sum += fn(arr[key], key);
      }
    }
  } else {
    for (var i = 0; i < arr.length; ++i) {
      sum += arr[i];
    }
  }
  return sum;
};

});

require.register("component~indexof@0.0.3", function (exports, module) {
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});

require.register("component~classes@1.2.1", function (exports, module) {
/**
 * Module dependencies.
 */

var index = require("component~indexof@0.0.3");

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el) throw new Error('A DOM element reference is required');
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name, force){
  // classList
  if (this.list) {
    if ("undefined" !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if ("undefined" !== typeof force) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});

require.register("fast-scroll", function (exports, module) {
/**
 *
 * A notice message at the top of a webpage.
 *
 */

var classes = require("component~classes@1.2.1");
var events = require("component~event@0.1.3");
var sum = require("component~sum@0.1.1");
var domify = require("component~domify@1.2.2");

var hasTouch = 'ontouchend' in window;

function merge(target, defaults) {
  var res = {};
  for (var p in defaults) {
    if (!target.hasOwnProperty(p)) {
      res[p] = defaults[p];
    } else {
      res[p] = target[p];
    }
  }
  return res;
}

function buffer(fn, ms) {
  var timeout;
  return function() {
    if (timeout) return;
    timeout = setTimeout(function() {
      timeout = null;
      fn();
    }, ms);
  }
}

/**
 * checks whether a element should be reclaimed
 * @param {String} el
 * @return {Number} element height
 * @api private
 */
function reclaim(el, offset, isBottom) {
  var rect = el.getBoundingClientRect();
  if (!isBottom && rect.bottom <= - offset) {
    return rect;
  }
  var wh = (window.innerHeight || document.documentElement.clientHeight);
  if (isBottom && rect.top >= wh + offset) {
    return rect;
  }
  return;
}

function Scroll(el, opts) {
  if (!(this instanceof Scroll)) return new Scroll(el, opts);
  this.opts = merge(opts, {
    offsetTop: 800,
    offsetBottom: 800,
    throttle: 400
  })
  this.el = el;
  var t = this.top = document.createElement('div');
  var b = this.bottom = document.createElement('div');
  el.parentNode.insertBefore(t, el);
  var n = el.nextElementSibling;
  if (n) {
    el.parentNode.insertBefore(b, n);
  } else {
    el.parentNode.appendChild(b);
  }
  //array of html and height
  this.topCache = [];
  this.bottomCache = [];
  var onscroll = this.onscroll = buffer(this.onscroll.bind(this), this.opts.throttle);
  if (hasTouch) {
    //events.bind(el, 'touchstart', this.ontouchstart.bind(this));
    //events.bind(el, 'touchend', this.ontouchend.bind(this));
  }

  events.bind(document, 'scroll', onscroll);
  onscroll();
}

Scroll.prototype.onscroll = function () {
  var fns = [];
  this.restoreTop();
  this.restoreBottom();
  fns.push(this.save());
  fns.push(this.save(true));
  fns.forEach(function(fn, i) {
    if(fn) fn();
  })
}

Scroll.prototype.restoreTop = function () {
  if (this.topCache.length === 0) return;
  var tb = this.top.getBoundingClientRect().bottom;
  var to = - this.opts.offsetTop;
  var html = '';
  var th = 0;
  if (tb > to) {
    while(th < tb - to) {
      var o = this.topCache.pop();
      th += o.height;
      html =  o.html + html;
      if (this.topCache.length === 0) break;
    }
    prepend(this.el, domify(html));
    setHeight(this.topCache, this.top);
  }
}

Scroll.prototype.restoreBottom = function () {
  if (this.bottomCache.length === 0) return;
  var tt = this.bottom.getBoundingClientRect().top;
  var tm = this.opts.offsetBottom;
  var wh = (window.innerHeight || document.documentElement.clientHeight);
  var html = '';
  var th = 0;
  if (tt < wh + tm) {
    while(th < (wh + tm) - tt) {
      var o = this.bottomCache.pop();
      th += o.height;
      html =  html + o.html;
      if (this.bottomCache.length === 0) break;
    }
    this.el.appendChild(domify(html));
    setHeight(this.bottomCache, this.bottom);
  }
}

Scroll.prototype.save = function (isBottom) {
  var offset = isBottom ? this.opts.offsetBottom : this.opts.offsetTop;
  var cache = isBottom ? this.bottomCache : this.topCache;
  var div = isBottom ? this.bottom : this.top;
  var n = isBottom ? this.el.lastElementChild : this.el.firstElementChild;
  var html = '';
  var th = 0;
  var h;
  var els = [];
  var cb;
  while(n) {
    var rect = reclaim(n, offset, isBottom);
    if (rect) {
      h = rect.height;
      els.push(n);
      if (cb !== rect.bottom) {
        cb = rect.bottom;
        if (html) cache.push({
          html: html,
          height: h
        })
        th += h;
        html = '';
      }
      if (isBottom) {
        html = toHtml(n) + html;
      } else {
        html = html + toHtml(n);
      }
    } else {
      th += h;
      if (html) {
        cache.push({
          html: html,
          height: h
        })
      }
      break;
    }
    n = isBottom ? n.previousElementSibling : n.nextElementSibling;
  }
  return function() {
    if (th) {
      setHeight(cache, div);
      var p = this.el;
      els.forEach(function(el) {
        p.removeChild(el);
      })
    }
  }.bind(this);
}

Scroll.prototype.reset = function () {
  this.topCache = [];
  this.bottomCache = [];
  this.top.style.height = '0px';
  this.bottom.style.height = '0px';
}

function toHtml(el) {
  var div = document.createElement('div');
  div.appendChild(el.cloneNode(true));
  return div.innerHTML;
}

function setHeight(store, el) {
  var height = sum(store, function (o) {
    return o.height;
  })
  el.style.height = height + 'px';
}

function prepend(el, node) {
  if (el.firstElementChild) {
    el.insertBefore(node, el.firstElementChild);
  } else {
    el.appendChild(node);
  }
}
module.exports = Scroll;

});

if (typeof exports == "object") {
  module.exports = require("fast-scroll");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("fast-scroll"); });
} else {
  this["fscroll"] = require("fast-scroll");
}
})()
