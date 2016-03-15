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
