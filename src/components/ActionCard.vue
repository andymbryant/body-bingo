<template>
  <div :class='cardClass'>
    <div class='card-title'>Touch
      <span :class="[action.partOneName]">{{getPartName(action.partOneName)}}</span> to
      <span :class='[action.partTwoName]'>{{getPartName(action.partTwoName)}}</span>
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
    getPartName(name) {
      switch (name) {
        case 'leftEar':
          return 'Left Ear';
        case 'rightEar':
          return 'Right Ear';
        case 'leftElbow':
          return 'Left Elbow';
        case 'rightElbow':
          return 'Right Elbow';
        case 'leftWrist':
          return 'Left Wrist';
        case 'rightWrist':
          return 'Right Wrist';
        case 'leftShoulder':
          return 'Left Shoulder';
        case 'rightShoulder':
          return 'rightShoulder';
        case 'nose':
          return 'Nose';
        case 'topLeft':
          return 'Top Left of Screen';
        case 'topRight':
          return 'Top Right of Screen';
        case 'bottomLeft':
          return 'Bottom Left of Screen';
        case 'bottomRight':
          return 'Bottom Right of Screen';

        default: return name;
      }
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
    background-color: rgb(152, 233, 152);
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

  .topLeft, .bottomLeft, .topRight, .bottomRight {
    color: grey;
  }
</style>
