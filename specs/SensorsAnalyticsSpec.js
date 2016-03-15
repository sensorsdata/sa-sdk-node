import SensorsAnalytics from '../src/SensorsAnalytics'

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
})
