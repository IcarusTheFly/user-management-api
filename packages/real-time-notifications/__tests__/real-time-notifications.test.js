'use strict';

const realTimeNotifications = require('..');
const assert = require('assert').strict;

assert.strictEqual(realTimeNotifications(), 'Hello from realTimeNotifications');
console.info('realTimeNotifications tests passed');
