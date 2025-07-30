<template>
  <div class="news-card">
    <div class="header">
      <span class="icon">📌</span>
      <span class="title">Bảng tin công ty</span>
    </div>
    <p class="subtext">Những thông báo nội bộ mới nhất sẽ được hiển thị tại đây.</p>

    <div v-for="item in newsList" :key="item.id" class="news-item">
      <div class="top-row">
        <strong>{{ item.title }}</strong>
        <span>{{ item.date }}</span>
      </div>
      <div class="bottom-row">
        <a @click="openDetail(item)">→ Xem chi tiết</a>
      </div>
    </div>

    <NewsDetailModal :news="selectedNews" v-model:visible="modalVisible" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { newsService } from '@/services/news_service/newsService'
import dayjs from 'dayjs'
import NewsDetailModal from '@/pages/news/components/NewsDetailModal.vue'

const newsList = ref([])
const selectedNews = ref(null)
const modalVisible = ref(false)

const fetchLatestNews = async () => {
  try {
    const res = await newsService.latest()
    const raw = res.data.data || []
    newsList.value = raw.map(item => ({
      ...item,
      date: dayjs(item.published_at).format('DD/MM/YYYY')
    }))
  } catch (err) {
    console.error('Không thể tải bảng tin mới nhất:', err)
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
  background: #c06252;
  padding: 16px;
  border-radius: 12px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 4px;
}

.header .icon {
  margin-right: 8px;
}

.subtext {
  font-size: 14px;
  margin-bottom: 16px;
  color: #f9f3f1;
}

.news-item {
  background: white;
  border-radius: 8px;
  color: rgb(39, 38, 38);
  padding: 8px 12px;
  margin-bottom: 10px;
}

.top-row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;

}

.bottom-row {
  font-size: 14px;
  color: #c06252;
  margin-top: 4px;
}
</style>
