# Fast-scroll

A component used for performance improved infinite scroll on mobile device.

Showcase at <http://chemzqm.github.io/fast-scroll/>.

<http://engineering.linkedin.com/linkedin-ipad-5-techniques-smooth-infinite-scrolling-html5>

**Note** try not use infinite scroll in your app, that's terrible user experience.

TODO: improve performance by create dom with iframe <http://www.html5rocks.com/en/mobile/optimization-and-performance/>

## Installation

Install with [component(1)](http://component.io):

    $ component install chemzqm/fast-scroll

## API

```js
var faster = require('fast-scroll');
faster(el, {
  offsetTop: 500,
  osffsetBottom: 500,
  throttle: 300
})
```

### fast-scroll(el, [option])

bind fast-scoll to scrolling `el` with optional option.

* `option.offsetTop` <800> max top offset of the children element.
* `option.offsetBottom` <800> max bottom offset of the children element.
* `options.throttle` <400> throttle the check in throttle millisecond.

### .reset()

Back to initial state. call this when you rerender the items of the scrolling element.

## License

  MIT
