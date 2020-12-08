import BaseAction from './BaseAction';

export default class Connect extends BaseAction {
  testPose(pose) {
    if (this.isComplete) return;
    const diff = this.getDiff(pose);
    if (diff && diff < this.threshold) {
      this.isComplete = true;
    }
  }
}
