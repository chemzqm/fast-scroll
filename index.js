/**
 *
 * A notice message at the top of a webpage.
 *
 */

var classes = require('classes');
var events = require('event');
var sum = require('sum');
var domify = require('domify');

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
    events.bind(el, 'touchstart', this.ontouchstart.bind(this));
    events.bind(el, 'touchend', this.ontouchend.bind(this));
  }

  events.bind(document, 'scroll', onscroll);
  onscroll();
}

Scroll.prototype.ontouchstart = function () {
  window.clearInterval(this.interval);
  this.interval = window.setInterval(function(){
    this.onscroll();
  }.bind(this), 100);
}

Scroll.prototype.ontouchend = function () {
  var interval = this.interval;
  this.timeout = setTimeout(function () {
    window.clearInterval(interval);
  }, 3000);
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
