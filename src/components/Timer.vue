<template>
  <div class='time-ctr'>Time: {{seconds}} (seconds)</div>
</template>

<script>
export default {
  name: 'Timer',
  props: {
    isGamePaused: {
      type: Boolean,
      required: true,
    },
    isGameOver: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      seconds: 0,
      intervalFn: null,
    };
  },
  methods: {
    incrementSeconds() {
      if (!this.isGamePaused && !this.isGameOver) {
        this.seconds += 1;
      }
    },
    start() {
      if (this.intervalFn) {
        window.clearInterval(this.intervalFn);
      }
      this.intervalFn = window.setInterval(this.incrementSeconds, 1000);
    },
    reset() {
      if (this.intervalFn) {
        window.clearInterval(this.intervalFn);
      }
      this.seconds = 0;
    },
  },
};
</script>

<style scoped>

.time-ctr {
  margin: 0;
  padding: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

</style>
