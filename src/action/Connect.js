import BaseAction from './BaseAction';

export default class Connect extends BaseAction {
  testPose(pose) {
    if (this.isComplete) return;
    this.partOne = this.getPart(pose, this.partOneName);
    this.partTwo = this.getPart(pose, this.partTwoName);
    // const scoreOne = pose.keypoints.find((k) => k.part === this.partOneName);
    // const scoreTwo = pose.keypoints.find((k) => k.part === this.partTwoName);
    if (this.partOne.score < 0.6 || this.partTwo.score < 0.6) return;
    // if (this.partOneName === 'nose') {
    //   console.log(`${partOne.position.x}, ${partOne.position.y}`);
    // }
    const diff = this.getDiff(pose);
    if (diff && diff < this.threshold) {
      this.isComplete = true;
    }
  }

  get verb() {
    return 'Touch';
  }
}
