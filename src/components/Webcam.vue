<template>
  <div id='webcam-view'>
    <video id="webcam" ref='webcam' width='420' height='350' muted autoplay></video>
    <button v-if='!isWebcamEnabled' id="webcam-button" @click='beginWebcamEnable'>Enable Webcam</button>
  </div>
</template>

<script>
/* eslint-disable prefer-const */
import * as tf from '@tensorflow/tfjs';

const posenet = require('@tensorflow-models/posenet');

let model = null;

export default {
  name: 'Webcam',
  data() {
    return {
      loading: false,
      isWebcamEnabled: false,
      video: null,
    };
  },
  methods: {
    async bindVideo() {
      setTimeout(() => {
        this.video = this.$refs.webcam;
      }, 100);
    },
    async estimatePoseOnImage(element) {
      // load the posenet model from a checkpoint
      const net = await posenet.load();

      const pose = await net.estimateSinglePose(element, {
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
      this.isWebcamEnabled = true;
      // Once webcam is enabled, startin predicting!
      this.predict();
    },
    async predict() {
      const pose = await this.estimatePoseOnImage(this.video);
      console.log(pose);
      // make prediction on pose
      window.requestAnimationFrame(this.predict);
    },
  },
  created() {
    this.loading = true;
  },
  mounted() {
    this.bindVideo()
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
  height: 300px;
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
