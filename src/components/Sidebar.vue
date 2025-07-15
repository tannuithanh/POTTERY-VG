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
      <a-sub-menu key="profile" :icon="h(IdcardOutlined)" title="Hồ sơ điện tử">
        <a-menu-item key="forms_create">
          <router-link to="/forms_create">Tạo hồ sơ điện tử</router-link>
        </a-menu-item>
        <a-menu-item key="profile-list">
          <router-link to="/forms/list">Danh sách hồ sơ</router-link>
        </a-menu-item>
      </a-sub-menu>

      <a-sub-menu key="news" :icon="h(ProfileOutlined)" title="Bảng tin">
        <a-menu-item key="create_news">
          <router-link to="/create_news">Tạo bảng tin</router-link>
        </a-menu-item>
        <a-menu-item key="news-list">
          <router-link to="/news/list">Thông tin bảng tin</router-link>
        </a-menu-item>
      </a-sub-menu>

    </a-menu>
  </a-layout-sider>
</template>


<script setup>
import { HomeOutlined, IdcardOutlined, ProfileOutlined } from '@ant-design/icons-vue'
import { useRoute } from 'vue-router'
import { computed, ref, h } from 'vue'
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
