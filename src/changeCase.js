import R from 'ramda'

const UPPER_CASE_LETTER = /([A-Z])/g

export function pascal2Snake(text) {
  return text.replace(UPPER_CASE_LETTER, (match, letter) => `_${letter.toLowerCase()}`)
}

export const translateKeys = R.curry((translator, object) =>
  R.reduce((result, key) => {
    result[translator(key) || key] = object[key]

    return result
  }, {}, R.keys(object)))
