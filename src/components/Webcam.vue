<template>
  <video id="webcam" ref='webcam' width='0' height='0' muted autoplay></video>
  <canvas id='canvas' ref='canvas' :width='width' :height='height'></canvas>
</template>

<script>
/* eslint-disable prefer-const */
import * as tf from '@tensorflow/tfjs';
import * as tmPose from '@teachablemachine/pose';
import colorKey from '@/colorKey';

const posenet = require('@tensorflow-models/posenet');

let model = null;
let poseModel = null;

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
        inputResolution: { width: this.width / 1.5, height: this.height / 1.5 },
        quantBytes: 2,
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
      // const weights = await this.getWeights();
      // console.log(weights);
      // const URL = 'https://teachablemachine.withgoogle.com/models/BNsfS7AVC/';
      // const modelURL = `${URL}model.json`;
      // const modelURL = 'model.json';
      // const metadataURL = 'metadata.json';
      // const metadataURL = `${URL}metadata.json`;
      // poseModel = await tmPose.loadFromFiles(modelURL, metadataURL);
      poseModel = await tf.loadLayersModel('model.json');
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
      // Clear previos frame
      // Draw video frame
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
    preprocess(img) {
      let tensor = tf.browser.fromPixels(img, 1).toFloat();

      const offset = tf.scalar(127.5);
      // Normalize the image
      const normalized = tensor.sub(offset).div(offset);

      // We add a dimension to get a batch shape [1,224,224,3]
      const batched = normalized;
      // const batched = normalized.expandDims(0);
      return batched;
    },
    async predict() {
      const input = tf.browser.fromPixels(this.video);
      const pose = await this.estimatePoseOnImage(input);
      // const { posenetOutput } = await poseModel.estimatePose(this.video);
      // let next = tf.browser.fromPixels(this.video)
      //   .mean(2)
      //   .toFloat()
      //   .expandDims(-1);
      // next = input;
      // next = tf.image.resizeNearestNeighbor(next, [14739]);
      let next = this.preprocess(this.video);
      // next = next.reshape([247, 247]);
      // console.log(next);
      // next = tf.reshape(next, shape=)
      // next = tf.image.resizeBilinear(next, [1474000]);
      // next = tf.expandDims(next, -1);
      // next = tf.reshape(next, [14739]);
      // next = next.squeeze(2);
      // next = next.reshape([257, 257]);
      // console.log(poseModel.summary());
      // next = next.slice([14739]);
      // next = tf.expandDims(next, 0);
      // next = input.resizeBilinear([14739]);
      // next = next.mean(2);
      // next = tf.expandDims(next, 0);
      // next = tf.transpose(next);

      // next = next.flatten();
      // next = tf.transpose(next, tf.concat([[1, 0], tf.range(2, tf.rank(next))], 0));

      // next = await tf.reshape([1, 14739, 3]);
      next = tf.image.resizeBilinear(next, [1, 14739]);
      // next = tf.squeeze(next);
      next = tf.squeeze(next);
      next = tf.expandDims(next, 0);
      // next = tf.reshape(input, [1, 14739]);
      // next = next.slice([0, 0], [1, 14739]);

      // let next = input.resizeBilinear([257, 257]);
      // next = tf.slice(input, [0, 14739]);
      // poseModel.add(tf.layers.inputLayer({ inputShape: [640] }));
      const prediction = await poseModel.predict(next);
      console.log(prediction.dataSync());
      this.drawVideoOnCanvas();
      await this.drawPose(pose);
      if (!this.isGamePaused && this.isGameActive) {
        this.$emit('update-pose', pose);
      }
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
