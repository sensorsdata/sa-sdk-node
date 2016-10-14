import {
  pascal2Snake,
  translateKeys,
  translateTimeStamp,
  extractTimestamp,
  parseCallInfo,
  extractCodeProperties,
  parseUserAgent,
  translateUserAgent,
} from '../src/translators'

describe('translators', () => {
  describe('keys', () => {
    describe('pascal2Snake', () => {
      it('should convert pascal case to snake case', () => {
        expect(pascal2Snake('super')).to.equal('super')

        expect(pascal2Snake('superMan')).to.equal('super_man')

        expect(pascal2Snake('superManIsSoCool')).to.equal('super_man_is_so_cool')
      })

      it('should support $ prefixed text', () => {
        expect(pascal2Snake('$date')).to.equal('$date')
        expect(pascal2Snake('$dateTime')).to.equal('$date_time')
      })

      it('should support null value', () => {
        expect(pascal2Snake(null)).to.be.null
        expect(pascal2Snake(undefined)).to.be.undefined
      })

      it('should not escape $SignUp', async () => {
        expect(pascal2Snake('$SignUp')).to.equal('$SignUp')
      })
    })

    describe('translateKeys', () => {
      it('should convert keys', () => {
        const translated = translateKeys((key) => key.toUpperCase(), { a: 1, b: 2, c: 3 })

        expect(translated).to.deep.equal({ A: 1, B: 2, C: 3 })
      })

      it('should support empty object', () => {
        const translated = translateKeys((key) => key.toUpperCase(), {})

        expect(translated).to.deep.equal({})
      })

      it('should support nonString object', () => {
        const translated = translateKeys((key) => key.toUpperCase(), { 1: 1, 2: 2 })

        expect(translated).to.deep.equal({ 1: 1, 2: 2 })
      })

      it('should support curry', () => {
        const translator = translateKeys((key) => key.toUpperCase())

        expect(translator({ a: 1, b: 2, c: 3 })).to.deep.equal({ A: 1, B: 2, C: 3 })
      })

      it('should convert to snake case', () => {
        const translated = translateKeys(pascal2Snake, { $time: 'time', $superMan: 'clark', man: 1, manPower: 100 })

        expect(translated).to.deep.equal({ $time: 'time', $super_man: 'clark', man: 1, man_power: 100 })
      })

      it('should support null and undefined', () => {
        expect(translateKeys((key) => key.toUpperCase(), null)).to.be.null
        expect(translateKeys((key) => key.toUpperCase(), undefined)).to.be.undefined
      })
    })
  })

  describe('timestamp', () => {
    it('extract timestamp', () => {
      const properties = { $time: '2016-07-29T00:00:00+08:00' }
      const timestamp = extractTimestamp(properties)

      expect(timestamp).to.equal(1469721600000)
      expect(properties).not.to.have.property('$time')
    })

    describe('translateTimeStamp', () => {
      it('should convert date', () => {
        const timestamp = translateTimeStamp(new Date('2015-01-28T00:00:00+08:00'))
        expect(timestamp).to.equal(1422374400000)
      })

      it('should support moment like object', () => {
        const timestamp = translateTimeStamp({ toDate() { return new Date('2015-01-28T00:00:00+08:00') } })
        expect(timestamp).to.equal(1422374400000)
      })

      it('should support direct number', () => {
        const timestamp = translateTimeStamp(1422374400000)
        expect(timestamp).to.equal(1422374400000)
      })

      it('should support string', () => {
        const timestamp = translateTimeStamp('2015-01-28T00:00:00+08:00')
        expect(timestamp).to.equal(1422374400000)
      })

      it('should handle null and undefined', () => {
        const timestamp = translateTimeStamp(null)
        expect(timestamp).to.be.a('number')
      })
    })
  })

  describe('code properties', () => {
    it('should extract code properties', () => {
      const properties = extractCodeProperties(2)

      expect(properties).to.have.property('$libMethod', 'code')
      expect(properties).to.have.property('$libDetail').that.match(/Context##(it|<anonymous>)##[\s\S/]*translatorsSpec\.js##\d+,\d+/)
    })

    describe('parseCallInfo', () => {
      it('should parse anonymous call', () => {
        const callInfo = parseCallInfo('   at /Users/timnew/Workspace/apricot_forest/sa-sdk-node/test.js:23:2')

        expect(callInfo).to.have.property('fileName', '/Users/timnew/Workspace/apricot_forest/sa-sdk-node/test.js')
        expect(callInfo).to.have.property('lineNumber', '23')
        expect(callInfo).to.have.property('columnNumber', '2')
        expect(callInfo).to.have.property('className').that.is.undefined
        expect(callInfo).to.have.property('functionName').that.is.undefined
      })

      it('should parse function call', () => {
        const callInfo = parseCallInfo('    at extractCodeProperties (translators.js:78:22)')

        expect(callInfo).to.have.property('fileName', 'translators.js')
        expect(callInfo).to.have.property('lineNumber', '78')
        expect(callInfo).to.have.property('columnNumber', '22')
        expect(callInfo).to.have.property('functionName', 'extractCodeProperties')
        expect(callInfo).to.have.property('className').that.is.undefined
      })

      it('should parse named method call', () => {
        const callInfo = parseCallInfo('    at SensorsAnalytics.superizeProperties (SensorsAnalytics.js:56:28)')

        expect(callInfo).to.have.property('fileName', 'SensorsAnalytics.js')
        expect(callInfo).to.have.property('lineNumber', '56')
        expect(callInfo).to.have.property('columnNumber', '28')
        expect(callInfo).to.have.property('functionName', 'superizeProperties')
        expect(callInfo).to.have.property('className', 'SensorsAnalytics')
      })

      it('should parse anonymouse method call', () => {
        const callInfo = parseCallInfo('     at Context.<anonymous> (SensorsAnalyticsSpec.js:17:8)')

        expect(callInfo).to.have.property('fileName', 'SensorsAnalyticsSpec.js')
        expect(callInfo).to.have.property('lineNumber', '17')
        expect(callInfo).to.have.property('columnNumber', '8')
        expect(callInfo).to.have.property('functionName', '<anonymous>')
        expect(callInfo).to.have.property('className', 'Context')
      })

      it('should parse native call', () => {
        const callInfo = parseCallInfo('    at undefined.next (native)')

        expect(callInfo).to.have.property('fileName', 'native')
        expect(callInfo).to.have.property('lineNumber').that.is.undefined
        expect(callInfo).to.have.property('columnNumber').that.is.undefined
        expect(callInfo).to.have.property('functionName', 'next')
        expect(callInfo).to.have.property('className', 'undefined')
      })
    })
  })

  describe('', () => {
    it('should translate user agent', () => {
      const properties = {
        value: 100,
        $userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2783.5 Safari/537.36',
      }

      const translatedProps = translateUserAgent(properties)

      expect(translatedProps).to.have.property('$os', 'macosx')
      expect(translatedProps).to.have.property('$model', 'mac')
      expect(translatedProps).to.have.property('_browser_engine', 'webkit')
      expect(translatedProps).to.have.property('$os_version', '10.11')
      expect(translatedProps).to.have.property('$browser', 'chrome')
      expect(translatedProps).to.have.property('$browser_version', '53')

      expect(translatedProps).to.have.property('value', 100)
      expect(translatedProps).to.not.have.property('$userAgent')
    })

    describe('parseUserAgent', () => {
      it('should parse Desktop', () => {
        const userAgentInfo = parseUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2783.5 Safari/537.36')

        expect(userAgentInfo).to.have.property('$os', 'macosx')
        expect(userAgentInfo).to.have.property('$model', 'mac')
        expect(userAgentInfo).to.have.property('_browser_engine', 'webkit')
        expect(userAgentInfo).to.have.property('$os_version', '10.11')
        expect(userAgentInfo).to.have.property('$browser', 'chrome')
        expect(userAgentInfo).to.have.property('$browser_version', '53')
      })

      it('should parse iOS', () => {
        const userAgentInfo = parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')

        expect(userAgentInfo).to.have.property('$os', 'iPhone OS')
        expect(userAgentInfo).to.have.property('$model', 'iphone')
        expect(userAgentInfo).to.have.property('_browser_engine', 'webkit')
        expect(userAgentInfo).to.have.property('$os_version', '9.1')
        expect(userAgentInfo).to.have.property('$browser', 'safari')
        expect(userAgentInfo).to.have.property('$browser_version', '9')
      })


      it('should parse iPad', () => {
        const userAgentInfo = parseUserAgent('Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')

        expect(userAgentInfo).to.have.property('$os', 'iPhone OS')
        expect(userAgentInfo).to.have.property('$model', 'ipad')
        expect(userAgentInfo).to.have.property('_browser_engine', 'webkit')
        expect(userAgentInfo).to.have.property('$os_version', '9.1')
        expect(userAgentInfo).to.have.property('$browser', 'safari')
        expect(userAgentInfo).to.have.property('$browser_version', '9')
      })

      it('should parse Android', () => {
        const userAgentInfo = parseUserAgent('Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36')

        expect(userAgentInfo).to.have.property('$os', 'Android')
        expect(userAgentInfo).to.have.property('$model', 'samsung')
        expect(userAgentInfo).to.have.property('_browser_engine', 'webkit')
        expect(userAgentInfo).to.have.property('$os_version', '5')
        expect(userAgentInfo).to.have.property('$browser', 'chrome')
        expect(userAgentInfo).to.have.property('$browser_version', '48')
      })
    })
  })
})
