'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkExists = checkExists;
exports.checkPattern = checkPattern;
exports.checkDateTimeValueType = checkDateTimeValueType;
exports.checkValueType = checkValueType;
exports.checkValueIsNumber = checkValueIsNumber;
exports.checkIsStringArray = checkIsStringArray;
exports.checkValueIsStringArray = checkValueIsStringArray;
exports.checkProperties = checkProperties;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('sa:assertions');

const KEY_PATTERN = /^((?!^distinct_id$|^original_id$|^time$|^properties$|^id$|^first_id$|^second_id$|^users$|^events$|^event$|^user_id$|^date$|^datetime$)[a-zA-Z_$][a-zA-Z\d_$]{0,99})$/;

function checkExists(value) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'value';

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
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'value';

  debug('checkPattern: %s', value);

  checkExists(value, name);

  if (!KEY_PATTERN.exec(value)) {
    throw new Error(`${ name } is invalid`);
  }

  return value;
}

function checkDateTimeValueType(key, value) {
  const type = _ramda2.default.type(value);

  switch (type) {
    case 'Number':
    case 'String':
    case 'Date':
      return;
    case 'Object':
      if (typeof value.toDate === 'function') {
        return;
      }
      throw new Error('Invalid time object');
    default:
      throw new Error('Invalid time object');
  }
}

function checkValueType(key) {
  debug('checkValyeType: this[%s]', key);

  const value = this[key];

  if (key === '$time') {
    // Bypass normal check
    checkDateTimeValueType(key, value);
    return;
  }

  switch (_ramda2.default.type(value)) {
    case 'Number':
    case 'String':
    case 'Boolean':
    case 'Symbol':
    case 'Array':
      return;
    case 'Date':
      this[key] = (0, _moment2.default)(value).format('YYYY-MM-DD HH:mm:ss.SSS');
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
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Value';

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