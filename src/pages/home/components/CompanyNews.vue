<template>
  <a-card class="news-card" :bordered="true">
    <template #title>
      <div class="header">
        <span class="icon">📰</span>
        <span class="title">Bảng tin công ty</span>
      </div>
    </template>

    <p class="subtext">Những thông báo nội bộ mới nhất sẽ được hiển thị tại đây.</p>

    <div class="news-list">
      <div v-for="item in newsList" :key="item.id" class="news-item" @click="openDetail(item)">
        <div class="top-row">
          <strong class="t-title">{{ item.title }}</strong>
          <span class="t-date">{{ item.date }}</span>
        </div>
        <div class="bottom-row">
          <a>→ Xem chi tiết</a>
        </div>
      </div>

      <a-empty v-if="!loading && !newsList.length" description="Chưa có thông báo" />
      <a-skeleton v-if="loading" :active="true" :paragraph="{ rows: 2 }" />
    </div>

    <NewsDetailModal :news="selectedNews" v-model:visible="modalVisible" />
  </a-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { newsService } from '@/services/news_service/newsService'
import dayjs from 'dayjs'
import NewsDetailModal from '@/pages/news/components/NewsDetailModal.vue'

const newsList = ref([])
const selectedNews = ref(null)
const modalVisible = ref(false)
const loading = ref(false)

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
  }
}

const openDetail = (item) => {
  selectedNews.value = item
  modalVisible.value = true
}

onMounted(fetchLatestNews)
</script>

<style scoped>
/* Card chiếm full chiều cao cột và cho phần list cuộn */
.news-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Tiêu đề đồng bộ font-size với Ant Calendar header (~14-16px) */
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

/* Subtext nhẹ giống calendar */
.subtext {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 10px;
}

/* Khu vực danh sách chiếm phần còn lại, có scroll khi dài */
.news-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

/* Item nhìn gọn như cell của calendar */
.news-item {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
  transition: box-shadow .15s ease, transform .05s ease;
  cursor: pointer;
}

.news-item:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, .06);
  transform: translateY(-1px);
}

/* Typography đồng bộ: title 14px, date 12px, link 13px */
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

/* tím trùng với dấu chấm lịch */
</style>
