class ObservableMonitor {
  constructor(observable) {
    this.observable = observable
    this.promise = observable.materialize().toArray().toPromise()
  }

  complete(subject = this.observable) {
    subject.onCompleted()

    return this
  }

  async toNotifications() {
    if (this.notifications == null) {
      this.notifications = await this.promise
      this.notifications.pop()
    }

    return this.notifications
  }

  async kinds() {
    await this.toNotifications()

    return this.notifications.map(notification => notification.kind)
  }

  async values() {
    await this.toNotifications()

    return this.notifications.map(notification => notification.value)
  }

  async errors() {
    await this.toNotifications()

    return this.notifications.map(notification => notification.error)
  }

  async pluckValues(key) {
    await this.toNotifications()

    return this.notifications.map(notification => notification.value && notification.value[key])
  }
}

function monitorRx(observable) {
  return new ObservableMonitor(observable)
}

global.monitorRx = monitorRx
