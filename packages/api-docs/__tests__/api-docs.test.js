'use strict';

const apiDocs = require('..');
const assert = require('assert').strict;

assert.strictEqual(apiDocs(), 'Hello from apiDocs');
console.info('apiDocs tests passed');
