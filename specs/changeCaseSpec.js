import { pascal2Snake, translateKeys } from '../src/changeCase'

describe('changeCase', () => {
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

    it('should convert to snake case', () => {
      const translated = translateKeys(pascal2Snake, { $time: 'time', $superMan: 'clark', man: 1, manPower: 100 })

      expect(translated).to.deep.equal({ $time: 'time', $super_man: 'clark', man: 1, man_power: 100 })
    })
  })
})
