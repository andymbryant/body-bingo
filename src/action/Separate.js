import BaseAction from './BaseAction';

export default class Separate extends BaseAction {
  constructor(data) {
    super(data);
    this.threshold = 250;
  }

  testPose(pose) {
    if (this.isComplete) return;
    const diff = this.getDiff(pose);
    if (diff && diff > this.threshold) {
      this.isComplete = true;
    }
  }
}
