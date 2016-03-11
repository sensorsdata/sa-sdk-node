import R from 'ramda'
import { pascal2Snake, translateKeys, translateTimeStamp } from './translators'
import { version as PACKAGE_VERSION } from './readPackageVersion'

const snakenizeKeys = translateKeys(pascal2Snake)

class SensorsAnalytics {
  constructor(consumer) {
    this.consumer = consumer
    this.clearSuperProperties()
  }

  registerSuperProperties(values = {}) {
    return Object.assign(this.superProperties, values)
  }

  clearSuperProperties() {
    this.superProperties = {
      $lib: 'Node',
      $libVersion: PACKAGE_VERSION,
    }

    return this.superProperties
  }

  superizeProperties(properties = {}) {
    return R.merge(this.superProperties, properties)
  }

  track(distinctId, event, eventProperties) {
    const properties = this.superizeProperties(eventProperties)

    this.internalTrack('track', { event, distinctId, properties })
  }

  trackSignup(distinctId, originalId, eventProperties) {
    const properties = this.superizeProperties(eventProperties)

    this.internalTrack('track_signup', { event: '$SignUp', distinctId, originalId, properties })
  }

  profileSet(distinctId, properties) {
    this.internalTrack('profile_set', { distinctId, properties })
  }

  profileSetOnce(distinctId, properties) {
    this.internalTrack('profile_set_once', { distinctId, properties })
  }

  profileIncrement(distinctId, properties) {
    this.internalTrack('profile_increment', { distinctId, properties })
  }

  profileAppend(distinctId, properties) {
    this.internalTrack('profile_append', { distinctId, properties })
  }

  profileUnset(distinctId, keys = []) {
    const properties = R.zipObj(keys, R.repeat(true, keys.length))

    this.internalTrack('profile_unset', { distinctId, properties })
  }

  internalTrack(type, { event, distinctId, originalId, properties }) {
    const time = translateTimeStamp(properties.$time)

    const envelope = snakenizeKeys({
      type,
      event,
      time,
      distinctId,
      originalId,
      properties: snakenizeKeys(properties),
    })

    this.consumer.send(envelope)
  }
}

export default SensorsAnalytics
