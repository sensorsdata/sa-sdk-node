import R from 'ramda'
import detector from 'detector'

import createDebug from 'debug'
const debug = createDebug('sa:translators')

const UPPER_CASE_LETTER = /([A-Z])/g

export function pascal2Snake(text) {
  var reg = new RegExp('^[A-Z_]+$')
  if (text == null || text === '$SignUp' || reg.test(text) ) {
    return text
  }
  return text.replace(UPPER_CASE_LETTER, (match, letter) => `_${letter.toLowerCase()}`)
}
export const translateKeys = R.curry((translator, object) => {
  if (object == null) {
    return object
  }

  return R.reduce((result, key) => {
    result[translator(key) || key] = object[key]

    return result
  }, {}, R.keys(object))
})

export const snakenizeKeys = translateKeys(pascal2Snake)

export function translateTimeStamp(timestamp) {
  if (timestamp == null) {
    return Date.now()
  }

  if (typeof timestamp === 'number') {
    return timestamp
  }

  if (typeof timestamp === 'string') {
    return Date.parse(timestamp)
  }

  if (timestamp instanceof Date) {
    return timestamp.valueOf()
  }

  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().valueOf() // Support moment.js
  }

  throw new Error('Invalid timestamp')
}
export function extractTimestamp(properties) {
  const time = translateTimeStamp(properties.$time)
  delete properties.$time // Remove the key if exists
  return time
}

const CALL_INFO_REGEX = /^\s*at ((((\w+)\.)?(\w+|<anonymous>) \(((.+):(\d+):(\d+)|(native))\))|(.+):(\d+):(\d+))$/
export function parseCallInfo(text) {
  debug('parseCallInfo: %s', text)

  const matches = CALL_INFO_REGEX.exec(text)

  if (matches == null) {
    return null
  }

  return {
    fileName: matches[7] || matches[10] || matches[11],
    lineNumber: matches[8] || matches[12],
    columnNumber: matches[9] || matches[13],
    className: matches[4],
    functionName: matches[5],
  }
}
export function extractCodeProperties(callerIndex) {
  const codeProperties = {
    $libMethod: 'code',
  }

  const callerInfo = new Error()
  const stack = callerInfo.stack.split('\n', callerIndex + 1)
  debug('extractCodeProperties: %j', stack)

  const callInfo = parseCallInfo(stack[callerIndex])

  if (callInfo != null) {
    debug('Call info: %j', callInfo)
    const { className, functionName, fileName, lineNumber, columnNumber } = callInfo
    codeProperties.$libDetail = `${className}##${functionName}##${fileName}##${lineNumber},${columnNumber}`
  } else {
    debug('Call info not parsed')
  }

  return codeProperties
}

function patchOSName(os) {
  switch (os.name) {
    case 'ios':
      os.name = 'iPhone OS'
      break
    case 'android':
      os.name = 'Android'
      break
    default:
      break
  }
}
export function parseUserAgent(userAgent) {
  if (userAgent == null) {
    return undefined
  }

  const result = detector.parse(userAgent)
  patchOSName(result.os)

  return {
    $os: result.os.name,
    $model: result.device.name,
    _browser_engine: result.engine.name,
    $os_version: String(result.os.version),
    $browser: result.browser.name,
    $browser_version: String(result.browser.version),
  }
}
export function translateUserAgent(properties) {
  const { $userAgent } = properties

  if ($userAgent == null) {
    return properties
  }

  delete properties.$userAgent

  const userAgentInfo = parseUserAgent($userAgent)

  return Object.assign(userAgentInfo, properties)
}
