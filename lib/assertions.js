"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkDateTimeValueType = checkDateTimeValueType;
exports.checkExists = checkExists;
exports.checkIsStringArray = checkIsStringArray;
exports.checkPattern = checkPattern;
exports.checkProperties = checkProperties;
exports.checkValueIsNumber = checkValueIsNumber;
exports.checkValueIsStringArray = checkValueIsStringArray;
exports.checkValueType = checkValueType;
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.object.to-string.js");
require("core-js/modules/es.array.iterator.js");
var _ramda = _interopRequireDefault(require("ramda"));
var _debug = _interopRequireDefault(require("debug"));
var _moment = _interopRequireDefault(require("moment"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var debug = (0, _debug.default)("sa:assertions");
var KEY_PATTERN = /^((?!^distinct_id$|^original_id$|^time$|^properties$|^id$|^first_id$|^second_id$|^users$|^events$|^event$|^user_id$|^date$|^datetime$)[a-zA-Z_$][a-zA-Z\d_$]{0,99})$/;
function checkExists(value) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "value";
  debug("checkExists: %s => %j", name, value);
  if (typeof value !== "string") {
    throw new Error(`${name} must be a string`);
  }
  if (value.length === 0) {
    throw new Error(`${name} is empty`);
  }
  if (value.length > 255) {
    throw new Error(`${name} is too long`);
  }
  return value;
}
function checkPattern(value) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "value";
  debug("checkPattern: %s", value);
  checkExists(value, name);
  if (!KEY_PATTERN.exec(value)) {
    throw new Error(`${name} is invalid`);
  }
  return value;
}
function checkDateTimeValueType(key, value) {
  var type = _ramda.default.type(value);
  switch (type) {
    case "Number":
    case "String":
    case "Date":
      return;
    case "Object":
      if (typeof value.toDate === "function") {
        return;
      }
      throw new Error("Invalid time object");
    default:
      throw new Error("Invalid time object");
  }
}
function checkValueType(key) {
  debug("checkValyeType: this[%s]", key);
  var value = this[key];
  if (key === "$time") {
    // Bypass normal check
    checkDateTimeValueType(key, value);
    return;
  }
  switch (_ramda.default.type(value)) {
    case "Number":
    case "String":
    case "Boolean":
    case "Symbol":
    case "Array":
      return;
    case "Date":
      this[key] = (0, _moment.default)(value).format("YYYY-MM-DD HH:mm:ss.SSS");
      return;
    default:
      throw new Error(`Property ${key} is invalid: ${value}`);
  }
}
function checkValueIsNumber(key) {
  debug("checkValueIsNumber: this[%s]", key);
  var value = this[key];
  if (typeof value !== "number") {
    throw new Error(`Property ${key} must be number: ${value}`);
  }
}
function checkIsStringArray(value) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Value";
  debug("checkIsStringArray: %s => %j", name, value);
  if (!Array.isArray(value) || !_ramda.default.all(_ramda.default.is(String), value)) {
    throw new Error(`${name} must be a array of string: ${value}`);
  }
  return value;
}
function checkValueIsStringArray(key) {
  debug("checkValueIsStringArray: this[%s]", key);
  var value = this[key];
  checkIsStringArray(value, key);
}
function checkProperties(obj, checker) {
  debug("checkProperties: %j", obj);
  _ramda.default.forEach(_ramda.default.bind(checker, obj), _ramda.default.keys(obj));
  return obj;
}