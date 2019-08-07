"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pascal2Snake = pascal2Snake;
exports.translateTimeStamp = translateTimeStamp;
exports.extractTimestamp = extractTimestamp;
exports.parseCallInfo = parseCallInfo;
exports.extractCodeProperties = extractCodeProperties;
exports.parseUserAgent = parseUserAgent;
exports.translateUserAgent = translateUserAgent;
exports.snakenizeKeys = exports.translateKeys = void 0;

var _ramda = _interopRequireDefault(require("ramda"));

var _detector = _interopRequireDefault(require("detector"));

var _debug = _interopRequireDefault(require("debug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug.default)('sa:translators');
const UPPER_CASE_LETTER = /([A-Z])/g;

function pascal2Snake(text) {
  const reg = new RegExp('^[A-Z_]+$');

  if (text == null || text === '$SignUp' || reg.test(text)) {
    return text;
  }

  return text.replace(UPPER_CASE_LETTER, (match, letter) => `_${letter.toLowerCase()}`);
}

const translateKeys = _ramda.default.curry((translator, object) => {
  if (object == null) {
    return object;
  }

  return _ramda.default.reduce((result, key) => {
    result[translator(key) || key] = object[key];
    return result;
  }, {}, _ramda.default.keys(object));
});

exports.translateKeys = translateKeys;
const snakenizeKeys = translateKeys(pascal2Snake);
exports.snakenizeKeys = snakenizeKeys;

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
    const className = callInfo.className,
          functionName = callInfo.functionName,
          fileName = callInfo.fileName,
          lineNumber = callInfo.lineNumber,
          columnNumber = callInfo.columnNumber;
    codeProperties.$libDetail = `${className}##${functionName}##${fileName}##${lineNumber},${columnNumber}`;
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

  const result = _detector.default.parse(userAgent);

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