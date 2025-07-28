<template>
    <a-form layout="vertical">
        <a-row :gutter="12">
            <a-col :xs="24" :sm="12" :md="6">
                <a-form-item>
                    <a-input v-model:value="filters.keyword" placeholder="Nhập tiêu đề hoặc nội dung..." allow-clear
                        @input="emitSearch" />
                </a-form-item>
            </a-col>

            <a-col :xs="24" :sm="12" :md="6">
                <a-form-item>
                    <a-range-picker v-model:value="filters.dateRange" format="DD/MM/YYYY" allow-clear
                        style="width: 100%" placeholder="Chọn khoảng ngày tạo" @change="emitSearch" />
                </a-form-item>
            </a-col>

            <a-col :xs="24" :sm="12" :md="3" v-if="canExport">
                <a-button type="primary" @click="onExport" style="width: 100%">
                    <template #icon>
                        <FileExcelOutlined />
                    </template>
                    Xuất Excel
                </a-button>
            </a-col>

        </a-row>
    </a-form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FileExcelOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

// ✅ Chỉ hiển thị nếu module "form" có quyền "export_excel"
const canExport = computed(() => {
  const user = authStore.user
  const isAdmin = user?.is_admin == 1
  const formModule = user?.modules?.find(m => m.code === 'form')
  const hasPermission = formModule?.actions?.includes('export_excel')
  return isAdmin || hasPermission
})

// ✅ Gộp emit đúng cú pháp
const emit = defineEmits(['search', 'export'])

const filters = ref({
    keyword: '',
    date: null,
    status: null,
    creator: '',
    dateRange: []
})

function emitSearch() {
    emit('search', { ...filters.value })
}

function onExport() {
    emit('export')
}
</script>
