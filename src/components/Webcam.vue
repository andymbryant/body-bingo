<template>
  <video id="webcam" ref='webcam' width='0' height='0' muted autoplay></video>
  <canvas id='canvas' ref='canvas' :width='width' :height='height'></canvas>
</template>

<script>
/* eslint-disable prefer-const */
import * as tf from '@tensorflow/tfjs';
import colorKey from '@/colorKey';

const posenet = require('@tensorflow-models/posenet');

// Model must be loaded into global variable - standard data variables didn't work for some reason
let model = null;

export default {
  name: 'Webcam',
  emits: ['update-model-ready', 'update-webcam-ready', 'update-pose'],
  props: {
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    isGamePaused: {
      type: Boolean,
      required: true,
    },
    isGameActive: {
      type: Boolean,
      required: true,
    },
    modelType: {
      type: String,
      required: false,
      default: () => 'low-model',
    },
  },
  data() {
    return {
      loading: false,
      isWebcamReady: false,
      video: null,
      canvas: null,
      highConfig: {
        architecture: 'ResNet50',
        outputStride: 8,
        inputResolution: { width: this.width, height: this.height },
        quantBytes: 4,
      },
      lowConfig: {
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: this.width / 2, height: this.height / 2 },
      },
    };
  },
  methods: {
    async init() {
      await this.bindVideo();
      await this.loadModel();
      await this.beginWebcamEnable();
    },
    async bindVideo() {
      // Make sure video and refs are bound before action loop begins
      setTimeout(() => {
        this.video = this.$refs.webcam;
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');
      }, 100);
    },
    async loadModel() {
      this.$emit('update-model-ready', false);
      const config = this.modelType === 'low-model' ? this.lowConfig : this.highConfig;
      model = await posenet.load(this.config);
      this.$emit('update-model-ready', true);
    },
    async estimatePoseOnImage(element) {
      const pose = await model.estimateSinglePose(element, {
        flipHorizontal: true,
      });
      return pose;
    },
    async beginWebcamEnable(event = null) {
      // Constrain to the designated dimensions
      const constraints = {
        video: true,
        audio: false,
        width: this.width,
        height: this.height,
      };
      navigator.mediaDevices.getUserMedia(constraints)
        .then(async (stream) => {
          let { width, height } = stream.getTracks()[0].getSettings();
          if (width !== this.width) {
            console.error('Width mismatch. Check webcam settings');
          }
          if (height !== this.height) {
            console.error('Height mismatch. Check webcam settings');
          }
          this.video.srcObject = stream;
        })
        .then(() => this.video.addEventListener('loadeddata', this.completeWebcamEnable))
        // The constraints are requests, there needs to be a fallback
        .catch((err) => console.error(err));
    },
    async completeWebcamEnable() {
      this.isWebcamReady = true;
      this.$emit('update-webcam-ready', true);
      this.predict();
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
      // Draw video frame
      // Loop through all keypoints, assign a color, and filter out low-scoring ones and eyes
      pose.keypoints.forEach((k) => {
        const color = colorKey[k.part] || 'grey';
        if (k.score > 0.5 && k.part !== 'leftEye' && k.part !== 'rightEye') {
          const { x, y } = k.position;
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.fillStyle = color;
          this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
          this.ctx.fill();
          this.ctx.stroke();
          this.ctx.restore();
        }
      });
    },
    // Heart of the action loop
    async predict() {
      // Get tensor from browser input
      const input = tf.browser.fromPixels(this.video);
      // Use model to get prediction
      const pose = await this.estimatePoseOnImage(input);
      // Draw the video to the canvas element
      this.drawVideoOnCanvas();
      // Draw the pose
      await this.drawPose(pose);
      // If game is being played, update pose
      if (!this.isGamePaused && this.isGameActive) {
        this.$emit('update-pose', pose);
      }
      // Continue loop
      window.requestAnimationFrame(this.predict);
    },
  },
  watch: {
    modelType: {
      handler() {
        this.loadModel();
      },
      immediate: true,
    },

  },
  created() {
    this.loading = true;
  },
  mounted() {
    this.init().then(() => this.loading = false);
  },
};
</script>
