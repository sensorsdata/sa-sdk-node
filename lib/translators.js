'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.translateKeys = undefined;
exports.pascal2Snake = pascal2Snake;
exports.translateTimeStamp = translateTimeStamp;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const UPPER_CASE_LETTER = /([A-Z])/g;

function pascal2Snake(text) {
  if (text == null) {
    return text;
  }
  return text.replace(UPPER_CASE_LETTER, (match, letter) => `_${ letter.toLowerCase() }`);
}

const translateKeys = exports.translateKeys = _ramda2.default.curry((translator, object) => {
  if (object == null) {
    return object;
  }

  return _ramda2.default.reduce((result, key) => {
    result[translator(key) || key] = object[key];

    return result;
  }, {}, _ramda2.default.keys(object));
});

function translateTimeStamp(timestamp) {
  if (timestamp == null) {
    return Date.now();
  }

  if (typeof timestamp === 'number') {
    return timestamp;
  }

  if (typeof timestamp === 'string') {
    return Date.parse(timestamp);
  }

  if (timestamp instanceof Date) {
    return timestamp.valueOf();
  }

  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().valueOf(); // Support moment.js
  }

  throw new Error('Invalid timestamp');
}