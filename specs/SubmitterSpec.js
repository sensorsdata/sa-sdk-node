import Submitter from '../src/Submitter'

describe('Submitter', () => {
  const url = 'http://sample.cloud.sensorsdata.cn:8006/sa?token=23befde23232e'

  describe('create instance', () => {
    it('should instantiate from config object', () => {
      const submitter = new Submitter({ url, gzip: false, mode: 'track', timeout: 100 })

      expect(submitter).to.have.property('url', url)
      expect(submitter).to.have.property('gzip', false)
      expect(submitter).to.have.property('timeout', 100)
      expect(submitter).to.have.property('debug', false)
      expect(submitter).to.have.property('dryRun', false)
    })

    it('should instantiate from with default value', () => {
      const submitter = new Submitter({ url })

      expect(submitter).to.have.property('url', url)
      expect(submitter).to.have.property('gzip', true)
      expect(submitter).to.have.property('timeout', 10000)
      expect(submitter).to.have.property('debug', false)
      expect(submitter).to.have.property('dryRun', false)
    })

    describe('set mode', () => {
      it('should handle track mode', () => {
        const submitter = new Submitter({ url, mode: 'track' })
        expect(submitter).to.have.property('debug', false)
        expect(submitter).to.have.property('dryRun', false)
      })

      it('should handle debug mode', () => {
        const submitter = new Submitter({ url, mode: 'debug' })
        expect(submitter).to.have.property('debug', true)
        expect(submitter).to.have.property('dryRun', false)
      })

      it('should handle dry-run mode', () => {
        const submitter = new Submitter({ url, mode: 'dryRun' })
        expect(submitter).to.have.property('debug', true)
        expect(submitter).to.have.property('dryRun', true)
      })

      it('should yield error if unknown mode', () => {
        expect(() => new Submitter({ url, mode: 'bad-mode' })).to.throw(/Unknown mode/)
      })
    })

    it('should instantiate from string', () => {
      const submitter = new Submitter(url)

      expect(submitter).to.have.property('url', url)
      expect(submitter).to.have.property('gzip', true)
      expect(submitter).to.have.property('timeout', 10000)
      expect(submitter).to.have.property('debug', false)
      expect(submitter).to.have.property('dryRun', false)
    })

    it('should complain if url is not provided', () => {
      expect(() => new Submitter({ gzip: false, mode: 'track', timeout: 100 })).to.throw(/url/i)
    })

    it('should complain if nothing provided', () => {
      expect(() => new Submitter()).to.throw()
    })
  })
})
