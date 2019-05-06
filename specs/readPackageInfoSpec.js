import * as packageInfo from '../src/readPackageInfo'

describe('readPackageInfo', () => {
  it('should read version', () => {
    expect(packageInfo.version).to.be.a('string').and.match(/^\d+\.\d+\.\d+$/)
  })
})
