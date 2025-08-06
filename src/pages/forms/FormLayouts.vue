<template>
  <div class="form-layout">
    <!-- Button-style menu -->
    <div class="menu-buttons">
      <a-button class="custom-button" :class="{ active: selectedKey === 'leave_form' }" @click="goTo('leave_form')">
        Tạo giấy ra vào cổng
      </a-button>

    </div>
    <hr>
    <!-- Nội dung biểu mẫu -->
    <div class="form-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const selectedKey = computed(() => route.path.split('/').pop())

const goTo = (key) => {
  router.push(`/forms_create/${key}`)
}
</script>

<style scoped>
.form-layout {
  width: 100%;
}

.menu-buttons {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  flex-wrap: wrap;

}

.form-content {
  margin-top: 10px;
  padding: 16px;
  border-radius: 6px;
  background: #fff;
}

.custom-button {
  border: 1px solid #c06252;
  color: #c06252;
  background-color: #fff;
  transition: all 0.3s ease;
  font-weight: 500;
}

/* Hover */
.custom-button:hover {
  background-color: #c06252;
  color: #fff;
  border-color: #c06252;
}

/* Trạng thái được chọn (clicked) */
.custom-button.active {
  background-color: #c06252;
  color: #fff;
  border-color: #c06252;
}

</style>
