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
        <button class='btn'>Start</button>
        <button class='btn'>Reset</button>
      </div>
    </div>
    <Webcam @update-poses='updatePoses'/>
  </div>
  <div id="cards">
    <!-- <Row v-for='suit in suits' :suit='suit' :key='suit'/> -->
  </div>
</span>
</template>

<script>
/* eslint-disable no-return-assign */
import Webcam from '@/components/Webcam.vue';

export default {
  name: 'Home',
  components: {
    Webcam,
  },
  data() {
    return {
      loading: false,
      isWebcamEnabled: false,
      poses: [],
    };
  },
  methods: {
    updatePoses(score) {
      this.cards.forEach((c) => {
        const card = c;
        if (card.name === score) {
          card.isActive = true;
          card.isAvailable = false;
        } else {
          card.isActive = false;
        }
      });
      // const card = this.cards.find(c => c.value === classname)
      // card.isAvailable = false
      // this.predictions.map((p) => console.log(p));
    },
  },
  created() {
    this.loading = true;
  },
  mounted() {
    this.$nextTick(() => this.loading = false);
  },
};
</script>

<style>

#top {
  height: 300px;
  display: flex;
  justify-content: space-around;
}

#content {
  text-align: left;
  flex-direction: row;
  justify-content: space-between;
}

#controls {
  width: 250px;
  display: flex;
  justify-content: space-between;
}

.btn {
  width: 100px;
  height: 50px;
  font-size: 1.5rem;
}

#cards {
  width: 800px;
}

.half {
  width: 300px;
}

</style>
