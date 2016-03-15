import R from 'ramda'
import { Subject } from 'rx'
import urlUtil from 'url'
import fetch from 'node-fetch'
import zlib from 'mz/zlib'
import encodeForm from 'form-urlencoded'
import createDebug from 'debug'

const debug = createDebug('sa:Submitter')

const DEFAULT_TIMEOUT = 10000
const MODES = {
  track: { debug: false, dryRun: false },
  debug: { debug: true, dryRun: false },
  dryRun: { debug: true, dryRun: true },
}

class Submitter extends Subject {
  static composeDebugUrl(url) {
    return urlUtil.format(R.merge(urlUtil.parse(url), { pathname: '/debug' }))
  }

  constructor({ url, gzip = true, mode = 'track', timeout = DEFAULT_TIMEOUT }) {
    super()

    if (typeof arguments[0] === 'string') { // eslint-disable-line prefer-rest-params
      url = arguments[0] // eslint-disable-line no-param-reassign, prefer-rest-params
    }

    if (url == null) {
      throw new Error('Url is not provided')
    }

    if (MODES[mode] == null) {
      throw new Error(`Unknown mode: ${mode}`)
    }

    Object.assign(this, { url, gzip, timeout }, MODES[mode])

    if (this.debug) {
      this.url = Submitter.composeDebugUrl(url)
    }

    debug('Config: %o', this)
  }

  catch(callback) {
    this.subscribe(
      R.identity,
      callback,
      R.identity
    )
  }

  async onNext(data) {
    debug('onNext(%o)', data)

    if (data == null) {
      debug('Skiped due to empty data')
      return
    }

    const messages = Array.isArray(data) ? data : [data]

    if (messages.length === 0) {
      debug('Skiped due to empty batch data')
      return
    }

    try {
      await this.submit(messages)
      debug('Submit succeeded')
      super.onNext(null)
    } catch (ex) {
      debug('Submit error: %o', ex)
      this.onError(ex)
    }
  }

  async submit(messages) {
    debug('submit(%j)', messages)
    const payloadText = new Buffer(JSON.stringify(messages), 'utf8')
    const dataListBuffer = await (this.gzip ? zlib.gzip(payloadText) : payloadText)
    const body = encodeForm({
      data_list: dataListBuffer.toString('base64'),
      gzip: this.gzip ? 1 : 0,
    })

    const headers = {
      'User-Agent': 'SensorsAnalytics Node SDK',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Dry-Run': this.dryRun ? 'true' : undefined,
    }

    debug('Post to %s', this.url)
    debug('Headers: %o', headers)
    debug('Body: %o', body)

    debug('Posting...')
    const response = await fetch(this.url, { method: 'POST', headers, body, timeout: this.timeout })
    debug('Post complete')

    if (response.ok) {
      debug('Suceeded: %d', response.status)
      return
    }

    debug('Error: %s', response.status)

    if (this.debug && messages.count > 1 && response.status === 400) {
      debug('Batch mode is not supported in debug')
      throw new Error('Batch mode is not supported in Debug')
    }

    const errorMessage = await response.text()
    throw new Error(errorMessage)
  }
}

export default Submitter
