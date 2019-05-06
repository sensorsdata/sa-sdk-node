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

  async firstValue() {
    return (await this.values())[0]
  }

  async errors() {
    await this.toNotifications()

    return this.notifications.map(notification => notification.error)
  }

  async firstError() {
    return (await this.errors())[0]
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
