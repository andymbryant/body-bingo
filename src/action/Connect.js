import BaseAction from './BaseAction';

// This action is for when two parts Connect
export default class Connect extends BaseAction {
  testPose(pose) {
    if (this.isComplete) return;
    this.partOne = this.getPart(pose, this.partOneName);
    this.partTwo = this.getPart(pose, this.partTwoName);
    const scoreThreshold = 0.45;
    if (this.partOne.score <= scoreThreshold || this.partTwo.score <= scoreThreshold) return;
    const diff = this.getDiff(pose);
    if (diff && diff < this.threshold) {
      this.isComplete = true;
    }
  }

  get verb() {
    return 'Touch';
  }
}
