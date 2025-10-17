<template>
  <teleport to="body">
    <div class="rf-overlay" :style="{ zIndex: zIndex.toString() }" aria-hidden="true">
      <div class="rf-layer">
        <span
          v-for="p in petals"
          :key="p.id"
          class="rf-petal"
          :style="styleFor(p)"
          @mouseenter="nudge(p)"
          >🌹</span
        >
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  density: { type: Number, default: 18 }, // THƯA
  zIndex: { type: Number, default: 2147482000 },
});

const petals = ref([]);

function mkPetal(i) {
  const sizes = [14, 16, 18, 20, 22];
  return {
    id: "p" + i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    dur: 16 + Math.random() * 10, // chậm & mượt
    drift: 24 + Math.random() * 48,
    sway: 4 + Math.random() * 8,
    size: sizes[Math.floor(Math.random() * sizes.length)],
    rot: Math.floor(Math.random() * 360),
    scale: 0.9 + Math.random() * 0.5,
    push: 0,
  };
}
function styleFor(p) {
  return `
    left:${p.left}vw;
    animation-delay:${p.delay.toFixed(2)}s;
    animation-duration:${p.dur.toFixed(2)}s;
    font-size:${p.size}px;
    transform: translateX(${p.push}px) scale(${p.scale}) rotate(${p.rot}deg);
    --drift:${p.drift}px; --sway:${p.sway}deg;
  `;
}
function nudge(p) {
  p.push = (Math.random() < 0.5 ? -1 : 1) * (12 + Math.random() * 18);
  p.rot += 360;
  setTimeout(() => (p.push = 0), 400);
}

let tick;
onMounted(() => {
  petals.value = Array.from({ length: props.density }, (_, i) => mkPetal(i));
  // thay mới 1 bông mỗi 4s để chuyển động tự nhiên
  tick = setInterval(() => {
    const i = Math.floor(Math.random() * petals.value.length);
    petals.value.splice(i, 1, mkPetal(Date.now()));
  }, 4000);
});
onBeforeUnmount(() => clearInterval(tick));
</script>

<style scoped>
/* trước: pointer-events: auto; -> đang chặn toàn bộ */
.rf-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  /* ✅ click xuyên qua */
}

.rf-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  /* ✅ lớp chứa không bắt sự kiện */
}

/* chỉ riêng từng bông mới bắt sự kiện hover */
.rf-petal {
  position: absolute;
  top: -10vh;
  pointer-events: auto;
  /* ✅ cho phép hover trên chính emoji */
  user-select: none;
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.06));
  animation-name: rf-fall, rf-sway;
  animation-timing-function: linear, ease-in-out;
  animation-iteration-count: infinite, infinite;
  will-change: transform, top;
}

@keyframes rf-fall {
  0% {
    top: -10vh;
    opacity: 0;
  }

  6% {
    opacity: 0.98;
  }

  100% {
    top: 110vh;
    opacity: 0.98;
  }
}

@keyframes rf-sway {
  0% {
    transform: translateX(0) rotate(0);
  }

  50% {
    transform: translateX(var(--drift)) rotate(var(--sway));
  }

  100% {
    transform: translateX(0) rotate(0);
  }
}
</style>
