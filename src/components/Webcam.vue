<template>
  <div id='webcam-view'>
    <video id="webcam" ref='webcam' width='0' height='0' muted autoplay></video>
    <canvas id='canvas' ref='canvas' :width='canvasWidth' :height='canvasHeight'></canvas>
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
      canvasWidth: 500,
      canvasHeight: 375,
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
        inputResolution: { width: 400, height: 400 },
        quantBytes: 2,
      });
      model = mod;
      this.$emit('update-model-ready', true);
    },
    async estimatePoseOnImage(element) {
      const pose = await model.estimateSinglePose(element, {
        flipHorizontal: false,
      });
      return pose;
    },
    async beginWebcamEnable(event = null) {
      const constraints = { video: true };
      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => this.video.srcObject = stream)
        // .then(() => )
        .then(() => this.video.addEventListener('loadeddata', this.completeWebcamEnable))
        .catch((err) => console.error(err));
    },
    async completeWebcamEnable() {
      this.isWebcamReady = true;
      this.$emit('update-webcam-ready', true);
    },
    drawVideoOnCanvas() {
      // Or this way?
      // let input = tf.browser.fromPixels(this.video);
      // tf.browser.toPixels(input, this.canvas);
      this.ctx.save();
      this.ctx.scale(-1, 1);
      this.ctx.translate(-this.canvasWidth, 0);
      this.ctx.drawImage(this.video, 0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.restore();
    },
    drawPose(pose) {
      pose.keypoints.forEach((k) => {
        const { x, y } = k.position;
        // this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = '#00ff00';
        this.ctx.rect(x, y, 50, 50);
        // this.ctx.arc(x, y, 50, 0, 2 * Math.PI);
        console.log(x);
        this.ctx.fillRect(x, y, 50, 50);
        this.ctx.stroke();
        // this.ctx.restore();
      });
      // const nose = pose.keypoints.find((k) => k.part === 'nose');
      // const nose = pose.keypoints.find((k) => k.part === 'nose');
      // const { x, y } = nose.position;
      // console.log(x, y);
      // this.ctx.save();
      // this.ctx.beginPath();
      // this.ctx.fillStyle = '#000000';
      // this.ctx.arc(x, y, 50, 0, 2 * Math.PI);
      // this.ctx.fill();
      // this.ctx.stroke();
      // this.ctx.restore();
    },
    async predict() {
      // this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      if (!this.isGamePaused) {
        this.drawVideoOnCanvas();
        const pose = await this.estimatePoseOnImage(this.canvas);
        this.drawPose(pose);
        this.$emit('update-pose', pose);
        // make prediction on pose
      }
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
