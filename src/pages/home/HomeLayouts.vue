<template>
    <!-- 🎞️ Filmstrip banner -->
    <a-card :bordered="false" style="margin-bottom:16px">
        <!-- Header -->
        <div class="section-header">
            <span class="section-badge">
                <CameraOutlined />
            </span>
            <div class="section-heading">
                <h2 class="section-title">Hình ảnh hoạt động công ty</h2>
                <p class="section-sub">Khoảnh khắc nổi bật từ công ty</p>
            </div>
        </div>

        <!-- Filmstrip -->
        <div class="cinema" @mouseenter="paused = true" @mouseleave="paused = false">
            <div class="edge-fade left"></div>
            <div class="edge-fade right"></div>

            <div class="reel">
                <div class="strip" :class="{ paused }">
                    <!-- dải 1 -->
                    <div v-for="(s, i) in heroSlides" :key="'a-' + i" class="frame" :title="s.title"
                        @click="openPreview(i)">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const go = (path) => { if (path) router.push(path) }

const heroSlides = ref([])
const paused = ref(false)

// Preview control
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

onMounted(async () => {
    try {
        const res = await fetch('/home/manifest.json', { cache: 'no-cache' })
        if (!res.ok) throw new Error('Cannot load manifest')
        const arr = await res.json()
        heroSlides.value = arr
    } catch (e) {
        console.error(e)
        heroSlides.value = [] // hoặc set fallback nếu cần
    }

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
    background:
        linear-gradient(90deg, rgba(192, 98, 82, .25), rgba(192, 98, 82, .9) 40%, rgba(192, 98, 82, .25));
    border-radius: 8px;
}

.section-sub {
    margin: 6px 0 0;
    font-size: 12.5px;
    color: #6b7280;
}

/* ===== giữ style cũ cho 2 card ===== */
/* ===== Cinematic filmstrip (đẹp hơn) ===== */
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

/* Mép fade trái/phải cho cảm giác băng phim trôi vô tận */
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

/* Dải phim có “lỗ phim” ở trên/dưới bằng mask */
.reel {
    position: relative;
    padding: 25px 0;
    /* chừa chỗ cho thanh lỗ phim */
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
    /* đục lỗ */
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

/* Dải chuyển động */
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

/* Caption kính mờ */
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
