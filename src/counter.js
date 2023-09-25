export class Counter {
  constructor() {
    this.value = 0;
  }

  get count() {
    return this.value;
  }
  reset() {
    this.value = 0;
  }

  increase() {
    return ++this.value;
  }
  decrease() {
    return --this.value;
  }
}