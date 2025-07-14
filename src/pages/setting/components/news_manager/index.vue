<template>
  <a-card>
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="category" tab="Hạng mục bảng tin">
        <NewsCategoryTable />
      </a-tab-pane>

      <a-tab-pane key="permission" tab="Phân quyền chức năng">
        <NewsPermissionTable />
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script setup>
import { ref } from 'vue'

// Import các component con
import NewsCategoryTable from './NewsCategoryTable.vue'
import NewsPermissionTable from './NewsPermissionTable.vue'

const activeTab = ref('category')
</script>
