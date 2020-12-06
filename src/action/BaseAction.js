export default class BaseAction {
  constructor(data) {
    this.name = data.name;
    this.partOneName = data.partOneName;
    this.partTwoName = data.partTwoName;
    this.threshold = data.threshold || 25;
    this.isComplete = false;
  }

  getPart(pose, partName) {
    return pose.keypoints.find((k) => k.part === partName);
  }

  isPartVisible(part) {
    if (this.partOneName === 'rightKnee') {
      console.log(`X: ${part.position.x}, Y: ${part.position.y}`);
    }
    const { x, y } = part.position;
    return x < 400 && x > 0 && y < 400 && y > 0;
  }

  getDiff(pose) {
    // Get euclidian distance between parts
    const partOne = this.getPart(pose, this.partOneName);
    const partTwo = this.getPart(pose, this.partTwoName);
    // If parts are on screen, don't consider them
    if (!this.isPartVisible(partOne) || !this.isPartVisible(partTwo)) return null;
    const xDiff = partOne.position.x - partTwo.position.x;
    const yDiff = partOne.position.y - partTwo.position.y;
    const a = xDiff;
    const b = yDiff;
    return Math.sqrt(a * a + b * b);
  }

  testPose(pose) {
    console.error('Not implemented');
  }
}
