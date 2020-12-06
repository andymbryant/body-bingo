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
  },
  methods: {
    isActionComplete() {
      const flag = this.action.isComplete;
      console.log(flag);
      return flag;
    },
  },
  computed: {
    cardClass() {
      return {
        'card-ctr': true,
        complete: this.isActionComplete(),
      };
    },
  },
};
</script>

<style scoped>
  .card-ctr {
    border-radius: 10px;
    border: 1px solid black;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: grey;
    color: white;
    font-size: 1.2rem;
    font-weight: 700;
    padding: 0.5rem;
  }
  .complete {
    background-color: green
  }
</style>
