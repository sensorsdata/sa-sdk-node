import R from 'ramda'
import createDebug from 'debug'
import moment from 'moment'

const debug = createDebug('sa:assertions')

const KEY_PATTERN = /^((?!^distinct_id$|^original_id$|^time$|^properties$|^id$|^first_id$|^second_id$|^users$|^events$|^event$|^user_id$|^date$|^datetime$)[a-zA-Z_$][a-zA-Z\d_$]{0,99})$/

export function checkExists(value, name = 'value') {
  debug('checkExists: %s => %j', name, value)

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
  debug('checkPattern: %s', value)

  checkExists(value, name)

  if (!KEY_PATTERN.exec(value)) {
    throw new Error(`${name} is invalid`)
  }

  return value
}

export function checkDateTimeValueType(key, value) {
  const type = R.type(value)

  switch (type) {
    case 'Number':
    case 'String':
    case 'Date':
      return
    case 'Object':
      if (typeof value.toDate === 'function') {
        return
      }
      throw new Error('Invalid time object')
    default:
      throw new Error('Invalid time object')
  }
}

export function checkValueType(key) {
  debug('checkValyeType: this[%s]', key)

  const value = this[key]

  if (key === '$time') { // Bypass normal check
    checkDateTimeValueType(key, value)
    return
  }

  switch (R.type(value)) {
    case 'Number':
    case 'String':
    case 'Boolean':
    case 'Symbol':
    case 'Array':
      return
    case 'Date':
      this[key] = moment(value).format('YYYY-MM-DD HH:mm:ss.SSS');
      return
    default:
      throw new Error(`Property ${key} is invalid: ${value}`)
  }
}

export function checkValueIsNumber(key) {
  debug('checkValueIsNumber: this[%s]', key)
  const value = this[key]
  if (typeof value !== 'number') {
    throw new Error(`Property ${key} must be number: ${value}`)
  }
}

export function checkIsStringArray(value, name = 'Value') {
  debug('checkIsStringArray: %s => %j', name, value)

  if (!Array.isArray(value) || !R.all(R.is(String), value)) {
    throw new Error(`${name} must be a array of string: ${value}`)
  }
  return value
}

export function checkValueIsStringArray(key) {
  debug('checkValueIsStringArray: this[%s]', key)

  const value = this[key]
  checkIsStringArray(value, key)
}

export function checkProperties(obj, checker) {
  debug('checkProperties: %j', obj)
  R.forEach(R.bind(checker, obj), R.keys(obj))

  return obj
}
