<template>
<div id='board' v-if='!loading'>
  <div id="top">
    <div id='content'>
      <div class='title-ctr'>
        <h1>Body Bingo</h1>
        <h3><em>Let's throw some shapes!</em></h3>
        <p>To win the game, you must fill an entire row or a column of cards on the board (no diagonals).
          But don't use your mouse, move your body!</p>
        <p>For best results, sit about five feet away from the camera in a well-lit area.</p>
        <label for="model-select"><strong>Choose a model: </strong></label>
          <select name="model-select" v-model='modelType' id="model-select">
            <option value="low-model">Low Accuracy</option>
            <option value="high-model">High Accuracy</option>
          </select>
      <div id='model-loading-message'><em v-show='!isModelReady' >(loading...)</em></div>
        <p>When you're ready to start, click play!</p>
      </div>
      <div id='controls'>
        <button v-if='bingo()' class='btn reset-btn' @click='reset'>New Game</button>
        <button v-else-if='isGamePaused || !isGameActive' :disabled='!isWebcamReady' class='btn play-btn' @click='play'>Play</button>
        <button v-else :disabled='!isWebcamReady' class='btn' @click='pause'>Pause</button>
        <Timer :isGamePaused='isGamePaused' :isGameOver='isGameOver' ref='timer'/>
      </div>
    </div>
    <div id='webcam-view'>
      <div v-if='!isWebcamReady' id='webcam-loading-message'>Waiting on webcam...</div>
      <div v-if='bingo()' id='bingo-message'>BINGO!</div>
        <Webcam
          ref='webcam'
          :width='width'
          :height='height'
          :modelType='modelType'
          @update-model-ready='updateModelReady'
          :isGamePaused='isGamePaused'
          :isGameActive='isGameActive'
          @update-webcam-ready='updateWebcamReady'
          @update-pose='updatePose'
        />
      </div>
  </div>
  <div id="action-board">
    <ActionCard v-for='action in actions' :isGameActive='isGameActive' :action='action' :key='action'/>
  </div>
</div>
<div class='copyright'>© 2020 Andy Bryant - <a href="https://github.com/andymbryant/body-bingo" target='_blank'>Github</a></div>
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
      modelType: 'high-model',
      width: 640,
      height: 480,
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
        this.$refs.timer.reset();
      }, 100);
      this.actions = [];
      // Get actions and load them
      this.getActions()
        .then((actions) => actions.forEach((a) => this.actions.push(a)));
    },
    async getActions() {
      // Creates actions from the actions data
      const actions = this.actionData.map((d) => {
        const data = d;
        data.width = this.width;
        data.height = this.height;
        if (data.actionType === 'connect') {
          return new Connect(data);
        }
        // TODO: Add different kinds, like separate and maybe position
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
    play() {
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
      // Only select those actions that are associated with parts of the body included in the pose
      this.actions.forEach((a) => a.testPose(pose));
      if (this.bingo()) {
        this.isGameOver = true;
        this.isGameActive = false;
      }
    },
    // This determines if the user has bingo, based on board position
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
      // Condition for if an action is complete
      const actionIsComplete = (index) => this.actions[index].isComplete;
      // Check that all actions are complete based on indices in the wins data
      if (this.actions.length) {
        wins.forEach((win) => {
          if (win.every(actionIsComplete)) {
            flag = true;
          }
        });
      }
      return flag;
    },
  },
  computed: {
    actionData() {
      const high = 60;
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
          threshold: high,
          actionType: 'connect',
        },
        {
          name: 'Touch Right Wrist to Left Elbow',
          partOneName: 'rightWrist',
          partTwoName: 'leftElbow',
          threshold: high,
          actionType: 'connect',
        },
        {
          name: 'Touch Wrists Together',
          partOneName: 'rightWrist',
          partTwoName: 'leftWrist',
          threshold: 15,
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
          name: 'Put Nose in Bottom Left',
          partOneName: 'nose',
          partTwoName: 'bottomLeft',
          actionType: 'connect',
        },
        {
          name: 'Put Nose in Top Right',
          partOneName: 'nose',
          partTwoName: 'topRight',
          actionType: 'connect',
        },
        {
          name: 'Put Nose in Bottom Right',
          partOneName: 'nose',
          partTwoName: 'bottomRight',
          actionType: 'connect',
        },
        {
          name: 'Put Nose in Top Left',
          partOneName: 'nose',
          partTwoName: 'topLeft',
          actionType: 'connect',
        },
        {
          name: 'Dab with Right Arm',
          partOneName: 'rightElbow',
          partTwoName: 'nose',
          threshold: high,
          actionType: 'connect',
        },
        {
          name: 'Dab with Left Arm',
          partOneName: 'leftElbow',
          partTwoName: 'nose',
          threshold: high,
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

#board {
  border: 3px solid black;
  width: 1000px;
}

#top {
  display: flex;
  justify-content: space-between;
  border-bottom: 3px solid black;
  height: 480px;
  width: 100%;
  margin: 0;
  padding: 0;
}

#content {
  width: 100%;
  border-right: 3px solid black;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title-ctr {
  text-align: left;
}

#controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn {
  width: 150px;
  height: 50px;
  font-size: 1.2rem;
  border: 3px solid black;
  transition: all 0.5s;
}

.play-btn {
  background-color: rgb(243, 136, 136);
}

.play-btn:disabled {
  background-color: lightgrey;
}

.reset-btn {
  background-color: lightgreen;
}

#webcam-view {
  position: relative;
}

#webcam-loading-message {
  position: absolute;
  top: 50%;
  left: 32%;
  color: grey;
  font-size: 1.5rem;
  font-weight: 700
}

#model-loading-message {
  height: 20px;
}

#bingo-message {
  position: absolute;
  top: 39%;
  left: 24%;
  color: red;
  font-size: 6rem;
  font-weight: 700
}

#action-board {
  display: grid;
  grid-template-columns: 50px 50px 50px 50px;
  border-bottom: 1px solid black;
  border-left: 1px solid black;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
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
  color: #fa820e;
}

.copyright {
  font-size: 12px;
  margin-top: 1rem;
  left: 50%;
}

</style>
