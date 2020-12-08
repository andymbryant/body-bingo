<template>
  <div :class='cardClass'>{{action.name}}</div>
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
    background-color: rgb(204, 204, 204);
    color: black;
    font-size: 1.2rem;
    font-weight: 700;
    padding: 0.5rem;
    transition: all 0.5s;
    /* filter:blur(5px) */
  }
  .active {
    filter: none;
  }
  .complete {
    background-color: green
  }
</style>
