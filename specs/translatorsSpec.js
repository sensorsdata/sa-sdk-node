import { pascal2Snake, translateKeys, translateTimeStamp, parseCallInfo } from '../src/translators'

describe('translators', () => {
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

  describe('parseCallInfo', () => {
    it('should parse anonymous call', () => {
      const callInfo = parseCallInfo('   at /home/gbusey/file.js:525:2')

      expect(callInfo).to.have.property('fileName', '/home/gbusey/file.js')
      expect(callInfo).to.have.property('lineNumber', '525')
      expect(callInfo).to.have.property('columnNumber', '2')
      expect(callInfo).to.have.property('className').that.is.undefined
      expect(callInfo).to.have.property('functionName').that.is.undefined
    })

    it('should parse function call', () => {
      const callInfo = parseCallInfo('   at increaseSynergy (/home/gbusey/actors.js:701:6)')

      expect(callInfo).to.have.property('fileName', '/home/gbusey/actors.js')
      expect(callInfo).to.have.property('lineNumber', '701')
      expect(callInfo).to.have.property('columnNumber', '6')
      expect(callInfo).to.have.property('functionName', 'increaseSynergy')
      expect(callInfo).to.have.property('className').that.is.undefined
    })

    it('should parse named method call', () => {
      const callInfo = parseCallInfo('   at Frobnicator.refrobulate (/home/gbusey/business-logic.js:424:21)')

      expect(callInfo).to.have.property('fileName', '/home/gbusey/business-logic.js')
      expect(callInfo).to.have.property('lineNumber', '424')
      expect(callInfo).to.have.property('columnNumber', '21')
      expect(callInfo).to.have.property('functionName', 'refrobulate')
      expect(callInfo).to.have.property('className', 'Frobnicator')
    })

    it('should parse anonymouse method call', () => {
      const callInfo = parseCallInfo('   at Actor.<anonymous> (/home/gbusey/actors.js:400:8)')

      expect(callInfo).to.have.property('fileName', '/home/gbusey/actors.js')
      expect(callInfo).to.have.property('lineNumber', '400')
      expect(callInfo).to.have.property('columnNumber', '8')
      expect(callInfo).to.have.property('functionName', '<anonymous>')
      expect(callInfo).to.have.property('className', 'Actor')
    })
  })
})
