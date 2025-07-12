<template>
  <div class="marquee-bar">
    <div class="marquee-text">
      HỆ THỐNG PORTAL - CTY TNHH VINH GIA
    </div>
  </div>
</template>

<style scoped>
.marquee-bar {
  width: 100%;
  height: 28px;
  overflow: hidden;
  background-color:#c06252;
  display: flex;
  align-items: center;
  position: relative;

}

.marquee-text {
  display: inline-block;
  white-space: nowrap;
  font-size: 16px;
  font-weight: bold;
  color: white;
  animation: scroll-left 10s linear infinite;
  padding-left: 100%;
}

@keyframes scroll-left {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
