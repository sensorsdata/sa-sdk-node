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
  constructor(url, { gzip = true, mode = 'track', timeout = DEFAULT_TIMEOUT } = {}) {
    Object.assign(this, { url, gzip, timeout }, MODES[mode])

    debug('Config: %o', this)
  }

  async onNext(data) {
    debug('onNext(%o)', data)

    const messages = Array.isArray(data) ? data : [data]

    try {
      await this.submit(messages)
    } catch (ex) {
      debug('Error: %o', ex)
      this.onError(ex)
    }
  }

  async submit(messages) {
    const payloadText = new Buffer(JSON.stringify(messages), 'utf8')
    const dataListBuffer = await (this.gzip ? zlib.gzip(payloadText) : payloadText)
    const body = encodeForm({
      data_list: dataListBuffer.toString('base64'),
      gzip: this.gzip ? 1 : 0,
    })

    const headers = {
      'User-Agent': 'SensorsAnalytics Node SDK',
      'Dry-Run': this.dryRun ? 'true' : undefined,
    }

    const actualUrl = this.debug ? urlUtil.resolve(this.url, '/debug') : this.url

    debug('Post to %s', actualUrl)
    debug('Headers: %o', headers)
    debug('Body: %o', body)

    const response = await fetch(actualUrl, { method: 'POST', headers, body, timeout: this.timeout })

    if (response.ok) {
      debug('Suceeded')
      return
    }

    debug('Error: %s', response.status)

    const errorMessage = await response.text()
    throw new Error(errorMessage)
  }
}

export default Submitter
