<template>
  <a-card class="news-card fx-root" :bordered="true" :class="{ 'fx-ready': effectsReady }">
    <template #title>
      <div class="header fx fx-up delay-1">
        <span class="icon fx fx-pop delay-2">📰</span>
        <span class="title fx fx-fade delay-3">Bảng tin công ty</span>
      </div>
    </template>

    <p class="subtext fx fx-fade delay-4">Những thông báo nội bộ mới nhất sẽ được hiển thị tại đây.</p>

    <div class="news-list">
      <transition-group name="list" tag="div">
        <div v-for="(item, i) in newsList" :key="item.id" class="news-item fx fx-up" :style="staggerStyle(i)"
          @click="openDetail(item)">
          <div class="top-row">
            <strong class="t-title">{{ item.title }}</strong>
            <span class="t-date">{{ item.date }}</span>
          </div>
          <div class="bottom-row">
            <a>→ Xem chi tiết</a>
          </div>
        </div>
      </transition-group>

      <a-empty v-if="!loading && !newsList.length" description="Chưa có thông báo" class="fx fx-fade delay-5" />
      <a-skeleton v-if="loading" :active="true" :paragraph="{ rows: 2 }" />
    </div>

    <NewsDetailModal :news="selectedNews" v-model:visible="modalVisible" />
  </a-card>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { newsService } from '@/services/news_service/newsService'
import dayjs from 'dayjs'
import NewsDetailModal from '@/pages/news/components/NewsDetailModal.vue'

const newsList = ref([])
const selectedNews = ref(null)
const modalVisible = ref(false)
const loading = ref(false)

// hiệu ứng
const effectsReady = ref(false)
const STAGGER_MS = 70
const staggerStyle = (i) => ({ '--delay': `${i * STAGGER_MS}ms` })

const fetchLatestNews = async () => {
  try {
    loading.value = true
    const res = await newsService.latest()
    const raw = res?.data?.data || []
    newsList.value = raw.map(item => ({
      ...item,
      date: dayjs(item.published_at).format('DD/MM/YYYY')
    }))
  } catch (err) {
    console.error('Không thể tải bảng tin mới nhất:', err)
  } finally {
    loading.value = false
    await nextTick()
    effectsReady.value = true
  }
}

const openDetail = (item) => {
  selectedNews.value = item
  modalVisible.value = true
}

onMounted(fetchLatestNews)
</script>

<style scoped>
.news-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.2;
}

.icon {
  font-size: 18px;
}

.subtext {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 10px;
}

/* List */
.news-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.news-item {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
  transition: box-shadow .2s ease, transform .15s ease;
  cursor: pointer;
}

.news-item:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, .08);
  transform: translateY(-2px) scale(1.01);
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.t-title {
  font-size: 14px;
  font-weight: 600;
}

.t-date {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}

.bottom-row {
  margin-top: 6px;
  font-size: 13px;
}

.bottom-row a {
  color: #c06252;
}

/* ====== FX system ====== */
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
  animation-duration: .6s;
  animation-timing-function: cubic-bezier(.2, .8, .2, 1);
}

.fx-up {
  animation-name: fx-up;
}

.fx-pop {
  animation-name: fx-pop;
  transform: none;
}

.fx-fade {
  animation-name: fx-fade;
  transform: none;
}

.delay-1 {
  animation-delay: 60ms;
}

.delay-2 {
  animation-delay: 140ms;
}

.delay-3 {
  animation-delay: 220ms;
}

.delay-4 {
  animation-delay: 300ms;
}

.delay-5 {
  animation-delay: 380ms;
}

.fx-ready .fx-up {
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

@keyframes fx-fade {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

/* TransitionGroup fallback */
.list-enter-active,
.list-leave-active {
  transition: all .35s;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {

  .fx,
  .fx-ready .fx {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
