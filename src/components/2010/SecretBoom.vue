<template>
    <teleport to="body">
        <div v-if="visible" class="sb-wrap" :style="{ zIndex: zIndex.toString() }">
            <div class="backdrop"></div>

            <!-- BOOM khung cố định -->
            <div ref="boomWrap" class="boom">
                <!-- Layer chỉ để animate, rồi trả về scale=1 -->
                <div ref="scaleLayer" class="scale-layer">
                    <!-- ánh sáng quét -->
                    <div ref="sweep" class="sweep"></div>
                    <!-- vầng sáng nền -->
                    <div ref="aura" class="aura"></div>

                    <!-- shockwave vòng nổ -->
                    <div ref="shock" class="shock"></div>
                    <div ref="rings" class="rings">
                        <span class="ring r1"></span><span class="ring r2"></span><span class="ring r3"></span>
                    </div>

                    <!-- nội dung 2 cột -->
                    <div class="inner" ref="inner">
                        <div class="flower">
                            <img ref="roseImg" :src="rosePng" alt="Rose" />
                        </div>
                        <div ref="cardIn" class="card-in" aria-live="polite">
                            <h3 class="t1"><span ref="titleSpan"></span></h3>
                            <p class="t2"><span ref="msgSpan"></span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div ref="confetti" class="confetti" aria-hidden="true"></div>
            <button v-if="canClose" class="btn" @click="close">Đóng</button>
        </div>
    </teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap } from 'gsap'
import rosePng from '@/assets/images/flower.png'

// =====================
// PROPS & CONSTANTS
// =====================
const props = defineProps({
  zIndex: { type: Number, default: 2147483600 },
  autoStartAfter: { type: Number, default: 6 },
  messages: { type: Array, default: () => [] },
  onceEver: { type: Boolean, default: false }
})
const STORAGE_KEY = 'secret_boom_cinematic_once_v1'

// =====================
// REFS (DOM / STATE)
// =====================
const visible = ref(false)
const canClose = ref(false)

const boomWrap = ref(null)
const scaleLayer = ref(null)
const inner = ref(null)
const rings = ref(null)
const shock = ref(null)
const sweep = ref(null)
const aura = ref(null)
const roseImg = ref(null)
const cardIn = ref(null)
const titleSpan = ref(null)
const msgSpan = ref(null)
const confetti = ref(null)

// Runtime handles
const tlRef = ref(null)
let startTimer = null
let abortTyping = { current: false }

// =====================
// TEXT POOL
// =====================
const defaultList = [
  'Chúc mừng ngày Phụ nữ Việt Nam 20/10! Chúc tất cả phụ nữ luôn xinh đẹp, hạnh phúc và thành công trong mọi lĩnh vực của cuộc sống.',
  'Ngày Phụ nữ Việt Nam, chúc toàn thể phái nữ luôn rạng ngời, tràn đầy năng lượng và hạnh phúc trong từng khoảnh khắc.',
  'Chúc tất cả những người phụ nữ xung quanh tôi luôn được yêu thương, trân trọng và đạt được những gì mình mong muốn.',
  'Chúc một nửa thế giới có một ngày 20/10 thật đặc biệt và đầy ắp niềm vui bên gia đình và bạn bè.',
  'Mong rằng không chỉ ngày hôm nay, mà mỗi ngày phái nữ đều được đối xử như một nữ hoàng!',
  'Ngày 20/10 chúc bạn luôn vui vẻ, tự tin và đầy nghị lực để chinh phục mọi thử thách trong cuộc sống.',
  'Chúc những người phụ nữ tuyệt vời luôn được hạnh phúc và bình an. Hãy sống cuộc sống của mình một cách trọn vẹn nhất!',
  'Ngày Phụ nữ Việt Nam, chúc tất cả phụ nữ luôn yêu đời, yêu bản thân và nhận được nhiều yêu thương từ những người xung quanh.',
  'Chúc phái nữ một ngày 20/10 rực rỡ, thành công và luôn tỏa sáng trong mọi hoàn cảnh.',
  'Chúc những người phụ nữ mạnh mẽ, tự lập luôn có được sự công nhận và thành công mà họ xứng đáng.',
  'Nhân ngày 20/10, chúc tất cả phái nữ luôn là chính mình và tự tin bước đi trên con đường mình đã chọn.',
  'Chúc cho mọi phụ nữ luôn có sức khỏe, hạnh phúc và được yêu thương không chỉ hôm nay mà suốt cả cuộc đời.',
  'Chúc các bạn nữ mãi mãi xinh đẹp và rạng rỡ như những đóa hoa tươi thắm trong vườn cuộc sống.',
  'Chúc tất cả phụ nữ luôn đạt được ước mơ và hoài bão, dù lớn hay nhỏ, dù xa hay gần.',
  'Chúc bạn ngày 20/10 tràn ngập niềm vui, may mắn và những điều tốt đẹp nhất!'
]

// =====================
// UTILITIES
// =====================
function pickMsg () {
  const list = props.messages?.length ? props.messages : defaultList
  return list[Math.floor(Math.random() * list.length)]
}

function getMaxCrispScaleForImg (imgEl) {
  if (!imgEl || !imgEl.naturalWidth) return 1
  const dpr = window.devicePixelRatio || 1
  const cssW = imgEl.clientWidth * dpr
  const cssH = imgEl.clientHeight * dpr
  const maxScaleW = imgEl.naturalWidth / cssW
  const maxScaleH = imgEl.naturalHeight / cssH
  // an toàn một chút để tránh aliasing rìa
  return Math.max(1, Math.min(maxScaleW, maxScaleH) * 0.98)
}

function confettiBurst (layer, count = 56) {
  if (!layer) return
  const EMO = ['✨', '💖', '🌸', '💐', '🌷', '🩷']
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.textContent = EMO[Math.floor(Math.random() * EMO.length)]
    Object.assign(el.style, {
      position: 'fixed',
      left: (Math.random() * 100) + 'vw',
      top: '-6vh',
      fontSize: (16 + Math.random() * 14) + 'px',
      transform: `rotate(${Math.random() * 360}deg)`,
      pointerEvents: 'none',
      animation: `fall ${1100 + Math.random() * 800}ms ease-in forwards`,
      animationDelay: (Math.random() * 250) + 'ms',
      zIndex: (props.zIndex + 2).toString()
    })
    layer.appendChild(el)
    setTimeout(() => el.remove(), 2200)
  }
}

async function typeText (el, text, cps = 30) {
  if (!el) return
  el.textContent = ''
  abortTyping.current = false
  for (let i = 0; i <= text.length; i++) {
    if (abortTyping.current) return
    el.textContent = text.slice(0, i)
    // eslint-disable-next-line no-await-in-loop
    await new Promise(r => setTimeout(r, 1000 / cps))
  }
}

// Detect reduced motion
const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false

// =====================
// ANIMATION ENTRYPOINT
// =====================
async function start () {
  if (props.onceEver && localStorage.getItem(STORAGE_KEY) === '1') return
  visible.value = true
  await nextTick()

  // Clear any old timeline
  if (tlRef.value) {
    tlRef.value.kill()
    tlRef.value = null
  }

  // Prep 3D & compositing
  gsap.set(scaleLayer.value, {
    scale: 1, rotationX: 0, rotationY: 0,
    transformOrigin: '50% 50%',
    transformPerspective: 900,
    transformStyle: 'preserve-3d',
    willChange: 'transform',
    force3D: true
  })

  gsap.set([roseImg.value, cardIn.value], { autoAlpha: 0, y: 10 })
  gsap.set([sweep.value, aura.value, shock.value], { autoAlpha: 0 })
  gsap.set(rings.value?.querySelectorAll?.('.ring') ?? [], { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' })

  // Compute crisp target scale
  const MAX_ROSE_SCALE = getMaxCrispScaleForImg(roseImg.value)
  const BASE_TARGET = 1.55
  const TARGET_SCALE = Math.min(BASE_TARGET, MAX_ROSE_SCALE)

  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })
  tlRef.value = tl

  const pulseScale = Math.min(1.08, TARGET_SCALE)

  // If user prefers reduced motion, keep minimal
  if (prefersReduced) {
    gsap.set([shock.value, aura.value, sweep.value, rings.value?.querySelectorAll?.('.ring') ?? []], { autoAlpha: 0 })
    gsap.set(scaleLayer.value, { scale: 1 })
    gsap.set(roseImg.value, { autoAlpha: 1, y: 0, scale: 1, filter: 'drop-shadow(0 14px 44px rgba(0,0,0,.35))' })
    gsap.set(cardIn.value, { autoAlpha: 1, y: 0 })
  } else {
    // 1) pre-pulse
    tl.to(scaleLayer.value, { scale: pulseScale, duration: 0.22, ease: 'sine.out' })
      .to(scaleLayer.value, { scale: 1.0, duration: 0.18, ease: 'sine.in' })

      // 2) shockwave + glow + light sweep
      .addLabel('boom', '+=0.02')

      // shockwave
      .fromTo(shock.value,
        { autoAlpha: 0, scale: 0.2, filter: 'blur(10px)' },
        { autoAlpha: 1, scale: 1.35, filter: 'blur(0px)', duration: 0.35, ease: 'power3.out' }, 'boom')
      .to(shock.value,
        { autoAlpha: 0, scale: 1.6, filter: 'blur(12px)', duration: 0.35, ease: 'power2.in' }, 'boom+=0.22')

      // aura
      .fromTo(aura.value,
        { autoAlpha: 0, scale: 0.85, filter: 'blur(10px)' },
        { autoAlpha: 0.85, scale: 1.15, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' }, 'boom+=0.06')
      .to(aura.value, { autoAlpha: 0, duration: 0.35, ease: 'power1.in' }, 'boom+=0.5')

      // rings
      .to(rings.value?.querySelectorAll?.('.ring') ?? [], {
        scale: (i) => [1.7, 2.4, 3.1][i] ?? 2,
        autoAlpha: 1,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power3.out'
      }, 'boom+=0.02')
      .to(rings.value?.querySelectorAll?.('.ring') ?? [], {
        autoAlpha: 0,
        duration: 0.34,
        stagger: 0.05,
        ease: 'power1.in'
      }, 'boom+=0.28')

      // sweep
      .fromTo(sweep.value,
        { autoAlpha: 0, xPercent: -130, skewX: -12 },
        { autoAlpha: 1, xPercent: 130, duration: 1.05, ease: 'power2.out' }, 'boom+=0.08')
      .to(sweep.value, { autoAlpha: 0, duration: 0.2 }, 'boom+=0.95')

      // 3) nở mạnh + parallax 3D, clamp scale
      .to(scaleLayer.value, {
        scale: TARGET_SCALE, rotationX: -7, rotationY: 6, duration: 0.6, ease: 'power4.out'
      }, 'boom+=0.05')
      .to(scaleLayer.value, {
        scale: 1, rotationX: 0, rotationY: 0, duration: 0.4, ease: 'power3.out'
      }, '+=0.05')
      .add(() => gsap.set(scaleLayer.value, { clearProps: 'transform' }))

      // 4) nội dung: hoa + card
      .fromTo(roseImg.value,
        { autoAlpha: 0, y: 12, scale: 0.9, filter: 'drop-shadow(0 6px 12px rgba(0,0,0,.2))' },
        {
          autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.6)',
          onUpdate: () => {
            // giữ filter cố định nét ở cuối để tránh soft khi blur động
            if (roseImg.value) {
              roseImg.value.style.filter = 'drop-shadow(0 14px 44px rgba(0,0,0,.35))'
            }
          }
        }, '-=0.1')
      .to(cardIn.value, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.2')
  }

  // 5) typewriter + confetti + enable close
  tl.add(async () => {
    abortTyping.current = false
    await typeText(titleSpan.value, 'Happy 20/10 ✨', 36)
    await typeText(msgSpan.value, pickMsg(), 30)
  }, '+=0.02')
  tl.add(() => confettiBurst(confetti.value, 64), '-=0.1')
  tl.add(() => { canClose.value = true }, '+=0.3')
}

function close () {
  visible.value = false
  if (props.onceEver) localStorage.setItem(STORAGE_KEY, '1')
  // stop animations & typing
  if (tlRef.value) {
    tlRef.value.kill()
    tlRef.value = null
  }
  abortTyping.current = true
}

onMounted(() => {
  if (props.onceEver && localStorage.getItem(STORAGE_KEY) === '1') return

  // Defer start if image not yet loaded to compute naturalWidth accurately
  const tryStart = () => {
    if (startTimer) clearTimeout(startTimer)
    startTimer = setTimeout(start, props.autoStartAfter * 1000)
  }

  if (roseImg.value && !roseImg.value.complete) {
    roseImg.value.addEventListener('load', tryStart, { once: true })
  } else {
    tryStart()
  }
})

onBeforeUnmount(() => {
  if (startTimer) {
    clearTimeout(startTimer)
    startTimer = null
  }
  if (tlRef.value) {
    tlRef.value.kill()
    tlRef.value = null
  }
  abortTyping.current = true
  // cleanup confetti children if any
  if (confetti.value) {
    try {
      confetti.value.querySelectorAll('*').forEach(n => n.remove())
    } catch (e) { /* noop */ }
  }
})

// Optionally expose controls to parent
defineExpose({ start, close })
</script>

<style scoped>
/* overlay */
.sb-wrap {
    position: fixed;
    inset: 0;
}

.backdrop {
    position: absolute;
    inset: 0;
    background: rgba(255, 240, 246, .78);
}

/* BOOM khung cố định (~1/2 màn, rất nét) */
.boom {
    position: absolute;
    left: 50%;
    top: 46%;
    transform: translate(-50%, -50%);
    width: clamp(520px, 50vw, 980px);
    min-height: clamp(260px, 45vh, 440px);
    border-radius: 30px;
    background:
        radial-gradient(120% 120% at 30% 20%, #ffd2dc 0%, rgba(255, 210, 220, .0) 40%),
        radial-gradient(circle at 40% 35%, #ff8faa, #ff6f91 60%, #d94c6f 100%);
    box-shadow: 0 18px 60px rgba(192, 98, 82, .35);
    overflow: hidden;
    z-index: 30;
}

.scale-layer {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
}

/* ánh sáng quét */
.sweep {
    position: absolute;
    inset: -10%;
    background: linear-gradient(120deg, transparent 45%, rgba(255, 255, 255, .65) 50%, transparent 55%);
    mix-blend-mode: screen;
    pointer-events: none;
}

/* aura nền */
.aura {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 160%;
    height: 160%;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    background: radial-gradient(circle, rgba(255, 205, 214, .9), rgba(255, 205, 214, 0) 60%);
    filter: blur(10px);
    pointer-events: none;
}

/* shockwave */
.shock {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 26%;
    height: 26%;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    border: 3px solid rgba(255, 255, 255, .95);
    box-shadow: 0 0 26px rgba(255, 255, 255, .6), inset 0 0 12px rgba(255, 255, 255, .5);
    pointer-events: none;
}

/* grid 2 cột */
.inner {
    position: absolute;
    inset: clamp(12px, 2.2vw, 22px);
    display: grid;
    grid-template-columns: 42% 1fr;
    gap: clamp(10px, 2vw, 20px);
    align-items: center;
}

/* Hoa */
.flower {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.flower img {
    width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 10px 36px rgba(0, 0, 0, .25));
    image-rendering: -webkit-optimize-contrast;
}

/* Card */
.card-in {
    background: rgba(255, 255, 255, .95);
    border: 1px solid #ffd6e0;
    border-radius: 18px;
    padding: clamp(14px, 2.2vw, 22px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, .12);
    text-align: center;
}

.t1 {
    color: #c06252;
    font-weight: 800;
    margin-bottom: 8px;
    font-size: clamp(18px, 2.4vw, 28px);
}

.t2 {
    color: #8a4d43;
    font-size: clamp(14px, 2vw, 18px);
    line-height: 1.6;
}

/* rings */
.rings {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.ring {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 38%;
    height: 38%;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    border: 3px solid rgba(255, 255, 255, .85);
    box-shadow: 0 0 24px rgba(255, 255, 255, .35);
}

.r2 {
    width: 54%;
    height: 54%;
    border-width: 2px;
}

.r3 {
    width: 70%;
    height: 70%;
    border-width: 2px;
}

/* confetti */
.confetti {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

@keyframes fall {
    to {
        transform: translateY(105vh) rotate(720deg);
        opacity: .95
    }
}

/* Close */
.btn {
    position: absolute;
    bottom: clamp(12px, 3vh, 24px);
    left: 50%;
    transform: translateX(-50%);
    height: 44px;
    padding: 0 22px;
    border-radius: 999px;
    border: 1px solid #c06252;
    background: #c06252;
    color: #fff;
    font-weight: 700;
    cursor: pointer;
}

/* Mobile: full width, 1 cột */
@media (max-width: 768px) {
    .boom {
        width: 94vw;
        top: 50%;
        transform: translate(-50%, -50%);
        min-height: 52vh;
        max-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 24px);
        border-radius: 24px;
    }

    /* 1 cột: card ở trên, hoa ở dưới */
    .inner {
        position: absolute;
        inset: 12px;
        display: grid;
        grid-template-areas:
            "card"
            "flower";
        grid-template-columns: 1fr;
        gap: 12px;
        align-content: start;
    }

    .card-in {
        grid-area: card;
        background: rgba(255, 255, 255, .97);
        border-radius: 16px;
        padding: 14px;
    }

    .flower {
        grid-area: flower;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 0;
    }

    /* Ảnh hoa: tự co, không vượt quá 32vh */
    .flower img {
        width: 82%;
        height: auto;
        max-height: clamp(140px, 40vh, 320px);
        display: block;
        margin: 0 auto;
        margin-top: 247px;
    }

    .t1 {
        font-size: clamp(18px, 6vw, 22px);
        line-height: 1.25;
        margin-bottom: 6px;
    }

    .t2 {
        font-size: clamp(13px, 4.2vw, 16px);
        line-height: 1.55;
    }

    .btn {
        bottom: calc(12px + env(safe-area-inset-bottom));
    }
}
</style>
