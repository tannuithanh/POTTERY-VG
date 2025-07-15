<template>
  <div class="form-layout">
    <!-- Menu ngang -->
    <a-menu mode="horizontal" class="mb-4" :selectedKeys="[selectedKey]">
      <a-menu-item key="leave_form">
        <router-link to="/forms_create/leave_form">Giấy ra vào cổng</router-link>
      </a-menu-item>
    </a-menu>

    <!-- Nội dung biểu mẫu -->
    <div class="form-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const selectedKey = computed(() => route.path.split('/').pop())
</script>

<style scoped>
.form-layout {
    width: 100%;
}

.form-content {
    margin-top: 10px;
    padding: 16px;
    border-radius: 6px;
}

/* Hiển thị scroll khi thu nhỏ màn hình */
::v-deep(.ant-layout-header) {
    overflow-x: auto;
    white-space: nowrap;
}

/* Tùy chọn: ẩn thanh cuộn xấu xí trên một số trình duyệt */
::v-deep(.ant-layout-header::-webkit-scrollbar) {
    display: none;
}

::v-deep(.ant-menu-horizontal) {
    flex-wrap: nowrap;
    min-width: max-content;
}

/* Màu khi hover & chọn */
::v-deep(.ant-menu-horizontal > .ant-menu-item:hover::after),
::v-deep(.ant-menu-horizontal > .ant-menu-item-active::after),
::v-deep(.ant-menu-horizontal > .ant-menu-item-selected::after) {
    border-bottom: 2px solid #c06252 !important;
}

::v-deep(.ant-menu-horizontal > .ant-menu-item-selected) {
    color: #c06252 !important;
}
</style>
