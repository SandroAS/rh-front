<script setup lang="ts">
const randomStyle = () => {
  const x = (Math.random() - 0.5) * 200
  const y = (Math.random() - 1) * 300
  const rotate = Math.random() * 360
  const delay = Math.random() * 0.2

  return {
    transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
    animationDelay: `${delay}s`,
  }
}
</script>

<template>
  <div class="money-explosion">
    <span v-for="n in 15" :key="n" class="money" :style="randomStyle()">💵</span>
  </div>
</template>

<style scoped>
.money-explosion {
  position: absolute;
  pointer-events: none;
  left: 73%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.money {
  position: absolute;
  font-size: 24px;
  animation: fly 2s ease-out forwards;
  opacity: 0;
}
@keyframes fly {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}
</style>
