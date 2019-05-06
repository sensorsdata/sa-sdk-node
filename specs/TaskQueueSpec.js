import Promise from 'bluebird'
import TaskQueue from '../src/TaskQueue'

describe('TaskQueue', () => {
  describe('Queue data management', () => {
    it('should enqueue and dequeue', () => {
      const queue = new TaskQueue({})

      expect(queue.head).to.null
      expect(queue.tail).to.null

      expect(queue.hasData).to.be.false

      queue.enqueue('a')

      expect(queue.head.data).to.equal('a')
      expect(queue.tail).to.equal(queue.head)

      expect(queue.hasData).to.be.true

      queue.enqueue('b')

      expect(queue.head.data).to.equal('a')
      expect(queue.tail.data).to.equal('b')

      expect(queue.hasData).to.be.true

      expect(queue.dequeue()).to.equal('a')

      expect(queue.head.data).to.equal('b')
      expect(queue.tail).to.equal(queue.head)

      expect(queue.hasData).to.be.true

      expect(queue.dequeue()).to.equal('b')

      expect(queue.head).to.be.null
      expect(queue.tail).to.be.null

      expect(queue.hasData).to.be.false
    })
  })

  describe('Sequential Executing', () => {
    function createControlledPromise() {
      const result = {}
      const promise = new Promise((resolve, reject) =>
        Object.assign(result, { resolve, reject }) // Expose resolve and reject to
      )

      result.promise = promise

      return result
    }
    function initQueue({ consumeData, onSucceeded, onError } = {}) {
      const queue = new TaskQueue({
        consumeData: Sinon.spy(consumeData),
        onSucceeded: Sinon.spy(onSucceeded),
        onError: Sinon.spy(onError),
      })

      return {
        queue,
        consumeData: queue.consumeData,
        onSucceeded: queue.onSucceeded,
        onError: queue.onError,
      }
    }

    it('should consume data in sequence', async () => {
      const sequence = []

      const { queue } = initQueue({
        consumeData: ::sequence.push,
      })

      queue.enqueue('a')
      queue.enqueue('b')
      queue.enqueue('c')

      await queue.enqueueAndStart('d')

      expect(queue.executing).to.be.false

      expect(sequence).to.deep.equal(['a', 'b', 'c', 'd'])
    })

    it('should not execute in parallel', async () => {
      // What an ugly spec !!!!!!

      // Create a Promise that won't resolve until resolve is called
      const { promise, resolve } = createControlledPromise()

      // Create queue that controlled with resolve
      const { queue, consumeData, onSucceeded } = initQueue({
        consumeData: () => promise,
      })

      queue.enqueue('a')

      // Use finish to control executing sequence
      // Add then to make sure that the promise is invoked
      const finish = queue.enqueueAndStart('b').then(() => { console.log('finish') })

      expect(queue.executing).to.be.true

      expect(consumeData).to.be.calledOnce
      expect(consumeData).to.be.calledWith('a')
      expect(onSucceeded).to.not.be.called

      resolve('succeeded')
      await finish // since consumeData yields the same promise, so 'b' will be consumed immediately

      expect(queue.executing).to.be.false

      expect(onSucceeded).to.be.calledWith('succeeded')

      expect(consumeData).to.be.calledTwice
    })
  })
})
