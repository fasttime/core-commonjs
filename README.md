# core-commonjs · [![npm version][npm badge]][npm URL]

**core-commonjs** adds support for [`require`](https://nodejs.org/api/modules.html#requireid), [`__dirname`](https://nodejs.org/api/modules.html#__dirname) and [`__filename`](https://nodejs.org/api/modules.html#__filename) to ES modules in Node.js.

## Installation

Install with [npm](https://docs.npmjs.com/about-npm):
```shell
npm i core-commonjs
```

## Usage

Import once at the entry point of your application/running unit:

```js
// main.js
import 'core-commonjs';
import './app.js';
```

Use in all ES modules later on:

```js
// app.js
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Hello World from ' + __dirname));
app.listen(80);

export default app;
```

Alternatively, launch with `node -r core-commonjs ./app.js` to have core-commonjs preloaded by Node.js.

## Compatibility

core-commonjs works in Node.js 14 or later. Browsers and transpilers are not supported.

[npm badge]: https://badge.fury.io/js/core-commonjs.svg
[npm URL]: https://www.npmjs.com/package/core-commonjs
