export default class BasePose {
  constructor(data) {
    this.data = data;
  }

  get name() {
    return this.data.name;
  }

  set name(name) {
    this.data.name = name;
  }
}
