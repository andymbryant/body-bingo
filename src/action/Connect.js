import BaseAction from './BaseAction';

export default class Connect extends BaseAction {
  testPose(pose) {
    if (this.isComplete) return;
    const diff = this.getDiff(pose);
    if (this.name === 'Put Left Elbow in Bottom Left') {
      console.log(diff);
    }
    if (diff && diff < this.threshold) {
      this.isComplete = true;
    }
  }
}
