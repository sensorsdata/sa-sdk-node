import SensorsAnalytics from '../src'

describe('Smoking', () => {
  const SA_URL = process.env.SA_URL

  let sa = null
  let submitter = null

  before(() => {
    if (SA_URL == null) {
      throw Error('Env var SA_URL is not set')
    }
  })

  beforeEach(() => {
    sa = new SensorsAnalytics()
    submitter = sa.submitTo(SA_URL, { mode: 'debug' })
  })

  it('should submit data', (done) => {
    sa.track('timnew', 'super', { name: '文亮' })

    submitter.subscribe(done, console.log.bind(console), console.log.bind(console))
  })
})
