// All actions inherit from this base action
// It represents how two parts are associated with each other

export default class BaseAction {
  constructor(data) {
    this.name = data.name;
    this.partOneName = data.partOneName;
    this.partTwoName = data.partTwoName;
    this.threshold = data.threshold || 35;
    this.isComplete = false;
    this.width = data.width;
    this.height = data.height;
    this.partOne = null;
    this.partTwo = null;
  }

  getPoints() {
    return [
      {
        part: 'topLeft',
        score: 1,
        position: { x: 0, y: 0 },
      },
      {
        part: 'topRight',
        score: 1,
        position: { x: this.width, y: 0 },
      },
      {
        part: 'bottomLeft',
        score: 1,
        position: { x: 0, y: this.height },
      },
      {
        part: 'bottomRight',
        score: 1,
        position: { x: this.width, y: this.height },
      },
    ];
  }

  getPart(pose, partName) {
    const allPoints = [pose.keypoints, this.getPoints()].flat();
    return allPoints.find((k) => k.part === partName);
  }

  // isPartVisible(part) {
  //   const { x, y } = part.position;
  //   return x <= this.width && x >= 0 && y <= this.height && y >= 0;
  // }

  getDiff(pose) {
    // Get euclidian distance between parts

    if (!this.partOne) console.error(`You probably mispelled this: ${this.partOneName}`);
    if (!this.partTwo) console.error(`You probably mispelled this: ${this.partTwoName}`);
    // if (!this.isPartVisible(partOne) || !this.isPartVisible(partTwo)) return null;
    const xDiff = this.partOne.position.x - this.partTwo.position.x;
    const yDiff = this.partOne.position.y - this.partTwo.position.y;
    const a = xDiff;
    const b = yDiff;
    const c = Math.sqrt(a * a + b * b);
    return c;
  }

  testPose(pose) {
    console.error('Not implemented');
  }
}
