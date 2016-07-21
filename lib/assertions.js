'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkExists = checkExists;
exports.checkPattern = checkPattern;
exports.checkValueType = checkValueType;
exports.checkValueIsNumber = checkValueIsNumber;
exports.checkIsStringArray = checkIsStringArray;
exports.checkValueIsStringArray = checkValueIsStringArray;
exports.checkProperties = checkProperties;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('sa:assertions');

const KEY_PATTERN = /^((?!^distinct_id$|^original_id$|^time$|^properties$|^id$|^first_id$|^second_id$|^users$|^events$|^event$|^user_id$|^date$|^datetime$)[a-zA-Z_$][a-zA-Z\d_$]{0,99})$/;

function checkExists(value) {
  let name = arguments.length <= 1 || arguments[1] === undefined ? 'value' : arguments[1];

  debug('checkExists: %s => %j', name, value);

  if (typeof value !== 'string') {
    throw new Error(`${ name } must be a string`);
  }

  if (value.length === 0) {
    throw new Error(`${ name } is empty`);
  }

  if (value.length > 255) {
    throw new Error(`${ name } is too long`);
  }

  return value;
}

function checkPattern(value) {
  let name = arguments.length <= 1 || arguments[1] === undefined ? 'value' : arguments[1];

  debug('checkPattern: %s', value);

  checkExists(value, name);

  if (!KEY_PATTERN.exec(value)) {
    throw new Error(`${ name } is invalid`);
  }

  return value;
}

function checkValueType(key) {
  debug('checkValyeType: this[%s]', key);
  const value = this[key];
  switch (_ramda2.default.type(value)) {
    case 'Number':
    case 'String':
    case 'Boolean':
    case 'Symbol':
    case 'Array':
      return;
    default:
      throw new Error(`Property ${ key } is invalid: ${ value }`);
  }
}

function checkValueIsNumber(key) {
  debug('checkValueIsNumber: this[%s]', key);
  const value = this[key];
  if (typeof value !== 'number') {
    throw new Error(`Property ${ key } must be number: ${ value }`);
  }
}

function checkIsStringArray(value) {
  let name = arguments.length <= 1 || arguments[1] === undefined ? 'Value' : arguments[1];

  debug('checkIsStringArray: %s => %j', name, value);

  if (!Array.isArray(value) || !_ramda2.default.all(_ramda2.default.is(String), value)) {
    throw new Error(`${ name } must be a array of string: ${ value }`);
  }
  return value;
}

function checkValueIsStringArray(key) {
  debug('checkValueIsStringArray: this[%s]', key);

  const value = this[key];
  checkIsStringArray(value, key);
}

function checkProperties(obj, checker) {
  debug('checkProperties: %j', obj);
  _ramda2.default.forEach(_ramda2.default.bind(checker, obj), _ramda2.default.keys(obj));

  return obj;
}