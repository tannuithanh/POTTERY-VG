<template>
  <a-layout-sider theme="light" v-model:collapsed="collapsed" :trigger="null" collapsible>
    <div class="logo">
      <img src="@/assets/images/logo.png" alt="Logo" />
    </div>

    <a-menu :selectedKeys="[activeKey]" theme="light" mode="inline">
      <a-menu-item key="home">
        <router-link to="/">
          <HomeOutlined />
          <span>Trang chủ</span>
        </router-link>
      </a-menu-item>
      <a-menu-item key="forms">
        <router-link to="/forms">
          <HomeOutlined />
          <span>Mẫu đăng ký</span>
        </router-link>
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>


<script setup>
import { HomeOutlined } from '@ant-design/icons-vue'
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'
const collapsed = ref(false)
const route = useRoute()

const activeKey = computed(() => {
  if (route.path === '/') return 'home'
  if (route.path === '/forms') return 'forms'
  return ''
})
</script>

<style scoped>
.logo {
  height: 90px;
  margin: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

/* Màu nền khi được chọn */
::v-deep(.ant-menu-light .ant-menu-item-selected) {
  background-color: rgba(192, 98, 82, 0.1) !important;
  color: #c06252 !important;
}

/* Màu icon khi được chọn */
::v-deep(.ant-menu-light .ant-menu-item-selected .anticon) {
  color: #c06252 !important;
}

/* Màu khi hover */
::v-deep(.ant-menu-light .ant-menu-item:hover) {
  background-color: rgba(192, 98, 82, 0.05) !important;
  color: #c06252 !important;
}

/* Màu icon khi hover */
::v-deep(.ant-menu-light .ant-menu-item:hover .anticon) {
  color: #c06252 !important;
}

</style>
