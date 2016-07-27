import Queue from '../src/Queue'

describe('Queue', () => {
  it('should work', () => {
    const queue = new Queue()

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
