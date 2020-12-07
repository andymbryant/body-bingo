export default class BaseAction {
  constructor(data) {
    this.name = data.name;
    this.partOneName = data.partOneName;
    this.partTwoName = data.partTwoName;
    this.threshold = data.threshold || 20;
    this.isComplete = false;
  }

  get screenSize() {
    return 350;
  }

  getPoints() {
    return [
      {
        part: 'topLeft',
        position: { x: 0, y: 0 },
      },
      {
        part: 'topRight',
        position: { x: this.screenSize, y: 0 },
      },
      {
        part: 'bottomLeft',
        position: { x: 0, y: this.screenSize },
      },
      {
        part: 'bottomRight',
        position: { x: this.screenSize, y: this.screenSize },
      },
    ];
  }

  getPart(pose, partName) {
    const allPoints = [pose.keypoints, this.getPoints()].flat();
    return allPoints.find((k) => k.part === partName);
  }

  isPartVisible(part) {
    const { x, y } = part.position;
    return x <= this.screenSize && x >= 0 && y <= this.screenSize && y >= 0;
  }

  getDiff(pose) {
    // Get euclidian distance between parts
    const partOne = this.getPart(pose, this.partOneName);
    const partTwo = this.getPart(pose, this.partTwoName);
    if (!partOne) console.error(`You probably mispelled this: ${this.partOneName}`);
    if (!partTwo) console.error(`You probably mispelled this: ${this.partTwoName}`);
    // If parts are on screen, don't consider them
    if (!this.isPartVisible(partOne) || !this.isPartVisible(partTwo)) return null;
    const xDiff = partOne.position.x - partTwo.position.x;
    const yDiff = partOne.position.y - partTwo.position.y;
    const a = xDiff;
    const b = yDiff;
    const c = Math.sqrt(a * a + b * b);
    return c;
  }

  testPose(pose) {
    console.error('Not implemented');
  }
}
