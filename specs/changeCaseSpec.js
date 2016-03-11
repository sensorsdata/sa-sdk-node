import { pascal2Snake } from '../src/changeCase'

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
})
