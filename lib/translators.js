'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.snakenizeKeys = exports.translateKeys = undefined;
exports.pascal2Snake = pascal2Snake;
exports.translateTimeStamp = translateTimeStamp;
exports.extractTimestamp = extractTimestamp;
exports.parseCallInfo = parseCallInfo;
exports.extractCodeProperties = extractCodeProperties;
exports.parseUserAgent = parseUserAgent;
exports.translateUserAgent = translateUserAgent;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _detector = require('detector');

var _detector2 = _interopRequireDefault(_detector);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('sa:translators');

const UPPER_CASE_LETTER = /([A-Z])/g;

function pascal2Snake(text) {
  var reg = new RegExp('^[A-Z_]+$');
  if (text == null || text === '$SignUp' || reg.test(text)) {
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

const snakenizeKeys = exports.snakenizeKeys = translateKeys(pascal2Snake);

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
function extractTimestamp(properties) {
  const time = translateTimeStamp(properties.$time);
  delete properties.$time; // Remove the key if exists
  return time;
}

const CALL_INFO_REGEX = /^\s*at ((((\w+)\.)?(\w+|<anonymous>) \(((.+):(\d+):(\d+)|(native))\))|(.+):(\d+):(\d+))$/;
function parseCallInfo(text) {
  debug('parseCallInfo: %s', text);

  const matches = CALL_INFO_REGEX.exec(text);

  if (matches == null) {
    return null;
  }

  return {
    fileName: matches[7] || matches[10] || matches[11],
    lineNumber: matches[8] || matches[12],
    columnNumber: matches[9] || matches[13],
    className: matches[4],
    functionName: matches[5]
  };
}
function extractCodeProperties(callerIndex) {
  const codeProperties = {
    $libMethod: 'code'
  };

  const callerInfo = new Error();
  const stack = callerInfo.stack.split('\n', callerIndex + 1);
  debug('extractCodeProperties: %j', stack);

  const callInfo = parseCallInfo(stack[callerIndex]);

  if (callInfo != null) {
    debug('Call info: %j', callInfo);
    const className = callInfo.className;
    const functionName = callInfo.functionName;
    const fileName = callInfo.fileName;
    const lineNumber = callInfo.lineNumber;
    const columnNumber = callInfo.columnNumber;

    codeProperties.$libDetail = `${ className }##${ functionName }##${ fileName }##${ lineNumber },${ columnNumber }`;
  } else {
    debug('Call info not parsed');
  }

  return codeProperties;
}

function patchOSName(os) {
  switch (os.name) {
    case 'ios':
      os.name = 'iPhone OS';
      break;
    case 'android':
      os.name = 'Android';
      break;
    default:
      break;
  }
}
function parseUserAgent(userAgent) {
  if (userAgent == null) {
    return undefined;
  }

  const result = _detector2.default.parse(userAgent);
  patchOSName(result.os);

  return {
    $os: result.os.name,
    $model: result.device.name,
    _browser_engine: result.engine.name,
    $os_version: String(result.os.version),
    $browser: result.browser.name,
    $browser_version: String(result.browser.version)
  };
}
function translateUserAgent(properties) {
  const $userAgent = properties.$userAgent;


  if ($userAgent == null) {
    return properties;
  }

  delete properties.$userAgent;

  const userAgentInfo = parseUserAgent($userAgent);

  return Object.assign(userAgentInfo, properties);
}