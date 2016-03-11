import { Observer } from 'rx'
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

class Submitter extends Observer {
  constructor(url, { gzip = true, mode = 'track', timeout = DEFAULT_TIMEOUT } = {}) {
    Object.assign(this, { url, gzip, timeout }, MODES[mode])
  }

  onNext(data) {
    if (Array.isArray(data)) {
      this.submit(data)
    } else {
      this.submit([data])
    }
  }

  onError(err) {
    debug('Error: %o', err)
    throw err
  }

  onCompleted() {
    debug('Completed')
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

    return await fetch(actualUrl, { method: 'POST', headers, body, timeout: this.timeout })
  }
}

export default Submitter
