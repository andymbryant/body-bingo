<template>
  <div id='webcam-view'>
    <video id="webcam" ref='webcam' width='0' height='0' muted autoplay></video>
    <canvas id='canvas' ref='canvas' :width='width' :height='height'></canvas>
    <button v-if='!isWebcamReady' id="webcam-button" @click='beginWebcamEnable'>Enable Webcam</button>
  </div>
</template>

<script>
/* eslint-disable prefer-const */
import * as tf from '@tensorflow/tfjs';

const posenet = require('@tensorflow-models/posenet');

let model = null;

export default {
  name: 'Webcam',
  props: {
    isGamePaused: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      isWebcamReady: false,
      video: null,
      canvas: null,
      width: 640,
      height: 480,
    };
  },
  methods: {
    async init() {
      await this.bindVideo();
      await this.loadModel();
    },
    async bindVideo() {
      setTimeout(() => {
        this.video = this.$refs.webcam;
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');
      }, 100);
    },
    async loadModel() {
      const mod = await posenet.load({
        architecture: 'ResNet50',
        outputStride: 32,
        inputResolution: { width: this.width, height: this.height },
        quantBytes: 2,
      });
      model = mod;
      this.$emit('update-model-ready', true);
    },
    async estimatePoseOnImage(element) {
      const pose = await model.estimateSinglePose(element, {
        flipHorizontal: true,
      });
      return pose;
    },
    async beginWebcamEnable(event = null) {
      const constraints = { video: true };
      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          let { width, height } = stream.getTracks()[0].getSettings();
          this.width = width;
          this.height = height;

          this.video.srcObject = stream;
        })
        // .then(() => )
        .then(() => this.video.addEventListener('loadeddata', this.completeWebcamEnable))
        .catch((err) => console.error(err));
    },
    async completeWebcamEnable() {
      this.isWebcamReady = true;
      this.$emit('update-webcam-ready', true);
    },
    drawVideoOnCanvas() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.save();
      this.ctx.scale(-1, 1);
      this.ctx.translate(-this.width, 0);
      this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
      this.ctx.restore();
    },
    async drawPose(pose) {
      // Clear previos frame
      // Draw video frame
      pose.keypoints.forEach((k) => {
        if (k.score > 0.5) {
          const { x, y } = k.position;
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.fillStyle = '#00ff00';
          this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
          this.ctx.fill();
          this.ctx.stroke();
          this.ctx.restore();
        }
      });
    },
    async predict() {
      let pose;
      if (!this.isGamePaused) {
        const input = tf.browser.fromPixels(this.video);
        pose = await this.estimatePoseOnImage(input);
        this.$emit('update-pose', pose);
        // make prediction on pose
      }
      this.drawVideoOnCanvas();
      if (pose) await this.drawPose(pose);
      window.requestAnimationFrame(this.predict);
    },
  },
  created() {
    this.loading = true;
  },
  mounted() {
    this.init()
      .then(() => this.loading = false);
  },
};
</script>

<style scoped>

#canvas {
  width: 400;
  height: 400;
  border: 1px solid black;
}

#webcam-button {
  position: absolute;
  top: 115px;
  left: 125px;
  width: 100px;
  height: 75px;
  background-color: #fa820e;
}

</style>
