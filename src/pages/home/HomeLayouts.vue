<template>
    <!-- 🎞️ Filmstrip banner -->
    <a-card :bordered="false" style="margin-bottom:16px" class="fx-root" :class="{ 'fx-ready': effectsReady }">
        <!-- Header -->
        <div class="section-header fx fx-up delay-1">
            <span class="section-badge fx fx-pop delay-2">
                <CameraOutlined />
            </span>
            <div class="section-heading">
                <h2 class="section-title fx fx-swipe delay-3">Hình ảnh hoạt động công ty</h2>
                <p class="section-sub fx fx-fade delay-4">Khoảnh khắc nổi bật từ công ty</p>
            </div>
        </div>

        <!-- Filmstrip -->
        <div class="cinema fx fx-rise delay-5" @mouseenter="paused = true" @mouseleave="paused = false">
            <div class="edge-fade left"></div>
            <div class="edge-fade right"></div>

            <div class="reel">
                <div class="strip" :class="{ paused }">
                    <!-- dải 1 (stagger từng frame) -->
                    <div v-for="(s, i) in heroSlides" :key="'a-' + i" class="frame fx fx-zoom-in"
                        :style="staggerStyle(i)" :title="s.title" @click="openPreview(i)">
                        <picture>
                            <source :srcset="s.thumbAvif" type="image/avif" />
                            <source :srcset="s.thumbWebp" type="image/webp" />
                            <img :src="s.thumbWebp || s.thumbAvif" :alt="s.title" loading="lazy" decoding="async"
                                fetchpriority="low" />
                        </picture>
                    </div>

                    <!-- dải 2 (loop mượt) -->
                    <div v-for="(s, i) in heroSlides" :key="'b-' + i" class="frame" aria-hidden="true">
                        <picture>
                            <source :srcset="s.thumbAvif" type="image/avif" />
                            <source :srcset="s.thumbWebp" type="image/webp" />
                            <img :src="s.thumbWebp || s.thumbAvif" :alt="s.title" loading="lazy" decoding="async"
                                fetchpriority="low" />
                        </picture>
                    </div>
                </div>
            </div>
        </div>
    </a-card>

    <!-- 🔍 Preview Group: chỉ mount khi mở để KHÔNG preload full -->
    <a-image-preview-group v-if="previewVisible" :preview="previewConfig">
        <a-image v-for="(s, i) in heroSlides" :key="'pg-' + i" :src="s.full" :alt="s.title" style="display: none" />
    </a-image-preview-group>

    <!-- ↓ Hàng 2 card như cũ -->
    <a-row :gutter="[16, 16]" align="stretch" class="dash-row">
        <a-col :xs="24" :lg="10">
            <CompanyNews />
        </a-col>
        <a-col :xs="24" :lg="14">
            <MyTodaySchedule />
        </a-col>
    </a-row>
</template>

<script setup>
import { CameraOutlined } from '@ant-design/icons-vue'
import CompanyNews from './components/CompanyNews.vue'
import MyTodaySchedule from './components/MyTodaySchedule.vue'
import { ref, computed, onMounted, nextTick } from 'vue'

/* ===== State ===== */
const heroSlides = ref([])
const paused = ref(false)

/* Preview control */
const previewVisible = ref(false)
const previewIndex = ref(0)
const previewConfig = computed(() => ({
    visible: previewVisible.value,
    onVisibleChange: (v) => (previewVisible.value = v),
    current: previewIndex.value,
    onChange: (idx) => (previewIndex.value = idx),
}))
const openPreview = (idx) => {
    previewIndex.value = idx
    previewVisible.value = true
}

/* ===== Hiệu ứng hậu-load ===== */
const effectsReady = ref(false)
const STAGGER_MS = 60
const MAX_WAIT = 1500
const staggerStyle = (i) => ({ '--delay': `${i * STAGGER_MS}ms` })

async function gentlyPreload(list) {
    // Preload nhẹ 2–3 thumb đầu để bật hiệu ứng sớm
    const first = list.slice(0, Math.min(3, list.length))
    const loaders = first.map((s) => new Promise((res) => {
        const im = new Image()
        im.onload = im.onerror = () => res(true)
        im.src = s.thumbWebp || s.thumbAvif
    }))
    const t = setTimeout(() => (effectsReady.value = true), MAX_WAIT)
    await Promise.allSettled(loaders)
    clearTimeout(t)
    effectsReady.value = true
}

/* ===== Lifecycle ===== */
onMounted(async () => {
    try {
        const res = await fetch('/home/manifest.json', { cache: 'no-cache' })
        if (!res.ok) throw new Error('Cannot load manifest')
        const arr = await res.json()
        heroSlides.value = arr
    } catch (e) {
        console.error(e)
        heroSlides.value = [] // fallback nếu cần
    } finally {
        // Bật hiệu ứng sau khi DOM cập nhật + dữ liệu sẵn sàng
        await nextTick()
        if (heroSlides.value.length) {
            gentlyPreload(heroSlides.value)
        } else {
            effectsReady.value = true
        }
    }

    // Tự động pause khi filmstrip ra khỏi viewport
    const el = document.querySelector('.cinema')
    if (el) {
        const io = new IntersectionObserver(([ent]) => {
            paused.value = !ent.isIntersecting
        }, { threshold: 0.01 })
        io.observe(el)
    }
})
</script>

<style scoped>
/* ========= FX system (chỉ thêm, không đổi UI) ========= */
.fx-root {
    position: relative;
}

.fx {
    opacity: 0;
    transform: translateY(6px);
    will-change: transform, opacity;
}

.fx-ready .fx {
    animation-fill-mode: both;
    animation-duration: 2s;
    /* chậm gấp đôi */
    animation-timing-function: cubic-bezier(.2, .8, .2, 1);
}


.fx-up {
    animation-name: fx-up;
}

.fx-pop {
    animation-name: fx-pop;
    transform: none;
}

.fx-rise {
    animation-name: fx-rise;
}

.fx-fade {
    animation-name: fx-fade;
    transform: none;
}

.fx-zoom-in {
    animation-name: fx-zoom-in;
    transform: scale(.96);
}

.delay-1 {
    animation-delay: 60ms;
}

.delay-2 {
    animation-delay: 140ms;
}

.delay-3 {
    animation-delay: 240ms;
}

.delay-4 {
    animation-delay: 340ms;
}

.delay-5 {
    animation-delay: 440ms;
}

/* dải 1: stagger từng frame bằng custom prop --delay */
.fx-ready .fx-zoom-in {
    animation-delay: var(--delay, 0ms);
}

@keyframes fx-up {
    0% {
        opacity: 0;
        transform: translateY(12px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Sửa lại fx-pop để giữ opacity sau khi kết thúc */
@keyframes fx-pop {
    0% {
        opacity: 0;
        transform: scale(.86);
    }

    60% {
        opacity: 1;
        transform: scale(1.06);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }

}


@keyframes fx-rise {
    0% {
        opacity: 0;
        transform: translateY(16px) scale(.98);
    }

    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes fx-fade {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

@keyframes fx-zoom-in {
    0% {
        opacity: 0;
        transform: scale(.94);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

/* Swipe reveal cho heading */
.fx-swipe {
    position: relative;
    animation-name: fx-swipe;
    transform: none;
}

.fx-ready .fx-swipe::after {
    content: "";
    position: absolute;
    inset: 0 0 -6px 0;
    border-radius: 8px;
    background: linear-gradient(90deg, rgba(192, 98, 82, .0), rgba(192, 98, 82, .35), rgba(192, 98, 82, .0));
    opacity: 0;
    pointer-events: none;
    animation: fx-sheen 900ms 300ms ease forwards;
}

@keyframes fx-swipe {
    0% {
        opacity: 0;
        clip-path: inset(0 100% 0 0);
    }

    100% {
        opacity: 1;
        clip-path: inset(0 0 0 0);
    }
}

@keyframes fx-sheen {
    0% {
        opacity: 0;
        transform: translateX(-30%);
    }

    20% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        transform: translateX(120%);
    }
}

/* Tôn trọng người dùng không thích animation */
@media (prefers-reduced-motion: reduce) {

    .fx,
    .fx-ready .fx {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
    }

    .strip {
        animation-duration: 999s;
    }

    /* làm chậm filmstrip */
}

/* ===== Section header (title có dấu ấn) ===== */
.section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 4px 4px 12px;
}

.section-badge {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: conic-gradient(from 220deg, #c06252, #e38f7f 40%, #c06252 80%, #a74f41);
    box-shadow: 0 4px 10px rgba(192, 98, 82, .25);
}

.section-badge :deep(svg) {
    font-size: 20px;
    color: #fff;
}

.section-heading {
    line-height: 1;
}

.section-title {
    margin: 0;
    font-weight: 900;
    font-size: clamp(18px, 2.4vw, 26px);
    letter-spacing: .2px;
    background: linear-gradient(90deg, #c06252 0%, #8d3f33 55%, #2b2b2b 120%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    position: relative;
    display: inline-block;
    padding-bottom: 6px;
}

.section-title::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 6px;
    background: linear-gradient(90deg, rgba(192, 98, 82, .25), rgba(192, 98, 82, .9) 40%, rgba(192, 98, 82, .25));
    border-radius: 8px;
}

.section-sub {
    margin: 6px 0 0;
    font-size: 12.5px;
    color: #6b7280;
}

/* ===== Cinematic filmstrip ===== */
.cinema {
    --h: clamp(220px, 30vh, 420px);
    /* chiều cao khung */
    --gap: 14px;
    /* khoảng giữa khung */
    --r: 14px;
    /* bo góc ngoài */
    --dur: 400s;
    /* tốc độ chạy 1 vòng */
    position: relative;
    border-radius: var(--r);
    background: radial-gradient(120% 140% at 50% -20%, white 0, white 55%, white 100%);
    overflow: hidden;
    box-shadow: 0 10px 24px rgba(255, 255, 255, 0.25);
}

.edge-fade {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 12%;
    pointer-events: none;
    z-index: 3;
}

.edge-fade.left {
    left: 0;
    background: linear-gradient(90deg, rgba(9, 11, 16, 1) 0%, rgba(9, 11, 16, 0) 100%);
}

.edge-fade.right {
    right: 0;
    background: linear-gradient(270deg, rgba(9, 11, 16, 1) 0%, rgba(9, 11, 16, 0) 100%);
}

.reel {
    position: relative;
    padding: 25px 0;
    overflow: hidden;
}

.reel::before,
.reel::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 22px;
    z-index: 2;
    background: linear-gradient(#c06252, #c06252);
    -webkit-mask: radial-gradient(circle 5px at 12px 50%, transparent 98%, #c06252 100%) repeat-x;
    mask: radial-gradient(circle 5px at 12px 50%, transparent 98%, #c06252 100%) repeat-x;
    -webkit-mask-size: 44px 22px;
    mask-size: 44px 22px;
}

.reel::before {
    top: 0;
}

.reel::after {
    bottom: 0;
    transform: scaleY(-1);
}

.strip {
    display: flex;
    gap: var(--gap);
    width: max-content;
    padding: 0 var(--gap);
    animation: reel-move var(--dur) linear infinite;
    will-change: transform;
}

.strip.paused {
    animation-play-state: paused;
}

@keyframes reel-move {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(calc(-50% - var(--gap)));
    }
}

/* Khung ảnh */
.frame {
    position: relative;
    height: var(--h);
    aspect-ratio: 16/9;
    flex: 0 0 auto;
    border-radius: 10px;
    overflow: hidden;
    background: #000;
    box-shadow: 0 6px 14px rgba(0, 0, 0, .25);
    transition: transform .35s ease;
}

.frame:hover {
    transform: translateY(-2px);
}

.frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform .6s ease, filter .4s ease;
    will-change: transform;
}

.frame:hover img {
    transform: scale(1.05);
    filter: saturate(1.05) contrast(1.02);
}

/* Caption kính mờ (nếu muốn bật) */
.cap {
    position: absolute;
    left: 10px;
    bottom: 10px;
    right: 10px;
    display: flex;
    justify-content: flex-start;
    pointer-events: none;
}

.cap span {
    max-width: 70%;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    padding: 6px 10px;
    border-radius: 8px;
    background: rgba(15, 17, 22, .45);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .08);
}

/* (giữ các style card phía dưới nguyên) */
.dash-row :deep(.ant-col) {
    display: flex;
}

.dash-row :deep(.ant-card) {
    width: 100%;
    height: 100%;
}

:deep(.ant-card-body) {
    padding: 16px !important;
}
</style>
