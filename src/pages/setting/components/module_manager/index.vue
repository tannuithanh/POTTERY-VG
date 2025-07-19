<template>
  <div>
    <ModuleSearch @search="handleSearch" />
    <ModuleTable :data="modules" @edit="handleEdit" @delete="handleDelete" @create="handleCreate"
      @refresh="fetchModules" />
    <ModuleModal v-model:visible="showModal" :record="selectedRecord" @success="fetchModules" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import moduleService from '@/services/moduleService'
import ModuleSearch from './ModuleSearch.vue'
import ModuleTable from './ModuleTable.vue'
import ModuleModal from './ModuleModal.vue'

const modules = ref([])
const showModal = ref(false)
const selectedRecord = ref(null)
const currentQuery = ref({})

// 🚀 Lấy danh sách modules
const fetchModules = async (query = {}) => {
  currentQuery.value = query
  const res = await moduleService.getAll(query)
  modules.value = res.data
}

// 🧩 Xử lý tìm kiếm
const handleSearch = (query) => {
  fetchModules(query)
}

// ➕ Thêm mới
const handleCreate = () => {
  selectedRecord.value = null
  showModal.value = true
}

// ✏️ Sửa
const handleEdit = (record) => {
  selectedRecord.value = { ...record }
  showModal.value = true
}

// ❌ Xóa
const handleDelete = async (id) => {
  await moduleService.delete(id)
  fetchModules(currentQuery.value)
}

onMounted(() => fetchModules())
</script>
