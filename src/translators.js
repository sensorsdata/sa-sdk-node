import R from 'ramda'
import createDebug from 'debug'

const debug = createDebug('sa:translators')

const UPPER_CASE_LETTER = /([A-Z])/g

export function pascal2Snake(text) {
  if (text == null) {
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

//   at /home/gbusey/file.js:525:2
//   at Frobnicator.refrobulate (/home/gbusey/business-logic.js:424:21)
//   at Actor.<anonymous> (/home/gbusey/actors.js:400:8)
//   at increaseSynergy (/home/gbusey/actors.js:701:6)
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
