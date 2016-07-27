import createDebug from 'debug'

const debug = createDebug('sa:TaskQueue')

const NOP = () => {}

class TaskQueue {
  constructor({ consumeData, onSucceeded = NOP, onError = NOP } = {}) {
    this.head = null
    this.tail = null

    this.consumeData = consumeData
    this.onSucceeded = onSucceeded
    this.onError = onError

    this.executing = false
  }

  get hasData() {
    return this.head != null
  }

  enqueue(data) {
    debug('Eneque: %o', data)

    const node = {
      data,
      next: null,
    }

    if (this.tail == null) {
      this.tail = node
      this.head = node
    } else {
      this.tail.next = node
      this.tail = node
    }
  }

  dequeue() {
    debug('Dequeue')
    const result = this.head

    if (result == null) {
      return null
    }

    this.head = result.next
    if (this.head == null) {
      this.tail = null
    }

    return result.data
  }

  async executeTask() {
    debug('Execute Task...')

    if (!this.hasData) {
      this.executing = false
      debug('Queue is empty, stop...')
      return null
    }

    this.executing = true
    const data = this.dequeue()

    try {
      debug('Consume data: %o', data)
      const result = await this.consumeData(data)
      debug('Succeeded')
      if (this.onSucceeded != null) {
        this.onSucceeded(result)
      }
    } catch (ex) {
      debug('Failed: %s', ex)
      if (this.onError != null) {
        this.onError(ex)
      }
    }

    return this.executeTask() // No await to flattern cascaded promises
  }

  start() {
    debug('Start task...')
    if (this.consumeData == null) {
      debug('consumeData is not given')
      throw new Error('consumeData is not given')
    }

    if (this.executing) {
      debug('Already running')
      return null
    }

    return this.executeTask()
  }

  enqueueAndStart(data) {
    this.enqueue(data)
    return this.start()
  }
}

export default TaskQueue
