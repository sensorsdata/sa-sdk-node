import R from 'ramda'
import { pascal2Snake, translateKeys, translateTimeStamp } from './translators'

const convertToEnvelope = translateKeys(pascal2Snake)

class SensorsAnalytics {
  constructor(consumer) {
    this.consumer = consumer
  }

  track(distinctId, event, properties = {}) {
    this.internalTrack({ type: 'track', event, distinctId, properties })
  }

  trackSignup(distinctId, originalId, properties = {}) {
    this.internalTrack({ type: 'track_signup', event: '$SignUp', distinctId, originalId, properties })
  }

  profileSet(distinctId, properties) {
    this.internalTrack({ type: 'profile_set', distinctId, originalId: distinctId, properties })
  }

  profileSetOnce(distinctId, properties) {
    this.internalTrack({ type: 'profile_set_once', distinctId, originalId: distinctId, properties })
  }

  profileIncrement(distinctId, properties) {
    this.internalTrack({ type: 'profile_increment', distinctId, originalId: distinctId, properties })
  }

  profileAppend(distinctId, properties) {
    this.internalTrack({ type: 'profile_append', distinctId, originalId: distinctId, properties })
  }

  profileUnset(distinctId, keys = []) {
    const properties = R.reduce((result, key) => {
      result[key] = true
      return result
    }, {}, keys)

    this.internalTrack({ type: 'profile_unset', distinctId, originalId: distinctId, properties })
  }

  internalTrack({ type, event, distinctId, originalId, properties }) {
    const time = translateTimeStamp(properties.$time)

    const envelope = convertToEnvelope({
      type,
      event,
      time,
      distinctId,
      originalId,
      properties,
    })

    this.consumer.send(envelope)
  }
}

export default SensorsAnalytics
