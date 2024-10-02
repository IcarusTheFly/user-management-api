'use strict';

const authentication = require('..');
const assert = require('assert').strict;

assert.strictEqual(authentication(), 'Hello from authentication');
console.info('authentication tests passed');
