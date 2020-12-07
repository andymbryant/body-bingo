<template>
<span v-if='!loading'>
  <div id="top">
    <div class='half' id="content">
      <div id='title'>
        <h1>Body Bingo</h1>
        <h3><em>Let's throw some shapes!</em></h3>
        <p>To win the game, you must fill an entire row or a column of cards on the board (no diagonals).
          But don't use your mouse, move your body!</p>
      </div>
      <div id='controls'>
        <button v-if='isGamePaused || !isGameActive' :disabled='!isWebcamReady' class='btn' @click='start'>Start</button>
        <button v-else-if='!isGameOver' :disabled='!isWebcamReady' class='btn' @click='pause'>Pause</button>
        <button v-else class='btn' @click='reset'>New Game</button>
        <Timer :isGamePaused='isGamePaused' :isGameOver='isGameOver' ref='timer'/>
      </div>
      <div v-if='!isModelReady'>(loading model...)</div>
    </div>
    <Webcam
      ref='webcam'
      @update-model-ready='updateModelReady'
      :isGamePaused='isGamePaused'
      @update-webcam-ready='updateWebcamReady'
      @update-pose='updatePose'
    />
  </div>
  <div class='bingo-ctr'>
    <div class='bingo-message' v-if='bingo()'>BINGO! You won!</div>
  </div>
  <div id="actions-board">
    <ActionCard v-for='action in actions' :action='action' :key='action'/>
  </div>
</span>
</template>

<script>
/* eslint-disable no-return-assign */
import Webcam from '@/components/Webcam.vue';
import Timer from '@/components/Timer.vue';
import ActionCard from '@/components/ActionCard.vue';
import Connect from '@/action/Connect';
import * as shuffle from 'lodash/shuffle';

export default {
  name: 'Home',
  components: {
    Timer,
    Webcam,
    ActionCard,
  },
  data() {
    return {
      loading: false,
      isGameActive: false,
      isGameOver: false,
      isGamePaused: false,
      isWebcamReady: false,
      isModelReady: false,
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
        // Add different kinds, like separate and maybe position
        return new Connect(data);
      });
      return shuffle(actions);
    },
    updateWebcamReady(bool) {
      this.isWebcamReady = bool;
    },
    updateModelReady(bool) {
      this.isModelReady = bool;
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
      this.$nextTick(() => {
        this.$refs.webcam.predict();
        this.$refs.timer.start();
      });
    },
    pause() {
      this.isGamePaused = true;
    },
    updatePose(pose) {
      this.actions.forEach((a) => a.testPose(pose));
      if (this.bingo()) {
        this.isGameOver = true;
        this.isGameActive = false;
      }
    },
    bingo() {
      let flag = false;
      const wins = [
        // rows
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
        // columns
        [0, 4, 8, 12],
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],
      ];
      const actionIsComplete = (index) => this.actions[index].isComplete;
      wins.forEach((win) => {
        if (win.every(actionIsComplete)) {
          flag = true;
        }
      });
      return flag;
    },
  },
  computed: {
    actionData() {
      const actionData = [
        {
          name: 'Touch Right Wrist to Right Ear',
          partOneName: 'rightWrist',
          partTwoName: 'rightEar',
          actionType: 'connect',
        },
        {
          name: 'Touch Left Wrist to Left Ear',
          partOneName: 'leftWrist',
          partTwoName: 'rightEar',
          actionType: 'connect',
        },
        {
          name: 'Touch Right Wrist to Nose',
          partOneName: 'rightWrist',
          partTwoName: 'nose',
          actionType: 'connect',
        },
        {
          name: 'Touch Left Wrist to Nose',
          partOneName: 'leftWrist',
          partTwoName: 'nose',
          actionType: 'connect',
        },
        {
          name: 'Touch Left Wrist to Right Elbow',
          partOneName: 'leftWrist',
          partTwoName: 'rightElbow',
          actionType: 'connect',
        },
        {
          name: 'Touch Right Wrist to Left Elbow',
          partOneName: 'rightWrist',
          partTwoName: 'leftElbow',
          actionType: 'connect',
        },
        {
          name: 'Touch Wrists Together',
          partOneName: 'rightWrist',
          partTwoName: 'leftWrist',
          threshold: 10,
          actionType: 'connect',
        },
        {
          name: 'Put Left Elbow in Bottom Left',
          partOneName: 'leftElbow',
          partTwoName: 'bottomLeft',
          actionType: 'connect',
        },
        {
          name: 'Put Right Wrist in Top Right',
          partOneName: 'rightWrist',
          partTwoName: 'topRight',
          actionType: 'connect',
        },
        {
          name: 'Put Right Elbow in Bottom Right',
          partOneName: 'rightElbow',
          partTwoName: 'bottomRight',
          actionType: 'connect',
        },
        {
          name: 'Put Face in Bottom Left',
          partOneName: 'nose',
          partTwoName: 'bottomLeft',
          threshold: 50,
          actionType: 'connect',
        },
        {
          name: 'Put Face in Top Right',
          partOneName: 'nose',
          partTwoName: 'topRight',
          threshold: 50,
          actionType: 'connect',
        },
        {
          name: 'Put Face in Bottom Right',
          partOneName: 'nose',
          partTwoName: 'bottomRight',
          threshold: 50,
          actionType: 'connect',
        },
        {
          name: 'Put Face in Top Left',
          partOneName: 'nose',
          partTwoName: 'topLeft',
          threshold: 50,
          actionType: 'connect',
        },
        {
          name: 'Dab with Right Arm',
          partOneName: 'rightElbow',
          partTwoName: 'rightEye',
          actionType: 'connect',
        },
        {
          name: 'Dab with Left Arm',
          partOneName: 'leftElbow',
          partTwoName: 'leftEye',
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
  align-items: flex-end;
  justify-content: space-between;
}

.btn {
  width: 120px;
  height: 50px;
  font-size: 1.2rem;
}

#actions-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  grid-column-gap: 10px;
  grid-row-gap: 10px;
}

.half {
  width: 300px;
}

.bingo-ctr {
  width: 100%;
  height: 30px;
  padding: 0.2rem 0 0.5rem 0;
}

.bingo-message {
  margin: 0;
  padding: 0;
  font-weight: 700;
  font-size: 1.2rem;
  color: rgb(202, 27, 27);
}

</style>
