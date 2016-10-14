import SensorsAnalytics from '../src/SensorsAnalytics'
import moment from 'moment'

const TIME_DELTA = 500

describe('SensorsAnalytics', () => {
  const distinctId = 'user-id'

  let sa = null

  beforeEach(() => {
    sa = new SensorsAnalytics()
  })

  it('should compose event', async () => {
    const monitor = monitorRx(sa)

    sa.track(distinctId, 'a')
    sa.track(distinctId, 'b')
    sa.track(distinctId, 'c')
    sa.track(distinctId, 'd')

    monitor.complete()

    await expect(monitor.pluckValues('event')).to.eventually.have.members(['a', 'b', 'c', 'd'])
  })

  it('should snakenizeKeys property name by default', async () => {
    const monitor = monitorRx(sa);

    expect(sa.allowReNameOption).to.equal(true)
    sa.track(distinctId, 'a', {
      '$appVersion': '1.0.8'
    })
    sa.registerSuperProperties({
      '$appVersion': '1.0.8'
    })
    sa.profileSet(distinctId, {
      'test': 'test'
    })
    monitor.complete(sa)

    const values = await monitor.values()
    console.log(values)

    expect(values[0].lib).to.have.property('$app_version', '1.0.8')
    expect(values[0].properties).to.have.property('$app_version', '1.0.8')

    expect(values[1].lib).to.have.property('$app_version', '1.0.8')
    expect(values[1].properties.hasOwnProperty('$app_version')).to.be.false
    sa.disableReNameOption()
    expect(sa.allowReNameOption).to.equal(false)
  })

  it('should batch compose event', async () => {
    const monitor = monitorRx(sa.inBatch({ count: 2, timeSpan: 5000 }))

    sa.track(distinctId, 'a')
    sa.track(distinctId, 'a')

    sa.track(distinctId, 'b')
    sa.track(distinctId, 'b')

    sa.track(distinctId, 'c')

    monitor.complete(sa)

    const values = await monitor.values()

    expect(values[0]).to.have.length(2)
    expect(values[1]).to.have.length(2)
    expect(values[2]).to.have.length(1)
  })

  it('should flush data in batch when close', async () => {
    const monitor = monitorRx(sa.inBatch({ count: 100 }))

    sa.track(distinctId, 'a')
    sa.track(distinctId, 'b')
    sa.track(distinctId, 'c')

    sa.close()

    const notifications = await monitor.toNotifications()
    const values = notifications[0].value.map((v) => v.event)
    expect(values).to.deep.equal(['a', 'b', 'c'])
  })

  describe('Override event time', () => {
    let monitor

    const event = 'testEvent'

    beforeEach(() => {
      monitor = monitorRx(sa)
    })

    it('should generate tiem automatically', async () => {
      const now = Date.now()
      sa.track(distinctId, event)
      sa.close()

      const message = await monitor.firstValue()
      expect(message.time).to.be.closeTo(now, TIME_DELTA)
    })

    it('should able to use number as $time', async () => {
      sa.track(distinctId, event, { $time: 1469808000000 })

      sa.close()

      const message = await monitor.firstValue()

      expect(message.time).to.equal(1469808000000)
    })

    it('should able to use string as $time', async () => {
      sa.track(distinctId, event, { $time: '2016-07-30T00:00:00+08:00' })

      sa.close()

      const message = await monitor.firstValue()

      expect(message.time).to.equal(1469808000000)
    })

    it('should able to use Date as $time', async () => {
      sa.track(distinctId, event, { $time: new Date('2016-07-30T00:00:00+08:00') })

      sa.close()

      const message = await monitor.firstValue()

      expect(message.time).to.equal(1469808000000)
    })

    it('should able to use moment as $time', async () => {
      sa.track(distinctId, event, { $time: moment('2016-07-30T00:00:00+08:00') })

      sa.close()

      const message = await monitor.firstValue()

      expect(message.time).to.equal(1469808000000)
    })

    it('should yield if $time is invalid type', async () => {
      expect(() =>
        sa.track(distinctId, event, { $time: { type: 'invalid date type' } })
      ).to.throw(Error, /Invalid time object/)
    })
  })
})
