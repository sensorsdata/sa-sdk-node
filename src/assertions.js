import R from 'ramda'

const KEY_PATTERN = /^((?!^distinct_id$|^original_id$|^time$|^properties$|^id$|^first_id$|^second_id$|^users$|^events$|^event$|^user_id$|^date$|^datetime$)[a-zA-Z_$][a-zA-Z\d_$]{0,99})$/

export function checkExists(value, name = 'value') {
  if (typeof(value) !== 'string') {
    throw new Error(`${name} must be a string`)
  }

  if (value.length === 0) {
    throw new Error(`${name} is empty`)
  }

  if (value.length > 255) {
    throw new Error(`${name} is too long`)
  }

  return value
}

export function checkPattern(value, name = 'value') {
  checkExists(value, name)

  if (!KEY_PATTERN.exec(value)) {
    throw new Error(`${name} is invalid`)
  }

  return value
}

export function checkValueType(key) {
  const value = this[key]
  switch (R.type(value)) {
    case 'Number':
    case 'String':
    case 'Boolean':
    case 'Symbol':
    case 'Array':
      return
    default:
      throw new Error(`Property ${key} is invalid: ${value}`)
  }
}

export function checkValueIsNumber(key) {
  const value = this[key]
  if (typeof value !== 'number') {
    throw new Error(`Property ${key} must be number: ${value}`)
  }
}

export function checkIsStringArray(value, name = 'Value') {
  if (!Array.isArray(value) || !R.all(R.is(String), value)) {
    throw new Error(`${name} must be a array of string: ${value}`)
  }
  return value
}

export function checkValueIsStringArray(key) {
  const value = this[key]
  checkIsStringArray(value)
}

export function checkProperties(obj, checker) {
  R.forEach(R.bind(checker, obj), R.keys(obj))

  return obj
}
