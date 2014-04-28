
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components

standalone: components index.js
	@component build --standalone fscroll -o dist
	@mv dist/build.js fscroll.js
	@rm -fr dist

watch:
	rewatch index.js -c "make build"

publish:
	@component publish

test:
	@component test phantom

test-browser:
	@component test browser

doc:
	@component build
	@rm -fr .gh-pages
	@mkdir .gh-pages
	@cp -r build .gh-pages/
	@cp example.html .gh-pages/index.html
	@ghp-import .gh-pages -n -p
	@rm -fr .gh-pages

.PHONY: clean test doc
