<template>
  <div :class='cardClass'>
    <div class='card-title'>Touch
      <span :class="[action.partOneName]">{{action.partOneName}}</span> to
      <span :class='[action.partTwoName]'>{{action.partTwoName}}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionCard',
  props: {
    action: {
      type: Object,
      required: true,
    },
    isGameActive: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    isActionComplete() {
      return this.action.isComplete;
    },
  },
  computed: {
    cardClass() {
      return {
        'card-ctr': true,
        complete: this.isActionComplete(),
        active: this.isGameActive,
      };
    },
    colorClass() {
      return {

      };
    },
  },
};
</script>

<style scoped>
  .card-ctr {
    /* border: 1px solid black; */
    border-top: 1px solid black;
    border-right: 1px solid black;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(236, 236, 236);

    padding: 0.5rem;
    transition: all 0.5s;
    /* filter:blur(5px) */
  }
  .active {
    filter: none;
  }
  .complete {
    background-color: rgb(204, 255, 204);
  }
  .card-title {
    color: black;
    font-size: 1.2rem;
    font-weight: 700;
  }

  .leftElbow {
    color: blue;
  }

  .rightElbow {
    color: magenta;
  }

  .leftWrist {
    color: darkorange;
  }

  .rightWrist {
    color: salmon;
  }

  .nose {
    color: crimson;
  }

  .leftEar {
    color: darkgreen;
  }
  .rightEar {
    color: darkorchid;
  }
  .leftShoulder {
    color: hotpink;
  }

  .rightShoulder {
    color: skyblue;
  }
</style>
