const UPPER_CASE_LETTER = /([A-Z])/g

export function pascal2Snake(text) {
  return text.replace(UPPER_CASE_LETTER, (match, letter) => `_${letter.toLowerCase()}`)
}
