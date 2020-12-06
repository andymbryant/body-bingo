<template>
  <div id='webcam-view'>
    <video id="webcam" ref='webcam' width='400' height='400' muted autoplay></video>
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
        .then(() => this.video.addEventListener('loadeddata', this.completeWebcamEnable))
        .catch((err) => console.error(err));
    },
    async completeWebcamEnable() {
      this.isWebcamReady = true;
      this.$emit('update-webcam-ready', true);
      // Once webcam is enabled, startin predicting!
      // this.predict();
    },
    async predict() {
      if (!this.isGamePaused) {
        const pose = await this.estimatePoseOnImage(this.video);
        this.$emit('update-pose', pose);
        // make prediction on pose
        window.requestAnimationFrame(this.predict);
      }
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
#webcam-view {
  position: relative;
  border: 1px solid black;
}
#webcam {
  height: 400px;
  width: 400px;
}

#webcam-button {
  position: absolute;
  top: 120px;
  left: 150px;
  width: 100px;
  height: 75px;
}

</style>
