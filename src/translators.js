import R from 'ramda'

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
const CALL_INFO_REGEX = /^ {3}at ((((\w+)\.)?(\w+|<anonymous>) \((.+):(\d+):(\d+)\))|(.+):(\d+):(\d+))$/

export function parseCallInfo(text) {
  const matches = CALL_INFO_REGEX.exec(text)

  return {
    fileName: matches[6] || matches[9],
    lineNumber: matches[7] || matches[10],
    columnNumber: matches[8] || matches[11],
    className: matches[4],
    functionName: matches[5],
  }
}
