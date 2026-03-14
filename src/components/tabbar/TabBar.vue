<template>
  <div id="tab-bar" v-show="!keyboardVisible">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "TabBar",
  data() {
    return {
      keyboardVisible: false,
      originalHeight: 0
    }
  },
  mounted() {
    this.originalHeight = window.innerHeight
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onResize() {
      this.keyboardVisible = window.innerHeight < this.originalHeight * 0.85
    }
  }
}
</script>

<style scoped>
#tab-bar {
  display: flex;
  background-color: #f6f6f6;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  box-shadow: 0 -1px 1px rgba(100,100,100,.2);
}
</style>