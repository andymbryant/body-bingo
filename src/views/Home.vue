<template>
<span v-if='!loading'>
  <div id="top">
    <div class='half' id="content">
      <div id='title'>
        <h1>Body Bingo</h1>
        <h3>Throwing Shapes</h3>
        <p>Description of the app and how it works and why you want to use it.</p>
      </div>
      <div id='controls'>
        <button v-if='isGamePaused || !isGameActive' :disabled='!isWebcamReady' class='btn' @click='start'>Start</button>
        <button v-else :disabled='!isWebcamReady' class='btn' @click='pause'>Pause</button>
        <button class='btn' :disabled='!isWebcamReady' @click='reset'>Reset</button>
      </div>
    </div>
    <Webcam
      ref='webcam'
      :isGamePaused='isGamePaused'
      @update-webcam-ready='updateWebcamReady'
      @update-pose='updatePose'
    />
  </div>
  <div id="actions-board">
    <ActionCard v-for='action in actions' :action='action' :key='action'/>
  </div>
</span>
</template>

<script>
/* eslint-disable no-return-assign */
import Webcam from '@/components/Webcam.vue';
import ActionCard from '@/components/ActionCard.vue';
import Connect from '@/action/Connect';
import Separate from '@/action/Separate';

export default {
  name: 'Home',
  components: {
    Webcam,
    ActionCard,
  },
  data() {
    return {
      loading: false,
      isGameActive: false,
      isGamePaused: false,
      isWebcamReady: false,
      actions: [],
    };
  },
  methods: {
    async init() {
      this.reset();
    },
    async reset() {
      // If predict is running, stop it
      this.isGamePaused = true;
      setTimeout(() => {
        this.isGamePaused = false;
        this.isGameActive = false;
      }, 100);
      this.getActions()
        .then((actions) => actions.forEach((a) => this.actions.push(a)));
      // reset timer, reset board, etc.
    },
    async getActions() {
      const actions = this.actionData.map((data) => {
        if (data.actionType === 'connect') {
          return new Connect(data);
        }
        return new Separate(data);
      });
      return actions;
    },
    updateWebcamReady(bool) {
      this.isWebcamReady = bool;
    },
    gameAction() {
      if (this.isGameActive) {
        this.pause();
      } else {
        this.start();
      }
    },
    start() {
      this.isGameActive = true;
      this.isGamePaused = false;
      this.$nextTick(() => this.$refs.webcam.predict());
    },
    pause() {
      this.isGamePaused = true;
    },
    updatePose(pose) {
      this.actions.forEach((a) => a.testPose(pose));
    },
  },
  computed: {
    actionData() {
      const actionData = [
        {
          name: 'Touch Elbows',
          partOneName: 'leftElbow',
          partTwoName: 'rightElbow',
          actionType: 'connect',
        },
        {
          name: 'Touch Left Wrist to Right Shoulder',
          partOneName: 'rightWrist',
          partTwoName: 'leftShoulder',
          actionType: 'connect',
        },
        {
          name: 'Dab!',
          partOneName: 'rightElbow',
          partTwoName: 'rightEye',
          actionType: 'connect',
        },
        {
          name: 'Touch Knees',
          partOneName: 'rightKnee',
          partTwoName: 'leftKnee',
          actionType: 'connect',
        },
      ];
      return actionData;
    },
  },
  created() {
    this.loading = true;
  },
  mounted() {
    this.init()
      .then(() => this.$nextTick(() => this.loading = false));
  },
};
</script>

<style>

#top {
  height: 300px;
  display: flex;
  justify-content: space-between;
}

#content {
  text-align: left;
  flex-direction: row;
  justify-content: space-between;
}

#controls {
  display: flex;
  justify-content: space-between;
}

.btn {
  width: 120px;
  height: 50px;
  font-size: 1.2rem;
}

#actions-board {
  margin-top: 2rem;
  height: 300px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-column-gap: 10px;
  grid-row-gap: 10px;
}

.half {
  width: 300px;
}

</style>
