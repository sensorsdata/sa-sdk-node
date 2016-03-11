import chai from 'chai'
import sinonChai from 'sinon-chai'
import chaiDateTime from 'chai-datetime'
import chaiAsPromised from 'chai-as-promised'

chai.should()

chai.use(sinonChai)
chai.use(chaiDateTime)
chai.use(chaiAsPromised)

global.expect = chai.expect
