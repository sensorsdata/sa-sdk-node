class Queue {
  constructor() {
    this.head = null
    this.tail = null
  }

  get hasData() {
    return this.head != null
  }

  enqueue(data) {
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
}

export default Queue
