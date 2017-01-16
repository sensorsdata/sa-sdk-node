import R from 'ramda'
import { Subject } from 'rx'

import {
  pascal2Snake,
  snakenizeKeys,
  extractTimestamp,
  extractCodeProperties,
  translateUserAgent,
} from './translators'
import { version as PACKAGE_VERSION } from './readPackageInfo'
import {
  checkExists,
  checkPattern,
  checkIsStringArray,
  checkProperties,
  checkValueType,
  checkValueIsNumber,
  checkValueIsStringArray,
} from './assertions'
import Submitter from './Submitter'
import LoggingConsumer from './LoggingConsumer'

import createDebug from 'debug'
const debug = createDebug('sa:SensorsAnalytics')

const SDK_PROPERTIES = {
  $lib: 'Node',
  $libVersion: PACKAGE_VERSION,
}

class SensorsAnalytics extends Subject {
  constructor() {
    super()
    this.logger = null
    this.loggingConsumer = false;
    this.enableReNameOption()
    this.clearSuperProperties()
  }

  disableLoggingConsumer() {
    this.loggingConsumer = false
  }

  enableLoggingConsumer() {
    this.loggingConsumer = true
  }

  registerSuperProperties(values = {}) {
    debug('registerSuperProperties(%j)', values)
    checkProperties(values, checkPattern)
    checkProperties(values, checkValueType)

    return Object.assign(this.superProperties, values)
  }

  clearSuperProperties() {
    debug('clearSuperProperties()')

    this.superProperties = {}

    return this.superProperties
  }

  disableReNameOption() {
    debug('resetReNameOption()')

    this.allowReNameOption = false

    return this.allowReNameOption
  }

  enableReNameOption() {
    debug('resetReNameOption()')

    this.allowReNameOption = true

    return this.allowReNameOption
  }

  superizeProperties(properties = {}, callIndex) {
    // 合并公共属性
    const codeProperties = extractCodeProperties(callIndex)
    return {
      properties: R.mergeAll([this.superProperties, translateUserAgent(properties)]),
      lib: snakenizeKeys(R.mergeAll([SDK_PROPERTIES, codeProperties, {'$app_version': this.superProperties.$app_version || this.superProperties.$appVersion || properties.$app_version || properties.$appVersion}]))
    }
  }

  track(distinctId, event, eventProperties) {
    debug('track(%j)', { distinctId, event, eventProperties })

    checkExists(distinctId, 'distinctId')
    checkPattern(event, 'event')
    checkProperties(eventProperties, checkValueType)

    const superize = this.superizeProperties(eventProperties, 4)

    this.internalTrack('track', { event, distinctId, properties: R.mergeAll([snakenizeKeys(SDK_PROPERTIES), superize.properties]),lib: superize.lib})
  }

  trackSignup(distinctId, originalId, eventProperties) {
    debug('trackSignup(%j)', { distinctId, originalId, eventProperties })

    checkExists(distinctId, 'distinctId')
    checkExists(originalId, 'originalId')
    checkProperties(eventProperties, checkValueType)

    const superize = this.superizeProperties(eventProperties, 4)

    this.internalTrack('track_signup', { event: '$SignUp', distinctId, originalId, properties: R.mergeAll([snakenizeKeys(SDK_PROPERTIES), superize.properties]) ,lib: superize.lib })
  }

  profileSet(distinctId, properties) {
    debug('profileSet(%j)', { distinctId, properties })

    checkExists(distinctId, 'distinctId')
    checkProperties(properties, checkValueType)

    const superize = this.superizeProperties(properties, 4)

    if (superize.properties.hasOwnProperty('$app_version')) {
      delete superize.properties.$app_version
    }

    if (superize.properties.hasOwnProperty('$appVersion')) {
      delete superize.properties.$appVersion
    }

    this.internalTrack('profile_set', { distinctId, properties: superize.properties, lib: superize.lib })
  }

  profileSetOnce(distinctId, properties) {
    debug('profileSetOnce(%j)', { distinctId, properties })

    checkExists(distinctId, 'distinctId')
    checkProperties(properties, checkValueType)

    const superize = this.superizeProperties(properties, 4)

    if (superize.properties.hasOwnProperty('$app_version')) {
      delete superize.properties.$app_version
    }

    if (superize.properties.hasOwnProperty('$appVersion')) {
      delete superize.properties.$appVersion
    }

    this.internalTrack('profile_set_once', { distinctId, properties: superize.properties, lib: superize.lib })
  }

  profileIncrement(distinctId, properties) {
    debug('profileIncrement(%j)', { distinctId, properties })

    checkExists(distinctId, 'distinctId')
    checkProperties(properties, checkValueIsNumber)

    this.internalTrack('profile_increment', { distinctId, properties })
  }

  profileAppend(distinctId, properties) {
    debug('profileAppend(%j)', { distinctId, properties })

    checkExists(distinctId, 'distinctId')
    checkProperties(properties, checkValueIsStringArray)

    this.internalTrack('profile_append', { distinctId, properties })
  }

  profileUnset(distinctId, keys = []) {
    debug('profileUnset(%j)', { distinctId, keys })

    checkExists(distinctId, 'distinctId')
    checkIsStringArray(keys, 'Keys')

    const properties = R.zipObj(keys, R.repeat(true, keys.length))

    this.internalTrack('profile_unset', { distinctId, properties })
  }

  internalTrack(type, { event, distinctId, originalId, properties, lib }) {

    if (this.allowReNameOption) {
      properties = snakenizeKeys(properties)
      event = pascal2Snake(event)
    }
    const envelope = snakenizeKeys({
      type,
      event,
      time: extractTimestamp(properties),
      distinctId,
      originalId,
      properties: checkProperties(properties, checkPattern),
      lib
    })

    debug('envelope: %j', envelope)

    if (this.loggingConsumer) {
      this.logger.send(envelope)
    } else {
      this.onNext(envelope)
    }
  }

  inBatch({ count, timeSpan }) {
    const mode = `${count != null ? 'count' : ''}${timeSpan != null ? 'time' : ''}`

    debug('inBatch(%j)', { count, timeSpan, mode })

    switch (mode) {
      case 'count':
        return this.bufferWithCount(count).filter((events) => events.length > 0)
      case 'counttime':
        return this.bufferWithTimeOrCount(timeSpan, count).filter((events) => events.length > 0)
      case 'time':
        return this.bufferWithTime(timeSpan).filter((events) => events.length > 0)
      default:
        return this
    }
  }

  submitTo(options, batchOptions = {}) {
    debug('submitTo(%j, %j)', options, batchOptions)

    const observable = this.inBatch(batchOptions)
    const submitter = new Submitter(options)

    observable.subscribe(submitter)

    return submitter
  }

  initLoggingConsumer(path) {
    this.enableLoggingConsumer();
    this.logger = new LoggingConsumer(path);
  }

  close() {
    this.onCompleted()
    this.logger.close()
  }
}

export default SensorsAnalytics
