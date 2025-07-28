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
        <a href="#">→ Xem chi tiết</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const newsList = ref([
  { id: 1, title: 'VG-QED25-19.quyet dinh vv ky luat TRAN THI LY - VG', date: '30/05/2025' },
  { id: 2, title: 'HHH-TB25-07.thong bao vv di lam vao thu 7 hang tuan - HHH', date: '27/05/2025' },
  { id: 3, title: 'VG-TB25-13.thong bao vv di lam vao thu 7 hang tuan - VG', date: '27/05/2025' },
  { id: 4, title: 'PTSP - CẬP NHẬT QUY TRÌNH - BM', date: '27/05/2025' },
  { id: 5, title: 'KHKD-TB06.Thong bao vv dieu chinh nang luc san xuat', date: '27/05/2025' },
])
</script>

<style scoped>
.news-card {
  background: #b2493e;
  padding: 16px;
  border-radius: 12px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}

.header .icon {
  margin-right: 8px;
}

.subtext {
  font-size: 12px;
  margin-bottom: 16px;
  color: #f9f3f1;
}

.news-item {
  background: white;
  border-radius: 8px;
  color: black;
  padding: 8px 12px;
  margin-bottom: 10px;
}

.top-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.bottom-row {
  font-size: 12px;
  color: #b2493e;
  margin-top: 4px;
}
</style>
